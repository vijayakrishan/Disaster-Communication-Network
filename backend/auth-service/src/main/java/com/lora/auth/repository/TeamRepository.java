package com.lora.auth.repository;

import com.lora.auth.entity.Team;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TeamRepository {

    private final JdbcTemplate jdbcTemplate;

    public TeamRepository(
            @Qualifier("teamJdbcTemplate")
            JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;
    }

    // =====================================================
    // GET ALL TEAMS
    // =====================================================

    public List<Team> findAll() {

        String sql = """
            SELECT
                t.id,
                t.name,
                t.leader_name,
                t.frequency_sector,
                t.contact_number,
                t.operational_state,
                COUNT(tm.id) AS member_count
            FROM teams t
            LEFT JOIN team_members tm
                ON tm.team_id = t.id
                AND tm.member_status = 'ACTIVE'
            GROUP BY
                t.id,
                t.name,
                t.leader_name,
                t.frequency_sector,
                t.contact_number,
                t.operational_state
            ORDER BY t.id
            """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {

                    Team team = new Team();

                    team.setId(rs.getString("id"));
                    team.setName(rs.getString("name"));
                    team.setLeaderName(rs.getString("leader_name"));
                    team.setFrequencySector(
                            rs.getString("frequency_sector")
                    );
                    team.setContactNumber(
                            rs.getString("contact_number")
                    );
                    team.setOperationalState(
                            rs.getString("operational_state")
                    );
                    team.setMemberCount(
                            rs.getLong("member_count")
                    );

                    return team;
                }
        );
    }

    // =====================================================
    // COUNT TEAMS
    // =====================================================

    public long count() {

        String sql =
                "SELECT COUNT(*) FROM teams";

        Long count =
                jdbcTemplate.queryForObject(
                        sql,
                        Long.class
                );

        return count != null ? count : 0;
    }

    // =====================================================
    // GET TEAM BY ID
    // =====================================================

    public Team findById(String teamId) {

        String sql = """
                SELECT
                    t.id,
                    t.name,
                    t.leader_name,
                    t.frequency_sector,
                    t.contact_number,
                    t.operational_state,
                    (
                        SELECT COUNT(*)
                        FROM auth_db.users_auth u
                        WHERE u.team_id = t.id
                    ) AS member_count
                FROM teams t
                WHERE t.id = ?
                """;

        List<Team> teams =
                jdbcTemplate.query(
                        sql,
                        (rs, rowNum) -> {

                            Team team = new Team();

                            team.setId(
                                    rs.getString("id")
                            );

                            team.setName(
                                    rs.getString("name")
                            );

                            team.setLeaderName(
                                    rs.getString("leader_name")
                            );

                            team.setFrequencySector(
                                    rs.getString("frequency_sector")
                            );

                            team.setContactNumber(
                                    rs.getString("contact_number")
                            );

                            team.setOperationalState(
                                    rs.getString(
                                            "operational_state"
                                    )
                            );

                            team.setMemberCount(
                                    rs.getLong("member_count")
                            );

                            return team;
                        },
                        teamId
                );

        return teams.isEmpty()
                ? null
                : teams.get(0);
    }

    // =====================================================
    // UPDATE TEAM STATUS
    // =====================================================

    public int updateStatus(
            String teamId,
            String status) {

        String sql = """
                UPDATE teams
                SET operational_state = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(
                sql,
                status,
                teamId
        );
    }


    // =====================================================
    // GENERATE NEXT TEAM ID
    // =====================================================

    public String generateTeamId() {

        String sql = """
                SELECT COALESCE(
                    MAX(
                        CAST(
                            SUBSTRING(id, 6)
                            AS UNSIGNED
                        )
                    ),
                    0
                ) + 1
                FROM teams
                WHERE id LIKE 'team-%'
                """;

        Integer nextNumber =
                jdbcTemplate.queryForObject(
                        sql,
                        Integer.class
                );

        if (nextNumber == null) {
            nextNumber = 1;
        }

        return String.format(
                "team-%02d",
                nextNumber
        );
    }


    // =====================================================
    // INSERT NEW TEAM
    // =====================================================

    public int insertTeam(
            Team team) {

        String sql = """
                INSERT INTO teams (
                    id,
                    name,
                    leader_name,
                    frequency_sector,
                    contact_number,
                    operational_state
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,

                team.getId(),

                team.getName(),

                team.getLeaderName(),

                team.getFrequencySector(),

                team.getContactNumber(),

                team.getOperationalState()
        );
    }

    public int updateLeaderName(
            String teamId,
            String leaderName) {

        String sql = """
        UPDATE teams
        SET leader_name = ?
        WHERE id = ?
        """;

        return jdbcTemplate.update(
                sql,
                leaderName,
                teamId
        );
    }
}