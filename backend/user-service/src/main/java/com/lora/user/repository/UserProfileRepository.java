package com.lora.user.repository;

import com.lora.user.entity.UserProfile;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserProfileRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserProfileRepository(
            JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;
    }

    // =====================================================
    // GET PROFILE
    // =====================================================

    public Optional<UserProfile> findByEmail(
            String email) {

        String sql = """
            SELECT
                id,
                email,
                name,
                phone,
                date_of_birth,
                gender,
                address,
                emergency_contact_name,
                emergency_contact_number,
                relationship,
                medical_information,
                designation,
                team_id,
                team_name,
                base_station
            FROM auth_db.users_auth
            WHERE email = ?
            LIMIT 1
            """;

        return jdbcTemplate.query(
                sql,
                rs -> {

                    if (!rs.next()) {
                        return Optional.empty();
                    }

                    UserProfile profile =
                            new UserProfile();

                    profile.setId(
                            rs.getString("id")
                    );

                    profile.setEmail(
                            rs.getString("email")
                    );

                    profile.setFullName(
                            rs.getString("name")
                    );

                    profile.setPhone(
                            rs.getString("phone")
                    );

                    profile.setDateOfBirth(
                            rs.getString("date_of_birth")
                    );

                    profile.setGender(
                            rs.getString("gender")
                    );

                    profile.setAddress(
                            rs.getString("address")
                    );

                    profile.setEmergencyContactName(
                            rs.getString(
                                    "emergency_contact_name"
                            )
                    );

                    profile.setEmergencyContactNumber(
                            rs.getString(
                                    "emergency_contact_number"
                            )
                    );

                    profile.setRelationship(
                            rs.getString("relationship")
                    );

                    profile.setMedicalInformation(
                            rs.getString(
                                    "medical_information"
                            )
                    );

                    profile.setDesignation(
                            rs.getString("designation")
                    );

                    profile.setTeamId(
                            rs.getString("team_id")
                    );

                    profile.setTeamName(
                            rs.getString("team_name")
                    );

                    profile.setBaseStation(
                            rs.getString("base_station")
                    );

                    return Optional.of(profile);
                },
                email
        );
    }


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    public UserProfile save(
            UserProfile profile) {

        String sql = """
            UPDATE auth_db.users_auth
            SET
                name = ?,
                phone = ?,
                date_of_birth = ?,
                gender = ?,
                address = ?,
                emergency_contact_name = ?,
                emergency_contact_number = ?,
                relationship = ?,
                medical_information = ?
            WHERE email = ?
            """;

        int rows =
                jdbcTemplate.update(
                        sql,

                        profile.getFullName(),

                        profile.getPhone(),

                        profile.getDateOfBirth(),

                        profile.getGender(),

                        profile.getAddress(),

                        profile.getEmergencyContactName(),

                        profile.getEmergencyContactNumber(),

                        profile.getRelationship(),

                        profile.getMedicalInformation(),

                        profile.getEmail()
                );

        if (rows == 0) {

            throw new RuntimeException(
                    "PROFILE_UPDATE_FAILED"
            );
        }

        return findByEmail(
                profile.getEmail()
        ).orElseThrow(() ->
                new RuntimeException(
                        "PROFILE_NOT_FOUND_AFTER_UPDATE"
                )
        );
    }
}