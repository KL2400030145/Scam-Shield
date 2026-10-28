package com.scamshield.backend.service;

import com.scamshield.backend.dto.AnalysisResponse;
import com.scamshield.backend.exception.AnalysisUnavailableException;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import java.util.Set;

@Component
public class MlAnalysisClient {
    private final RestClient restClient;

    public MlAnalysisClient(RestClient mlRestClient) {
        this.restClient = mlRestClient;
    }

    public AnalysisResponse analyze(String text) {
        try {
            AnalysisResponse response = restClient.post()
                    .uri("/analyze")
                    .body(Map.of("text", text))
                    .retrieve()
                    .body(AnalysisResponse.class);
            if (response == null || response.riskScore() < 0 || response.riskScore() > 100
                    || !VALID_RISK_LEVELS.contains(response.riskLevel())) {
                throw new AnalysisUnavailableException("The analysis service returned an invalid response.", null);
            }
            return response;
        } catch (RestClientException exception) {
            throw new AnalysisUnavailableException(
                    "The analysis service is unavailable. Start the Python service and try again.", exception);
        }
    }

    private static final Set<String> VALID_RISK_LEVELS = Set.of("Low", "Medium", "High");
}
