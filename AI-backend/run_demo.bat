@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo                 RESQMESH AI - DISASTER RISK ESTIMATION SERVICE
echo                       Standalone Demonstration Launcher
echo ==============================================================================
echo.

:: Check Java
echo [1/3] Checking Java environment...
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java is not found in PATH!
    echo Please install Java 17 or Java 21 and ensure 'java' is accessible.
    pause
    exit /b 1
)
java -version
echo.

:: Check Maven
echo [2/3] Checking Maven environment...
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Maven is not found in PATH. Will attempt to run packaged JAR directly if present.
)

:: Locate application artifact or launch via Maven
echo [3/3] Locating application artifact...
set "SCRIPT_DIR=%~dp0"
set "JAR_FILE=%SCRIPT_DIR%target\resqmesh-ai-backend-1.0.0.jar"

if exist "%JAR_FILE%" (
    echo Found packaged JAR: %JAR_FILE%
    echo Starting RESQMESH AI Backend on port 8086...
    start http://localhost:8086
    java -jar "%JAR_FILE%"
) else (
    echo JAR not found. Building and running via Maven...
    cd /d "%SCRIPT_DIR%"
    start http://localhost:8086
    mvn spring-boot:run
)

pause
