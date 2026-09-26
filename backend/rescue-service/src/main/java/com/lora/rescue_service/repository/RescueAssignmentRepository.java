package com.lora.rescue_service.repository;

import com.lora.rescue_service.entity.RescueAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RescueAssignmentRepository
        extends JpaRepository<RescueAssignment, Long> {


    // ---------------------------------------------
    // All assignments - newest first
    // ---------------------------------------------
    List<RescueAssignment>
    findAllByOrderByAssignedTimeDesc();


    // ---------------------------------------------
    // Active assignment for team
    // ---------------------------------------------
    Optional<RescueAssignment>
    findFirstByTeamIdAndStatus(
            String teamId,
            String status
    );


    // ---------------------------------------------
    // Check team busy
    // ---------------------------------------------
    boolean existsByTeamIdAndStatus(
            String teamId,
            String status
    );


    // ---------------------------------------------
    // Team assignment history
    // ---------------------------------------------
    List<RescueAssignment>
    findByTeamIdOrderByAssignedTimeDesc(
            String teamId
    );


    // ---------------------------------------------
    // Assignment for SOS
    // ---------------------------------------------
    Optional<RescueAssignment>
    findBySosId(
            Long sosId
    );


    // ---------------------------------------------
    // Assignments by status
    // ---------------------------------------------
    List<RescueAssignment>
    findByStatusOrderByAssignedTimeDesc(
            String status
    );
}