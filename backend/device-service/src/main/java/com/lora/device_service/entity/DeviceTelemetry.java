package com.lora.device_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceTelemetry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    private Double battery;

    private Double rssi;

    private Double snr;

    private Double latitude;

    private Double longitude;

    @Column(name = "gps_precision")
    private Double gpsPrecision;

    @Column(name = "beacon_status")
    private String beaconStatus;

    @Column(name = "packets_sent")
    private Integer packetsSent;

    @Column(name = "gps_status")
    private String gpsStatus;

    @Column(name = "lora_module")
    private String loraModule;

    @Column(name = "lora_frequency")
    private Double loraFrequency;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}