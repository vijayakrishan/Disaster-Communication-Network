-- ============================================================================
-- 05-team-schema.sql
-- Database: team_db | Service: team-service (Port 8084)
-- ============================================================================

USE team_db;

CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    leader_name VARCHAR(100) NOT NULL,
    frequency_sector VARCHAR(100) NOT NULL DEFAULT 'Sector 1 (915.200 MHz)',
    contact_number VARCHAR(50),
    operational_state VARCHAR(20) NOT NULL DEFAULT 'STANDBY',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_team_name (name),
    INDEX idx_team_operational_state (operational_state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    worker_id VARCHAR(36) NOT NULL,
    member_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tm_team_id (team_id),
    INDEX idx_tm_worker_id (worker_id),
    CONSTRAINT fk_tm_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
