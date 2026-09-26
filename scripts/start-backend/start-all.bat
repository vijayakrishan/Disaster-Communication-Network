@echo off
title ResQMesh Microservices Startup Launcher
echo ===================================================
echo Starting ResQMesh Microservices Mesh
echo ===================================================

cd /d "%~dp0..\..\backend"

echo [1/6] Launching Auth Service on Port 8081...
start "ResQMesh - Auth Service (8081)" cmd /k "cd auth-service && mvn spring-boot:run"

echo [2/6] Launching Device Service on Port 8082...
start "ResQMesh - Device Service (8082)" cmd /k "cd device-service && mvn spring-boot:run"

echo [3/6] Launching User Service on Port 8083...
start "ResQMesh - User Service (8083)" cmd /k "cd user-service && mvn spring-boot:run"

echo [4/6] Launching Base Station Service on Port 8084...
start "ResQMesh - Base Station Service (8084)" cmd /k "cd base-station-service && mvn spring-boot:run"

echo [5/6] Launching SOS Service on Port 8085...
start "ResQMesh - SOS Service (8085)" cmd /k "cd sos-service && mvn spring-boot:run"

echo [6/6] Launching Rescue Service on Port 8086...
start "ResQMesh - Rescue Service (8086)" cmd /k "cd rescue-service && mvn spring-boot:run"

echo ===================================================
echo All 6 microservices launched in separate terminals!
echo Ports: 8081, 8082, 8083, 8084, 8085, 8086
echo ===================================================
pause
