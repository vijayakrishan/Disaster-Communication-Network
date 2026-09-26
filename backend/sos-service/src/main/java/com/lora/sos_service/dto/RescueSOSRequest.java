package com.lora.sos_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RescueSOSRequest {

    private String sosId;
    private String userEmail;
    private String userName;
    private String deviceId;
    private String source;
    private String message;
    private Double latitude;
    private Double longitude;
}