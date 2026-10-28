package com.scamshield.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "scan_record", indexes = {
        @Index(name = "idx_scan_created_at", columnList = "created_at"),
        @Index(name = "idx_scan_risk_created", columnList = "risk_level, created_at")
})
public class ScanRecord {
    @Id
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(name = "full_text", nullable = false, columnDefinition = "TEXT")
    private String fullText;

    @Column(name = "risk_score", nullable = false)
    private int riskScore;

    @Column(name = "risk_level", nullable = false, length = 16)
    private String riskLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "indicators_json", nullable = false, columnDefinition = "json")
    private String indicatorsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendations_json", nullable = false, columnDefinition = "json")
    private String recommendationsJson;

    @Column(name = "model_version", nullable = false, length = 100)
    private String modelVersion;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected ScanRecord() {
    }

    public ScanRecord(UUID id, String fullText, int riskScore, String riskLevel,
            String indicatorsJson, String recommendationsJson, String modelVersion, Instant createdAt) {
        this.id = id;
        this.fullText = fullText;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.indicatorsJson = indicatorsJson;
        this.recommendationsJson = recommendationsJson;
        this.modelVersion = modelVersion;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public String getFullText() { return fullText; }
    public int getRiskScore() { return riskScore; }
    public String getRiskLevel() { return riskLevel; }
    public String getIndicatorsJson() { return indicatorsJson; }
    public String getRecommendationsJson() { return recommendationsJson; }
    public String getModelVersion() { return modelVersion; }
    public Instant getCreatedAt() { return createdAt; }
}
