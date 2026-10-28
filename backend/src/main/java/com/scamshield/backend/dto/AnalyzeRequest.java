package com.scamshield.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnalyzeRequest(
        @NotBlank(message = "Text must not be blank.")
        @Size(min = 30, max = 20000, message = "Text must contain 30 to 20,000 characters.")
        String text) {
}
