package com.lora.sos_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcceptSosRequestDTO {

    private String teamId;

    private String teamName;
}