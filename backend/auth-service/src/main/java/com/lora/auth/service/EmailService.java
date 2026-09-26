package com.lora.auth.service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final Resend resend;

    @Value("${resend.api.key}")
    private String apiKey;

    public EmailService() {
        this.resend = null;
    }

    public void sendOtpEmail(String toEmail, String otp) {

        System.out.println("=================================");
        System.out.println("EMAIL SERVICE CALLED");
        System.out.println("TO: " + toEmail);
        System.out.println("OTP: " + otp);
        System.out.println("=================================");

        try {

            Resend resendClient = new Resend(apiKey);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("RESQMESH <onboarding@resend.dev>")
                    .to(toEmail)
                    .subject("RESQMESH - Email Verification OTP")
                    .text(
                            "Hello,\n\n" +
                                    "Welcome to RESQMESH.\n\n" +
                                    "Your RESQMESH email verification OTP is:\n\n" +
                                    otp + "\n\n" +
                                    "This OTP is valid for 10 minutes.\n\n" +
                                    "Please do not share this OTP with anyone.\n\n" +
                                    "Regards,\n" +
                                    "RESQMESH Team"
                    )
                    .build();

            resendClient.emails().send(params);

            System.out.println("EMAIL SENT SUCCESSFULLY");

        } catch (Exception e) {

            System.out.println("EMAIL SENDING FAILED");
            System.out.println("ERROR MESSAGE: " + e.getMessage());

            e.printStackTrace();

            throw new RuntimeException(
                    "EMAIL_SEND_FAILED: " + e.getMessage()
            );
        }
    }
}