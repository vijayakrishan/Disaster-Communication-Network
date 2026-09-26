package com.lora.auth.service;

import com.lora.auth.entity.Team;
import com.lora.auth.repository.TeamRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;

    public TeamService(
            TeamRepository teamRepository) {

        this.teamRepository = teamRepository;
    }

    // =====================================================
    // GET ALL TEAMS
    // =====================================================

    public List<Team> getAllTeams() {

        return teamRepository.findAll();
    }

    // =====================================================
    // GET TEAM COUNT
    // =====================================================

    public long getTeamCount() {

        return teamRepository.count();
    }

    // =====================================================
    // GET TEAM BY ID
    // =====================================================

    public Team getTeamById(
            String teamId) {

        Team team =
                teamRepository.findById(
                        teamId
                );

        if (team == null) {

            throw new RuntimeException(
                    "TEAM_NOT_FOUND"
            );
        }

        return team;
    }


    // =====================================================
    // ADD NEW TEAM
    // =====================================================

    public Team addTeam(
            Team team) {

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (
                team.getName() == null ||
                        team.getName().isBlank()
        ) {

            throw new RuntimeException(
                    "TEAM_NAME_REQUIRED"
            );
        }



        // -------------------------------------------------
        // CLEAN VALUES
        // -------------------------------------------------

        team.setName(
                team.getName().trim()
        );

        if (team.getLeaderName() != null) {

            team.setLeaderName(
                    team.getLeaderName().trim()
            );

        }

        if (team.getFrequencySector() != null) {

            team.setFrequencySector(
                    team.getFrequencySector().trim()
            );

        }


        if (team.getContactNumber() != null) {

            team.setContactNumber(
                    team.getContactNumber().trim()
            );

        }


        // -------------------------------------------------
        // OPERATIONAL STATE
        // -------------------------------------------------

        if (
                team.getOperationalState() == null ||
                        team.getOperationalState().isBlank()
        ) {

            team.setOperationalState(
                    "STANDBY"
            );

        } else {

            team.setOperationalState(
                    team.getOperationalState()
                            .trim()
                            .toUpperCase()
            );

        }


        // -------------------------------------------------
        // GENERATE TEAM ID
        // -------------------------------------------------

        team.setId(
                teamRepository.generateTeamId()
        );


        // -------------------------------------------------
        // SAVE TO DATABASE
        // -------------------------------------------------

        int rows =
                teamRepository.insertTeam(
                        team
                );


        if (rows != 1) {

            throw new RuntimeException(
                    "TEAM_SAVE_FAILED"
            );

        }


        // -------------------------------------------------
        // RETURN SAVED TEAM
        // -------------------------------------------------

        return teamRepository.findById(
                team.getId()
        );
    }


    // =====================================================
    // UPDATE TEAM STATUS
    // =====================================================

    public Team updateTeamStatus(
            String teamId,
            String status) {

        Team team =
                teamRepository.findById(
                        teamId
                );

        if (team == null) {

            throw new RuntimeException(
                    "TEAM_NOT_FOUND"
            );
        }

        teamRepository.updateStatus(
                teamId,
                status
        );

        team.setOperationalState(
                status
        );

        return team;
    }

    public Team updateTeamLeader(
            String teamId,
            String leaderName) {

        Team team = teamRepository.findById(teamId);

        if (team == null) {
            throw new RuntimeException("TEAM_NOT_FOUND");
        }

        teamRepository.updateLeaderName(
                teamId,
                leaderName
        );

        team.setLeaderName(leaderName);

        return team;
    }
}