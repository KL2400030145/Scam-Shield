import os
from pathlib import Path
from typing import Any

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from app.scoring import (
    MAX_SCORE,
    MEDIUM_MAX,
    detect_indicators,
    normalize_text,
    recommendations_for,
    risk_level,
    score_indicators,
)

MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "20000"))
BASELINE_VERSION = "rules-baseline-v1"
MODEL_PATH = Path(os.getenv("MODEL_PATH", "models/job-scam-model.joblib"))
DISCLAIMER = (
    "This is an automated risk estimate, not a definitive fraud determination. "
    "ScamShield does not verify employers, websites, domains, or recruiter identities."
)

app = FastAPI(title="ScamShield AI screening service", version=BASELINE_VERSION)
origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=30, max_length=MAX_TEXT_LENGTH)

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text must not be blank")
        return value


class Indicator(BaseModel):
    code: str
    title: str
    explanation: str
    severity: str


class AnalyzeResponse(BaseModel):
    risk_score: int
    risk_level: str
    indicators: list[Indicator]
    recommendations: list[str]
    model_version: str
    analysis_method: str
    disclaimer: str


def _load_model(path: Path) -> dict[str, Any] | None:
    if not path.is_file():
        return None
    try:
        loaded = joblib.load(path)
    except (OSError, ValueError, EOFError, ImportError) as exc:
        raise RuntimeError(f"Unable to load trained model at {path}: {exc}") from exc
    if not isinstance(loaded, dict) or "pipeline" not in loaded or "version" not in loaded:
        raise RuntimeError(f"Model file at {path} does not match the documented ScamShield model format.")
    return loaded


model_bundle = _load_model(MODEL_PATH)


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "model_loaded": model_bundle is not None,
        "model_version": str(model_bundle["version"]) if model_bundle else BASELINE_VERSION,
    }


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    normalized = normalize_text(request.text)
    if len(normalized) < 30:
        raise HTTPException(status_code=422, detail="Text must contain at least 30 non-whitespace characters.")

    indicators = detect_indicators(normalized)
    rule_score = score_indicators(indicators)
    score = rule_score
    version = BASELINE_VERSION
    method = "transparent-rule-baseline"

    if model_bundle is not None:
        pipeline = model_bundle["pipeline"]
        classes = list(pipeline.classes_)
        scam_label = model_bundle["scam_label"]
        if scam_label not in classes:
            raise HTTPException(status_code=503, detail="The configured trained model has no documented scam class.")
        scam_index = classes.index(scam_label)
        probability = float(pipeline.predict_proba([normalized])[0][scam_index])
        model_score = round(probability * MAX_SCORE)
        score = round(0.7 * rule_score + 0.3 * model_score)
        version = str(model_bundle["version"])
        method = "trained-model-and-rule-signals"

    return AnalyzeResponse(
        risk_score=score,
        risk_level=risk_level(score),
        indicators=indicators,
        recommendations=recommendations_for(indicators),
        model_version=version,
        analysis_method=method,
        disclaimer=DISCLAIMER,
    )
