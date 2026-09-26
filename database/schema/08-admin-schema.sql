-- ============================================================================
-- 08-admin-schema.sql
-- Database: admin_db | Service: admin-service (Port 8087)
-- ============================================================================

USE admin_db;

CREATE TABLE IF NOT EXISTS system_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_type VARCHAR(20) NOT NULL DEFAULT 'INFO',
    message VARCHAR(255) NOT NULL,
    service_source VARCHAR(50) DEFAULT 'GATEWAY',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_type (log_type),
    INDEX idx_log_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
