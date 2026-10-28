package com.scamshield.backend.repository;

import com.scamshield.backend.entity.ScanRecord;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScanRecordRepository extends JpaRepository<ScanRecord, UUID> {
    long countByRiskLevel(String riskLevel);

    List<ScanRecord> findTop10ByOrderByCreatedAtDesc();

    List<ScanRecord> findByCreatedAtGreaterThanEqual(Instant from);

    @Query("""
            select s from ScanRecord s
            where (:riskLevel is null or s.riskLevel = :riskLevel)
              and (:search is null or lower(s.fullText) like lower(concat('%', :search, '%')))
            """)
    Page<ScanRecord> searchScans(
            @Param("riskLevel") String riskLevel,
            @Param("search") String search,
            Pageable pageable);

    Optional<ScanRecord> findById(UUID id);
}
