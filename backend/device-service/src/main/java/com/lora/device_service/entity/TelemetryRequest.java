package com.lora.device_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryRequest {

    private String deviceId;

    private Double battery;

    private Double rssi;

    private Double snr;

    private Double latitude;

    private Double longitude;

    private Double gpsPrecision;

    private String beaconStatus;

    private Integer packetsSent;

    private String gpsStatus;

    private String loraModule;

    private Double loraFrequency;
}