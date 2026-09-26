# ResQMesh — Hardware Firmware & IoT Mesh Specifications

This directory contains the firmware, wiring guides, pin connections, and architectural specifications for the physical hardware nodes composing the **ResQMesh** disaster communication network.

---

## Hardware Hierarchy

```
       [ Victim / Sensor Node ] (ESP32 + SX1278 + Sensors + GPS)
                   │
                   ▼ (433 MHz LoRa RF)
       [ Multi-Hop Relay Nodes ] (Off-Grid Solar Repeaters)
                   │
                   ▼ (433 MHz LoRa RF)
       [ Base Station Gateway ] (LoRa to IP Bridge)
                   │
                   ▼ (HTTP / REST)
       [ ResQMesh Backend Services ]
```

---

## Directory Structure

```
hardware/
├── README.md
├── victim-node/               # ESP32 + LoRa + GPS + Sensors firmware & wiring
│   ├── README.md
│   └── ResQMesh_SensorNode.ino
├── relay-node/                # Mesh repeater specifications and routing logic
│   └── README.md
└── base-station/              # LoRa-to-IP Gateway gateway specifications
    └── README.md
```
