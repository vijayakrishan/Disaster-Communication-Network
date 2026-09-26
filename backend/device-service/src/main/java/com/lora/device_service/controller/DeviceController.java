package com.lora.device_service.controller;

import com.lora.device_service.dto.DeviceResponse;
import com.lora.device_service.service.DeviceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/devices")
@CrossOrigin(origins = "*")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(
            DeviceService deviceService) {

        this.deviceService = deviceService;
    }

    @GetMapping("/{deviceId}")
    public ResponseEntity<DeviceResponse> getDevice(
            @PathVariable String deviceId) {

        return ResponseEntity.ok(
                deviceService.getDevice(deviceId)
        );
    }
}