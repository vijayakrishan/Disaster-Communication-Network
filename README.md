# ResQMesh — LoRa-Based Emergency Communication & Disaster Rescue Mesh Network

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![ESP32](https://img.shields.io/badge/ESP32-LoRa%20SX1278-red.svg)](https://espressif.com/)

---

## 1. Project Overview

**ResQMesh** is an integrated IoT edge-to-cloud emergency disaster communication platform designed to provide resilient, off-grid communication and triage coordination during natural disasters, infrastructure failures, or cellular blackouts. By leveraging Long Range (LoRa) radio mesh networking at 433 MHz, battery-backed ESP32 sensor beacons, autonomous solar repeaters, and Spring Boot microservices, ResQMesh enables survivors to transmit distress beacons and first responders to coordinate rescue operations in real time.

---

## 2. Problem Statement

During catastrophic natural disasters (floods, earthquakes, hurricanes, landslides):
- Terrestrial cellular towers, fiber backbones, and electrical grids frequently collapse within minutes.
- Victims are cut off from emergency contact, unable to signal their location, medical status, or hazard conditions.
- First responders lack ground-level telemetry regarding water levels, toxic gas leaks, and trapped survivor clusters.
- Centralized dispatch systems become paralyzed due to infrastructure dependency.

---

## 3. The ResQMesh Solution

ResQMesh bridges the critical gap between disaster victims and rescue command teams through a multi-tier decentralized topology:
1. **Edge LoRa Beacons**: Victims carry or activate compact ESP32-powered sensor beacons equipped with GPS and environmental sensors (temperature, pressure, flood depth, fire, toxic gas).
2. **Autonomous Multi-Hop Relay Nodes**: Solar-powered mesh repeaters automatically forward distress signals across long distances and through obstructed terrain without requiring SIM cards or internet access.
3. **Gateway Base Stations**: Ground stations capture LoRa radio packets, convert them to IP payloads, and ingest them into backend services.
4. **Resilient Microservices Suite**: Decoupled Spring Boot services independently process survivor registration, distress triage, telemetry tracking, and dispatching.
5. **Role-Based Command Dashboard**: A modern React 19 web application providing custom views for System Administrators, Field Rescue Workers, and Civilian Victims.

---

## 4. Main Features

- **Off-Grid SOS Distress Signaling**: Instant beacon activation with GPS coordinates and victim medical profiles transmitted via LoRa radio.
- **Environmental Hazard Telemetry**: Live sensing of flood water levels (HC-SR04 ultrasonic), atmospheric pressure (BMP280), air toxicity (MQ-135), fire (flame sensor), and soil saturation.
- **Multi-Hop Relay Mesh Tracking**: Visual tracking of packet hop paths (`NODE -> RELAY-1 -> RELAY-2 -> BASE`), RSSI signal strength, and relay battery percentages.
- **Interactive Geospatial Mapping**: Real-time Leaflet GIS displaying active distress beacons, survivor coordinates, base station coverage circles, and responder team positions.
- **Active SOS Dispatch Queue**: Priority-based triage queue allowing incident commanders to dispatch specialized rescue teams (Boat, Medical, Extraction) with live status updates.
- **Field Worker Tactical Messaging**: Two-way operational communications between field rescue units and central command.
- **Survivor Hardware Registry**: Device pairing and management allowing citizens to register unique beacon hardware IDs.
- **Predictive Risk & Vulnerability Analysis**: Telemetry-driven zone severity estimation to help commanders allocate resources proactively.
- **Email OTP Verification**: Automated authentication verification powered by the Resend email API.

---

## 5. System Architecture

```
                                  OFF-GRID DISASTER ZONE
                        ┌───────────────────────────────────────┐
                        │      Victim / Sensor Node (ESP32)     │
                        │    GPS + Sensors + SX1278 (433MHz)    │
                        └───────────────────┬───────────────────┘
                                            │
                                            ▼
                        ┌───────────────────────────────────────┐
                        │    LoRa Mesh Relay Nodes (Repeaters)  │
                        │  Hop-by-hop forwarding across terrain  │
                        └───────────────────┬───────────────────┘
                                            │
                                            ▼
                        ┌───────────────────────────────────────┐
                        │       LoRa Base Station Gateway       │
                        │        Radio-to-IP Translation        │
                        └───────────────────┬───────────────────┘
                                            │ HTTP / REST
    ════════════════════════════════════════╪════════════════════════════════════════
                                 COMMAND & CONTROL TIER
                                            │
         ┌───────────────┬──────────────────┼──────────────────┬────────────────┐
         │               │                  │                  │                │
         ▼               ▼                  ▼                  ▼                ▼
 ┌──────────────┐┌──────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
 │ auth-service ││device-service│   │ user-service │   │ base-station │  │rescue-service│
 │  Port: 8081  ││  Port: 8082  │   │  Port: 8083  │   │  Port: 8084  │  │  Port: 8086  │
 └──────┬───────┘└──────┬───────┘   └──────┬───────┘   └──────┬───────┘  └──────┬───────┘
        │               │                  │                  │                 │
        │               │                  │                  │          ┌──────┴───────┐
        │               │                  │                  │          │ sos-service  │
        │               │                  │                  │          │  Port: 8085  │
        │               │                  │                  │          └──────┬───────┘
        ▼               ▼                  ▼                  ▼                 ▼
   [(auth_db)]   [(lora_device)]    [(lora_user_db)]   [(lora_station)]   [(rescue_db)]
        ▲               ▲                  ▲                  ▲                 ▲
        └───────────────┴──────────────────┼──────────────────┴─────────────────┘
                                           │ HTTP / REST
                                ┌──────────┴──────────┐
                                │  ResQMesh Frontend  │
                                │   React 19 + Vite   │
                                └─────────────────────┘
```

---

## 6. Technology Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Mapping**: Leaflet & React-Leaflet
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Styling**: Vanilla CSS with customized theme variables

### Backend
- **Framework**: Spring Boot 4.1.x / Java 21
- **Persistence**: Spring Data JPA / Hibernate
- **Database**: MySQL 8.0
- **Email Service**: Resend Java SDK
- **Build Tool**: Apache Maven

### Hardware & IoT
- **Microcontroller**: ESP32 DevKit V1
- **RF Transceiver**: Semtech SX1278 (433 MHz LoRa)
- **GNSS**: NEO-6M / NEO-8M GPS Module
- **Sensors**: DHT22, BMP280, MQ-135, HC-SR04, Rain, Flame, Capacitive Moisture

---

## 7. Repository Structure

```
ResQMesh/
│
├── README.md                  # Master project documentation
├── LICENSE                    # MIT License
├── .gitignore                 # Comprehensive Git exclusion rules
├── .env.example               # Template environment configuration
│
├── frontend/                  # React 19 + Vite Web Application
│   ├── README.md
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/                # Static assets (favicons, SVG icons)
│   └── src/
│       ├── api/               # API client & centralized endpoint URLs
│       ├── assets/            # Brand logos and vector graphics
│       ├── components/        # Reusable UI widgets, navbars & sidebars
│       │   ├── common/        # Shared queue and visualizer components
│       │   ├── navbar/        # Top navigation bars
│       │   └── sidebar/       # Role-specific navigation sidebars
│       ├── context/           # Global application state (AppContext)
│       ├── layouts/           # Layout shells (AdminLayout, WorkerLayout, UserLayout)
│       ├── pages/             # Authenticated role-based application views
│       │   ├── auth/          # Login, Register, OTP verification
│       │   ├── admin/         # Operations command dashboard & admin controls
│       │   ├── worker/        # Field rescue tracking & responder tools
│       │   └── user/          # Civilian victim dashboard & beacon status
│       ├── services/          # Microservice API integration service modules
│       ├── styles/            # Global styling rules and CSS variables
│       ├── utils/             # Helper utilities (phone formatting)
│       ├── App.jsx            # Application root router
│       └── main.jsx           # React DOM mounting entry point
│
├── backend/                   # Independent Spring Boot Microservices
│   ├── README.md
│   ├── api-gateway/           # Gateway routing specifications and proxy configs
│   ├── auth-service/          # Port 8081: Auth, Workers, Teams & OTP Verification
│   ├── device-service/        # Port 8082: LoRa Beacon Hardware & Telemetry
│   ├── user-service/          # Port 8083: Survivor Profiles & Medical Notes
│   ├── base-station-service/  # Port 8084: Base Station Registry & Geo-Lookup
│   ├── sos-service/           # Port 8085: Real-Time Distress Beacon Ingestion
│   └── rescue-service/        # Port 8086: Rescue Dashboard, Relays & Dispatch
│
├── hardware/                  # IoT Firmware and Node Schematics
│   ├── README.md
│   ├── victim-node/           # ESP32 + LoRa + Multi-Sensor Arduino firmware
│   ├── relay-node/            # Solar Mesh Repeater specifications
│   └── base-station/          # Gateway bridge specifications
│
├── database/                  # SQL Schemas and Initialization Scripts
│   ├── README.md
│   ├── schema/                # Isolated database schema creation scripts
│   ├── sample-data/           # Demonstration seed data & verification queries
│   ├── migrations/            # Migration documentation and tracking
│   └── run-init.ps1           # Automated PowerShell database setup runner
│
├── docs/                      # Technical Documentation & Diagrams
│   ├── architecture/          # System architecture and data flow diagrams
│   ├── api/                   # REST API endpoint reference
│   ├── database/              # Schema diagrams and table definitions
│   ├── hardware/              # Wiring pinouts and hardware guide
│   └── screenshots/           # Application screenshots guide
│
└── scripts/                   # Automation & Deployment Utilities
    ├── start-backend/         # Service startup & shutdown scripts
    ├── start-frontend/        # Vite development server startup scripts
    └── deployment/            # Docker Compose & container deployment scripts
```

---

## 8. Database Setup

### Prerequisites
- MySQL Server 8.0+ running on `localhost:3306`.

### Automated Setup (PowerShell)
```powershell
.\database\run-init.ps1 -dbUser "root" -dbPassword "yourpassword"
```

### Manual Setup via MySQL CLI
```bash
mysql -u root -p < database/schema/01-create-databases.sql
mysql -u root -p < database/sample-data/09-seed-data.sql
```

The script will create:
- `auth_db`
- `lora_device_db`
- `lora_user_db`
- `lora_station_db`
- `rescue_db`

---

## 9. Backend Setup & Running

### Prerequisites
- Java JDK 21+
- Apache Maven 3.9+

### Build All Services
Navigate to each service in `backend/` and run:
```bash
mvn clean package -DskipTests
```

### Start All Services Automatically
```bash
# Windows Command Prompt
.\scripts\start-backend\start-all.bat

# Or PowerShell
.\scripts\start-backend\start-all.ps1
```

Each service will start on its dedicated port:
- **Auth Service**: `http://localhost:8081`
- **Device Service**: `http://localhost:8082`
- **User Service**: `http://localhost:8083`
- **Base Station Service**: `http://localhost:8084`
- **SOS Service**: `http://localhost:8085`
- **Rescue Service**: `http://localhost:8086`

---

## 10. Frontend Setup & Running

### Prerequisites
- Node.js 18+ and npm

### Installation & Execution
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

---

## 11. Hardware Setup (ESP32 Sensor Node)

1. Open `hardware/victim-node/ResQMesh_SensorNode.ino` in the Arduino IDE.
2. Install the required libraries:
   - `LoRa` by Sandeep Mistry
   - `TinyGPSPlus` by Mikal Hart
   - `DHT sensor library` by Adafruit
   - `Adafruit BMP280 Library` by Adafruit
   - `ArduinoJson`
3. Wire the sensors according to [docs/hardware/HARDWARE_GUIDE.md](docs/hardware/HARDWARE_GUIDE.md).
4. Select board **DOIT ESP32 DEVKIT V1**, connect via USB, and click **Upload**.

---

## 12. Microservices REST Overview

| Endpoint | Method | Service | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Auth (8081) | Register survivor or responder |
| `/api/auth/login` | `POST` | Auth (8081) | Account sign-in |
| `/api/auth/verify-otp`| `POST` | Auth (8081) | Verify OTP via Resend |
| `/api/devices` | `GET/POST` | Device (8082) | Beacon hardware registration |
| `/api/devices/telemetry` | `POST` | Device (8082) | Sensor telemetry ingestion |
| `/api/users/profile/**`| `GET/PUT` | User (8083) | Victim profile & emergency data |
| `/api/stations` | `GET` | Station (8084) | Active base station registry |
| `/api/sos/create` | `POST` | SOS (8085) | Broadcast emergency distress signal |
| `/api/sos/active` | `GET` | SOS (8085) | Retrieve active distress queue |
| `/api/rescue/dashboard/summary` | `GET` | Rescue (8086) | Operational statistics & KPIs |
| `/api/rescue/assign` | `POST` | Rescue (8086) | Dispatch team to active SOS |
| `/api/relays` | `GET` | Rescue (8086) | Relay mesh health & hop metrics |
| `/api/messages` | `GET/POST` | Rescue (8086) | Field worker tactical messaging |

---

## 13. Git Initialization & Publishing

To push this organized repository to your GitHub account:

```bash
# 1. Initialize Git repository
git init

# 2. Stage all organized files
git add .

# 3. Create initial commit
git commit -m "feat: organize ResQMesh repository structure for GitHub"

# 4. Set main branch
git branch -M main

# 5. Connect to your GitHub repository
git remote add origin https://github.com/<your-username>/ResQMesh.git

# 6. Push to GitHub
git push -u origin main
```

---

## 14. Contributors & Team

Developed with dedication to emergency communication resilience and disaster relief technology.
- **Project**: ResQMesh Emergency Mesh System
- **Repository**: [https://github.com/vijayakrishan/ResQMesh](https://github.com/vijayakrishan)
