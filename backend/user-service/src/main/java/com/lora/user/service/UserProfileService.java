package com.lora.user.service;

import com.lora.user.entity.UserProfile;
import com.lora.user.repository.UserProfileRepository;

import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserProfileRepository
            userProfileRepository;

    public UserProfileService(
            UserProfileRepository userProfileRepository) {

        this.userProfileRepository =
                userProfileRepository;
    }


    // =====================================================
    // GET PROFILE
    // =====================================================

    public UserProfile getProfile(
            String email) {

        return userProfileRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User profile not found for email: "
                                        + email
                        )
                );
    }


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    public UserProfile updateProfile(
            String email,
            UserProfile updatedProfile) {

        UserProfile existingProfile =
                userProfileRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User profile not found for email: "
                                                + email
                                )
                        );

        // ---------------------------------------------
        // BASIC DETAILS
        // ---------------------------------------------

        existingProfile.setFullName(
                updatedProfile.getFullName()
        );

        existingProfile.setPhone(
                updatedProfile.getPhone()
        );

        // ---------------------------------------------
        // PERSONAL DETAILS
        // ---------------------------------------------

        existingProfile.setDateOfBirth(
                updatedProfile.getDateOfBirth()
        );

        existingProfile.setGender(
                updatedProfile.getGender()
        );

        existingProfile.setAddress(
                updatedProfile.getAddress()
        );

        // ---------------------------------------------
        // EMERGENCY DETAILS
        // ---------------------------------------------

        existingProfile.setEmergencyContactName(
                updatedProfile.getEmergencyContactName()
        );

        existingProfile.setEmergencyContactNumber(
                updatedProfile.getEmergencyContactNumber()
        );

        existingProfile.setRelationship(
                updatedProfile.getRelationship()
        );

        // ---------------------------------------------
        // MEDICAL INFORMATION
        // ---------------------------------------------

        existingProfile.setMedicalInformation(
                updatedProfile.getMedicalInformation()
        );

        // ---------------------------------------------
        // SAVE
        // ---------------------------------------------

        return userProfileRepository.save(
                existingProfile
        );
    }
}