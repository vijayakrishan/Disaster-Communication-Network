package com.lora.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {

    private String email;
    private String fullName;
    private String phone;
    private Double latitude;
    private Double longitude;
}