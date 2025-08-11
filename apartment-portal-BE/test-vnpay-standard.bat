@echo off
echo === TEST VNPAY PAYLOAD THEO CHUẨN ===
echo.

echo 1. Compiling VNPayStandardTest.java...
javac VNPayStandardTest.java

if %ERRORLEVEL% EQU 0 (
    echo    ✅ Compile thành công
    echo.
    echo 2. Running test...
    java VNPayStandardTest
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Test hoàn thành thành công!
    ) else (
        echo.
        echo ❌ Test chạy thất bại
    )
) else (
    echo    ❌ Compile thất bại
)

echo.
echo === HOÀN THÀNH TEST ===
pause

