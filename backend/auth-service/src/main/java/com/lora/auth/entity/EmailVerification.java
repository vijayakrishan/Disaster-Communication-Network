package com.lora.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_verifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;


    @Column(name = "otp", nullable = false, length = 10)
    private String otp;


    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;


    @Column(name = "verified", nullable = false)
    private Boolean verified = false;


    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;


    @PrePersist
    protected void onCreate() {

        createdAt =
                LocalDateTime.now();

    }
}