@echo off
echo ========================================
echo    SETUP GIT REPOSITORY
echo ========================================

echo.
echo 1. Initializing Git repository...
git init

echo.
echo 2. Adding all files...
git add .

echo.
echo 3. Creating initial commit...
git commit -m "Initial commit: Apartment Management Portal

- Backend: Spring Boot API with JWT authentication
- Frontend: Next.js user and admin portals  
- Features: Vehicle registration with multiple image upload
- Database: MySQL with complete schema
- Security: Role-based access control"

echo.
echo 4. Git repository setup complete!
echo.
echo Next steps:
echo 1. Create repository on GitHub
echo 2. Add remote: git remote add origin YOUR_GITHUB_URL
echo 3. Push: git push -u origin main
echo.
pause 