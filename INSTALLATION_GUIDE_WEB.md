# HƯỚNG DẪN CÀI ĐẶT - PHẦN WEB
## Smart Building Management System

---

## 📋 MỤC LỤC

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt Backend API](#cài-đặt-backend-api)
3. [Cài đặt Admin Portal](#cài-đặt-admin-portal)
4. [Cài đặt User Portal](#cài-đặt-user-portal)
5. [Cấu hình môi trường](#cấu-hình-môi-trường)
6. [Chạy ứng dụng](#chạy-ứng-dụng)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ YÊU CẦU HỆ THỐNG

### Phần mềm cần thiết:
- **Java**: 20 hoặc cao hơn
- **Node.js**: 18.0.0 hoặc cao hơn
- **npm**: 9.0.0 hoặc cao hơn (hoặc yarn/pnpm)
- **MySQL**: 8.0 hoặc cao hơn
- **Git**: Để clone repository

### Công cụ phát triển (khuyến nghị):
- **IDE**: IntelliJ IDEA, Visual Studio Code, hoặc Eclipse
- **Database Client**: MySQL Workbench, DBeaver, hoặc phpMyAdmin
- **API Testing**: Postman hoặc Insomnia

---

## 🔧 CÀI ĐẶT BACKEND API

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd Luc_Admin_HoaDon/apartment-portal-BE
```

### Bước 2: Cài đặt Java 20
**Windows:**
1. Tải Java 20 từ [Oracle](https://www.oracle.com/java/technologies/downloads/) hoặc [OpenJDK](https://adoptium.net/)
2. Cài đặt và cấu hình JAVA_HOME
3. Thêm Java vào PATH

**macOS:**
```bash
# Sử dụng Homebrew
brew install openjdk@20
export JAVA_HOME=/opt/homebrew/opt/openjdk@20/libexec/openjdk.jdk/Contents/Home
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install openjdk-20-jdk
export JAVA_HOME=/usr/lib/jvm/java-20-openjdk-amd64
```

### Bước 3: Cài đặt MySQL
**Windows:**
1. Tải MySQL Community Server từ [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Cài đặt và cấu hình root password

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

### Bước 4: Tạo database
```sql
-- Kết nối MySQL với root user
mysql -u root -p

-- Tạo database
CREATE DATABASE apartment_portal;
CREATE USER 'apartment_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON apartment_portal.* TO 'apartment_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Bước 5: Cấu hình môi trường
Tạo file `.env` trong thư mục `apartment-portal-BE`:

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

### Bước 6: Chạy migration database
```bash
# Chạy file SQL migration
mysql -u apartment_user -p apartment_portal < run-migration.sql
```

### Bước 7: Build và chạy Backend
```bash
# Sử dụng Gradle Wrapper
./gradlew clean build
./gradlew bootRun

# Hoặc sử dụng Gradle trực tiếp
gradle clean build
gradle bootRun
```

**Backend sẽ chạy tại:** `http://localhost:8080`

---

## 🎨 CÀI ĐẶT ADMIN PORTAL

### Bước 1: Di chuyển đến thư mục Admin Portal
```bash
cd ../apartment-portal-Fe
```

### Bước 2: Cài đặt dependencies
```bash
# Sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install

# Hoặc sử dụng pnpm
pnpm install
```

### Bước 3: Cấu hình môi trường
Tạo file `.env.local` trong thư mục `apartment-portal-Fe`:

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

### Bước 4: Chạy development server
```bash
# Development mode
npm run dev

# Hoặc
yarn dev
```

**Admin Portal sẽ chạy tại:** `http://localhost:3000`

### Bước 5: Build cho production
```bash
# Build production
npm run build
npm run start

# Hoặc
yarn build
yarn start
```

---

## 👥 CÀI ĐẶT USER PORTAL

### Bước 1: Di chuyển đến thư mục User Portal
```bash
cd ../apartment-user-portal
```

### Bước 2: Cài đặt dependencies
```bash
# Sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install
```

### Bước 3: Cấu hình môi trường
Tạo file `.env.local` trong thư mục `apartment-user-portal`:

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

### Bước 4: Chạy development server
```bash
# Development mode (chạy trên port 3001)
npm run dev

# Hoặc
yarn dev
```

**User Portal sẽ chạy tại:** `http://localhost:3001`

### Bước 5: Build cho production
```bash
# Build production
npm run build
npm run start

# Hoặc
yarn build
yarn start
```

---

## ⚙️ CẤU HÌNH MÔI TRƯỜNG

### Cấu hình Database
1. **Tạo database schema:**
```sql
-- Chạy file migration
mysql -u apartment_user -p apartment_portal < apartment-portal-BE/run-migration.sql
```

2. **Cấu hình connection pool trong application.properties:**
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

### Cấu hình CORS
Backend đã được cấu hình CORS để cho phép:
- Admin Portal: `http://localhost:3000`
- User Portal: `http://localhost:3001`

### Cấu hình Security
- JWT tokens với expiration 24 giờ
- Password encoding với BCrypt
- Role-based access control (RBAC)

---

## 🚀 CHẠY ỨNG DỤNG

### Thứ tự khởi động:
1. **MySQL Database** (Port 3306)
2. **Backend API** (Port 8080)
3. **Admin Portal** (Port 3000)
4. **User Portal** (Port 3001)

### Scripts tự động (Windows):
```powershell
# Chạy tất cả services
./start-all-services.ps1

# Hoặc chạy từng service riêng biệt
./start-backend.ps1
./start-admin-portal.ps1
./start-user-portal.ps1
```

### Scripts tự động (Linux/macOS):
```bash
# Chạy tất cả services
./start-all-services.sh

# Hoặc chạy từng service riêng biệt
./start-backend.sh
./start-admin-portal.sh
./start-user-portal.sh
```

---

## 🔍 TROUBLESHOOTING

### Lỗi thường gặp:

#### 1. Lỗi kết nối Database
```
Error: Could not create connection to database server
```
**Giải pháp:**
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra thông tin kết nối trong `.env`
- Kiểm tra firewall và port 3306

#### 2. Lỗi JWT Secret
```
Error: JWT secret is not configured
```
**Giải pháp:**
- Thêm `JWT_SECRET` vào file `.env`
- Sử dụng key mạnh (ít nhất 256 bit)

#### 3. Lỗi CORS
```
Access to fetch at 'http://localhost:8080/api' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Giải pháp:**
- Kiểm tra cấu hình CORS trong Backend
- Đảm bảo frontend chạy đúng port

#### 4. Lỗi Node.js version
```
Error: The engine "node" is incompatible with this module
```
**Giải pháp:**
- Cập nhật Node.js lên version 18+
- Sử dụng nvm để quản lý Node.js versions

#### 5. Lỗi Port đã được sử dụng
```
Error: listen EADDRINUSE: address already in use :::8080
```
**Giải pháp:**
- Tìm và kill process đang sử dụng port
- Hoặc thay đổi port trong cấu hình

### Kiểm tra logs:
```bash
# Backend logs
tail -f apartment-portal-BE/logs/application.log

# Frontend logs (trong terminal chạy dev server)
# Logs sẽ hiển thị trực tiếp trong console
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề trong quá trình cài đặt, vui lòng:

1. Kiểm tra phần Troubleshooting ở trên
2. Xem logs để tìm lỗi cụ thể
3. Tạo issue trên repository với thông tin chi tiết
4. Liên hệ team phát triển

---

## 📝 GHI CHÚ

- Đảm bảo tất cả services đã được khởi động trước khi truy cập
- Sử dụng HTTPS trong môi trường production
- Cấu hình backup database định kỳ
- Monitor logs và performance metrics

---

**Phiên bản tài liệu:** 1.0.0  
**Ngày cập nhật:** 18/09/2025  
**Tác giả:** AI Assistant
