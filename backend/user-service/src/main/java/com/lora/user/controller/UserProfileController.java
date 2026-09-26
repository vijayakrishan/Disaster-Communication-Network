package com.lora.user.controller;

import com.lora.user.entity.UserProfile;
import com.lora.user.service.UserProfileService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/profile")
@CrossOrigin(origins = "*")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(
            UserProfileService userProfileService) {

        this.userProfileService = userProfileService;
    }


    // =====================================================
    // GET PROFILE
    // =====================================================

    @GetMapping("/{email}")
    public ResponseEntity<UserProfile> getProfile(
            @PathVariable String email) {

        return ResponseEntity.ok(
                userProfileService.getProfile(email)
        );
    }


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    @PutMapping("/{email}")
    public ResponseEntity<UserProfile> updateProfile(
            @PathVariable String email,
            @RequestBody UserProfile updatedProfile) {

        return ResponseEntity.ok(
                userProfileService.updateProfile(
                        email,
                        updatedProfile
                )
        );
    }
}