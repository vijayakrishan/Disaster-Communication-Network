package com.lora.rescue_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SOS {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "sos_id", unique = true, nullable = false)
    private String sosId;


    @Column(name = "user_email", nullable = false)
    private String userEmail;


    @Column(name = "user_name")
    private String userName;


    @Column(name = "device_id")
    private String deviceId;


    @Column(name = "source")
    private String source;


    @Column(name = "message", columnDefinition = "TEXT")
    private String message;


    @Column(name = "latitude")
    private Double latitude;


    @Column(name = "longitude")
    private Double longitude;


    // Team ID from team service
    // Example: team-01, team-02
    @Column(name = "assigned_team_id")
    private String assignedTeamId;


    @Column(name = "assigned_team")
    private String assignedTeam;


    /*
     * PENDING
     * IN_PROGRESS
     * COMPLETED
     * CANCELLED
     */
    @Column(name = "rescue_status")
    private String rescueStatus;
    @Column(name = "team_availability")
    private String teamAvailability;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // =====================================================
    // CREATE
    // =====================================================

    @PrePersist
    public void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        updatedAt = LocalDateTime.now();

        if (rescueStatus == null) {
            rescueStatus = "PENDING";
        }

        if (teamAvailability == null) {
            teamAvailability = "AVAILABLE";
        }
    }


    // =====================================================
    // UPDATE
    // =====================================================

    @PreUpdate
    public void onUpdate() {

        updatedAt = LocalDateTime.now();
    }
}