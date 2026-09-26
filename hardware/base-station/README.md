# ResQMesh — Base Station Gateway

The **ResQMesh Base Station Gateway** bridges the physical off-grid LoRa radio mesh network with the internet-connected cloud/local Spring Boot backend services.

---

## Technical Overview

- **Core Hardware**: Raspberry Pi 4 / ESP32 Gateway with SX1278 transceiver
- **Interfaces**:
  - **LoRa RF**: 433 MHz SPI Receiver
  - **Network**: Ethernet / 4G LTE / Satellite uplink / Local Wi-Fi
- **Bridge Responsibilities**:
  1. Captures modulated LoRa packets from victim nodes and relay nodes.
  2. Parses JSON telemetry payloads and validates packet CRC checksums.
  3. Relays telemetry to `device-service` (`POST /api/devices/telemetry`).
  4. Relays emergency distress alerts to `sos-service` (`POST /api/sos/create`).
  5. Periodically heartbeats its coordinates and status to `base-station-service` (`POST /api/stations`).
