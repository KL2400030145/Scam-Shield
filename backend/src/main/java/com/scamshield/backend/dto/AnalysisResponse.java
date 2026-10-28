package com.scamshield.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AnalysisResponse(
        @JsonAlias("risk_score") int riskScore,
        @JsonAlias("risk_level") String riskLevel,
        List<AnalysisIndicator> indicators,
        List<String> recommendations,
        @JsonAlias("model_version") String modelVersion,
        @JsonAlias("analysis_method") String analysisMethod,
        String disclaimer) {
}
