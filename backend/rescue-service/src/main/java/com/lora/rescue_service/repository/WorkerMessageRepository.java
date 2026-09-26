package com.lora.rescue_service.repository;

import com.lora.rescue_service.entity.WorkerMessage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerMessageRepository
        extends JpaRepository<WorkerMessage, String> {



    // =====================================================
    // GET MESSAGES BY STATUS
    // =====================================================

    List<WorkerMessage> findByStatus(
            String status
    );


    // =====================================================
    // COUNT MESSAGES BY STATUS
    // =====================================================
    //
    // Used for dashboard.
    //
    // ACCEPTED worker message
    // = one team currently on rescue
    //
    // =====================================================

    long countByStatus(
            String status
    );


    // =====================================================
    // CHECK WHETHER TEAM HAS ACTIVE WORKER HELP
    // =====================================================

    boolean existsByAcceptedByTeamIdAndStatus(
            String teamId,
            String status
    );


    // =====================================================
    // GET CURRENT WORKER HELP FOR TEAM
    // =====================================================

    Optional<WorkerMessage>
    findFirstByAcceptedByTeamIdAndStatus(
            String teamId,
            String status
    );


    // =====================================================
    // GET ALL MESSAGES OF A WORKER
    // =====================================================

    List<WorkerMessage> findByWorkerId(
            String workerId
    );
}