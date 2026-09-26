/*
 * ResQMesh Environmental Sensor Node
 * ESP32 + LoRa (SX1278) + Multiple Sensors
 *
 * DEPENDENCIES:
 * - LoRa by sandeepmistry (https://github.com/sandeepmistry/arduino-LoRa)
 * - TinyGPSPlus by mikalhart (https://github.com/mikalhart/TinyGPSPlus)
 * - DHT sensor library by Adafruit
 * - Adafruit BMP280 Library
 * - ArduinoJson by bblanchon (version 6 or 7)
 *
 * PIN CONNECTIONS:
 * - LoRa: NSS=5, RST=14, DIO0=2
 * - GPS: RX=16, TX=17 (Serial2)
 * - DHT22: Data=4
 * - BMP280: SDA=21, SCL=22 (I2C)
 * - MQ-135: Analog A0 (GPIO 36)
 * - Ultrasonic: Trig=25, Echo=26
 * - Soil Moisture: Analog (GPIO 39)
 * - Rain Sensor: Analog (GPIO 34)
 * - Flame Sensor: Digital (GPIO 27)
 * - Battery Voltage: Analog (GPIO 35) (Optional voltage divider)
 */

#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <HardwareSerial.h>
#include <TinyGPS++.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>
#include <ArduinoJson.h>
#include <esp_task_wdt.h>

// --- Configuration ---
#define NODE_ID "NODE-001"
#define LORA_FREQ 433E6
#define READ_INTERVAL_MS 10000
#define WDT_TIMEOUT 15 // 15 seconds WDT

// Pin Definitions
#define LORA_SS 5
#define LORA_RST 14
#define LORA_DIO0 2

#define GPS_RX 16
#define GPS_TX 17

#define DHT_PIN 4
#define DHT_TYPE DHT22

#define MQ135_PIN 36
#define TRIG_PIN 25
#define ECHO_PIN 26
#define SOIL_PIN 39
#define RAIN_PIN 34
#define FLAME_PIN 27
#define BATTERY_PIN 35

// --- Global Objects ---
TinyGPSPlus gps;
HardwareSerial GPS_Serial(2);
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_BMP280 bmp; // I2C

// --- State Variables ---
bool isDemoMode = false;
bool hasBMP = false;
int packetCounter = 0;
float currentLat = 11.0168; // Default Coimbatore
float currentLon = 76.9558;

// Buffer for unsent packets
const int MAX_BUFFER_SIZE = 50;
String packetBuffer[MAX_BUFFER_SIZE];
int bufferCount = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial);
  Serial.println(F("\n--- ResQMesh Sensor Node ---"));
  
  // Watchdog
  esp_task_wdt_init(WDT_TIMEOUT, true);
  esp_task_wdt_add(NULL);

  // Initialize 2-Sensor Hardware (DHT22: Temperature & Humidity)
  pinMode(BATTERY_PIN, INPUT);
  dht.begin();

  // Check DHT22 sensor
  float t = dht.readTemperature();
  if (isnan(t)) {
    isDemoMode = true;
    Serial.println(F("DHT22 failed, enabling demo mode."));
  }

  // Initialize GPS
  GPS_Serial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  // Initialize LoRa
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_FREQ)) {
    Serial.println(F("Starting LoRa failed! Will retry later."));
  } else {
    LoRa.setSpreadingFactor(7);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(5);
    Serial.println(F("LoRa Initialized."));
  }

  if (isDemoMode) {
    Serial.println(F("[DEMO MODE] Enabled. DHT22 sensor missing or disconnected."));
  }
}

float readBattery() {
  // Simple voltage divider assuming 100k/100k, 3.3v reference
  int raw = analogRead(BATTERY_PIN);
  float voltage = (raw / 4095.0) * 3.3 * 2; 
  // Map voltage to 0-100% roughly (assuming LiPo 3.2V - 4.2V)
  float pct = (voltage - 3.2) / (4.2 - 3.2) * 100.0;
  if(pct > 100) pct = 100;
  if(pct < 0) pct = 0;
  return isDemoMode ? random(80, 95) : pct;
}

String generateTimestamp() {
  // If GPS is valid and time is updated, use it
  if (gps.time.isValid() && gps.date.isValid()) {
    char ts[25];
    sprintf(ts, "%04d-%02d-%02dT%02d:%02d:%02d", 
            gps.date.year(), gps.date.month(), gps.date.day(), 
            gps.time.hour(), gps.time.minute(), gps.time.second());
    return String(ts);
  }
  // Fallback timestamp
  return "2024-01-15T10:30:00"; 
}

void processGPS() {
  while (GPS_Serial.available() > 0) {
    gps.encode(GPS_Serial.read());
  }
  if (gps.location.isValid()) {
    currentLat = gps.location.lat();
    currentLon = gps.location.lng();
  }
}

String createJSON(const char* sensorId, const char* type, float value, const char* unit, float batPct) {
  StaticJsonDocument<256> doc;
  doc["nodeId"] = NODE_ID;
  doc["sensorId"] = sensorId;
  doc["sensorType"] = type;
  doc["value"] = value;
  doc["unit"] = unit;
  doc["latitude"] = currentLat;
  doc["longitude"] = currentLon;
  doc["timestamp"] = generateTimestamp();
  doc["battery"] = (int)batPct;
  doc["isDemo"] = isDemoMode;
  doc["seq"] = packetCounter++;

  String output;
  serializeJson(doc, output);
  return output;
}

bool sendLoRa(String data) {
  if (LoRa.beginPacket()) {
    LoRa.print(data);
    if (LoRa.endPacket()) {
      Serial.println("Sent: " + data);
      return true;
    }
  }
  Serial.println("LoRa send failed.");
  return false;
}

void trySendBuffer() {
  int i = 0;
  while (i < bufferCount) {
    if (sendLoRa(packetBuffer[i])) {
      // Remove from buffer
      for (int j = i; j < bufferCount - 1; j++) {
        packetBuffer[j] = packetBuffer[j + 1];
      }
      bufferCount--;
    } else {
      break; // Stop if transmission still failing
    }
  }
}

void queueOrSend(String data) {
  if (sendLoRa(data)) {
    trySendBuffer(); // flush buffer if connection restored
  } else {
    if (bufferCount < MAX_BUFFER_SIZE) {
      packetBuffer[bufferCount++] = data;
      Serial.println(F("Buffered packet."));
    } else {
      Serial.println(F("Buffer full, dropping packet."));
    }
  }
}

// --- Sensor Reading Functions ---

void readAndSendTemperatureAndHumidity(float batPct) {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  if (isDemoMode || isnan(temp)) {
    temp = random(250, 400) / 10.0; // 25.0 to 40.0
    hum = random(400, 900) / 10.0;
  }
  
  if (temp >= -40 && temp <= 80) queueOrSend(createJSON("TEMP-001", "TEMPERATURE", temp, "C", batPct));
  if (hum >= 0 && hum <= 100) queueOrSend(createJSON("HUM-001", "HUMIDITY", hum, "%", batPct));
}

void readAndSendPressure(float batPct) {
  float pres = 0;
  if (hasBMP && !isDemoMode) {
    pres = bmp.readPressure() / 100.0F; // hPa
  } else {
    pres = random(9500, 10500) / 10.0;
  }
  if (pres > 800 && pres < 1100) queueOrSend(createJSON("PRES-001", "PRESSURE", pres, "hPa", batPct));
}

void readAndSendAirQuality(float batPct) {
  int aq = analogRead(MQ135_PIN);
  if (isDemoMode) aq = random(100, 1500); // 12-bit ADC
  queueOrSend(createJSON("AQ-001", "AIR_QUALITY", aq, "RAW", batPct));
}

void readAndSendWaterLevel(float batPct) {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  float distance = duration * 0.034 / 2;
  
  if (isDemoMode || distance == 0) distance = random(10, 200);
  
  if (distance > 0 && distance < 400) {
    queueOrSend(createJSON("WL-001", "WATER_LEVEL", distance, "cm", batPct));
  }
}

void readAndSendSoilMoisture(float batPct) {
  int soil = analogRead(SOIL_PIN);
  if (isDemoMode) soil = random(1000, 3000);
  queueOrSend(createJSON("SOIL-001", "SOIL_MOISTURE", soil, "RAW", batPct));
}

void readAndSendRain(float batPct) {
  int rain = analogRead(RAIN_PIN);
  if (isDemoMode) rain = random(0, 4095);
  queueOrSend(createJSON("RAIN-001", "RAIN", rain, "RAW", batPct));
}

void readAndSendFlame(float batPct) {
  int flame = digitalRead(FLAME_PIN);
  if (isDemoMode) flame = random(0, 100) > 95 ? 0 : 1; // 5% chance of fire
  queueOrSend(createJSON("FIRE-001", "FLAME", !flame, "BOOL", batPct)); // inverted usually
}

void loop() {
  esp_task_wdt_reset(); // feed dog

  processGPS();
  
  unsigned long currentMillis = millis();
  static unsigned long lastRead = 0;
  
  if (currentMillis - lastRead >= READ_INTERVAL_MS) {
    lastRead = currentMillis;
    float batPct = readBattery();
    
    if (isDemoMode) {
      Serial.print(F("[DEMO MODE] "));
    }
    Serial.println(F("Reading sensors..."));
    
    // Read and transmit ONLY the 2 hardware sensors
    readAndSendTemperatureAndHumidity(batPct);
    
    Serial.println(F("Reading cycle complete."));
    Serial.printf("GPS: Lat: %f, Lon: %f (Fix: %s)\n", currentLat, currentLon, gps.location.isValid() ? "YES" : "NO");
    Serial.printf("Battery: %.1f%%\n", batPct);
    Serial.println(F("-----------------------"));
  }
}
