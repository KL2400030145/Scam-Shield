package com.scamshield.backend.dto;

import java.time.LocalDate;

public record TrendPoint(LocalDate date, long count) {
}
