@echo off
REM Clean, build và chạy Backend
start "BACKEND" cmd /k "cd apartment-portal-BE && call gradlew.bat clean build && call gradlew.bat bootRun"

REM Clean, build và chạy Frontend Admin
start "FE-ADMIN" cmd /k "cd apartment-portal-Fe && call yarn install && call yarn build && call yarn dev"

REM Clean, build và chạy Frontend User
start "FE-USER" cmd /k "cd apartment-user-portal && call yarn install && call yarn build && call yarn dev"

echo Đã mở 3 cửa sổ để chạy BE, FE-ADMIN, FE-USER. Đóng cửa sổ này nếu muốn!
pause 