-- ============================================================================
-- 07-device-schema.sql
-- Database: device_db | Service: device-service (Port 8086)
-- ============================================================================

USE device_db;

CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(36) PRIMARY KEY,
    owner_user_id VARCHAR(36),
    name VARCHAR(100) NOT NULL,
    battery DOUBLE DEFAULT 100.0,
    gps_status VARCHAR(50) DEFAULT '3D FIX (8 Sats)',
    latitude DOUBLE DEFAULT 13.0827,
    longitude DOUBLE DEFAULT 80.2707,
    rssi INT DEFAULT -75,
    snr INT DEFAULT 9,
    firmware_version VARCHAR(30) DEFAULT 'v2.4.1-mesh',
    lora_module VARCHAR(50) DEFAULT 'SX1278 915MHz',
    frequency_band VARCHAR(50) DEFAULT '915.000 MHz (BW: 125kHz)',
    beacon_interval VARCHAR(30) DEFAULT '15 seconds',
    operating_temp VARCHAR(30) DEFAULT '34°C',
    serial_number VARCHAR(50) DEFAULT 'RESQ-NODE-9901-X',
    status VARCHAR(30) DEFAULT 'ONLINE',
    sos_enabled BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_owner (owner_user_id),
    INDEX idx_device_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS relay_stations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    signal_strength_rssi INT DEFAULT -68,
    snr INT DEFAULT 11,
    battery_percentage DOUBLE DEFAULT 95.0,
    total_packets BIGINT DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    uptime VARCHAR(50) DEFAULT '14d 06h',
    last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_relay_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
