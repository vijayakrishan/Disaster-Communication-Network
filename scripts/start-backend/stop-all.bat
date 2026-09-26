@echo off
title Stop ResQMesh Services
echo Stopping all running Java / Spring Boot processes on ports 8081-8086...

for %%P in (8081 8082 8083 8084 8085 8086) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%P ^| findstr LISTENING') do (
        echo Killing PID %%a on port %%P...
        taskkill /F /PID %%a
    )
)

echo Done. All ResQMesh service ports released.
pause
