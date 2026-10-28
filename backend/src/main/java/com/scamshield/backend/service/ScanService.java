package com.scamshield.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scamshield.backend.dto.AnalysisIndicator;
import com.scamshield.backend.dto.AnalysisResponse;
import com.scamshield.backend.dto.DashboardStats;
import com.scamshield.backend.dto.DashboardTrends;
import com.scamshield.backend.dto.ScanResponse;
import com.scamshield.backend.dto.TrendPoint;
import com.scamshield.backend.entity.ScanRecord;
import com.scamshield.backend.exception.ScanNotFoundException;
import com.scamshield.backend.repository.ScanRecordRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScanService {
    private static final int MAX_PAGE_SIZE = 50;
    private static final int MAX_SEARCH_LENGTH = 100;
    private static final TypeReference<List<AnalysisIndicator>> INDICATORS_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<String>> RECOMMENDATIONS_TYPE = new TypeReference<>() {};

    private final ScanRecordRepository repository;
    private final MlAnalysisClient analysisClient;
    private final ObjectMapper objectMapper;

    public ScanService(ScanRecordRepository repository, MlAnalysisClient analysisClient, ObjectMapper objectMapper) {
        this.repository = repository;
        this.analysisClient = analysisClient;
        this.objectMapper = objectMapper;
    }

    public AnalysisResponse analyze(String text) {
        return analysisClient.analyze(text);
    }

    @Transactional
    public ScanResponse analyzeAndSave(String text) {
        AnalysisResponse analysis = analysisClient.analyze(text);
        ScanRecord record = new ScanRecord(
                UUID.randomUUID(),
                text,
                analysis.riskScore(),
                analysis.riskLevel(),
                writeJson(analysis.indicators()),
                writeJson(analysis.recommendations()),
                analysis.modelVersion(),
                Instant.now());
        return toResponse(repository.save(record), true);
    }

    @Transactional(readOnly = true)
    public Page<ScanResponse> list(String riskLevel, String search, Pageable pageable) {
        String normalizedLevel = riskLevel == null || riskLevel.isBlank() ? null : riskLevel.trim();
        if (normalizedLevel != null && !List.of("Low", "Medium", "High").contains(normalizedLevel)) {
            throw new IllegalArgumentException("Risk level must be Low, Medium, or High.");
        }
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        if (normalizedSearch != null && normalizedSearch.length() > MAX_SEARCH_LENGTH) {
            throw new IllegalArgumentException("Search text must not exceed 100 characters.");
        }
        int page = Math.max(0, pageable.getPageNumber());
        int size = Math.max(1, Math.min(pageable.getPageSize(), MAX_PAGE_SIZE));
        Pageable safePageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return repository.searchScans(normalizedLevel, normalizedSearch, safePageable)
                .map(record -> toResponse(record, false));
    }

    @Transactional(readOnly = true)
    public ScanResponse get(UUID id) {
        return toResponse(repository.findById(id).orElseThrow(ScanNotFoundException::new), true);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ScanNotFoundException();
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public DashboardStats stats() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("Low", repository.countByRiskLevel("Low"));
        counts.put("Medium", repository.countByRiskLevel("Medium"));
        counts.put("High", repository.countByRiskLevel("High"));
        List<ScanResponse> recent = repository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(record -> toResponse(record, false))
                .toList();
        return new DashboardStats(repository.count(), counts, recent);
    }

    @Transactional(readOnly = true)
    public DashboardTrends trends() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate firstDay = today.minusDays(13);
        Instant start = firstDay.atStartOfDay(ZoneOffset.UTC).toInstant();
        Map<LocalDate, Long> counts = repository.findByCreatedAtGreaterThanEqual(start).stream()
                .collect(Collectors.groupingBy(
                        record -> record.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate(),
                        Collectors.counting()));
        List<TrendPoint> points = new ArrayList<>(14);
        for (int day = 0; day < 14; day++) {
            LocalDate date = firstDay.plusDays(day);
            points.add(new TrendPoint(date, counts.getOrDefault(date, 0L)));
        }
        return new DashboardTrends(points);
    }

    private ScanResponse toResponse(ScanRecord record, boolean includeText) {
        return new ScanResponse(
                record.getId(),
                includeText ? record.getFullText() : null,
                preview(record.getFullText()),
                record.getRiskScore(),
                record.getRiskLevel(),
                readJson(record.getIndicatorsJson(), INDICATORS_TYPE),
                readJson(record.getRecommendationsJson(), RECOMMENDATIONS_TYPE),
                record.getModelVersion(),
                record.getCreatedAt());
    }

    private String preview(String text) {
        String singleLine = text.replaceAll("\\s+", " ").trim();
        return singleLine.length() <= 140 ? singleLine : singleLine.substring(0, 137) + "...";
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize scan analysis for storage.", exception);
        }
    }

    private <T> T readJson(String value, TypeReference<T> type) {
        try {
            return objectMapper.readValue(value, type);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Stored scan analysis is not valid JSON.", exception);
        }
    }
}
