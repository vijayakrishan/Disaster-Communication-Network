-- ============================================================================
-- 03-user-schema.sql
-- Database: user_db | Service: user-service (Port 8082)
-- ============================================================================

USE user_db;

CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    auth_user_id VARCHAR(36) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    address VARCHAR(255),
    dob VARCHAR(20),
    gender VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    relationship VARCHAR(50),
    medical_info TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_auth_id (auth_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
