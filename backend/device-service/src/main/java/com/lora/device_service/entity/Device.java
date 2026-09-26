package com.lora.device_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, unique = true)
    private String deviceId;

    @Column(name = "device_name")
    private String deviceName;

    @Column(name = "serial_number", unique = true)
    private String serialNumber;

    @Column(name = "firmware_version")
    private String firmwareVersion;

    @Column(name = "lora_chip")
    private String loraChip;

    @Column(name = "frequency_band")
    private String frequencyBand;

    @Column(name = "beacon_interval")
    private String beaconInterval;

    @Column(name = "operating_temperature")
    private String operatingTemperature;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}