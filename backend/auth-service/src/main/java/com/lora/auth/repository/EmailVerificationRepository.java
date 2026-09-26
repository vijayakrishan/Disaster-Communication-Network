package com.lora.auth.repository;

import com.lora.auth.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationRepository
        extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification>
    findTopByUserIdOrderByCreatedAtDesc(String userId);
}