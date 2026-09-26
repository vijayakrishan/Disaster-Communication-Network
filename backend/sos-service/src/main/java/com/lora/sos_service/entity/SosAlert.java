package com.lora.sos_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sos_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SosAlert {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @Column(name = "sender_user_id", length = 36)
    private String senderUserId;
    @Column(name = "sender_email", length = 150)
    private String senderEmail;
    @Column(name = "device_id", length = 36)
    private String deviceId;

    @Column(name = "victim_name", nullable = false, length = 100)
    private String victimName;

    @Column(name = "victim_contact", length = 30)
    private String victimContact;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority;

    @Column(name = "emergency_details", columnDefinition = "TEXT")
    private String emergencyDetails;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "assigned_team_id", length = 36)
    private String assignedTeamId;

    @Column(name = "accepted_worker_id", length = 36)
    private String acceptedWorkerId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Version
    @Column(name = "version")
    private Long version;


    @PrePersist
    public void onCreate() {

        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (priority == null || priority.isBlank()) {
            priority = "HIGH";
        }

        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
    }
}