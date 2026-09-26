package com.lora.rescue_service.client;

import com.lora.rescue_service.dto.TeamDTO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Component
public class AuthClient {

    private final RestTemplate restTemplate;

    // =====================================================
    // AUTH SERVICE
    // =====================================================

    @Value("${auth.service.url:http://localhost:8081}")
    private String authServiceUrl;


    public AuthClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    // =====================================================
    // GET ALL TEAMS
    // =====================================================

    public List<TeamDTO> getAllTeams() {

        String url =
                authServiceUrl + "/api/teams";

        System.out.println(
                "CALLING GET TEAMS URL = " + url
        );

        try {

            TeamDTO[] teams =
                    restTemplate.getForObject(
                            url,
                            TeamDTO[].class
                    );

            return teams != null
                    ? Arrays.asList(teams)
                    : List.of();

        } catch (Exception e) {

            System.err.println(
                    "Unable to get teams: "
                            + e.getMessage()
            );

            return List.of();
        }
    }


    // =====================================================
    // GET TOTAL TEAM COUNT
    // =====================================================

    public long getTeamCount() {

        String url =
                authServiceUrl + "/api/teams/count";

        System.out.println(
                "CALLING AUTH URL = " + url
        );

        try {

            Long count =
                    restTemplate.getForObject(
                            url,
                            Long.class
                    );

            System.out.println(
                    "TEAM COUNT RECEIVED = " + count
            );

            return count != null
                    ? count
                    : 0;

        } catch (Exception e) {

            System.err.println(
                    "TEAM COUNT ERROR = "
                            + e.getClass().getName()
                            + " : "
                            + e.getMessage()
            );

            e.printStackTrace();

            return 0;
        }
    }


    // =====================================================
    // GET TEAM BY ID
    // =====================================================

    public TeamDTO getTeamById(
            String teamId) {

        String url =
                authServiceUrl
                        + "/api/teams/"
                        + teamId;

        System.out.println(
                "CALLING GET TEAM URL = " + url
        );

        return restTemplate.getForObject(
                url,
                TeamDTO.class
        );
    }


    // =====================================================
    // UPDATE TEAM STATUS
    // =====================================================

    public void updateTeamStatus(
            String teamId,
            String status) {

        String url =
                authServiceUrl
                        + "/api/teams/"
                        + teamId
                        + "/status?status="
                        + status;

        System.out.println(
                "UPDATING TEAM STATUS"
        );

        System.out.println(
                "TEAM ID = " + teamId
        );

        System.out.println(
                "STATUS = " + status
        );

        System.out.println(
                "CALLING URL = " + url
        );

        try {

            restTemplate.put(
                    url,
                    null
            );

            System.out.println(
                    "TEAM STATUS UPDATED SUCCESSFULLY"
            );

        } catch (Exception e) {

            System.err.println(
                    "UNABLE TO UPDATE TEAM STATUS: "
                            + e.getMessage()
            );

            e.printStackTrace();
        }
    }
}