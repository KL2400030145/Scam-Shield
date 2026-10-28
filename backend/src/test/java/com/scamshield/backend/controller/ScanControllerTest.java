package com.scamshield.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.scamshield.backend.dto.AnalysisResponse;
import com.scamshield.backend.service.ScanService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ScanController.class)
class ScanControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ScanService scanService;

    @Test
    void analyzeRejectsBlankOrShortText() throws Exception {
        mockMvc.perform(post("/api/scans/analyze").contentType("application/json")
                        .content("{\"text\":\"too short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void analyzeValidatesAndReturnsServiceResult() throws Exception {
        when(scanService.analyze(any())).thenReturn(
                new AnalysisResponse(0, "Low", List.of(), List.of("Verify independently."),
                        "rules-baseline-v1", "transparent-rule-baseline", "Estimate only."));

        mockMvc.perform(post("/api/scans/analyze").contentType("application/json")
                        .content("{\"text\":\"This is a sufficiently long description for a software engineering internship.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskScore").value(0))
                .andExpect(jsonPath("$.riskLevel").value("Low"));

        verify(scanService).analyze(eq("This is a sufficiently long description for a software engineering internship."));
    }
}
