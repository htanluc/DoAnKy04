# WEB INSTALLATION GUIDE
## Smart Building Management System

---

## 📋 TABLE OF CONTENTS

1. [System Requirements](#system-requirements)
2. [Backend API Installation](#backend-api-installation)
3. [Admin Portal Installation](#admin-portal-installation)
4. [User Portal Installation](#user-portal-installation)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ SYSTEM REQUIREMENTS

### Required Software:
- **Java**: 20 or higher
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm)
- **MySQL**: 8.0 or higher
- **Git**: For cloning repository

### Development Tools (Recommended):
- **IDE**: IntelliJ IDEA, Visual Studio Code, or Eclipse
- **Database Client**: MySQL Workbench, DBeaver, or phpMyAdmin
- **API Testing**: Postman or Insomnia

---

## 🔧 BACKEND API INSTALLATION

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd Luc_Admin_HoaDon/apartment-portal-BE
```

### Step 2: Install Java 20
**Windows:**
1. Download Java 20 from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
2. Install and configure JAVA_HOME
3. Add Java to PATH

**macOS:**
```bash
# Using Homebrew
brew install openjdk@20
export JAVA_HOME=/opt/homebrew/opt/openjdk@20/libexec/openjdk.jdk/Contents/Home
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install openjdk-20-jdk
export JAVA_HOME=/usr/lib/jvm/java-20-openjdk-amd64
```

### Step 3: Install MySQL
**Windows:**
1. Download MySQL Community Server from [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Install and configure root password

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Step 4: Create Database
```sql
-- Connect to MySQL with root user
mysql -u root -p

-- Create database
CREATE DATABASE apartment_portal;
CREATE USER 'apartment_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON apartment_portal.* TO 'apartment_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Environment Configuration
Create `.env` file in `apartment-portal-BE` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apartment_portal
DB_USERNAME=apartment_user
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=86400000

# Email Configuration (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Step 6: Run Database Migration
```bash
# Run SQL migration file
mysql -u apartment_user -p apartment_portal < run-migration.sql
```

### Step 7: Build and Run Backend
```bash
# Using Gradle Wrapper
./gradlew clean build
./gradlew bootRun

# Or using Gradle directly
gradle clean build
gradle bootRun
```

**Backend will run at:** `http://localhost:8080`

---

## 🎨 ADMIN PORTAL INSTALLATION

### Step 1: Navigate to Admin Portal Directory
```bash
cd ../apartment-portal-Fe
```

### Step 2: Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

### Step 3: Environment Configuration
Create `.env.local` file in `apartment-portal-Fe` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

# App Configuration
NEXT_PUBLIC_APP_NAME=Smart Building Admin
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_PAYMENT=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true
```

### Step 4: Run Development Server
```bash
# Development mode
npm run dev

# Or
yarn dev
```

**Admin Portal will run at:** `http://localhost:3000`

### Step 5: Build for Production
```bash
# Build production
npm run build
npm run start

# Or
yarn build
yarn start
```

---

## 👥 USER PORTAL INSTALLATION

### Step 1: Navigate to User Portal Directory
```bash
cd ../apartment-user-portal
```

### Step 2: Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Environment Configuration
Create `.env.local` file in `apartment-user-portal` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

# App Configuration
NEXT_PUBLIC_APP_NAME=Smart Building Resident Portal
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_PAYMENT=true
NEXT_PUBLIC_ENABLE_EVENTS=true
```

### Step 4: Run Development Server
```bash
# Development mode (runs on port 3001)
npm run dev

# Or
yarn dev
```

**User Portal will run at:** `http://localhost:3001`

### Step 5: Build for Production
```bash
# Build production
npm run build
npm run start

# Or
yarn build
yarn start
```

---

## ⚙️ ENVIRONMENT CONFIGURATION

### Database Configuration
1. **Create database schema:**
```sql
-- Run migration file
mysql -u apartment_user -p apartment_portal < apartment-portal-BE/run-migration.sql
```

2. **Configure connection pool in application.properties:**
```properties
# Database connection
spring.datasource.url=jdbc:mysql://localhost:3306/apartment_portal
spring.datasource.username=apartment_user
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

### CORS Configuration
Backend is configured with CORS to allow:
- Admin Portal: `http://localhost:3000`
- User Portal: `http://localhost:3001`

### Security Configuration
- JWT tokens with 24-hour expiration
- Password encoding with BCrypt
- Role-based access control (RBAC)

---

## 🚀 RUNNING THE APPLICATION

### Startup Order:
1. **MySQL Database** (Port 3306)
2. **Backend API** (Port 8080)
3. **Admin Portal** (Port 3000)
4. **User Portal** (Port 3001)

### Automated Scripts (Windows):
```powershell
# Run all services
./start-all-services.ps1

# Or run individual services
./start-backend.ps1
./start-admin-portal.ps1
./start-user-portal.ps1
```

### Automated Scripts (Linux/macOS):
```bash
# Run all services
./start-all-services.sh

# Or run individual services
./start-backend.sh
./start-admin-portal.sh
./start-user-portal.sh
```

---

## 🔍 TROUBLESHOOTING

### Common Issues:

#### 1. Database Connection Error
```
Error: Could not create connection to database server
```
**Solution:**
- Check if MySQL is running
- Verify connection details in `.env`
- Check firewall and port 3306

#### 2. JWT Secret Error
```
Error: JWT secret is not configured
```
**Solution:**
- Add `JWT_SECRET` to `.env` file
- Use a strong key (at least 256 bits)

#### 3. CORS Error
```
Access to fetch at 'http://localhost:8080/api' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution:**
- Check CORS configuration in Backend
- Ensure frontend runs on correct port

#### 4. Node.js Version Error
```
Error: The engine "node" is incompatible with this module
```
**Solution:**
- Update Node.js to version 18+
- Use nvm to manage Node.js versions

#### 5. Port Already in Use Error
```
Error: listen EADDRINUSE: address already in use :::8080
```
**Solution:**
- Find and kill process using the port
- Or change port in configuration

### Check Logs:
```bash
# Backend logs
tail -f apartment-portal-BE/logs/application.log

# Frontend logs (in dev server terminal)
# Logs will display directly in console
```

---

## 📞 SUPPORT

If you encounter issues during installation, please:

1. Check the Troubleshooting section above
2. View logs to find specific errors
3. Create an issue on the repository with detailed information
4. Contact the development team

---

## 📝 NOTES

- Ensure all services are started before accessing
- Use HTTPS in production environment
- Configure regular database backups
- Monitor logs and performance metrics

---

**Document Version:** 1.0.0  
**Last Updated:** September 18, 2025  
**Author:** AI Assistant
