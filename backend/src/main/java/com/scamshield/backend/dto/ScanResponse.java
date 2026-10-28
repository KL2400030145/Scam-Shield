package com.scamshield.backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ScanResponse(
        UUID id,
        String text,
        String preview,
        int riskScore,
        String riskLevel,
        List<AnalysisIndicator> indicators,
        List<String> recommendations,
        String modelVersion,
        Instant createdAt) {
}
