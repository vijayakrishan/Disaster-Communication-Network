# ResQMesh API Gateway & Service Routing Reference

In the ResQMesh microservice mesh architecture, backend services run independently on dedicated ports. Client applications (frontend web interface, base stations, and rescue operations consoles) can interact with services either directly via their respective microservice ports (development mode) or unified through an API Gateway / reverse proxy (production mode).

---

## Unified Port & Routing Table

| Service | Port | Path Prefix | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Auth Service** | `8081` | `/api/auth/**`<br>`/api/workers/**`<br>`/api/teams/**` | JWT authentication, email verification OTP, responder worker & rescue team management |
| **Device Service** | `8082` | `/api/devices/**`<br>`/api/telemetry/**` | LoRa beacon registration, hardware metadata, and sensor telemetry ingestion |
| **User Service** | `8083` | `/api/users/**` | Victim profiles, personal data, and emergency survivor contact info |
| **Base Station Service**| `8084` | `/api/stations/**` | LoRa base station node coordinates, health status, and proximity lookup |
| **SOS Service** | `8085` | `/api/sos/**` | Emergency distress signal dispatch, queue prioritization, and triage |
| **Rescue Service** | `8086` | `/api/rescue/**`<br>`/api/relays/**`<br>`/api/messages/**` | Live rescue operations dashboard, relay mesh telemetry, responder coordination |

---

## Production Reverse Proxy Configuration (Nginx)

```nginx
events { worker_connections 1024; }

http {
    upstream auth_service { server localhost:8081; }
    upstream device_service { server localhost:8082; }
    upstream user_service { server localhost:8083; }
    upstream station_service { server localhost:8084; }
    upstream sos_service { server localhost:8085; }
    upstream rescue_service { server localhost:8086; }

    server {
        listen 8080;
        server_name resqmesh.local;

        # Auth, Workers, Teams
        location /api/auth/ { proxy_pass http://auth_service; }
        location /api/workers/ { proxy_pass http://auth_service; }
        location /api/teams/ { proxy_pass http://auth_service; }

        # Device & Telemetry
        location /api/devices/ { proxy_pass http://device_service; }

        # User Profiles
        location /api/users/ { proxy_pass http://user_service; }

        # Base Stations
        location /api/stations/ { proxy_pass http://station_service; }

        # SOS Alerts
        location /api/sos/ { proxy_pass http://sos_service; }

        # Rescue, Relays & Dispatch
        location /api/rescue/ { proxy_pass http://rescue_service; }
        location /api/relays/ { proxy_pass http://rescue_service; }
        location /api/messages/ { proxy_pass http://rescue_service; }
    }
}
```

---

## Spring Cloud Gateway Configuration Example

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: http://localhost:8081
          predicates:
            - Path=/api/auth/**, /api/workers/**, /api/teams/**
        - id: device-service
          uri: http://localhost:8082
          predicates:
            - Path=/api/devices/**
        - id: user-service
          uri: http://localhost:8083
          predicates:
            - Path=/api/users/**
        - id: base-station-service
          uri: http://localhost:8084
          predicates:
            - Path=/api/stations/**
        - id: sos-service
          uri: http://localhost:8085
          predicates:
            - Path=/api/sos/**
        - id: rescue-service
          uri: http://localhost:8086
          predicates:
            - Path=/api/rescue/**, /api/relays/**, /api/messages/**
```
