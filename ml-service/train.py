import argparse
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from app.scoring import normalize_text

SCAM_LABELS = {"1", "scam", "fraud", "fraudulent", "fake", "fraudulent job"}
LEGIT_LABELS = {"0", "legitimate", "real", "genuine", "not scam", "not fraud"}


def _label(value: object) -> int:
    label = str(value).strip().lower()
    if label in SCAM_LABELS:
        return 1
    if label in LEGIT_LABELS:
        return 0
    raise ValueError(f"Unsupported label {value!r}; document and map your dataset's labels explicitly.")


def train(dataset: Path, output: Path, text_column: str, label_column: str) -> dict[str, object]:
    frame = pd.read_csv(dataset)
    missing = {text_column, label_column} - set(frame.columns)
    if missing:
        raise ValueError(f"Dataset is missing required column(s): {', '.join(sorted(missing))}")
    frame = frame[[text_column, label_column]].dropna()
    frame[text_column] = frame[text_column].astype(str).map(normalize_text)
    frame = frame[frame[text_column].str.len() >= 30]
    frame[label_column] = frame[label_column].map(_label)
    if frame[label_column].nunique() != 2 or frame[label_column].value_counts().min() < 2:
        raise ValueError("At least two examples of each class are required for a stratified train/test split.")

    texts_train, texts_test, labels_train, labels_test = train_test_split(
        frame[text_column],
        frame[label_column],
        test_size=0.2,
        random_state=42,
        stratify=frame[label_column],
    )
    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=100_000, sublinear_tf=True)),
            ("classifier", LogisticRegression(max_iter=1_000, class_weight="balanced", random_state=42)),
        ]
    )
    pipeline.fit(texts_train, labels_train)
    predictions = pipeline.predict(texts_test)
    report = classification_report(labels_test, predictions, labels=[0, 1], target_names=["legitimate", "scam"], output_dict=True, zero_division=0)
    matrix = confusion_matrix(labels_test, predictions, labels=[0, 1]).tolist()

    digest = __import__("hashlib").sha256(dataset.read_bytes()).hexdigest()[:12]
    version = f"scamshield-tfidf-logreg-{digest}"
    output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {"pipeline": pipeline, "version": version, "scam_label": 1, "dataset_sha256": digest},
        output,
    )
    result = {
        "model_version": version,
        "dataset_sha256": digest,
        "rows_after_cleaning": int(len(frame)),
        "train_rows": int(len(texts_train)),
        "test_rows": int(len(texts_test)),
        "classification_report": report,
        "confusion_matrix_labels": ["legitimate", "scam"],
        "confusion_matrix": matrix,
        "note": "Hold-out metrics are dataset-specific and do not establish real-world accuracy or calibrated probabilities.",
    }
    print(json.dumps(result, indent=2))
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Train an optional ScamShield TF-IDF classifier on a documented, licensed CSV dataset.")
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--text-column", default="text")
    parser.add_argument("--label-column", default="label")
    parser.add_argument("--output", type=Path, default=Path("models/job-scam-model.joblib"))
    args = parser.parse_args()
    train(args.dataset, args.output, args.text_column, args.label_column)


if __name__ == "__main__":
    main()
