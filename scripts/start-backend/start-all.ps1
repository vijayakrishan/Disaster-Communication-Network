# ResQMesh Backend PowerShell Startup Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting ResQMesh Microservices Mesh" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$backendDir = Resolve-Path "$PSScriptRoot\..\..\backend"

$services = @(
    @{ Name = "Auth Service"; Port = 8081; Dir = "auth-service" },
    @{ Name = "Device Service"; Port = 8082; Dir = "device-service" },
    @{ Name = "User Service"; Port = 8083; Dir = "user-service" },
    @{ Name = "Base Station Service"; Port = 8084; Dir = "base-station-service" },
    @{ Name = "SOS Service"; Port = 8085; Dir = "sos-service" },
    @{ Name = "Rescue Service"; Port = 8086; Dir = "rescue-service" }
)

$index = 1
foreach ($svc in $services) {
    Write-Host "[$index/$($services.Count)] Launching $($svc.Name) on Port $($svc.Port)..." -ForegroundColor Green
    $svcPath = Join-Path $backendDir $svc.Dir
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$svcPath'; mvn spring-boot:run"
    Start-Sleep -Seconds 2
    $index++
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "All 6 microservices initiated!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
