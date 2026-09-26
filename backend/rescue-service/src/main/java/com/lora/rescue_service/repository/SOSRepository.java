package com.lora.rescue_service.repository;

import com.lora.rescue_service.entity.SOS;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SOSRepository
        extends JpaRepository<SOS, Long> {

    // =====================================================
    // FIND SOS BY STATUS
    // =====================================================

    List<SOS> findByRescueStatus(
            String rescueStatus
    );

    List<SOS> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    // =====================================================
    // COUNT SOS BY STATUS
    // =====================================================

    long countByRescueStatus(
            String rescueStatus
    );


    // =====================================================
    // CURRENT SOS FOR TEAM
    // =====================================================

    Optional<SOS>
    findByAssignedTeamIdAndRescueStatus(
            String teamId,
            String rescueStatus
    );


    // =====================================================
    // ALL SOS FOR TEAM
    // =====================================================

    List<SOS> findByAssignedTeamId(
            String teamId
    );


    // =====================================================
    // FIND SOS BY DISPLAY ID
    // Example: SOS-1001
    // =====================================================

    Optional<SOS> findBySosId(
            String sosId
    );


    // =====================================================
    // COUNT TEAMS CURRENTLY ON RESCUE
    // =====================================================

    @Query("""
            SELECT COUNT(DISTINCT s.assignedTeamId)
            FROM SOS s
            WHERE s.rescueStatus = 'IN_PROGRESS'
            AND s.assignedTeamId IS NOT NULL
            """)
    long countTeamsOnRescue();
    @Query(
            value = "SELECT COALESCE(MAX(CAST(SUBSTRING(sos_id, 5) AS UNSIGNED)), 1000) " +
                    "FROM sos " +
                    "WHERE sos_id LIKE 'SOS-%'",
            nativeQuery = true
    )
    Long findMaxSosNumber();
}