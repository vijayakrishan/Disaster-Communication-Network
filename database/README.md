# ResQMesh Database Initialization & Management

This directory contains complete schema definitions, initialization scripts, seed data, and testing queries for the ResQMesh microservice databases.

---

## Database Architecture

ResQMesh uses isolated MySQL database instances per domain service to ensure microservice resilience and zero database-level coupling:

| Database Name | Microservice | Purpose |
| :--- | :--- | :--- |
| `auth_db` | `auth-service` (8081) | User accounts, credentials, OTP verification, teams, workers |
| `lora_device_db` | `device-service` (8082) | Hardware beacons, sensor registrations, telemetry logs |
| `lora_user_db` | `user-service` (8083) | Victim/survivor profiles, emergency contact records |
| `lora_station_db` | `base-station-service` (8084) | Base station towers, GPS locations, operational status |
| `rescue_db` | `sos-service` (8085) & `rescue-service` (8086) | Distress beacons, rescue assignments, relay telemetry, tactical messaging |

---

## Directory Organization

```
database/
├── schema/
│   ├── 01-create-databases.sql    # Drops and creates clean UTF8MB4 databases
│   ├── 02-auth-schema.sql         # Auth, workers, and teams tables
│   ├── 03-user-schema.sql         # Victim profile tables
│   ├── 04-worker-schema.sql       # Worker responder tables
│   ├── 05-team-schema.sql         # Rescue team configuration tables
│   ├── 06-rescue-schema.sql       # SOS alerts, assignments, and relay logs
│   ├── 07-device-schema.sql       # LoRa device & telemetry tables
│   └── 08-admin-schema.sql        # Admin tables and views
├── sample-data/
│   ├── 09-seed-data.sql           # Realistic demo survivors, workers, and beacons
│   └── 10-test-queries.sql        # Verification queries to check data integrity
├── migrations/                    # Incremental migration tracker
└── run-init.ps1                   # Automated PowerShell database setup runner
```

---

## Quick Setup

Run the automated PowerShell initialization script:
```powershell
.\database\run-init.ps1 -dbUser "root" -dbPassword "yourpassword"
```

Or manually initialize via MySQL CLI:
```bash
mysql -u root -p < database/schema/01-create-databases.sql
mysql -u root -p < database/sample-data/09-seed-data.sql
```
