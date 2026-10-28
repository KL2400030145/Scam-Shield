package com.scamshield.backend.dto;

import java.util.List;
import java.util.Map;

public record DashboardStats(long totalScans, Map<String, Long> riskCounts, List<ScanResponse> recentScans) {
}
