CREATE TABLE scan_record (
    id BINARY(16) NOT NULL PRIMARY KEY,
    full_text TEXT NOT NULL,
    risk_score SMALLINT NOT NULL,
    risk_level VARCHAR(16) NOT NULL,
    indicators_json JSON NOT NULL,
    recommendations_json JSON NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT chk_scan_score CHECK (risk_score BETWEEN 0 AND 100),
    CONSTRAINT chk_scan_level CHECK (risk_level IN ('Low', 'Medium', 'High')),
    INDEX idx_scan_created_at (created_at),
    INDEX idx_scan_risk_created (risk_level, created_at)
);
