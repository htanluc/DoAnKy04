@echo off
echo ========================================
echo APARTMENT MANAGEMENT SYSTEM - BACKEND
echo ========================================
echo.
echo Starting backend server...
echo Database: ApartmentDB (existing)
echo Sample data will be loaded automatically
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

REM Check if MySQL is running
echo Checking MySQL connection...
mysql -u root -p123123 -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo WARNING: MySQL connection failed
    echo Please ensure MySQL is running and credentials are correct
    echo.
)

REM Start the application
echo Starting Spring Boot application...
echo.
gradlew.bat bootRun

echo.
echo Backend server stopped.
pause 