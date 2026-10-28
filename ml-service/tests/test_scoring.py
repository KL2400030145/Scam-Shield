from app.scoring import detect_indicators, normalize_text, risk_level, score_indicators


def test_normalize_text_removes_markup_and_normalizes_whitespace():
    assert normalize_text(" <b>REMOTE</b>\n engineer &amp; intern ") == "remote engineer & intern"


def test_neutral_job_terms_are_not_indicators():
    indicators = detect_indicators(
        "We are hiring a remote software engineer with a competitive salary and an urgent start date."
    )
    assert indicators == []
    assert score_indicators(indicators) == 0


def test_upfront_fee_is_detected_once_even_when_repeated():
    indicators = detect_indicators(
        "Pay an application fee before starting. The application fee is required before onboarding."
    )
    assert [indicator["code"] for indicator in indicators] == ["UPFRONT_FEE"]
    assert score_indicators(indicators) == 45


def test_negated_fee_statement_is_not_flagged():
    assert detect_indicators("There is no application fee and candidates never pay a registration fee.") == []


def test_combined_distinct_signals_are_bounded_and_categorized():
    indicators = detect_indicators(
        "Pay a registration fee before starting. Deposit the check then forward the remaining funds to our recruiter."
    )
    score = score_indicators(indicators)
    assert score == 90
    assert risk_level(score) == "High"


def test_risk_threshold_boundaries():
    assert risk_level(29) == "Low"
    assert risk_level(30) == "Medium"
    assert risk_level(59) == "Medium"
    assert risk_level(60) == "High"
    assert risk_level(100) == "High"
