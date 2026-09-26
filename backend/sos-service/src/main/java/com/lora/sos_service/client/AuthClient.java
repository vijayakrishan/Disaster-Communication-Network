package com.lora.sos_service.client;

import com.lora.sos_service.dto.TeamDTO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AuthClient {

    private final RestTemplate restTemplate;

    @Value("${auth.service.url:http://localhost:8081}")
    private String authServiceUrl;


    public AuthClient(RestTemplate restTemplate) {

        this.restTemplate = restTemplate;
    }


    // =====================================================
    // GET TEAM BY ID
    // =====================================================

    public TeamDTO getTeamById(
            String teamId) {

        String url =
                authServiceUrl +
                        "/api/teams/" +
                        teamId;

        try {

            return restTemplate.getForObject(
                    url,
                    TeamDTO.class
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "TEAM_NOT_FOUND"
            );
        }
    }


    // =====================================================
    // UPDATE TEAM STATUS
    // =====================================================

    public void updateTeamStatus(
            String teamId,
            String status) {

        String url =
                authServiceUrl +
                        "/api/teams/" +
                        teamId +
                        "/status?status=" +
                        status;

        try {

            restTemplate.put(
                    url,
                    null
            );

            System.out.println(
                    "TEAM STATUS UPDATED: " +
                            teamId + " → " + status
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "TEAM_STATUS_UPDATE_FAILED"
            );
        }
    }
}