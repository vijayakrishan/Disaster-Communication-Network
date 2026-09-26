package com.lora.auth.controller;

import com.lora.auth.dto.LoginRequest;
import com.lora.auth.dto.LoginResponse;
import com.lora.auth.dto.RegisterRequest;
import com.lora.auth.service.AuthService;
import com.lora.auth.dto.VerifyOtpRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AuthController(
            AuthService authService
    ) {

        this.authService =
                authService;
    }


    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            LoginResponse response =
                    authService.login(request);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // REGISTER
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        try {

            String response =
                    authService.register(request);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
    // =====================================================
// VERIFY EMAIL
// =====================================================



}