# Hướng dẫn Setup và Chạy Ứng dụng Apartment Portal

## 1. Yêu cầu hệ thống
- Java 17 hoặc cao hơn
- MySQL 8.0 hoặc cao hơn
- IDE (IntelliJ IDEA, Eclipse, hoặc VS Code)

## 2. Cài đặt Database

### 2.1. Tạo database MySQL
```sql
CREATE DATABASE IF NOT EXISTS ApartmentDB;
USE ApartmentDB;
```

### 2.2. Cấu hình MySQL
- Username: `root`
- Password: `123456`
- Port: `3306`

## 3. Chạy ứng dụng

### Cách 1: Sử dụng IDE (Khuyến nghị)
1. Mở project trong IntelliJ IDEA hoặc Eclipse
2. Chạy file `PortalApplication.java`
3. Ứng dụng sẽ tự động tạo database và dữ liệu

### Cách 2: Sử dụng Gradle
```bash
# Windows
gradlew.bat bootRun

# Linux/Mac
./gradlew bootRun
```

### Cách 3: Build và chạy JAR
```bash
# Build
gradlew.bat build

# Chạy JAR
java -jar build/libs/apartment-portal-BE-0.0.1-SNAPSHOT.jar
```

## 4. Kiểm tra ứng dụng

### 4.1. Kiểm tra ứng dụng đã chạy
- URL: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 4.2. Kiểm tra dữ liệu đã được tạo
- API: `GET http://localhost:8080/api/test/check-data`
- Hoặc kiểm tra trực tiếp trong MySQL

### 4.3. Tạo dữ liệu thủ công (nếu cần)
- API: `POST http://localhost:8080/api/test/init-data`

## 5. Thông tin đăng nhập Admin

Sau khi ứng dụng chạy thành công, bạn có thể đăng nhập với:

- **Username:** `admin`
- **Password:** `admin123`
- **Số điện thoại:** `admin`

## 6. Troubleshooting

### 6.1. Lỗi kết nối database
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra username/password trong `application.properties`
- Đảm bảo database `ApartmentDB` đã được tạo

### 6.2. Lỗi port 8080 đã được sử dụng
- Thay đổi port trong `application.properties`: `server.port=8081`

### 6.3. Lỗi Java version
- Cài đặt Java 17 hoặc cao hơn
- Kiểm tra JAVA_HOME environment variable

## 7. Cấu trúc dữ liệu

### 7.1. Bảng Roles
- `ADMIN`: Quản trị viên
- `RESIDENT`: Cư dân
- `STAFF`: Nhân viên

### 7.2. Bảng Users
- User admin mặc định với role ADMIN

## 8. API Endpoints

### 8.1. Test endpoints
- `GET /api/test/public`: Kiểm tra truy cập công khai
- `GET /api/test/auth`: Kiểm tra xác thực
- `POST /api/test/init-data`: Tạo dữ liệu ban đầu
- `GET /api/test/check-data`: Kiểm tra dữ liệu

### 8.2. Auth endpoints
- `POST /api/auth/login`: Đăng nhập
- `POST /api/auth/register`: Đăng ký

## 9. Logs

Khi ứng dụng chạy, bạn sẽ thấy logs như:
```
🚀 Starting DataInitializer...
📝 Creating roles...
✅ Created ADMIN role with ID: 1
✅ Created RESIDENT role with ID: 2
✅ Created STAFF role with ID: 3
👤 Creating admin user...
✅ Admin user created successfully!
📱 Username: admin
🔑 Password: admin123
📞 Phone: admin
🆔 User ID: 1
✅ DataInitializer completed successfully!
```

## 10. Liên hệ hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs trong console
2. Database connection
3. Java version
4. Port availability 