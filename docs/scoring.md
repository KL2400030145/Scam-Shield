# Scoring and model behavior

## Rule baseline

`ml-service/app/scoring.py` is the canonical rule-weight and risk-threshold definition. It assigns points once per distinct matched rule code; repeating the same wording does not add points again. The final score is bounded at 100.

| Signal | Weight |
|---|---:|
| Possible upfront fee | 45 |
| Sensitive financial details requested | 40 |
| Payment by gift card / crypto / wire transfer | 35 |
| Check deposit and funds forwarding | 45 |
| Recruitment directed off-platform only | 20 |

Rule matches are text signals, not proof. A small negation guard reduces obvious false positives; it does not understand language reliably. Neutral terms such as remote, urgent, or salary do not independently trigger rules.

## Risk thresholds

- **Low:** 0–29
- **Medium:** 30–59
- **High:** 60–100

These are product categories for rule-weight totals, not estimated fraud probabilities.

## Optional trained model

The service starts in rule-baseline mode when `models/job-scam-model.joblib` is absent. No predictions from invented or sample training examples are used. The training CLI requires a user-provided CSV dataset with documented provenance and license. It stratifies the holdout split before fitting TF-IDF and prints precision, recall, F1, support, and a confusion matrix.

When a model is present, the final score is `round(0.70 × rule_score + 0.30 × (100 × scam_class_probability))`, bounded by the rule-score range and 0–100. The classifier probability is not calibrated confidence; it is a model component and does not establish real-world accuracy. The API does not expose it as a confidence value. `analysis_method` and `model_version` identify which path ran.

The rule indicators remain separately explained and counted once even if a classifier detects similar language. False positives and false negatives remain possible.
