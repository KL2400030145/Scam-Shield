package com.scamshield.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AnalysisIndicator(String code, String title, String explanation, String severity) {
}
