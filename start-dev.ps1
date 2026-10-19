# MediSense AI - Local Development Launcher for PowerShell
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MediSense AI - Local Development Launcher" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting all 3 services in separate windows..." -ForegroundColor Yellow

$rootDir = $PSScriptRoot

# 1. Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; Write-Host '--- Starting Backend API (Port 5000) ---' -ForegroundColor Green; npm run dev"

# 2. ML Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\ml-service'; if (Test-Path 'venv\Scripts\Activate.ps1') { . 'venv\Scripts\Activate.ps1' }; Write-Host '--- Starting ML Microservice (Port 8000) ---' -ForegroundColor Magenta; uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# 3. Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; Write-Host '--- Starting Frontend Web (Port 3000) ---' -ForegroundColor Cyan; npm run dev"

Write-Host "Services successfully triggered!" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:3000"
Write-Host "- Backend:  http://localhost:5000/api/docs"
Write-Host "- ML API:   http://localhost:8000/api/docs"
