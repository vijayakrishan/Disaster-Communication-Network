package com.lora.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users_auth")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @Column(name = "id", length = 36)
    private String id;


    // =====================================================
    // BASIC USER INFORMATION
    // =====================================================

    @Column(name = "name")
    private String name;


    @Column(name = "email", unique = true, nullable = false)
    private String email;


    @Column(name = "password_hash")
    private String password;


    @Column(name = "role", nullable = false)
    private String role;


    @Column(name = "account_status")
    private String accountStatus;


    // =====================================================
    // EMAIL / GOOGLE AUTHENTICATION
    // =====================================================



    @Column(name = "auth_provider")
    private String authProvider;


    @Column(name = "google_id", unique = true)
    private String googleId;


    // =====================================================
    // RESCUE TEAM
    // =====================================================

    @Column(name = "team_id", length = 36)
    private String teamId;


    @Column(name = "designation", length = 100)
    private String designation;


    @Column(name = "team_name", length = 100)
    private String teamName;


    @Column(name = "worker_id", length = 36)
    private String workerId;


    @Column(name = "phone", length = 20)
    private String phone;


    @Column(name = "base_station", length = 50)
    private String baseStation;
}