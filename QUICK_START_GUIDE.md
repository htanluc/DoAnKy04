# 🚀 HƯỚNG DẪN KHỞI ĐỘNG NHANH
## Smart Building Management System

---

## ⚡ KHỞI ĐỘNG NHANH (5 PHÚT)

### Bước 1: Cài đặt yêu cầu cơ bản
```bash
# Kiểm tra Java 20
java -version

# Kiểm tra Node.js 18+
node --version

# Kiểm tra MySQL 8.0+
mysql --version
```

### Bước 2: Clone và cài đặt
```bash
# Clone repository
git clone <repository-url>
cd Luc_Admin_HoaDon

# Cài đặt Backend dependencies
cd apartment-portal-BE
./gradlew build

# Cài đặt Admin Portal dependencies
cd ../apartment-portal-Fe
npm install

# Cài đặt User Portal dependencies
cd ../apartment-user-portal
npm install
```

### Bước 3: Cấu hình Database
```sql
-- Tạo database
mysql -u root -p
CREATE DATABASE apartment_portal;
CREATE USER 'apartment_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON apartment_portal.* TO 'apartment_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

-- Chạy migration
mysql -u apartment_user -p apartment_portal < apartment-portal-BE/run-migration.sql
```

### Bước 4: Cấu hình môi trường
Tạo file `.env` trong `apartment-portal-BE`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apartment_portal
DB_USERNAME=apartment_user
DB_PASSWORD=password123
JWT_SECRET=your-super-secret-jwt-key-here
```

### Bước 5: Khởi động tất cả services
**Windows:**
```powershell
./start-all-services.ps1
```

**Linux/macOS:**
```bash
./start-all-services.sh
```

---

## 🌐 TRUY CẬP ỨNG DỤNG

Sau khi khởi động thành công:

- **Admin Portal**: http://localhost:3000
- **User Portal**: http://localhost:3001  
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html

---

## 🔑 TÀI KHOẢN MẶC ĐỊNH

### Admin Account:
- **Email**: admin@building.com
- **Password**: admin123

### Resident Account:
- **Email**: resident@building.com
- **Password**: resident123

---

## 🆘 XỬ LÝ LỖI NHANH

### Lỗi Port đã được sử dụng:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8080 | xargs kill -9
```

### Lỗi Database connection:
```bash
# Kiểm tra MySQL service
# Windows
net start mysql

# Linux
sudo systemctl start mysql

# macOS
brew services start mysql
```

### Reset toàn bộ:
```bash
# Xóa node_modules và cài lại
rm -rf apartment-portal-Fe/node_modules
rm -rf apartment-user-portal/node_modules
npm install
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Xem file `INSTALLATION_GUIDE_WEB.md` để biết chi tiết
3. Tạo issue trên repository

---

**Thời gian cài đặt ước tính: 5-10 phút**  
**Phiên bản: 1.0.0**
