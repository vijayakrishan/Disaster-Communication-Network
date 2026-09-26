package com.lora.auth.controller;

import com.lora.auth.entity.Team;
import com.lora.auth.service.TeamService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176",
                "http://localhost:5180"
        }
)
public class TeamController {

    private final TeamService teamService;

    public TeamController(
            TeamService teamService) {

        this.teamService = teamService;
    }

    // =====================================================
    // GET ALL TEAMS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Team>> getAllTeams() {

        return ResponseEntity.ok(
                teamService.getAllTeams()
        );
    }


    // =====================================================
    // ADD NEW TEAM
    // =====================================================

    @PostMapping
    public ResponseEntity<?> addTeam(
            @RequestBody Team team) {

        System.out.println("=================================");
        System.out.println("ADD TEAM REQUEST RECEIVED");
        System.out.println("TEAM NAME: " + team.getName());
        System.out.println("LEADER: " + team.getLeaderName());
        System.out.println("FREQUENCY: " + team.getFrequencySector());
        System.out.println("CONTACT: " + team.getContactNumber());
        System.out.println("STATE: " + team.getOperationalState());
        System.out.println("=================================");

        try {

            return ResponseEntity.ok(
                    teamService.addTeam(team)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getClass().getSimpleName()
                                    + ": "
                                    + e.getMessage()
                    );
        }
    }

    // =====================================================
    // GET TEAM COUNT
    // =====================================================

    @GetMapping("/count")
    public ResponseEntity<Long> getTeamCount() {

        return ResponseEntity.ok(
                teamService.getTeamCount()
        );
    }

    // =====================================================
    // GET TEAM BY ID
    // =====================================================

    @GetMapping("/{teamId}")
    public ResponseEntity<?> getTeamById(
            @PathVariable String teamId) {

        try {

            return ResponseEntity.ok(
                    teamService.getTeamById(
                            teamId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // UPDATE TEAM STATUS
    // =====================================================

    @PutMapping("/{teamId}/status")
    public ResponseEntity<?> updateTeamStatus(
            @PathVariable String teamId,
            @RequestParam String status) {

        try {

            return ResponseEntity.ok(
                    teamService.updateTeamStatus(
                            teamId,
                            status
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{teamId}/leader")
    public ResponseEntity<?> updateTeamLeader(
            @PathVariable String teamId,
            @RequestParam String leaderName) {

        try {
            return ResponseEntity.ok(
                    teamService.updateTeamLeader(teamId, leaderName)
            );
        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getClass().getSimpleName()
                                    + ": "
                                    + e.getMessage()
                    );
        }
    }
}