package com.scamshield.backend.exception;

public class ScanNotFoundException extends RuntimeException {
    public ScanNotFoundException() {
        super("The requested scan was not found.");
    }
}
