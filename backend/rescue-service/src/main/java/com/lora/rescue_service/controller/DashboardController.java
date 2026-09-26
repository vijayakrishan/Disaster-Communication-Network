package com.lora.rescue_service.controller;

import com.lora.rescue_service.dto.AcceptRequestDTO;
import com.lora.rescue_service.dto.DashboardSummaryDTO;
import com.lora.rescue_service.entity.SOS;
import com.lora.rescue_service.entity.WorkerMessage;
import com.lora.rescue_service.service.DashboardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5180")
public class DashboardController {

        @Autowired
        private DashboardService dashboardService;


        // =====================================================
        // DASHBOARD SUMMARY
        // =====================================================

        @GetMapping("/summary")
        public ResponseEntity<DashboardSummaryDTO> getSummary() {

            return ResponseEntity.ok(
                    dashboardService.getSummary()
            );
        }
    @GetMapping("/sos/user/{email}")
    public ResponseEntity<?> getSOSByUser(
            @PathVariable String email) {

        return ResponseEntity.ok(
                dashboardService.getSOSByUser(email)
        );
    }
    // =====================================================
// CREATE SOS
// =====================================================

    @PostMapping("/sos")
    public ResponseEntity<?> createSOS(
            @RequestBody SOS sos) {

        try {

            SOS createdSOS =
                    dashboardService.createSOS(sos);

            return ResponseEntity.ok(createdSOS);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
        // =====================================================
        // GET PENDING SOS
        // =====================================================

        @GetMapping("/sos/pending")
        public ResponseEntity<List<SOS>> getPendingSOS() {

            return ResponseEntity.ok(
                    dashboardService.getPendingSOS()
            );
        }
        // =====================================================
    // GET ALL SOS
    // =====================================================

        @GetMapping("/sos/all")
        public ResponseEntity<List<SOS>> getAllSOS() {

            return ResponseEntity.ok(
                    dashboardService.getAllSOS()
            );
        }


        // =====================================================
        // ACCEPT SOS
        // =====================================================

        @PostMapping("/sos/{sosId}/accept")
        public ResponseEntity<?> acceptSOS(
                @PathVariable Long sosId,
                @RequestBody AcceptRequestDTO request) {

            try {

                SOS acceptedSOS =
                        dashboardService.acceptSOS(
                                sosId,
                                request
                        );

                return ResponseEntity.ok(
                        acceptedSOS
                );

            } catch (RuntimeException e) {

                if ("TEAM_BUSY".equals(
                        e.getMessage()
                )) {

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
        // CURRENT SOS FOR TEAM
        // =====================================================

        @GetMapping("/team/{teamId}/current-sos")
        public ResponseEntity<?> getCurrentSOS(
                @PathVariable String teamId) {

            SOS sos =
                    dashboardService.getCurrentRescue(
                            teamId
                    );

            if (sos == null) {

                return ResponseEntity
                        .noContent()
                        .build();
            }

            return ResponseEntity.ok(sos);
        }


        // =====================================================
        // COMPLETE SOS
        // =====================================================

        @PutMapping("/sos/{sosId}/complete")
        public ResponseEntity<?> completeSOS(
                @PathVariable String sosId) {

            System.out.println("=================================");
            System.out.println("COMPLETE SOS REQUEST RECEIVED");
            System.out.println("SOS ID = " + sosId);

            try {

                SOS completed =
                        dashboardService.completeRescue(
                                sosId
                        );

                System.out.println(
                        "COMPLETE SOS SUCCESS"
                );

                System.out.println(
                        "DATABASE ID = " +
                                completed.getId()
                );

                System.out.println(
                        "SOS ID = " +
                                completed.getSosId()
                );

                System.out.println(
                        "STATUS = " +
                                completed.getRescueStatus()
                );

                System.out.println(
                        "================================="
                );

                return ResponseEntity.ok(
                        completed
                );

            } catch (Exception e) {

                System.out.println(
                        "================================="
                );

                System.out.println(
                        "COMPLETE SOS FAILED"
                );

                System.out.println(
                        "SOS ID = " +
                                sosId
                );

                System.out.println(
                        "ERROR = " +
                                e.getMessage()
                );

                e.printStackTrace();

                System.out.println(
                        "================================="
                );

                return ResponseEntity
                        .badRequest()
                        .body(e.getMessage());
            }
        }


        // =====================================================
        // GET SOS HISTORY
        // =====================================================

        @GetMapping("/team/{teamId}/history")
        public ResponseEntity<List<SOS>> getHistory(
                @PathVariable String teamId) {

            return ResponseEntity.ok(
                    dashboardService.getHistory(
                            teamId
                    )
            );
        }
    @GetMapping("/worker-messages/all")
    public ResponseEntity<List<WorkerMessage>> getAllWorkerMessages() {

        return ResponseEntity.ok(
                dashboardService.getAllWorkerMessages()
        );
    }

        // =====================================================
        // GET PENDING WORKER MESSAGES
        // =====================================================

        @GetMapping("/worker-messages/pending")
        public ResponseEntity<List<WorkerMessage>>
        getPendingWorkerMessages() {

            return ResponseEntity.ok(
                    dashboardService
                            .getPendingWorkerMessages()
            );
        }


        // =====================================================
        // ACCEPT WORKER MESSAGE
        // =====================================================

        @PostMapping(
                "/worker-messages/{messageId}/accept"
        )
        public ResponseEntity<?> acceptWorkerMessage(
                @PathVariable String messageId,
                @RequestBody AcceptRequestDTO request) {

            try {

                WorkerMessage accepted =
                        dashboardService.acceptWorkerMessage(
                                messageId,
                                request
                        );

                return ResponseEntity.ok(
                        accepted
                );

            } catch (RuntimeException e) {

                if ("TEAM_BUSY".equals(
                        e.getMessage()
                )) {

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
        // CURRENT HELP MESSAGE
        // =====================================================

        @GetMapping(
                "/team/{teamId}/current-help"
        )
        public ResponseEntity<?> getCurrentHelp(
                @PathVariable String teamId) {

            WorkerMessage message =
                    dashboardService
                            .getCurrentHelpMission(
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
        // COMPLETE HELP MESSAGE
        // =====================================================

        @PutMapping(
                "/worker-messages/{messageId}/complete"
        )
        public ResponseEntity<?> completeHelp(
                @PathVariable String messageId) {

            try {

                WorkerMessage completed =
                        dashboardService
                                .completeHelpMission(
                                        messageId
                                );

                return ResponseEntity.ok(
                        completed
                );

            } catch (RuntimeException e) {
                if ("TEAM_BUSY".equals(
                        e.getMessage()
                )) {

                    return ResponseEntity
                            .status(409)
                            .body("TEAM_BUSY");
                }
                return ResponseEntity
                        .badRequest()
                        .body(e.getMessage());
            }
        }

}