@echo off
echo Testing VNPay Integration...
echo.

echo Compiling VNPayTest.java...
javac -cp ".;lib/*" src/main/java/com/mytech/apartment/portal/services/gateways/VNPayTest.java

if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed!
    pause
    exit /b 1
)

echo.
echo Running VNPayTest...
java -cp ".;src/main/java" com.mytech.apartment.portal.services.gateways.VNPayTest

echo.
echo Test completed.
pause
