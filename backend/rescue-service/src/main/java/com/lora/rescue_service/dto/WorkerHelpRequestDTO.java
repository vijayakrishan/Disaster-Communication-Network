package com.lora.rescue_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerHelpRequestDTO {

    private String workerId;

    private String workerName;

    private String teamId;

    private String teamName;

    private String message;

    private Double latitude;

    private Double longitude;

    private String source;
}