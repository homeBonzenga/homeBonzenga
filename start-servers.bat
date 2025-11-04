@echo off
echo Starting Home Bonzenga Servers...
echo.

echo Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd server && npm run dev"

echo Starting Frontend Server (Port 3003)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3003
echo.
echo Press any key to exit...
pause > nul
