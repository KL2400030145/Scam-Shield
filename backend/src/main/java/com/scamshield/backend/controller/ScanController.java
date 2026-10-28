package com.scamshield.backend.controller;

import com.scamshield.backend.dto.AnalysisResponse;
import com.scamshield.backend.dto.AnalyzeRequest;
import com.scamshield.backend.dto.ScanResponse;
import com.scamshield.backend.service.ScanService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scans")
public class ScanController {
    private final ScanService scanService;

    public ScanController(ScanService scanService) {
        this.scanService = scanService;
    }

    @PostMapping("/analyze")
    public AnalysisResponse analyze(@Valid @RequestBody AnalyzeRequest request) {
        return scanService.analyze(request.text().trim());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScanResponse create(@Valid @RequestBody AnalyzeRequest request) {
        return scanService.analyzeAndSave(request.text().trim());
    }

    @GetMapping
    public Page<ScanResponse> list(
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return scanService.list(riskLevel, search, pageable);
    }

    @GetMapping("/{id}")
    public ScanResponse get(@PathVariable UUID id) {
        return scanService.get(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        scanService.delete(id);
    }
}
