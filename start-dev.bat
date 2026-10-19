@echo off
echo ============================================================
echo   MediSense AI - Local Development Launcher
echo ============================================================
echo.
echo Starting all 3 microservices in separate terminal windows:
echo   [1] Backend API      (Node.js / Express -> Port 5000)
echo   [2] ML Microservice  (Python / FastAPI  -> Port 8000)
echo   [3] Frontend Web App (React / Vite      -> Port 3000)
echo.

:: 1. Launch Backend in new window
start "MediSense Backend (5000)" cmd /k "cd /d %~dp0backend && npm run dev"

:: 2. Launch ML Service in new window
start "MediSense ML Service (8000)" cmd /k "cd /d %~dp0ml-service && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: 3. Launch Frontend in new window
start "MediSense Frontend (3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo All services launched!
echo - Frontend:  http://localhost:3000 (or http://localhost:5173)
echo - Backend:   http://localhost:5000/api/docs
echo - ML API:    http://localhost:8000/api/docs
echo.
pause
