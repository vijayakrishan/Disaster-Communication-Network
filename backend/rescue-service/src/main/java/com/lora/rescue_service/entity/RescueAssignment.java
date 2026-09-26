package com.lora.rescue_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RescueAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // Which SOS this rescue belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sos_id", nullable = false)
    private SOS sos;


    // Which team is handling it
    // Example: team-01, team-02
    @Column(name = "team_id", nullable = false)
    private String teamId;


    @Column(name = "team_name")
    private String teamName;


    /*
     * IN_PROGRESS
     * COMPLETED
     */
    @Column(name = "status", nullable = false)
    private String status;


    @Column(name = "assigned_time")
    private LocalDateTime assignedTime;


    @Column(name = "completed_time")
    private LocalDateTime completedTime;


    @PrePersist
    public void onCreate() {

        if (assignedTime == null) {
            assignedTime = LocalDateTime.now();
        }

        if (status == null) {
            status = "IN_PROGRESS";
        }
    }
}