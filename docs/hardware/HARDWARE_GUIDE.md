# ResQMesh — Hardware Wiring & Firmware Reference

This guide details component selection, circuit pinouts, power configurations, and flashing steps for the ResQMesh hardware ecosystem.

---

## 1. Hardware BOM (Bill of Materials)

| Component | Purpose | Recommended Model |
| :--- | :--- | :--- |
| **Microcontroller** | Sensor processing & LoRa packet handling | ESP32 DevKit V1 (30-pin) |
| **LoRa Transceiver** | 433 MHz RF communication | Semtech SX1278 (Ra-02 module) |
| **GPS Receiver** | Geolocation tracking | u-blox NEO-6M / NEO-8M |
| **Atmospheric Sensor** | Barometric pressure & temperature | BMP280 (I2C) |
| **Humidity Sensor** | Ambient humidity | DHT22 (AM2302) |
| **Gas Sensor** | Hazardous air quality monitoring | MQ-135 |
| **Water Level Sensor**| Flood height measurement | HC-SR04 Ultrasonic |
| **Power Management** | Battery regulation | TP4056 + 18650 Li-ion cell |

---

## 2. LoRa Module Wiring (SX1278 to ESP32)

```
SX1278 (Ra-02)       ESP32 DevKit V1
--------------       ---------------
VCC (3.3V)   ----->  3V3 (Never 5V!)
GND          ----->  GND
NSS / CS     ----->  GPIO 5
RST          ----->  GPIO 14
DIO0         ----->  GPIO 2
SCK          ----->  GPIO 18
MISO         ----->  GPIO 19
MOSI         ----->  GPIO 23
```

> [!WARNING]
> The Semtech SX1278 operates on 3.3V logic. Connecting VCC to 5V will permanently damage the transceiver!

---

## 3. Sensors Wiring (ESP32)

```
Sensor               ESP32 Pin
------               ---------
BMP280 SDA           GPIO 21 (I2C SDA)
BMP280 SCL           GPIO 22 (I2C SCL)
DHT22 Data           GPIO 4
MQ-135 Analog A0     GPIO 36 (ADC1_CH0)
Ultrasonic Trig      GPIO 25
Ultrasonic Echo      GPIO 26
Soil Moisture        GPIO 39 (ADC1_CH3)
Rain Sensor          GPIO 34 (ADC1_CH6)
Flame Sensor         GPIO 27
GPS TX               GPIO 16 (Serial2 RX)
GPS RX               GPIO 17 (Serial2 TX)
```
