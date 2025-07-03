@echo off
echo Starting both Frontend projects...
echo.

echo Starting Admin Portal (apartment-portal-Fe) on port 3000...
start "Admin Portal" cmd /k "cd apartment-portal-Fe && npm run dev"

echo Starting User Portal (apartment-user-portal) on port 3001...
start "User Portal" cmd /k "cd apartment-user-portal && npm run dev"

echo.
echo Both projects are starting...
echo Admin Portal: http://localhost:3000
echo User Portal: http://localhost:3001
echo.
echo Press any key to exit this script (projects will continue running)
pause > nul 