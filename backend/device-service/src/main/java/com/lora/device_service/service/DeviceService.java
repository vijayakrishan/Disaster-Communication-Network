package com.lora.device_service.service;

import com.lora.device_service.dto.DeviceResponse;
import com.lora.device_service.entity.Device;
import com.lora.device_service.entity.DeviceTelemetry;
import com.lora.device_service.repository.DeviceRepository;
import com.lora.device_service.repository.DeviceTelemetryRepository;

import org.springframework.stereotype.Service;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceTelemetryRepository telemetryRepository;

    public DeviceService(
            DeviceRepository deviceRepository,
            DeviceTelemetryRepository telemetryRepository) {

        this.deviceRepository = deviceRepository;
        this.telemetryRepository = telemetryRepository;
    }

    public DeviceResponse getDevice(String deviceId) {

        Device device = deviceRepository
                .findByDeviceId(deviceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Device not found: " + deviceId
                        ));

        DeviceTelemetry telemetry =
                telemetryRepository
                        .findTopByDeviceIdOrderByRecordedAtDesc(
                                deviceId
                        )
                        .orElse(null);

        if (telemetry == null) {

            return new DeviceResponse(
                    device.getDeviceId(),
                    device.getDeviceName(),
                    device.getStatus(),

                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }

        return new DeviceResponse(

                device.getDeviceId(),

                device.getDeviceName(),

                device.getStatus(),

                telemetry.getBattery(),

                telemetry.getRssi(),

                telemetry.getSnr(),

                telemetry.getGpsStatus(),

                telemetry.getLatitude(),

                telemetry.getLongitude(),

                telemetry.getGpsPrecision(),

                telemetry.getPacketsSent(),

                telemetry.getLoraModule(),

                telemetry.getLoraFrequency(),

                telemetry.getRecordedAt() != null
                        ? telemetry.getRecordedAt().toString()
                        : null
        );
    }
}