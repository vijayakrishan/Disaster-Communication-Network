# ResQMesh — Microservices REST API Reference

This document provides complete endpoint specifications, HTTP request methods, request bodies, and sample responses for all ResQMesh backend services.

---

## 1. Auth Service (`http://localhost:8081`)

### `POST /api/auth/register`
Register a new victim or worker account.
```json
{
  "name": "Alex Mercer",
  "email": "alex@resqmesh.org",
  "password": "SecurePassword123",
  "role": "USER",
  "phoneNumber": "+91 98765 43210"
}
```

### `POST /api/auth/login`
Authenticate account credentials and obtain user profile.
```json
{
  "email": "alex@resqmesh.org",
  "password": "SecurePassword123"
}
```

### `POST /api/auth/verify-otp`
Verify email OTP received via Resend.
```json
{
  "email": "alex@resqmesh.org",
  "otp": "492810"
}
```

### `GET /api/workers`
Retrieve all registered emergency response workers.

### `POST /api/workers`
Create a field worker responder profile.

### `GET /api/teams`
Retrieve all emergency rescue teams.

### `POST /api/teams`
Create or update a rescue team.

---

## 2. Device Service (`http://localhost:8082`)

### `GET /api/devices`
List all registered LoRa beacons and environmental nodes.

### `POST /api/devices/register`
Register a physical LoRa node.
```json
{
  "deviceId": "NODE-001",
  "deviceType": "SENSOR_NODE",
  "ownerEmail": "alex@resqmesh.org",
  "macAddress": "24:6F:28:AB:12:34"
}
```

### `POST /api/devices/telemetry`
Ingest sensor data sent from hardware.
```json
{
  "nodeId": "NODE-001",
  "temperature": 27.5,
  "humidity": 68.2,
  "pressure": 1013.25,
  "gasLevel": 110,
  "waterLevel": 0.45,
  "latitude": 10.9027,
  "longitude": 76.8998,
  "batteryPercent": 88
}
```

---

## 3. User Service (`http://localhost:8083`)

### `GET /api/users/profile/{email}`
Retrieve survivor profile and medical notes.

### `PUT /api/users/profile`
Update victim emergency contact information.
```json
{
  "email": "alex@resqmesh.org",
  "fullName": "Alex Mercer",
  "bloodGroup": "O+",
  "emergencyContact": "+91 91234 56789",
  "address": "Sector 4, Riverbank Area",
  "medicalConditions": "Asthma"
}
```

---

## 4. Base Station Service (`http://localhost:8084`)

### `GET /api/stations`
Retrieve all registered base stations and gateway coordinates.

### `GET /api/stations/nearest?lat=10.9027&lng=76.8998`
Calculates nearest base station to given coordinates using the Haversine formula.

---

## 5. SOS Service (`http://localhost:8085`)

### `POST /api/sos/create`
Broadcast an emergency SOS distress alert.
```json
{
  "deviceId": "NODE-001",
  "userEmail": "alex@resqmesh.org",
  "latitude": 10.9027,
  "longitude": 76.8998,
  "emergencyType": "FLOOD",
  "severity": "CRITICAL",
  "description": "Rising water level, trapped on roof"
}
```

### `GET /api/sos/active`
Retrieve list of active, unassigned or pending distress calls.

---

## 6. Rescue Service (`http://localhost:8086`)

### `GET /api/rescue/dashboard/summary`
Aggregates operational metrics across all rescue zones.
```json
{
  "totalAlerts": 42,
  "activeAlerts": 7,
  "resolvedAlerts": 35,
  "activeTeams": 4,
  "onlineRelays": 12
}
```

### `POST /api/rescue/assign`
Dispatch a rescue team to an emergency alert.
```json
{
  "sosId": 101,
  "teamId": 3,
  "assignedWorkerEmail": "responder1@resqmesh.org",
  "notes": "Boat dispatched with medical kit"
}
```

### `GET /api/relays`
List all relay nodes, battery levels, and mesh hop status.

### `GET /api/messages`
Retrieve communications between dispatch operators and field workers.
