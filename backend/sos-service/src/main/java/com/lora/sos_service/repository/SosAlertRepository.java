package com.lora.sos_service.repository;

import com.lora.sos_service.entity.SosAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SosAlertRepository extends JpaRepository<SosAlert, String> {

    List<SosAlert> findAllByOrderByCreatedAtDesc();

    List<SosAlert> findBySenderUserIdOrderByCreatedAtDesc(
            String senderUserId
    );

    List<SosAlert> findByStatusOrderByCreatedAtDesc(
            String status
    );
}