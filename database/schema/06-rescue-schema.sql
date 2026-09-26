-- ============================================================================
-- 06-rescue-schema.sql
-- Database: rescue_db | Service: rescue-service (Port 8085)
-- ============================================================================

USE rescue_db;

CREATE TABLE IF NOT EXISTS sos_records (
    id VARCHAR(36) PRIMARY KEY,
    sender_user_id VARCHAR(36),
    device_id VARCHAR(36),
    victim_name VARCHAR(100) NOT NULL,
    victim_contact VARCHAR(30),
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    emergency_details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    assigned_team_id VARCHAR(36),
    accepted_worker_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    version BIGINT DEFAULT 0,
    INDEX idx_sos_status (status),
    INDEX idx_sos_user (sender_user_id),
    INDEX idx_sos_team (assigned_team_id),
    INDEX idx_sos_completed (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sos_timeline (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sos_id VARCHAR(36) NOT NULL,
    status_title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timeline_sos (sos_id),
    CONSTRAINT fk_timeline_sos FOREIGN KEY (sos_id) REFERENCES sos_records(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS worker_help_requests (
    id VARCHAR(36) PRIMARY KEY,
    requesting_worker_id VARCHAR(36) NOT NULL,
    requesting_team_id VARCHAR(36) NOT NULL,
    message_text TEXT NOT NULL,
    location VARCHAR(150),
    priority VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    accepting_worker_id VARCHAR(36),
    accepting_team_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    version BIGINT DEFAULT 0,
    INDEX idx_help_status (status),
    INDEX idx_help_req_team (requesting_team_id),
    INDEX idx_help_acc_team (accepting_team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
