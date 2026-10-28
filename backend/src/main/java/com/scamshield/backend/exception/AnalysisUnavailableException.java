package com.scamshield.backend.exception;

public class AnalysisUnavailableException extends RuntimeException {
    public AnalysisUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
