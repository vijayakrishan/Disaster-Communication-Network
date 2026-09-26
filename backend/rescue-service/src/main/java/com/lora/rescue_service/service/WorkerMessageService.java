package com.lora.rescue_service.service;
import com.lora.rescue_service.dto.TeamDTO;
import com.lora.rescue_service.dto.WorkerHelpRequestDTO;
import com.lora.rescue_service.entity.WorkerMessage;
import com.lora.rescue_service.repository.WorkerMessageRepository;
import com.lora.rescue_service.client.AuthClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkerMessageService {

    @Autowired
    private WorkerMessageRepository workerMessageRepository;

    @Autowired
    private AuthClient authClient;


    // =====================================================
    // CREATE WORKER HELP REQUEST
    // =====================================================

    @Transactional
    public WorkerMessage createHelpRequest(
            WorkerHelpRequestDTO request) {

        System.out.println("=================================");
        System.out.println("WORKER HELP REQUEST RECEIVED");

        System.out.println(
                "Worker ID = " +
                        request.getWorkerId()
        );

        System.out.println(
                "Worker Name = " +
                        request.getWorkerName()
        );

        System.out.println(
                "Team ID = " +
                        request.getTeamId()
        );

        System.out.println(
                "Team Name = " +
                        request.getTeamName()
        );

        System.out.println(
                "Message = " +
                        request.getMessage()
        );

        System.out.println(
                "Latitude = " +
                        request.getLatitude()
        );

        System.out.println(
                "Longitude = " +
                        request.getLongitude()
        );

        System.out.println(
                "Source = " +
                        request.getSource()
        );


        // =================================================
        // VALIDATION
        // =================================================

        if (request.getWorkerId() == null ||
                request.getWorkerId().isBlank()) {

            throw new RuntimeException(
                    "WORKER_ID_REQUIRED"
            );
        }

        if (request.getTeamId() == null ||
                request.getTeamId().isBlank()) {

            throw new RuntimeException(
                    "TEAM_ID_REQUIRED"
            );
        }

        if (request.getMessage() == null ||
                request.getMessage().isBlank()) {

            throw new RuntimeException(
                    "MESSAGE_REQUIRED"
            );
        }

        if (request.getLatitude() == null ||
                request.getLongitude() == null) {

            throw new RuntimeException(
                    "LOCATION_REQUIRED"
            );
        }


        // =================================================
        // CREATE MESSAGE
        // =================================================

        WorkerMessage message =
                new WorkerMessage();
        message.setId(generateWorkerMessageId());
        message.setWorkerId(
                request.getWorkerId()
        );

        message.setWorkerName(
                request.getWorkerName()
        );

        message.setTeamId(
                request.getTeamId()
        );

        message.setTeamName(
                request.getTeamName()
        );

        message.setMessage(
                request.getMessage()
        );

        message.setLatitude(
                request.getLatitude()
        );

        message.setLongitude(
                request.getLongitude()
        );

        message.setSource(
                request.getSource() == null
                        ? "WEB"
                        : request.getSource()
        );

        message.setStatus(
                "PENDING"
        );

        message.setCreatedAt(
                LocalDateTime.now()
        );

        message.setUpdatedAt(
                LocalDateTime.now()
        );


        // =================================================
        // SAVE TO DATABASE
        // =================================================

        WorkerMessage saved =
                workerMessageRepository.save(
                        message
                );

        System.out.println(
                "WORKER HELP MESSAGE SAVED"
        );

        System.out.println(
                "MESSAGE ID = " +
                        saved.getId()
        );

        System.out.println(
                "================================="
        );

        return saved;
    }


    // =====================================================
    // GET ALL MESSAGES
    // =====================================================

    public List<WorkerMessage> getAllMessages() {

        return workerMessageRepository.findAll();
    }


    // =====================================================
    // GET PENDING MESSAGES
    // =====================================================

    public List<WorkerMessage> getPendingMessages() {

        return workerMessageRepository
                .findByStatus("PENDING");
    }


    // =====================================================
    // GET WORKER MESSAGES
    // =====================================================

    public List<WorkerMessage> getMessagesByWorker(
            String workerId) {

        return workerMessageRepository
                .findByWorkerId(workerId);
    }


    // =====================================================
    // GET CURRENT MESSAGE FOR TEAM
    // =====================================================

    public WorkerMessage getCurrentMessage(
            String teamId) {

        return workerMessageRepository
                .findFirstByAcceptedByTeamIdAndStatus(
                        teamId,
                        "ACCEPTED"
                )
                .orElse(null);
    }


    // =====================================================
    // ACCEPT MESSAGE
    // =====================================================

    @Transactional
    public WorkerMessage acceptMessage(
            String messageId,
            String teamId,
            String teamName) {

        // -------------------------------------------------
        // TEAM ID CHECK
        // -------------------------------------------------

        if (teamId == null ||
                teamId.isBlank()) {

            throw new RuntimeException(
                    "TEAM_ID_REQUIRED"
            );
        }


        // -------------------------------------------------
        // TEAM BUSY CHECK
        // -------------------------------------------------

        boolean activeHelp =
                workerMessageRepository
                        .existsByAcceptedByTeamIdAndStatus(
                                teamId,
                                "ACCEPTED"
                        );

        if (activeHelp) {

            throw new RuntimeException(
                    "TEAM_BUSY"
            );
        }


        // -------------------------------------------------
        // FIND MESSAGE
        // -------------------------------------------------

        WorkerMessage message =
                workerMessageRepository
                        .findById(messageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "MESSAGE_NOT_FOUND"
                                )
                        );


        // -------------------------------------------------
        // MUST BE PENDING
        // -------------------------------------------------

        if (!"PENDING".equals(
                message.getStatus()
        )) {

            throw new RuntimeException(
                    "MESSAGE_NOT_PENDING"
            );
        }


        // -------------------------------------------------
        // ACCEPT
        // -------------------------------------------------

        message.setStatus(
                "ACCEPTED"
        );

        message.setAcceptedByTeamId(
                teamId
        );

        message.setAcceptedByTeamName(
                teamName
        );

        message.setAcceptedAt(
                LocalDateTime.now()
        );

        message.setUpdatedAt(
                LocalDateTime.now()
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        WorkerMessage saved =
                workerMessageRepository.save(
                        message
                );


        // -------------------------------------------------
        // TEAM → BUSY
        // -------------------------------------------------

        authClient.updateTeamStatus(
                teamId,
                "BUSY"
        );


        return saved;
    }


    // =====================================================
    // COMPLETE MESSAGE
    // =====================================================

    @Transactional
    public WorkerMessage completeMessage(
            String messageId) {

        // -------------------------------------------------
        // FIND MESSAGE
        // -------------------------------------------------

        WorkerMessage message =
                workerMessageRepository
                        .findById(messageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "MESSAGE_NOT_FOUND"
                                )
                        );


        // -------------------------------------------------
        // MUST BE ACCEPTED
        // -------------------------------------------------

        if (!"ACCEPTED".equals(
                message.getStatus()
        )) {

            throw new RuntimeException(
                    "MESSAGE_NOT_ACTIVE"
            );
        }


        // -------------------------------------------------
        // GET TEAM
        // -------------------------------------------------

        String teamId =
                message.getAcceptedByTeamId();


        // -------------------------------------------------
        // COMPLETE
        // -------------------------------------------------

        message.setStatus(
                "COMPLETED"
        );
        message.setCompletedAt(LocalDateTime.now());
        message.setUpdatedAt(
                LocalDateTime.now()
        );


        WorkerMessage completed =
                workerMessageRepository.save(
                        message
                );


        // -------------------------------------------------
        // TEAM → AVAILABLE
        // -------------------------------------------------

        if (teamId != null &&
                !teamId.isBlank()) {

            authClient.updateTeamStatus(
                    teamId,
                    "AVAILABLE"
            );
        }


        return completed;
    }


    // =====================================================
    // CANCEL MESSAGE
    // =====================================================

    @Transactional
    public WorkerMessage cancelMessage(
           String messageId) {

        // -------------------------------------------------
        // FIND MESSAGE
        // -------------------------------------------------

        WorkerMessage message =
                workerMessageRepository
                        .findById(messageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "MESSAGE_NOT_FOUND"
                                )
                        );


        // -------------------------------------------------
        // GET TEAM
        // -------------------------------------------------

        String teamId =
                message.getAcceptedByTeamId();


        // -------------------------------------------------
        // CANCEL
        // -------------------------------------------------

        message.setStatus(
                "CANCELLED"
        );

        message.setUpdatedAt(
                LocalDateTime.now()
        );


        WorkerMessage cancelled =
                workerMessageRepository.save(
                        message
                );


        // -------------------------------------------------
        // TEAM → AVAILABLE
        // -------------------------------------------------

        if (teamId != null &&
                !teamId.isBlank()) {

            authClient.updateTeamStatus(
                    teamId,
                    "AVAILABLE"
            );
        }



        return cancelled;
    }
    private String generateWorkerMessageId() {

        long nextNumber = workerMessageRepository.findAll()
                .stream()
                .map(WorkerMessage::getId)
                .filter(id -> id != null && id.startsWith("WOR-"))
                .map(id -> id.substring(4))
                .filter(value -> value.matches("\\d+"))
                .mapToLong(Long::parseLong)
                .max()
                .orElse(0) + 1;

        return String.format("WOR-%03d", nextNumber);
    }
}