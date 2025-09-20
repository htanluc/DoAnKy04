# 🚀 QUICK START GUIDE
## Smart Building Management System

---

## ⚡ QUICK SETUP (5 MINUTES)

### Step 1: Install Basic Requirements
```bash
# Check Java 20
java -version

# Check Node.js 18+
node --version

# Check MySQL 8.0+
mysql --version
```

### Step 2: Clone and Install
```bash
# Clone repository
git clone <repository-url>
cd Luc_Admin_HoaDon

# Install Backend dependencies
cd apartment-portal-BE
./gradlew build

# Install Admin Portal dependencies
cd ../apartment-portal-Fe
npm install

# Install User Portal dependencies
cd ../apartment-user-portal
npm install
```

### Step 3: Configure Database
```sql
-- Create database
mysql -u root -p
CREATE DATABASE apartment_portal;
CREATE USER 'apartment_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON apartment_portal.* TO 'apartment_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

-- Run migration
mysql -u apartment_user -p apartment_portal < apartment-portal-BE/run-migration.sql
```

### Step 4: Configure Environment
Create `.env` file in `apartment-portal-BE`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apartment_portal
DB_USERNAME=apartment_user
DB_PASSWORD=password123
JWT_SECRET=your-super-secret-jwt-key-here
```

### Step 5: Start All Services
**Windows:**
```powershell
./start-all-services.ps1
```

**Linux/macOS:**
```bash
./start-all-services.sh
```

---

## 🌐 ACCESS APPLICATIONS

After successful startup:

- **Admin Portal**: http://localhost:3000
- **User Portal**: http://localhost:3001  
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html

---

## 🔑 DEFAULT ACCOUNTS

### Admin Account:
- **Email**: admin@building.com
- **Password**: admin123

### Resident Account:
- **Email**: resident@building.com
- **Password**: resident123

---

## 🆘 QUICK ERROR FIXES

### Port Already in Use Error:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8080 | xargs kill -9
```

### Database Connection Error:
```bash
# Check MySQL service
# Windows
net start mysql

# Linux
sudo systemctl start mysql

# macOS
brew services start mysql
```

### Complete Reset:
```bash
# Remove node_modules and reinstall
rm -rf apartment-portal-Fe/node_modules
rm -rf apartment-user-portal/node_modules
npm install
```

---

## 📞 SUPPORT

If you encounter issues:
1. Check logs in terminal
2. See `INSTALLATION_GUIDE_WEB_EN.md` for details
3. Create issue on repository

---

**Estimated Setup Time: 5-10 minutes**  
**Version: 1.0.0**
