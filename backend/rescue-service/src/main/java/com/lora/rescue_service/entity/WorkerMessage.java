package com.lora.rescue_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "worker_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerMessage {

    @Id
    @Column(name = "id", length = 20, nullable = false)
    private String id;


    // =====================================================
    // REQUESTING WORKER
    // =====================================================

    @Column(name = "worker_id", length = 36)
    private String workerId;


    @Column(name = "worker_name", length = 100)
    private String workerName;


    // =====================================================
    // REQUESTING TEAM
    // =====================================================

    @Column(name = "team_id", length = 36)
    private String teamId;


    @Column(name = "team_name", length = 100)
    private String teamName;


    // =====================================================
    // MESSAGE
    // =====================================================

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;


    // =====================================================
    // LOCATION
    // =====================================================

    @Column(name = "latitude")
    private Double latitude;


    @Column(name = "longitude")
    private Double longitude;


    // =====================================================
    // SOURCE
    // WEB / DEVICE
    // =====================================================

    @Column(name = "source", length = 20)
    private String source;


    // =====================================================
    // STATUS
    // =====================================================

    @Column(name = "status")
    private String status;


    // =====================================================
    // ACCEPTED TEAM
    // =====================================================

    @Column(name = "accepted_by_team_id")
    private String acceptedByTeamId;


    @Column(name = "accepted_by_team_name")
    private String acceptedByTeamName;


    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    // =====================================================
// COMPLETED TIME
// =====================================================

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    // =====================================================
    // TIMESTAMPS
    // =====================================================

    @Column(name = "created_at")
    private LocalDateTime createdAt;


    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // =====================================================
    // AUTO CREATED
    // =====================================================

    @PrePersist
    public void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = "PENDING";
        }
    }


    @PreUpdate
    public void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }
}