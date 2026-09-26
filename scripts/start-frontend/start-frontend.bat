@echo off
title ResQMesh Frontend Development Server
echo Starting ResQMesh Frontend on Vite...
cd /d "%~dp0..\..\frontend"
npm.cmd run dev
pause
