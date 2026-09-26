-- ============================================================================
-- 09-seed-data.sql
-- ResQMesh Initial Development Seed Data
-- Passwords:
--   vijay@user.com      -> user123
--   vance@worker.com    -> worker123
--   elena@worker.com    -> worker123
--   admin@resqmesh.com  -> admin123
-- ============================================================================

-- 1. auth_db
USE auth_db;
DELETE FROM users_auth;

INSERT INTO users_auth (id, email, password_hash, role, status) VALUES
('u-101', 'vijay@user.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'USER', 'ACTIVE'),
('w-101', 'vance@worker.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'WORKER', 'ACTIVE'),
('w-102', 'elena@worker.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'WORKER', 'ACTIVE'),
('w-103', 'david@worker.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'WORKER', 'ACTIVE'),
('a-101', 'admin@resqmesh.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'ADMIN', 'ACTIVE');

-- 2. user_db
USE user_db;
DELETE FROM user_profiles;

INSERT INTO user_profiles (id, auth_user_id, full_name, phone, address, dob, gender, emergency_contact_name, emergency_contact_phone, relationship, medical_info) VALUES
('prof-101', 'u-101', 'Vijay Krishnan', '+91 98401 23456', '42 Coastline Avenue, Sector 4', '1998-04-12', 'Male', 'Ananya Krishnan', '+91 98401 99999', 'Sister', 'Asthma (Carries Albuterol inhaler)');

-- 3. worker_db
USE worker_db;
DELETE FROM workers;

INSERT INTO workers (id, auth_user_id, full_name, badge_number, phone, team_id, status) VALUES
('work-101', 'w-101', 'Marcus Vance', 'SAR-901', '+91 98402 11111', 'team-alpha', 'AVAILABLE'),
('work-102', 'w-102', 'Elena Rostova', 'SAR-902', '+91 98402 22222', 'team-eagle', 'AVAILABLE'),
('work-103', 'w-103', 'David Kim', 'SAR-903', '+91 98402 33333', 'team-bravo', 'AVAILABLE');

-- 4. team_db
USE team_db;
DELETE FROM team_members;
DELETE FROM teams;

INSERT INTO teams (id, name, leader_name, frequency_sector, contact_number, operational_state) VALUES
('team-alpha', 'Squad Alpha', 'Marcus Vance', 'Sector 1 (915.200 MHz)', '+91 44 2840-0001', 'STANDBY'),
('team-eagle', 'Eagle Air Rescue', 'Elena Rostova', 'Sector 2 (915.400 MHz)', '+91 44 2840-0002', 'STANDBY'),
('team-bravo', 'Bravo Ground Unit', 'David Kim', 'Sector 3 (915.600 MHz)', '+91 44 2840-0003', 'STANDBY');

INSERT INTO team_members (id, team_id, worker_id, member_status) VALUES
('tm-1', 'team-alpha', 'work-101', 'ACTIVE'),
('tm-2', 'team-eagle', 'work-102', 'ACTIVE'),
('tm-3', 'team-bravo', 'work-103', 'ACTIVE');

-- 5. rescue_db
USE rescue_db;
DELETE FROM sos_timeline;
DELETE FROM sos_records;
DELETE FROM worker_help_requests;

INSERT INTO sos_records (id, sender_user_id, device_id, victim_name, victim_contact, latitude, longitude, priority, emergency_details, status, assigned_team_id, accepted_worker_id, created_at, accepted_at, completed_at, version) VALUES
('SOS-1001', 'u-101', 'DEV-01', 'Vijay Krishnan', '+91 98401 23456', 13.0827, 80.2707, 'CRITICAL', 'Flash flood water rising rapidly inside ground floor residence.', 'ACCEPTED', 'team-alpha', 'work-101', DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 35 MINUTE), NULL, 1),
('SOS-1002', NULL, 'DEV-02', 'Sarah Connor', '+91 98403 44444', 13.0900, 80.2800, 'HIGH', 'Injured ankle after ridge fall. Water supply low.', 'PENDING', NULL, NULL, DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, NULL, 0),
('SOS-1003', NULL, 'DEV-03', 'John Doe', '+91 98404 55555', 13.0750, 80.2600, 'MEDIUM', 'Lost hiker, off-trail in heavy fog. No immediate medical threat.', 'COMPLETED', 'team-bravo', 'work-103', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), 2);

INSERT INTO sos_timeline (sos_id, status_title, description, created_at) VALUES
('SOS-1001', 'Beacon Activated', 'Emergency distress beacon received at Base Gateway.', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('SOS-1001', 'Mission Accepted', 'Squad Alpha assigned and en route to GPS coordinates.', DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
('SOS-1002', 'Beacon Activated', 'Distress beacon received on 915.000 MHz carrier.', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
('SOS-1003', 'Beacon Activated', 'Hiker distress beacon received.', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('SOS-1003', 'Mission Accepted', 'Bravo Ground Unit dispatched with terrain vehicle.', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('SOS-1003', 'Rescue Completed', 'Victim successfully recovered and returned to base safely.', DATE_SUB(NOW(), INTERVAL 1 HOUR));

INSERT INTO worker_help_requests (id, requesting_worker_id, requesting_team_id, message_text, location, priority, status, accepting_worker_id, accepting_team_id, created_at, accepted_at, resolved_at, version) VALUES
('HM-101', 'work-101', 'team-alpha', 'Requesting motorized inflatable boat and 2 oxygen tanks at Marina slip.', 'Marina Causeway (Sector 1)', 'HIGH', 'PENDING', NULL, NULL, DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL, NULL, 0),
('HM-102', 'work-102', 'team-eagle', 'Helipad refueling pump malfunction at Ridge staging zone.', 'Ridge Outpost (Sector 2)', 'MEDIUM', 'RESOLVED', 'work-103', 'team-bravo', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE), 2);

-- 6. device_db
USE device_db;
DELETE FROM devices;
DELETE FROM relay_stations;

INSERT INTO devices (id, owner_user_id, name, battery, gps_status, latitude, longitude, rssi, snr, firmware_version, lora_module, frequency_band, beacon_interval, operating_temp, serial_number, status, sos_enabled) VALUES
('DEV-01', 'u-101', 'Citizen Transceiver Node #101', 92.5, '3D FIX (9 Sats)', 13.0827, 80.2707, -72, 10, 'v2.4.1-mesh', 'SX1278 915MHz', '915.000 MHz (BW: 125kHz)', '15 seconds', '33°C', 'RESQ-NODE-9901-X', 'ONLINE', TRUE),
('DEV-02', NULL, 'Wilderness Beacon #102', 78.0, '3D FIX (8 Sats)', 13.0900, 80.2800, -85, 7, 'v2.4.0-mesh', 'SX1278 915MHz', '915.000 MHz (BW: 125kHz)', '30 seconds', '31°C', 'RESQ-NODE-9902-Y', 'ONLINE', FALSE),
('DEV-03', NULL, 'Marine Coastal Node #103', 95.0, '3D FIX (10 Sats)', 13.0750, 80.2600, -65, 12, 'v2.4.1-mesh', 'SX1278 915MHz', '915.000 MHz (BW: 125kHz)', '15 seconds', '30°C', 'RESQ-NODE-9903-Z', 'ONLINE', FALSE),
('DEV-04', NULL, 'Backpack Transceiver #104', 45.0, '3D FIX (7 Sats)', 13.0600, 80.2500, -92, 4, 'v2.3.8-mesh', 'SX1278 915MHz', '915.000 MHz (BW: 125kHz)', '60 seconds', '35°C', 'RESQ-NODE-9904-W', 'ONLINE', FALSE);

INSERT INTO relay_stations (id, name, latitude, longitude, signal_strength_rssi, snr, battery_percentage, total_packets, status, uptime) VALUES
('RELAY-01', 'Relay Tower Alpha (Ridge)', 13.0920, 80.2820, -68, 12, 96.0, 4820, 'ONLINE', '14d 06h'),
('RELAY-02', 'Relay Station Beta (Canyon)', 13.0780, 80.2650, -78, 9, 88.5, 3410, 'ONLINE', '8d 14h'),
('RELAY-03', 'Relay Node Gamma (Valley)', 13.0650, 80.2550, -89, 6, 91.0, 2190, 'ONLINE', '32d 02h'),
('RELAY-04', 'Relay Solar Delta (North Peak)', 13.1050, 80.2950, -115, -4, 12.0, 890, 'OFFLINE', '0d 00h');

-- 7. admin_db
USE admin_db;
DELETE FROM system_logs;

INSERT INTO system_logs (log_type, message, service_source) VALUES
('INFO', 'Base Gateway Hub online. Listening on 915.000 MHz LoRa mesh.', 'GATEWAY'),
('INFO', 'Relay Tower Alpha (Ridge) broadcasted synchronizing beacon packet.', 'DEVICE_SERVICE'),
('WARNING', 'Relay Solar Delta reported battery drop below 15% threshold.', 'DEVICE_SERVICE'),
('CRITICAL', 'SOS Distress Alert SOS-1001 broadcasted from Node DEV-01.', 'RESCUE_SERVICE'),
('INFO', 'Squad Alpha deployed and en route to SOS-1001 coordinates.', 'RESCUE_SERVICE');
