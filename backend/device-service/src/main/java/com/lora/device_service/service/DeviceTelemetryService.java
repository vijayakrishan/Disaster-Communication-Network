package com.lora.device_service.service;

import com.lora.device_service.dto.TelemetryRequest;
import com.lora.device_service.entity.DeviceTelemetry;
import com.lora.device_service.repository.DeviceTelemetryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DeviceTelemetryService {

    private final DeviceTelemetryRepository telemetryRepository;

    public DeviceTelemetryService(
            DeviceTelemetryRepository telemetryRepository) {

        this.telemetryRepository = telemetryRepository;
    }

    public DeviceTelemetry saveTelemetry(
            TelemetryRequest request) {

        DeviceTelemetry telemetry = new DeviceTelemetry();

        telemetry.setDeviceId(request.getDeviceId());

        telemetry.setBattery(request.getBattery());

        telemetry.setRssi(request.getRssi());

        telemetry.setSnr(request.getSnr());

        telemetry.setLatitude(request.getLatitude());

        telemetry.setLongitude(request.getLongitude());

        telemetry.setGpsPrecision(
                request.getGpsPrecision()
        );

        telemetry.setBeaconStatus(
                request.getBeaconStatus()
        );

        telemetry.setPacketsSent(
                request.getPacketsSent()
        );

        telemetry.setGpsStatus(
                request.getGpsStatus()
        );

        telemetry.setLoraModule(
                request.getLoraModule()
        );

        telemetry.setLoraFrequency(
                request.getLoraFrequency()
        );

        telemetry.setRecordedAt(
                LocalDateTime.now()
        );

        return telemetryRepository.save(telemetry);
    }
}