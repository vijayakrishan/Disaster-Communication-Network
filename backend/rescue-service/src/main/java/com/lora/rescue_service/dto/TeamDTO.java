package com.lora.rescue_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamDTO {

    private String id;

    private String name;

    private String status;

    private String location;

    private String contactNumber;
}