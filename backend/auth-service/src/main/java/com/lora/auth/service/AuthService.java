package com.lora.auth.service;
import com.lora.auth.dto.VerifyOtpRequest;
import com.lora.auth.dto.LoginRequest;
import com.lora.auth.dto.LoginResponse;
import com.lora.auth.dto.RegisterRequest;
import com.lora.auth.entity.EmailVerification;
import com.lora.auth.entity.User;
import com.lora.auth.repository.EmailVerificationRepository;
import com.lora.auth.repository.UserRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AuthService(
            UserRepository userRepository,
            EmailVerificationRepository emailVerificationRepository,
            EmailService emailService
    ) {

        this.userRepository =
                userRepository;

        this.emailVerificationRepository =
                emailVerificationRepository;

        this.emailService =
                emailService;
    }


    // =====================================================
    // LOGIN
    // =====================================================

    public LoginResponse login(
            LoginRequest request
    ) {

        System.out.println(
                "================================="
        );

        System.out.println(
                "LOGIN REQUEST"
        );

        System.out.println(
                "Email: " +
                        request.getEmail()
        );


        // =================================================
        // FIND USER
        // =================================================

        User user =
                userRepository
                        .findByEmail(
                                request.getEmail()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "USER_NOT_FOUND"
                                )
                        );


        System.out.println(
                "USER FOUND: " +
                        user.getEmail()
        );

        System.out.println(
                "NAME: " +
                        user.getName()
        );

        System.out.println(
                "ROLE: " +
                        user.getRole()
        );

        System.out.println(
                "WORKER ID: " +
                        user.getWorkerId()
        );

        System.out.println(
                "TEAM ID: " +
                        user.getTeamId()
        );

        System.out.println(
                "TEAM NAME: " +
                        user.getTeamName()
        );


        // =================================================
        // EMAIL VERIFICATION CHECK
        // =================================================


        // =================================================
        // PASSWORD CHECK
        // =================================================

        boolean passwordMatch =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );


        System.out.println(
                "PASSWORD MATCH: " +
                        passwordMatch
        );


        if (!passwordMatch) {

            throw new RuntimeException(
                    "INVALID_PASSWORD"
            );
        }


        // =================================================
        // LOGIN SUCCESS
        // =================================================

        System.out.println(
                "LOGIN SUCCESS"
        );

        System.out.println(
                "RETURNING WORKER ID: " +
                        user.getWorkerId()
        );

        System.out.println(
                "================================="
        );


        // =================================================
        // RESPONSE
        // =================================================

        return new LoginResponse(

                "Login successful",

                user.getRole(),

                "TEMP_TOKEN",

                user.getWorkerId(),

                user.getTeamId(),

                user.getTeamName()
        );
    }


    // =====================================================
    // REGISTER
    // =====================================================

    public String register(
            RegisterRequest request
    ) {

        System.out.println(
                "================================="
        );

        System.out.println(
                "REGISTRATION REQUEST"
        );

        System.out.println(
                "Email: " +
                        request.getEmail()
        );


        // =================================================
        // CHECK EMAIL
        // =================================================

        if (userRepository.existsByEmail(
                request.getEmail()
        )) {

            throw new RuntimeException(
                    "EMAIL_ALREADY_REGISTERED"
            );
        }


        // =================================================
        // CREATE USER
        // =================================================

        User user = new User();


        // Generate unique ID
        user.setId(
                UUID.randomUUID().toString()
        );


        // User information
        user.setName(
                request.getName()
        );

        user.setEmail(
                request.getEmail()
        );


        // =================================================
        // PASSWORD
        // =================================================

        String encryptedPassword =
                passwordEncoder.encode(
                        request.getPassword()
                );

        user.setPassword(
                encryptedPassword
        );


        // =================================================
        // DEFAULT ROLE
        // =================================================

        // Public registration always creates USER
        user.setRole(
                "USER"
        );


        // =================================================
        // ACCOUNT STATUS
        // =================================================

        user.setAccountStatus(
                "ACTIVE"
        );


        // =================================================
        // EMAIL VERIFICATION
        // =================================================




        // =================================================
        // AUTH PROVIDER
        // =================================================

        user.setAuthProvider(
                "LOCAL"
        );


        // =================================================
        // SAVE USER
        // =================================================

        User savedUser =
                userRepository.save(
                        user
                );


        System.out.println(
                "USER CREATED: " +
                        savedUser.getId()
        );


        // =================================================
        // GENERATE OTP
        // =================================================

        String otp =
                String.format(
                        "%06d",
                        new Random().nextInt(1000000)
                );


        System.out.println(
                "OTP GENERATED: " +
                        otp
        );


        // =================================================
        // CREATE EMAIL VERIFICATION
        // =================================================

        EmailVerification verification =
                new EmailVerification();


        verification.setUserId(
                savedUser.getId()
        );


        verification.setOtp(
                otp
        );


        // OTP valid for 10 minutes
        verification.setExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(10)
        );


        verification.setVerified(
                false
        );


        // =================================================
        // SAVE OTP
        // =================================================

        emailVerificationRepository.save(
                verification
        );


        System.out.println(
                "OTP SAVED"
        );


        // =================================================
        // SEND EMAIL
        // =================================================

        emailService.sendOtpEmail(
                savedUser.getEmail(),
                otp
        );


        System.out.println(
                "OTP EMAIL SENT"
        );

        System.out.println(
                "================================="
        );


        return
                "Registration successful. " +
                        "OTP sent to your email.";
    }
    // =====================================================
// VERIFY EMAIL OTP
// =====================================================

    public String verifyEmail(
            VerifyOtpRequest request
    ) {

        System.out.println(
                "================================="
        );

        System.out.println(
                "EMAIL VERIFICATION REQUEST"
        );

        System.out.println(
                "Email: " +
                        request.getEmail()
        );


        // =================================================
        // FIND USER
        // =================================================

        User user =
                userRepository
                        .findByEmail(
                                request.getEmail()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "USER_NOT_FOUND"
                                )
                        );


        // =================================================
        // CHECK WHETHER ALREADY VERIFIED
        // =================================================



        // =================================================
        // FIND LATEST OTP
        // =================================================

        EmailVerification verification =
                emailVerificationRepository
                        .findTopByUserIdOrderByCreatedAtDesc(
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "OTP_NOT_FOUND"
                                )
                        );


        // =================================================
        // CHECK OTP
        // =================================================

        if (!verification.getOtp().equals(
                request.getOtp()
        )) {

            throw new RuntimeException(
                    "INVALID_OTP"
            );
        }


        // =================================================
        // CHECK OTP EXPIRY
        // =================================================

        if (LocalDateTime.now().isAfter(
                verification.getExpiresAt()
        )) {

            throw new RuntimeException(
                    "OTP_EXPIRED"
            );
        }


        // =================================================
        // MARK OTP AS VERIFIED
        // =================================================

        verification.setVerified(true);

        emailVerificationRepository.save(
                verification
        );


        // =================================================
        // MARK USER EMAIL AS VERIFIED
        // =================================================



        userRepository.save(user);


        System.out.println(
                "EMAIL VERIFIED SUCCESSFULLY"
        );

        System.out.println(
                "================================="
        );


        return "Email verified successfully.";
    }
}