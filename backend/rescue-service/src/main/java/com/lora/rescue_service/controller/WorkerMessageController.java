package com.lora.rescue_service.controller;

import com.lora.rescue_service.dto.AcceptRequestDTO;
import com.lora.rescue_service.dto.WorkerHelpRequestDTO;
import com.lora.rescue_service.entity.WorkerMessage;
import com.lora.rescue_service.service.WorkerMessageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/worker-messages")
@CrossOrigin(origins = "http://localhost:5180")
public class WorkerMessageController {


    @Autowired
    private WorkerMessageService workerMessageService;


    // =====================================================
    // WORKER SEND HELP REQUEST
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createHelpRequest(
            @RequestBody WorkerHelpRequestDTO request) {

        try {

            WorkerMessage saved =
                    workerMessageService
                            .createHelpRequest(
                                    request
                            );

            return ResponseEntity.ok(
                    saved
            );

        } catch (RuntimeException e) {

            System.out.println(
                    "CREATE WORKER MESSAGE ERROR = " +
                            e.getMessage()
            );

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    public ResponseEntity<List<WorkerMessage>>
    getAllMessages() {

        return ResponseEntity.ok(
                workerMessageService
                        .getAllMessages()
        );
    }


    // =====================================================
    // GET PENDING
    // =====================================================

    @GetMapping("/pending")
    public ResponseEntity<List<WorkerMessage>>
    getPendingMessages() {

        return ResponseEntity.ok(
                workerMessageService
                        .getPendingMessages()
        );
    }


    // =====================================================
    // GET WORKER MESSAGES
    // =====================================================

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<WorkerMessage>>
    getWorkerMessages(
            @PathVariable String workerId) {

        return ResponseEntity.ok(
                workerMessageService
                        .getMessagesByWorker(
                                workerId
                        )
        );
    }


    // =====================================================
    // ACCEPT
    // =====================================================

    @PostMapping("/{messageId}/accept")
    public ResponseEntity<?> acceptMessage(
            @PathVariable String messageId,
            @RequestBody AcceptRequestDTO request) {

        try {

            WorkerMessage accepted =
                    workerMessageService
                            .acceptMessage(
                                    messageId,
                                    request.getTeamId(),
                                    request.getTeamName()
                            );

            return ResponseEntity.ok(
                    accepted
            );

        } catch (RuntimeException e) {

            if (
                    "TEAM_BUSY".equals(
                            e.getMessage()
                    )
            ) {

                return ResponseEntity
                        .status(409)
                        .body("TEAM_BUSY");
            }

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // CURRENT MESSAGE
    // =====================================================

    @GetMapping("/team/{teamId}/current")
    public ResponseEntity<?> getCurrentMessage(
            @PathVariable String teamId) {

        WorkerMessage message =
                workerMessageService
                        .getCurrentMessage(
                                teamId
                        );

        if (message == null) {

            return ResponseEntity
                    .noContent()
                    .build();
        }

        return ResponseEntity.ok(
                message
        );
    }


    // =====================================================
    // COMPLETE
    // =====================================================

    @PutMapping("/{messageId}/complete")
    public ResponseEntity<?> completeMessage(
            @PathVariable String messageId) {

        try {

            WorkerMessage completed =
                    workerMessageService
                            .completeMessage(
                                    messageId
                            );

            return ResponseEntity.ok(
                    completed
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // CANCEL
    // =====================================================

    @PutMapping("/{messageId}/cancel")
    public ResponseEntity<?> cancelMessage(
            @PathVariable String messageId) {

        try {

            WorkerMessage cancelled =
                    workerMessageService
                            .cancelMessage(
                                    messageId
                            );

            return ResponseEntity.ok(
                    cancelled
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}