package com.lora.rescue_service.service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

import com.lora.rescue_service.client.AuthClient;
import com.lora.rescue_service.dto.AcceptRequestDTO;
import com.lora.rescue_service.dto.DashboardSummaryDTO;
import com.lora.rescue_service.dto.TeamDTO;
import com.lora.rescue_service.entity.RescueAssignment;
import com.lora.rescue_service.entity.SOS;
import com.lora.rescue_service.entity.WorkerMessage;
import com.lora.rescue_service.repository.RescueAssignmentRepository;
import com.lora.rescue_service.repository.SOSRepository;
import com.lora.rescue_service.repository.WorkerMessageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class DashboardService {


    @Autowired
    private SOSRepository sosRepository;


    @Autowired
    private WorkerMessageRepository workerMessageRepository;


    @Autowired
    private RescueAssignmentRepository rescueAssignmentRepository;


    @Autowired
    private AuthClient authClient;



    // =========================================================
    // DASHBOARD SUMMARY
    // =========================================================

    public DashboardSummaryDTO getSummary() {

        DashboardSummaryDTO dto =
                new DashboardSummaryDTO();


        // =====================================================
        // 1. TOTAL TEAMS
        // =====================================================

        long totalTeams =
                authClient.getTeamCount();


        // =====================================================
        // 2. ACTIVE SOS
        //
        // PENDING is NOT active.
        //
        // Active rescue = IN_PROGRESS
        // =====================================================

        long activeSOS =
                sosRepository.countByRescueStatus(
                        "IN_PROGRESS"
                );


        // =====================================================
        // 3. GET ACTIVE SOS RECORDS
        //
        // Used to find unique teams currently
        // handling SOS.
        // =====================================================

        List<SOS> activeSOSList =
                sosRepository.findByRescueStatus(
                        "IN_PROGRESS"
                );


        Set<String> teamsOnSOS =
                new HashSet<>();


        for (SOS sos : activeSOSList) {

            String teamId =
                    sos.getAssignedTeamId();

            if (teamId != null &&
                    !teamId.isBlank()) {

                teamsOnSOS.add(teamId);
            }
        }


        // =====================================================
        // 4. ACTIVE WORKER HELP
        //
        // ACCEPTED worker message means
        // team is currently helping.
        // =====================================================

        List<WorkerMessage> activeWorkerMessages =
                workerMessageRepository.findByStatus(
                        "ACCEPTED"
                );


        Set<String> teamsOnWorkerHelp =
                new HashSet<>();


        for (
                WorkerMessage message :
                activeWorkerMessages
        ) {

            String teamId =
                    message.getAcceptedByTeamId();

            if (teamId != null &&
                    !teamId.isBlank()) {

                teamsOnWorkerHelp.add(teamId);
            }
        }


        // =====================================================
        // 5. TOTAL UNIQUE TEAMS ON RESCUE
        //
        // IMPORTANT:
        //
        // Same team may have SOS + worker help.
        //
        // Example:
        //
        // team-01 → SOS
        // team-01 → Worker Help
        //
        // Should count as ONE team.
        // =====================================================

        Set<String> allBusyTeams =
                new HashSet<>();


        allBusyTeams.addAll(
                teamsOnSOS
        );


        allBusyTeams.addAll(
                teamsOnWorkerHelp
        );


        long teamsOnRescue =
                allBusyTeams.size();


        // =====================================================
        // 6. AVAILABLE TEAMS
        // =====================================================

        long availableTeams =
                totalTeams - teamsOnRescue;


        if (availableTeams < 0) {

            availableTeams = 0;
        }


        // =====================================================
        // 7. DEBUG
        // =====================================================

        System.out.println(
                "================================="
        );

        System.out.println(
                "DASHBOARD SUMMARY"
        );

        System.out.println(
                "TOTAL TEAMS = " +
                        totalTeams
        );

        System.out.println(
                "ACTIVE SOS = " +
                        activeSOS
        );

        System.out.println(
                "SOS TEAMS = " +
                        teamsOnSOS.size()
        );

        System.out.println(
                "WORKER HELP TEAMS = " +
                        teamsOnWorkerHelp.size()
        );

        System.out.println(
                "UNIQUE TEAMS ON RESCUE = " +
                        teamsOnRescue
        );

        System.out.println(
                "AVAILABLE TEAMS = " +
                        availableTeams
        );

        System.out.println(
                "================================="
        );


        // =====================================================
        // 8. SET RESPONSE
        // =====================================================

        dto.setAvailableTeams(
                availableTeams
        );


        dto.setActiveSOS(
                activeSOS
        );


        dto.setTeamsOnRescue(
                teamsOnRescue
        );


        dto.setNetworkHealth(
                "Excellent"
        );


        return dto;
    }


    // =====================================================
// CREATE SOS
// =====================================================

    // =====================================================
// CREATE SOS
// =====================================================

    @Transactional
    public SOS createSOS(SOS sos) {

        // =====================================================
        // 1. GENERATE SEQUENTIAL SOS ID
        // =====================================================

        Long maxNumber = sosRepository.findMaxSosNumber();

        long nextNumber = maxNumber + 1;

        sos.setSosId("SOS-" + nextNumber);


        // =====================================================
        // 2. DEFAULT STATUS
        // =====================================================

        if (sos.getRescueStatus() == null ||
                sos.getRescueStatus().isBlank()) {

            sos.setRescueStatus("PENDING");
        }


        // =====================================================
        // 3. NEW SOS HAS NO TEAM
        // =====================================================

        sos.setAssignedTeamId(null);
        sos.setAssignedTeam(null);


        // =====================================================
        // 4. TEAM AVAILABLE FOR NEW SOS
        // =====================================================

        sos.setTeamAvailability("AVAILABLE");


        // =====================================================
        // DEBUG
        // =====================================================

        System.out.println("=================================");
        System.out.println("CREATE SOS REQUEST");
        System.out.println("GENERATED SOS ID = " + sos.getSosId());
        System.out.println("USER EMAIL = " + sos.getUserEmail());
        System.out.println("DEVICE ID = " + sos.getDeviceId());
        System.out.println("SOURCE = " + sos.getSource());
        System.out.println("MESSAGE = " + sos.getMessage());
        System.out.println("LATITUDE = " + sos.getLatitude());
        System.out.println("LONGITUDE = " + sos.getLongitude());
        System.out.println("STATUS = " + sos.getRescueStatus());
        System.out.println("=================================");


        // =====================================================
        // 5. SAVE
        // =====================================================

        return sosRepository.save(sos);
    }
    // =====================================================
    // GET ALL SOS
    // =====================================================

    public List<SOS> getAllSOS() {

        return sosRepository.findAll();
    }



    // =====================================================
    // GET PENDING SOS
    // =====================================================

    public List<SOS> getPendingSOS() {

        return sosRepository.findByRescueStatus(
                "PENDING"
        );
    }



    // =====================================================
    // GET PENDING WORKER MESSAGES
    // =====================================================

    public List<WorkerMessage>
    getPendingWorkerMessages() {

        return workerMessageRepository.findByStatus(
                "PENDING"
        );
    }



    // =========================================================
    // CHECK WHETHER TEAM IS BUSY
    // =========================================================

    private boolean isTeamBusy(
            String teamId) {


        // -----------------------------------------------------
        // CHECK ACTIVE SOS
        // -----------------------------------------------------

        boolean activeSOS =
                sosRepository
                        .findByAssignedTeamIdAndRescueStatus(
                                teamId,
                                "IN_PROGRESS"
                        )
                        .isPresent();


        if (activeSOS) {

            return true;
        }


        // -----------------------------------------------------
        // CHECK ACTIVE WORKER HELP
        // -----------------------------------------------------

        boolean activeHelp =
                workerMessageRepository
                        .existsByAcceptedByTeamIdAndStatus(
                                teamId,
                                "ACCEPTED"
                        );


        if (activeHelp) {

            return true;
        }


        // -----------------------------------------------------
        // CHECK RESCUE ASSIGNMENT
        // -----------------------------------------------------

        boolean activeAssignment =
                rescueAssignmentRepository
                        .existsByTeamIdAndStatus(
                                teamId,
                                "IN_PROGRESS"
                        );


        return activeAssignment;
    }



    // =========================================================
    // ACCEPT SOS
    // =========================================================

    @Transactional
    public SOS acceptSOS(
            Long sosId,
            AcceptRequestDTO request) {



        String teamId =
                request.getTeamId();


        // -----------------------------------------------------
        // 1. CHECK TEAM ID
        // -----------------------------------------------------

        if (teamId == null ||
                teamId.isBlank()) {

            throw new RuntimeException(
                    "TEAM_ID_REQUIRED"
            );
        }


        // -----------------------------------------------------
        // 2. CHECK TEAM BUSY
        // -----------------------------------------------------

        if (isTeamBusy(teamId)) {

            throw new RuntimeException(
                    "TEAM_BUSY"
            );
        }


        // -----------------------------------------------------
        // 3. GET SOS
        // -----------------------------------------------------

        SOS sos =
                sosRepository
                        .findById(sosId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "SOS_NOT_FOUND"
                                )
                        );


        // -----------------------------------------------------
        // 4. SOS MUST BE PENDING
        // -----------------------------------------------------

        if (!"PENDING".equals(
                sos.getRescueStatus()
        )) {

            throw new RuntimeException(
                    "SOS_NOT_PENDING"
            );
        }


        // -----------------------------------------------------
        // 5. ASSIGN TEAM
        // -----------------------------------------------------

        sos.setAssignedTeamId(
                teamId
        );


        sos.setAssignedTeam(
                request.getTeamName()
        );
        sos.setStartTime(LocalDateTime.now());
        sos.setRescueStatus("IN_PROGRESS");
        sos.setTeamAvailability("BUSY");

        // -----------------------------------------------------
        // IMPORTANT
        //
        // ACCEPTED SOS = ACTIVE RESCUE
        //
        // IN_PROGRESS is used everywhere
        // in backend for active rescue.
        // -----------------------------------------------------




        System.out.println(
                "================================="
        );

        System.out.println(
                "ACCEPT SOS"
        );

        System.out.println(
                "SOS ID = " +
                        sos.getSosId()
        );

        System.out.println(
                "TEAM ID = " +
                        teamId
        );

        System.out.println(
                "TEAM NAME = " +
                        request.getTeamName()
        );

        System.out.println(
                "NEW STATUS = " +
                        sos.getRescueStatus()
        );

        System.out.println(
                "================================="
        );


        // -----------------------------------------------------
        // 6. SAVE SOS
        // -----------------------------------------------------

        SOS savedSOS =
                sosRepository.save(
                        sos
                );


        // -----------------------------------------------------
        // 7. TEAM → BUSY
        // -----------------------------------------------------

        authClient.updateTeamStatus(
                teamId,
                "BUSY"
        );


        // -----------------------------------------------------
        // 8. CREATE RESCUE ASSIGNMENT
        // -----------------------------------------------------

        RescueAssignment assignment =
                new RescueAssignment();


        assignment.setSos(
                savedSOS
        );


        assignment.setTeamId(
                teamId
        );


        assignment.setTeamName(
                request.getTeamName()
        );


        assignment.setStatus(
                "IN_PROGRESS"
        );


        assignment.setAssignedTime(
                LocalDateTime.now()
        );


        // -----------------------------------------------------
        // 9. SAVE ASSIGNMENT
        // -----------------------------------------------------

        rescueAssignmentRepository.save(
                assignment
        );


        return savedSOS;
    }



    // =========================================================
    // ACCEPT WORKER MESSAGE
    // =========================================================

    @Transactional
    public WorkerMessage acceptWorkerMessage(
            String messageId,
            AcceptRequestDTO request) {


        String teamId =
                request.getTeamId();


        // -----------------------------------------------------
        // 1. CHECK TEAM ID
        // -----------------------------------------------------

        if (teamId == null ||
                teamId.isBlank()) {

            throw new RuntimeException(
                    "TEAM_ID_REQUIRED"
            );
        }


        // -----------------------------------------------------
        // 2. CHECK TEAM BUSY
        // -----------------------------------------------------

        if (isTeamBusy(teamId)) {

            throw new RuntimeException(
                    "TEAM_BUSY"
            );
        }


        // -----------------------------------------------------
        // 3. GET WORKER MESSAGE
        // -----------------------------------------------------

        WorkerMessage message =
                workerMessageRepository
                        .findById(messageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "MESSAGE_NOT_FOUND"
                                )
                        );


        // -----------------------------------------------------
        // 4. MESSAGE MUST BE PENDING
        // -----------------------------------------------------

        if (!"PENDING".equals(
                message.getStatus()
        )) {

            throw new RuntimeException(
                    "MESSAGE_NOT_PENDING"
            );
        }


        // -----------------------------------------------------
        // 5. ACCEPT MESSAGE
        // -----------------------------------------------------

        message.setStatus(
                "ACCEPTED"
        );


        message.setAcceptedByTeamId(
                teamId
        );


        message.setAcceptedByTeamName(
                request.getTeamName()
        );


        message.setAcceptedAt(
                LocalDateTime.now()
        );


        // -----------------------------------------------------
        // DEBUG
        // -----------------------------------------------------

        System.out.println(
                "================================="
        );

        System.out.println(
                "ACCEPT WORKER MESSAGE"
        );

        System.out.println(
                "MESSAGE ID = " +
                        messageId
        );

        System.out.println(
                "TEAM ID = " +
                        teamId
        );

        System.out.println(
                "TEAM NAME = " +
                        request.getTeamName()
        );

        System.out.println(
                "NEW STATUS = " +
                        message.getStatus()
        );

        System.out.println(
                "================================="
        );


        // -----------------------------------------------------
        // 6. SAVE MESSAGE
        // -----------------------------------------------------

        WorkerMessage savedMessage =
                workerMessageRepository.save(
                        message
                );


        // -----------------------------------------------------
        // 7. TEAM → BUSY
        // -----------------------------------------------------

        authClient.updateTeamStatus(
                teamId,
                "BUSY"
        );


        return savedMessage;
    }



    // =========================================================
    // GET CURRENT SOS
    // =========================================================

    public SOS getCurrentRescue(
            String teamId) {

        return sosRepository
                .findByAssignedTeamIdAndRescueStatus(
                        teamId,
                        "IN_PROGRESS"
                )
                .orElse(null);
    }



    // =========================================================
    // GET CURRENT WORKER HELP MESSAGE
    // =========================================================

    public WorkerMessage getCurrentHelpMission(
            String teamId) {

        return workerMessageRepository
                .findFirstByAcceptedByTeamIdAndStatus(
                        teamId,
                        "ACCEPTED"
                )
                .orElse(null);
    }



    // =========================================================
    // COMPLETE SOS
    // =========================================================

    @Transactional
    public SOS completeRescue(
            String sosId) {


        System.out.println(
                "================================="
        );

        System.out.println(
                "SERVICE: COMPLETE RESCUE"
        );

        System.out.println(
                "SOS DISPLAY ID = " +
                        sosId
        );


        // -----------------------------------------------------
        // 1. FIND SOS
        // -----------------------------------------------------

        SOS sos =
                sosRepository
                        .findBySosId(sosId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "SOS_NOT_FOUND"
                                )
                        );


        // -----------------------------------------------------
        // 2. CHECK STATUS
        // -----------------------------------------------------

        if (!"IN_PROGRESS".equals(
                sos.getRescueStatus()
        )) {

            throw new RuntimeException(
                    "SOS_NOT_IN_PROGRESS"
            );
        }


        // -----------------------------------------------------
        // 3. GET TEAM
        // -----------------------------------------------------

        String teamId =
                sos.getAssignedTeamId();


        if (teamId == null ||
                teamId.isBlank()) {

            throw new RuntimeException(
                    "NO_TEAM_ASSIGNED"
            );
        }


        // -----------------------------------------------------
        // 4. SOS → COMPLETED
        // -----------------------------------------------------

        // =====================================================
// 4. SOS → COMPLETED
// =====================================================



        sos.setTeamAvailability(
                "AVAILABLE"
        );

        sos.setRescueStatus(
                "COMPLETED"
        );

        sos.setEndTime(
                LocalDateTime.now()
        );

        SOS completed =
                sosRepository.save(
                        sos
                );


        // -----------------------------------------------------
        // 5. ASSIGNMENT → COMPLETED
        // -----------------------------------------------------

        Optional<RescueAssignment> assignment =
                rescueAssignmentRepository
                        .findBySosId(
                                sos.getId()
                        );


        if (assignment.isPresent()) {

            RescueAssignment rescue =
                    assignment.get();


            rescue.setStatus(
                    "COMPLETED"
            );


            rescue.setCompletedTime(
                    LocalDateTime.now()
            );


            rescueAssignmentRepository.save(
                    rescue
            );
        }


        // -----------------------------------------------------
        // 6. TEAM → AVAILABLE
        // -----------------------------------------------------

        authClient.updateTeamStatus(
                teamId,
                "AVAILABLE"
        );


        System.out.println(
                "TEAM STATUS UPDATED = AVAILABLE"
        );


        System.out.println(
                "SOS STATUS UPDATED = COMPLETED"
        );


        System.out.println(
                "================================="
        );


        return completed;
    }



    // =========================================================
    // COMPLETE WORKER MESSAGE
    // =========================================================

    @Transactional
    public WorkerMessage completeHelpMission(
            String messageId) {


        // -----------------------------------------------------
        // 1. FIND MESSAGE
        // -----------------------------------------------------

        WorkerMessage message =
                workerMessageRepository
                        .findById(messageId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "MESSAGE_NOT_FOUND"
                                )
                        );


        // -----------------------------------------------------
        // 2. CHECK STATUS
        // -----------------------------------------------------

        if (!"ACCEPTED".equals(
                message.getStatus()
        )) {

            throw new RuntimeException(
                    "MESSAGE_NOT_ACTIVE"
            );
        }


        // -----------------------------------------------------
        // 3. GET TEAM
        // -----------------------------------------------------

        String teamId =
                message.getAcceptedByTeamId();


        if (teamId == null ||
                teamId.isBlank()) {

            throw new RuntimeException(
                    "NO_TEAM_ASSIGNED"
            );
        }


        // -----------------------------------------------------
        // 4. MESSAGE → COMPLETED
        // -----------------------------------------------------

        message.setStatus(
                "COMPLETED"
        );


        WorkerMessage completed =
                workerMessageRepository.save(
                        message
                );


        // -----------------------------------------------------
        // 5. TEAM → AVAILABLE
        // -----------------------------------------------------

        authClient.updateTeamStatus(
                teamId,
                "AVAILABLE"
        );


        System.out.println(
                "================================="
        );

        System.out.println(
                "WORKER HELP COMPLETED"
        );

        System.out.println(
                "MESSAGE ID = " +
                        messageId
        );

        System.out.println(
                "TEAM ID = " +
                        teamId
        );

        System.out.println(
                "TEAM STATUS UPDATED = AVAILABLE"
        );

        System.out.println(
                "================================="
        );


        return completed;
    }



    // =========================================================
    // ACTIVE RESCUES
    // =========================================================

    public List<RescueAssignment>
    getActiveRescues() {

        return rescueAssignmentRepository
                .findByStatusOrderByAssignedTimeDesc(
                        "IN_PROGRESS"
                );
    }



    // =========================================================
    // SOS HISTORY
    // =========================================================

    public List<SOS> getHistory(
            String teamId) {

        return sosRepository
                .findByAssignedTeamId(
                        teamId
                );
    }



    // =========================================================
    // GET TEAM
    // =========================================================

    public TeamDTO getTeamById(
            String id) {

        return authClient.getTeamById(
                id
        );
    }



    // =========================================================
    // ALL WORKER MESSAGES
    // =========================================================

    public List<WorkerMessage>
    getAllWorkerMessages() {

        return workerMessageRepository.findAll();
    }
    public List<RescueAssignment>
    getAllHistory() {

        return rescueAssignmentRepository
                .findAllByOrderByAssignedTimeDesc();
    }
    public List<SOS> getSOSByUser(String email) {
        return sosRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }
}