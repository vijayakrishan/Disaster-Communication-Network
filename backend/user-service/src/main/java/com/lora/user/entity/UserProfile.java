package com.lora.user.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    private String id;

    private String email;

    private String fullName;

    private String phone;

    private String dateOfBirth;

    private String gender;

    private String address;

    private String emergencyContactName;

    private String emergencyContactNumber;

    private String relationship;

    private String medicalInformation;

    private Double latitude;

    private Double longitude;

    private String designation;

    private String teamId;

    private String teamName;

    private String baseStation;
}