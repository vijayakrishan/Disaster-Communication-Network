-- ============================================================================
-- 10-test-queries.sql
-- ResQMesh Database Integrity & Verification Query Suite
-- ============================================================================

-- 1. Check Authenticated Accounts
SELECT '=== AUTH USERS ===' AS section;
SELECT id, email, role, status FROM auth_db.users_auth;

-- 2. Check User Profiles
SELECT '=== USER PROFILES ===' AS section;
SELECT id, auth_user_id, full_name, phone, emergency_contact_name FROM user_db.user_profiles;

-- 3. Check Workers & Team Mapping
SELECT '=== WORKERS ===' AS section;
SELECT id, auth_user_id, full_name, badge_number, team_id, status FROM worker_db.workers;

-- 4. Check Teams & Members
SELECT '=== TEAMS ===' AS section;
SELECT id, name, leader_name, frequency_sector, operational_state FROM team_db.teams;
SELECT tm.id, tm.team_id, tm.worker_id, tm.member_status FROM team_db.team_members tm;

-- 5. Check SOS Distress Records
SELECT '=== SOS RECORDS ===' AS section;
SELECT id, victim_name, priority, status, assigned_team_id, created_at, accepted_at, completed_at FROM rescue_db.sos_records;

-- 6. Check Worker Help Requests
SELECT '=== WORKER HELP REQUESTS ===' AS section;
SELECT id, requesting_team_id, message_text, priority, status, accepting_team_id FROM rescue_db.worker_help_requests;

-- 7. Check Hardware Devices & Relays
SELECT '=== DEVICES & RELAYS ===' AS section;
SELECT id, name, battery, gps_status, status, rssi FROM device_db.devices;
SELECT id, name, status, battery_percentage, signal_strength_rssi FROM device_db.relay_stations;

-- 8. Check Admin Logs
SELECT '=== ADMIN AUDIT LOGS ===' AS section;
SELECT id, log_type, message, service_source, created_at FROM admin_db.system_logs ORDER BY created_at DESC;
