# ResQMesh Frontend PowerShell Startup Script
Write-Host "Starting ResQMesh Frontend (Vite)..." -ForegroundColor Cyan
$frontendDir = Resolve-Path "$PSScriptRoot\..\..\frontend"
Set-Location $frontendDir
npm.cmd run dev
