# Veriscope OS Launcher for Windows PowerShell
# This script starts the backend server and frontend client in separate windows.

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Launching Veriscope OS Workspace       " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Start Express Backend
Write-Host "[1/2] Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; Write-Host 'Booting server...'; npm run dev"

# 2. Start Vite Frontend
Write-Host "[2/2] Starting Frontend Client (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; Write-Host 'Booting client...'; npm run dev"

Write-Host "-----------------------------------------" -ForegroundColor Green
Write-Host "Both processes launched successfully." -ForegroundColor Green
Write-Host "Access Frontend at: http://localhost:5173" -ForegroundColor Green
Write-Host "Access Backend API at: http://localhost:5000" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
