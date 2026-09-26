# ResQMesh — Backend Microservices Architecture

The backend of **ResQMesh** is engineered as a decoupled, resilient suite of Spring Boot microservices designed to process high-throughput emergency sensor packets and dispatch operations during catastrophic network outages.

---

## Microservices Architecture Overview

```
                        ┌──────────────────────────────┐
                        │   ResQMesh Frontend (Vite)   │
                        └──────────────┬───────────────┘
                                       │ HTTP / REST
         ┌───────────────┬─────────────┼─────────────┬───────────────┐
         │               │             │             │               │
         ▼               ▼             ▼             ▼               ▼
┌────────────────┐┌────────────┐┌────────────┐┌────────────┐┌────────────────┐
│  auth-service  ││user-service││device-serv.││base-station││ rescue-service │
│   Port: 8081   ││ Port: 8083 ││ Port: 8082 ││ Port: 8084 ││   Port: 8086   │
└───────┬────────┘└──────┬─────┘└──────┬─────┘└──────┬─────┘└───────┬────────┘
        │                │             │             │              │
        ▼                ▼             ▼             ▼              ▼
   [auth_db]       [lora_user_db][lora_device][lora_station]   [rescue_db]
                                                             ▲
                                                             │
                                                     ┌───────┴────────┐
                                                     │  sos-service   │
                                                     │   Port: 8085   │
                                                     └────────────────┘
```

---

## Microservice Directory & Port Breakdown

### 1. `auth-service` (Port 8081)
- **Role**: User authentication, registration, role authorization (ADMIN, WORKER, USER), email OTP verification via Resend API, rescue team management, and field responder worker provisioning.
- **Database**: `auth_db`
- **Endpoints**:
  - `POST /api/auth/register` — User and worker registration
  - `POST /api/auth/login` — Account sign-in
  - `POST /api/auth/verify-otp` — Email OTP verification
  - `GET/POST /api/workers/**` — First responder worker accounts & credentials
  - `GET/POST /api/teams/**` — Emergency rescue team assignments

### 2. `device-service` (Port 8082)
- **Role**: LoRa hardware node registry, beacon provisioning, and sensor telemetry ingestion.
- **Database**: `lora_device_db`
- **Endpoints**:
  - `GET/POST /api/devices/**` — LoRa device registration and inventory lookup
  - `POST /api/devices/telemetry` — Ingestion of sensor metrics from base stations

### 3. `user-service` (Port 8083)
- **Role**: Survivor and victim profile management, medical notes, emergency contacts, and geographical location logs.
- **Database**: `lora_user_db`
- **Endpoints**:
  - `GET/POST /api/users/profile/**` — Victim user profile query and update

### 4. `base-station-service` (Port 8084)
- **Role**: Registry of fixed and mobile LoRa base stations, tower health metrics, and nearest station geolocation matching.
- **Database**: `lora_station_db`
- **Endpoints**:
  - `GET /api/stations` — List active base stations
  - `GET /api/stations/nearest` — Calculate nearest base station using Haversine formula

### 5. `sos-service` (Port 8085)
- **Role**: Real-time intake and queuing of SOS distress beacons received over LoRa mesh networks.
- **Database**: `rescue_db`
- **Endpoints**:
  - `POST /api/sos/create` — Create emergency distress alert
  - `GET /api/sos/active` — Retrieve pending and dispatched distress calls

### 6. `rescue-service` (Port 8086)
- **Role**: Command-and-control rescue dashboard aggregator, field assignment coordinator, LoRa relay mesh hop tracking, and worker tactical messaging.
- **Database**: `rescue_db`
- **Endpoints**:
  - `GET /api/rescue/dashboard/summary` — High-level incident statistics & KPIs
  - `POST /api/rescue/assign` — Assign rescue teams to active SOS beacons
  - `GET/POST /api/relays/**` — Relay node health monitoring and telemetry hops
  - `GET/POST /api/messages/**` — Field communication messages

---

## Building and Running the Microservices

### Prerequisites
- **Java**: JDK 21+
- **Maven**: 3.9+
- **MySQL Server**: 8.0+ running on port 3306 with databases configured (see `database/` directory)

### Build Every Service
Run within any individual service directory:
```bash
mvn clean package -DskipTests
```

Or run using the automated script:
```bash
# Windows
.\scripts\start-backend\start-all.bat
# or PowerShell
.\scripts\start-backend\start-all.ps1
```
