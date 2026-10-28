import html
import re
from dataclasses import dataclass

LOW_MAX = 29
MEDIUM_MAX = 59
MAX_SCORE = 100


@dataclass(frozen=True)
class Rule:
    code: str
    title: str
    explanation: str
    weight: int
    pattern: re.Pattern[str]


RULES = (
    Rule(
        "UPFRONT_FEE",
        "Possible upfront payment request",
        "The text appears to ask the applicant to pay a fee, deposit, or charge before employment. Verify any payment request independently.",
        45,
        re.compile(
            r"\b(?:pay|payment of|send|submit)\b.{0,35}\b(?:application|registration|processing|training|onboarding|equipment|security|placement|recruitment)?\s*(?:fee|deposit|charge)\b"
            r"|\b(?:application|registration|processing|training|onboarding|equipment|security|placement|recruitment)\s+(?:fee|deposit|charge)\b.{0,35}\b(?:required|must be paid|payable|before|upfront|in advance)\b",
            re.I,
        ),
    ),
    Rule(
        "SENSITIVE_FINANCIAL_DETAILS",
        "Request for sensitive financial details",
        "The text appears to request bank, payment-card, or government identity details. Verify the request through an independently sourced official channel before sharing anything.",
        40,
        re.compile(
            r"\b(?:send|share|provide|submit|email|text|enter)\b.{0,45}\b(?:bank account|routing number|account number|credit card|debit card|social security|social insurance|passport number|national id)\b"
            r"|\b(?:bank account|routing number|account number|credit card|debit card|social security|social insurance|passport number|national id)\b.{0,45}\b(?:send|share|provide|submit|email|text|details|number)\b",
            re.I,
        ),
    ),
    Rule(
        "PAYMENT_BY_GIFT_CARD_OR_CRYPTO",
        "Unusual payment method mentioned",
        "Gift cards or cryptocurrency are mentioned in a payment context. These methods are difficult to reverse; independently verify any payment request.",
        35,
        re.compile(r"\b(?:gift\s+cards?|cryptocurrency|crypto(?:currency)?|bitcoin|wire\s+transfer|western\s+union)\b", re.I),
    ),
    Rule(
        "CHECK_FORWARDING",
        "Possible check or funds-forwarding arrangement",
        "The text appears to ask the applicant to deposit a check and forward money or purchase items. A deposited check can later be reversed, leaving the applicant responsible.",
        45,
        re.compile(
            r"\b(?:deposit|cash|mobile\s+deposit)\b.{0,45}\bcheck\b.{0,80}\b(?:forward|transfer|send|return|purchase|buy)\b"
            r"|\b(?:forward|transfer|send|return)\b.{0,60}\b(?:remaining|excess|surplus)\s+funds\b",
            re.I,
        ),
    ),
    Rule(
        "OFF_PLATFORM_ONLY",
        "Recruiting communication directed off-platform",
        "The text appears to insist on moving recruitment entirely to a personal messaging account. Confirm the recruiter's identity using contact details found independently.",
        20,
        re.compile(
            r"\b(?:interview|recruit(?:ing|er|ment)?|communicat\w*|contact)\b.{0,70}\b(?:whats\s*app|telegram|signal|personal\s+(?:email|gmail|outlook|yahoo))\b.{0,55}\b(?:only|exclusively|instead|no\s+call|no\s+video)?\b"
            r"|\b(?:whats\s*app|telegram|signal)\b.{0,70}\b(?:interview|recruit(?:ing|er|ment)?|job\s+offer)\b",
            re.I,
        ),
    ),
)

NEGATION = re.compile(
    r"\b(?:no|not|never|without|does\s+not|do\s+not|don't|doesn't|isn't|are\s+not|is\s+not)\b"
    r"(?:\W+\w+){0,5}\W*$",
    re.I,
)

RECOMMENDATIONS = (
    "Find the employer's official website yourself and contact its recruiting team using details published there.",
    "Do not pay recruitment, training, equipment, or application fees unless the arrangement is independently verified.",
    "Do not send banking, payment-card, or government identity details to an unverified recruiter.",
    "Do not deposit a check and forward money or buy items for a recruiter.",
    "Ask to continue through an official company email and a verifiable interview process.",
    "Compare the role and recruiter with the employer's official careers page; do not rely on links or phone numbers in the message.",
)


def normalize_text(text: str) -> str:
    unescaped = html.unescape(text)
    without_markup = re.sub(r"<[^>]*>", " ", unescaped)
    return re.sub(r"\s+", " ", without_markup).strip().lower()


def _negated(text: str, start: int) -> bool:
    sentence_start = max(text.rfind(".", 0, start), text.rfind("!", 0, start), text.rfind("?", 0, start)) + 1
    prefix = text[sentence_start:start]
    return bool(NEGATION.search(prefix[-90:]))


def detect_indicators(text: str) -> list[dict[str, str | int]]:
    normalized = normalize_text(text)
    found: list[dict[str, str | int]] = []
    for rule in RULES:
        match = rule.pattern.search(normalized)
        if match and not _negated(normalized, match.start()):
            found.append(
                {
                    "code": rule.code,
                    "title": rule.title,
                    "explanation": rule.explanation,
                    "severity": "high" if rule.weight >= 35 else "medium",
                    "weight": rule.weight,
                }
            )
    return found


def score_indicators(indicators: list[dict[str, str | int]]) -> int:
    return min(MAX_SCORE, sum(int(item["weight"]) for item in indicators))


def risk_level(score: int) -> str:
    if score <= LOW_MAX:
        return "Low"
    if score <= MEDIUM_MAX:
        return "Medium"
    return "High"


def recommendations_for(indicators: list[dict[str, str | int]]) -> list[str]:
    codes = {str(item["code"]) for item in indicators}
    selected: list[str] = []
    if "UPFRONT_FEE" in codes or "PAYMENT_BY_GIFT_CARD_OR_CRYPTO" in codes:
        selected.append(RECOMMENDATIONS[1])
    if "SENSITIVE_FINANCIAL_DETAILS" in codes:
        selected.append(RECOMMENDATIONS[2])
    if "CHECK_FORWARDING" in codes:
        selected.append(RECOMMENDATIONS[3])
    if "OFF_PLATFORM_ONLY" in codes:
        selected.append(RECOMMENDATIONS[4])
    selected.append(RECOMMENDATIONS[0])
    if not indicators:
        selected.append(RECOMMENDATIONS[5])
    return list(dict.fromkeys(selected))
