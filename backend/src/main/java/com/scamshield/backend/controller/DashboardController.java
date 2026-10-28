package com.scamshield.backend.controller;

import com.scamshield.backend.dto.DashboardStats;
import com.scamshield.backend.dto.DashboardTrends;
import com.scamshield.backend.service.ScanService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final ScanService scanService;

    public DashboardController(ScanService scanService) {
        this.scanService = scanService;
    }

    @GetMapping("/stats")
    public DashboardStats stats() {
        return scanService.stats();
    }

    @GetMapping("/trends")
    public DashboardTrends trends() {
        return scanService.trends();
    }
}
