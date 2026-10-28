package com.scamshield.backend.exception;

import jakarta.validation.ConstraintViolationException;
import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ScanNotFoundException.class)
    ResponseEntity<Map<String, String>> notFound(ScanNotFoundException exception) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(AnalysisUnavailableException.class)
    ResponseEntity<Map<String, String>> analysisUnavailable(AnalysisUnavailableException exception) {
        return response(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage());
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class,
            HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            IllegalArgumentException.class})
    ResponseEntity<Map<String, String>> badRequest(Exception exception) {
        String message = exception instanceof MethodArgumentNotValidException validation
                ? validation.getBindingResult().getFieldErrors().stream()
                        .findFirst().map(error -> error.getDefaultMessage()).orElse("Invalid request.")
                : exception.getMessage();
        return response(HttpStatus.BAD_REQUEST, message == null ? "Invalid request." : message);
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<Map<String, String>> databaseUnavailable(DataAccessException exception) {
        return response(HttpStatus.SERVICE_UNAVAILABLE, "The scan database is temporarily unavailable.");
    }

    private ResponseEntity<Map<String, String>> response(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("status", status.getReasonPhrase(), "message", message));
    }
}
