package com.lora.sos_service.service;
import com.lora.sos_service.dto.RescueSOSRequest;
import org.springframework.web.client.RestTemplate;
import com.lora.sos_service.client.AuthClient;
import com.lora.sos_service.dto.TeamDTO;
import com.lora.sos_service.entity.SosAlert;
import com.lora.sos_service.repository.SosAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;

@Service
public class SosAlertService {

    private final SosAlertRepository sosAlertRepository;
    private final AuthClient authClient;
    private final RestTemplate restTemplate;
    public SosAlertService(
            SosAlertRepository sosAlertRepository,
            AuthClient authClient, RestTemplate restTemplate) {

        this.sosAlertRepository = sosAlertRepository;
        this.authClient = authClient;
        this.restTemplate = restTemplate;
    }

    // ============================================================
    // CREATE SOS
    // ============================================================

    @Transactional
    public SosAlert createSos(SosAlert sosAlert) {

        if (sosAlert.getVictimName() == null ||
                sosAlert.getVictimName().isBlank()) {

            throw new IllegalArgumentException(
                    "Victim name is required"
            );
        }

        if (sosAlert.getLatitude() == null ||
                sosAlert.getLongitude() == null) {

            throw new IllegalArgumentException(
                    "Location is required"
            );
        }

        if (sosAlert.getPriority() == null ||
                sosAlert.getPriority().isBlank()) {

            sosAlert.setPriority("HIGH");
        }

        sosAlert.setStatus("PENDING");

        sosAlert.setAssignedTeamId(null);
        sosAlert.setAcceptedWorkerId(null);
        sosAlert.setAcceptedAt(null);
        sosAlert.setCompletedAt(null);

        // ============================================================
        // 1. SAVE INTO lora_sos_db
        // ============================================================

        SosAlert savedSOS = sosAlertRepository.save(sosAlert);

        System.out.println(
                "SOS SAVED IN sos_service: " + savedSOS.getId()
        );

        // ============================================================
        // 2. SEND TO rescue_service
        // ============================================================

        try {

            RescueSOSRequest request = new RescueSOSRequest();

            // sos_service UUID becomes rescue_service sosId
            request.setSosId(savedSOS.getId());


            request.setUserEmail(
                    savedSOS.getSenderEmail()
            );

            request.setUserName(
                    savedSOS.getVictimName()
            );

            request.setDeviceId(
                    savedSOS.getDeviceId()
            );

            request.setSource("WEB");

            request.setMessage(
                    savedSOS.getEmergencyDetails()
            );

            request.setLatitude(
                    savedSOS.getLatitude()
            );

            request.setLongitude(
                    savedSOS.getLongitude()
            );

            String rescueServiceUrl =
                    "http://localhost:8086/api/dashboard/sos";

            restTemplate.postForEntity(
                    rescueServiceUrl,
                    request,
                    Object.class
            );

            System.out.println(
                    "SOS SENT TO rescue_service SUCCESSFULLY"
            );

        } catch (Exception e) {

            System.err.println(
                    "FAILED TO SEND SOS TO rescue_service"
            );

            System.err.println(
                    "Error: " + e.getMessage()
            );
        }

        return savedSOS;
    }
    // ============================================================
    // GET ALL SOS
    // ============================================================

    public List<SosAlert> getAllSos() {

        return sosAlertRepository
                .findAllByOrderByCreatedAtDesc();
    }

    // ============================================================
    // GET USER SOS HISTORY
    // ============================================================

    public List<SosAlert> getUserSosHistory(
            String senderUserId) {

        return sosAlertRepository
                .findBySenderUserIdOrderByCreatedAtDesc(
                        senderUserId
                );
    }

    // ============================================================
    // GET PENDING SOS
    // ============================================================

    public List<SosAlert> getPendingSos() {

        return sosAlertRepository
                .findByStatusOrderByCreatedAtDesc(
                        "PENDING"
                );
    }

    // ============================================================
    // GET SINGLE SOS
    // ============================================================

    public SosAlert getSos(String id) {

        return sosAlertRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "SOS not found: " + id
                        )
                );
    }

    // ============================================================
    // UPDATE STATUS
    // ============================================================

    @Transactional
    public SosAlert updateStatus(
            String id,
            String status) {

        if (status == null ||
                status.isBlank()) {

            throw new IllegalArgumentException(
                    "Status is required"
            );
        }

        SosAlert sosAlert =
                sosAlertRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "SOS not found: " + id
                                )
                        );

        String newStatus = status.toUpperCase();

        sosAlert.setStatus(newStatus);

        if ("COMPLETED".equals(newStatus)) {

            sosAlert.setCompletedAt(
                    LocalDateTime.now()
            );

            if (sosAlert.getAssignedTeamId() != null) {

                authClient.updateTeamStatus(
                        sosAlert.getAssignedTeamId(),
                        "AVAILABLE"
                );
            }
        }

        return sosAlertRepository.save(sosAlert);
    }

    // ============================================================
    // ACCEPT SOS
    // ============================================================

    @Transactional
    public SosAlert acceptSos(
            String id,
            String teamId,
            String teamName) {

        if (teamId == null ||
                teamId.isBlank()) {

            throw new IllegalArgumentException(
                    "Team ID is required"
            );
        }

        // --------------------------------------------------------
        // GET TEAM
        // --------------------------------------------------------

        TeamDTO team =
                authClient.getTeamById(teamId);

        if (team == null) {

            throw new RuntimeException(
                    "TEAM_NOT_FOUND"
            );
        }

        // --------------------------------------------------------
        // CHECK TEAM STATUS
        // --------------------------------------------------------

        if (!"AVAILABLE".equalsIgnoreCase(
                team.getOperationalState()
        )) {

            throw new RuntimeException(
                    "TEAM_BUSY"
            );
        }

        // --------------------------------------------------------
        // GET SOS
        // --------------------------------------------------------

        SosAlert sosAlert =
                sosAlertRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "SOS_NOT_FOUND"
                                )
                        );

        // --------------------------------------------------------
        // CHECK SOS STATUS
        // --------------------------------------------------------

        if (!"PENDING".equalsIgnoreCase(
                sosAlert.getStatus()
        )) {

            throw new RuntimeException(
                    "SOS_NOT_PENDING"
            );
        }

        // --------------------------------------------------------
        // ASSIGN TEAM
        // --------------------------------------------------------

        sosAlert.setStatus("IN_PROGRESS");

        sosAlert.setAssignedTeamId(teamId);

        sosAlert.setAcceptedAt(
                LocalDateTime.now()
        );

        // --------------------------------------------------------
        // UPDATE TEAM → BUSY
        // --------------------------------------------------------

        authClient.updateTeamStatus(
                teamId,
                "BUSY"
        );

        // --------------------------------------------------------
        // SAVE
        // --------------------------------------------------------

        return sosAlertRepository.save(
                sosAlert
        );
    }

    // ============================================================
    // COMPLETE SOS
    // ============================================================

    @Transactional
    public SosAlert completeSos(String id) {

        SosAlert sosAlert =
                sosAlertRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "SOS_NOT_FOUND"
                                )
                        );

        if (!"IN_PROGRESS".equalsIgnoreCase(
                sosAlert.getStatus()
        )) {

            throw new RuntimeException(
                    "SOS_NOT_IN_PROGRESS"
            );
        }

        sosAlert.setStatus("COMPLETED");

        sosAlert.setCompletedAt(
                LocalDateTime.now()
        );

        SosAlert saved =
                sosAlertRepository.save(
                        sosAlert
                );

        // --------------------------------------------------------
        // TEAM → AVAILABLE
        // --------------------------------------------------------

        if (saved.getAssignedTeamId() != null) {

            authClient.updateTeamStatus(
                    saved.getAssignedTeamId(),
                    "AVAILABLE"
            );
        }

        return saved;
    }

    // ============================================================
    // CANCEL SOS
    // ============================================================

    @Transactional
    public SosAlert cancelSos(String id) {

        SosAlert sosAlert =
                sosAlertRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "SOS_NOT_FOUND"
                                )
                        );

        if ("COMPLETED".equalsIgnoreCase(
                sosAlert.getStatus()
        )) {

            throw new RuntimeException(
                    "COMPLETED_SOS_CANNOT_BE_CANCELLED"
            );
        }

        sosAlert.setStatus("CANCELLED");

        SosAlert saved =
                sosAlertRepository.save(
                        sosAlert
                );

        // --------------------------------------------------------
        // TEAM → AVAILABLE
        // --------------------------------------------------------

        if (saved.getAssignedTeamId() != null) {

            authClient.updateTeamStatus(
                    saved.getAssignedTeamId(),
                    "AVAILABLE"
            );
        }

        return saved;
    }
}