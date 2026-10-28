from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_reports_transparent_baseline_without_model():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_analyze_returns_estimate_and_disclaimer():
    response = client.post(
        "/analyze",
        json={"text": "Pay a registration fee before you can start this exciting engineering internship role."},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["risk_score"] == 45
    assert body["risk_level"] == "Medium"
    assert body["indicators"][0]["code"] == "UPFRONT_FEE"
    assert body["analysis_method"] == "transparent-rule-baseline"
    assert "not a definitive" in body["disclaimer"]


def test_analyze_rejects_short_and_empty_text():
    assert client.post("/analyze", json={"text": "too short"}).status_code == 422
    assert client.post("/analyze", json={"text": " " * 40}).status_code == 422


def test_analyze_rejects_text_above_maximum():
    assert client.post("/analyze", json={"text": "x" * 20_001}).status_code == 422
