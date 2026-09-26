-- ============================================================================
-- 04-worker-schema.sql
-- Database: worker_db | Service: worker-service (Port 8083)
-- ============================================================================

USE worker_db;

CREATE TABLE IF NOT EXISTS workers (
    id VARCHAR(36) PRIMARY KEY,
    auth_user_id VARCHAR(36) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    badge_number VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(30),
    team_id VARCHAR(36),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_worker_auth_id (auth_user_id),
    INDEX idx_worker_team_id (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
