# ResQMesh — LoRa Relay Node

The **ResQMesh Relay Node** acts as an intermediate mesh repeater in disaster zones where direct line-of-sight communication between victim/sensor nodes and fixed base stations is obstructed by collapsed structures, terrain, or distance.

---

## Technical Overview

- **Architecture**: Store-and-Forward Mesh Node
- **Transceiver**: Semtech SX1278 (433 MHz)
- **Power**: Solar panel + LiFePO4 battery pack (continuous off-grid operation)
- **Functions**:
  1. Listens continuously for incoming LoRa distress packets.
  2. Inspects packet header for Hop Count (`ttl`) and deduplication cache.
  3. Appends relay node ID to packet route trail (`hops: ["R-1", "R-2"]`).
  4. Decrements remaining TTL and rebroadcasts the packet.
  5. Monitors local battery voltage and reports relay health metrics to base stations.

---

## Packet Format Forwarded by Relay

```json
{
  "nodeId": "NODE-001",
  "msgType": "SOS",
  "lat": 10.9027,
  "lng": 76.8998,
  "battery": 82,
  "temp": 28.4,
  "gas": 120,
  "relayedBy": "RELAY-02",
  "hopCount": 2,
  "rssi": -92,
  "snr": 7.5
}
```
