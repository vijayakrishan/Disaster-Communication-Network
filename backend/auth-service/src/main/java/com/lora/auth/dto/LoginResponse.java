package com.lora.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String message;

    private String role;

    private String token;

    private String workerId;

    private String teamId;

    private String teamName;
}