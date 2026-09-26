package com.lora.rescue_service.repository;

import com.lora.rescue_service.dto.RelayMetricsDTO;
import com.lora.rescue_service.entity.Relay;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class RelayRepository {

    private final JdbcTemplate jdbcTemplate;

    public RelayRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // =====================================================
    // GET ALL RELAYS
    // =====================================================

    public List<Relay> findAll() {

        String sql = """
                SELECT
                    id,
                    name,

                    CASE
                        WHEN last_seen IS NOT NULL
                             AND last_seen >= NOW() - INTERVAL 15 SECOND
                        THEN 'ONLINE'
                        ELSE 'OFFLINE'
                    END AS status,

                    lat,
                    lng,
                    battery,
                    rssi,
                    snr,
                    packet_count,
                    last_seen,
                    coverage_radius_km

                FROM team_db.relays
                ORDER BY id
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapRelay(rs)
        );
    }

    // =====================================================
    // GET RELAY BY ID
    // =====================================================

    public Relay findById(String relayId) {

        String sql = """
                SELECT
                    id,
                    name,

                    CASE
                        WHEN last_seen IS NOT NULL
                             AND last_seen >= NOW() - INTERVAL 15 SECOND
                        THEN 'ONLINE'
                        ELSE 'OFFLINE'
                    END AS status,

                    lat,
                    lng,
                    battery,
                    rssi,
                    snr,
                    packet_count,
                    last_seen,
                    coverage_radius_km

                FROM team_db.relays
                WHERE id = ?
                """;

        List<Relay> result = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapRelay(rs),
                relayId
        );

        return result.isEmpty()
                ? null
                : result.get(0);
    }

    // =====================================================
    // UPDATE RELAY TELEMETRY
    // =====================================================

    public int updateTelemetry(
            String relayId,
            String name,
            Integer battery,
            Double rssi,
            Double snr,
            Double lat,
            Double lng) {

        String sql = """
                UPDATE team_db.relays
                SET
                    name = COALESCE(?, name),
                    battery = COALESCE(?, battery),
                    rssi = COALESCE(?, rssi),
                    snr = COALESCE(?, snr),
                    lat = COALESCE(?, lat),
                    lng = COALESCE(?, lng),
                    packet_count = packet_count + 1,
                    last_seen = NOW()
                WHERE id = ?
                """;

        return jdbcTemplate.update(
                sql,
                name,
                battery,
                rssi,
                snr,
                lat,
                lng,
                relayId
        );
    }

    // =====================================================
    // GET METRICS
    // =====================================================

    public RelayMetricsDTO getMetrics() {

        String sql = """
                SELECT

                    SUM(
                        CASE
                            WHEN last_seen IS NOT NULL
                                 AND last_seen >= NOW() - INTERVAL 15 SECOND
                            THEN 1
                            ELSE 0
                        END
                    ) AS online_relays,

                    SUM(
                        CASE
                            WHEN last_seen IS NULL
                                 OR last_seen < NOW() - INTERVAL 15 SECOND
                            THEN 1
                            ELSE 0
                        END
                    ) AS offline_relays,

                    COALESCE(
                        AVG(
                            CASE
                                WHEN last_seen IS NOT NULL
                                     AND last_seen >= NOW() - INTERVAL 15 SECOND
                                THEN rssi
                            END
                        ),
                        0
                    ) AS average_rssi,

                    COALESCE(
                        AVG(
                            CASE
                                WHEN last_seen IS NOT NULL
                                     AND last_seen >= NOW() - INTERVAL 15 SECOND
                                THEN battery
                            END
                        ),
                        0
                    ) AS average_battery,

                    COALESCE(
                        AVG(
                            CASE
                                WHEN last_seen IS NOT NULL
                                     AND last_seen >= NOW() - INTERVAL 15 SECOND
                                THEN snr
                            END
                        ),
                        0
                    ) AS average_snr,

                    COALESCE(
                        SUM(packet_count),
                        0
                    ) AS total_packets

                FROM team_db.relays
                """;

        return jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) ->
                        new RelayMetricsDTO(
                                rs.getLong("online_relays"),
                                rs.getLong("offline_relays"),
                                rs.getDouble("average_rssi"),
                                rs.getDouble("average_battery"),
                                rs.getDouble("average_snr"),
                                rs.getLong("total_packets"),
                                0.0,
                                null
                        )
        );
    }

    // =====================================================
    // ONLY ONLINE RELAYS FOR COVERAGE
    // =====================================================

    public List<Relay> findOnlineRelaysForCoverage() {

        String sql = """
                SELECT
                    id,
                    name,
                    'ONLINE' AS status,
                    lat,
                    lng,
                    battery,
                    rssi,
                    snr,
                    packet_count,
                    last_seen,
                    coverage_radius_km

                FROM team_db.relays

                WHERE last_seen IS NOT NULL
                  AND last_seen >= NOW() - INTERVAL 15 SECOND

                ORDER BY id
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapRelay(rs)
        );
    }

    // =====================================================
    // MAP RESULT
    // =====================================================

    private Relay mapRelay(
            java.sql.ResultSet rs)
            throws java.sql.SQLException {

        Relay relay = new Relay();

        relay.setId(
                rs.getString("id")
        );

        relay.setName(
                rs.getString("name")
        );

        relay.setStatus(
                rs.getString("status")
        );

        relay.setLat(
                rs.getDouble("lat")
        );

        relay.setLng(
                rs.getDouble("lng")
        );

        relay.setBattery(
                rs.getInt("battery")
        );

        relay.setRssi(
                rs.getDouble("rssi")
        );

        relay.setSnr(
                rs.getDouble("snr")
        );

        relay.setPacketCount(
                rs.getLong("packet_count")
        );

        Timestamp timestamp =
                rs.getTimestamp("last_seen");

        if (timestamp != null) {

            relay.setLastSeen(
                    timestamp.toLocalDateTime()
            );
        }

        relay.setCoverageRadiusKm(
                rs.getDouble("coverage_radius_km")
        );

        return relay;
    }
}