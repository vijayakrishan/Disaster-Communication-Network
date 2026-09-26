-- ============================================================================
-- 01-create-databases.sql
-- ResQMesh Isolated Microservices Database Schemas Creation Script
-- ============================================================================

DROP DATABASE IF EXISTS auth_db;
DROP DATABASE IF EXISTS user_db;
DROP DATABASE IF EXISTS worker_db;
DROP DATABASE IF EXISTS team_db;
DROP DATABASE IF EXISTS rescue_db;
DROP DATABASE IF EXISTS device_db;
DROP DATABASE IF EXISTS admin_db;

CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE worker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE team_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE rescue_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE device_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE admin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
