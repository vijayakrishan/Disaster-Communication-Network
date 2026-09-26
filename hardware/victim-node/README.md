# ResQMesh — Victim / Environmental Sensor Node

The **ResQMesh Sensor Node** is an edge IoT emergency beacon and environmental monitor powered by an ESP32 microcontroller, Semtech SX1278 (433MHz) LoRa transceiver, GPS module, and multi-sensor suite.

---

## Hardware Specifications

- **Microcontroller**: ESP32 DevKit V1 (30 or 36 pins)
- **LoRa Module**: Semtech SX1278 (433 MHz, SPI)
- **GPS Receiver**: NEO-6M / NEO-7M / NEO-8M (Hardware Serial UART)
- **Sensors**:
  - **DHT22**: Ambient temperature and relative humidity
  - **BMP280**: Barometric atmospheric pressure and altitude estimation (I2C)
  - **MQ-135**: Air quality and hazardous gas concentration (Analog)
  - **HC-SR04**: Ultrasonic flood water level depth sensor (Digital Trig/Echo)
  - **Capacitive Soil Moisture**: Landslide / soil saturation sensor (Analog)
  - **Rain Drop Sensor**: Rain intensity (Analog)
  - **Flame Sensor**: Fire detection (Digital)
  - **Battery Voltage Divider**: Power status monitoring (Analog)

---

## Pin Connections

| Module / Sensor | ESP32 GPIO Pin | Protocol / Type | Notes |
| :--- | :--- | :--- | :--- |
| **LoRa NSS / CS** | `GPIO 5` | SPI | Chip Select |
| **LoRa SCK** | `GPIO 18` | SPI | Clock |
| **LoRa MISO** | `GPIO 19` | SPI | Master In Slave Out |
| **LoRa MOSI** | `GPIO 23` | SPI | Master Out Slave In |
| **LoRa RST** | `GPIO 14` | GPIO | Reset |
| **LoRa DIO0** | `GPIO 2` | Interrupt | Packet Rx/Tx notification |
| **GPS TX -> ESP32 RX** | `GPIO 16` | UART (Serial2) | 9600 Baud |
| **GPS RX -> ESP32 TX** | `GPIO 17` | UART (Serial2) | 9600 Baud |
| **BMP280 SDA** | `GPIO 21` | I2C | Data line |
| **BMP280 SCL** | `GPIO 22` | I2C | Clock line |
| **DHT22 DATA** | `GPIO 4` | 1-Wire Digital | 10k pullup resistor |
| **MQ-135 A0** | `GPIO 36` (ADC1_CH0) | Analog In | Air quality |
| **Ultrasonic TRIG** | `GPIO 25` | Digital Out | Pulse trigger |
| **Ultrasonic ECHO** | `GPIO 26` | Digital In | Pulse echo |
| **Soil Moisture** | `GPIO 39` (ADC1_CH3) | Analog In | Saturation |
| **Rain Sensor** | `GPIO 34` (ADC1_CH6) | Analog In | Rainfall level |
| **Flame Sensor** | `GPIO 27` | Digital In | Active LOW/HIGH |
| **Battery Divider** | `GPIO 35` (ADC1_CH7) | Analog In | 2:1 resistor divider |

---

## Required Arduino IDE Libraries

Install these libraries via the Arduino Library Manager:
1. `LoRa` by Sandeep Mistry
2. `TinyGPSPlus` by Mikal Hart
3. `DHT sensor library` by Adafruit
4. `Adafruit BMP280 Library` by Adafruit
5. `ArduinoJson` (v6 or v7) by Benoit Blanchon

---

## Flashing Instructions

1. Open `ResQMesh_SensorNode.ino` in Arduino IDE.
2. Select Board: **DOIT ESP32 DEVKIT V1** (or ESP32 Dev Module).
3. Connect the ESP32 via USB and select the appropriate COM port.
4. Set Upload Speed: `921600` or `115200`.
5. Click **Upload**.
