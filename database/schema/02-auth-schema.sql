-- ============================================================================
-- 02-auth-schema.sql
-- Database: auth_db | Service: auth-service (Port 8081)
-- ============================================================================

USE auth_db;

CREATE TABLE IF NOT EXISTS users_auth (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_auth_email (email),
    INDEX idx_auth_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
