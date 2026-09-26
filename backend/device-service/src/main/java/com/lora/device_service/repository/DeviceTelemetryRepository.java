package com.lora.device_service.repository;

import com.lora.device_service.entity.DeviceTelemetry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeviceTelemetryRepository
        extends JpaRepository<DeviceTelemetry, Long> {

    Optional<DeviceTelemetry>
    findTopByDeviceIdOrderByRecordedAtDesc(String deviceId);
}