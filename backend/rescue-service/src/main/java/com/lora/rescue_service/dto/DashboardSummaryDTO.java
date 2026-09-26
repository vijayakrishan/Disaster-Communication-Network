package com.lora.rescue_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {

    // Total teams currently available
    private long availableTeams;

    // SOS waiting for a team
    private long activeSOS;

    // Teams currently handling SOS / Help
    private long teamsOnRescue;

    // Current system/network status
    private String networkHealth;
}