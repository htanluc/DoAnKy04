# HƯỚNG DẪN SETUP DATABASE TỰ ĐỘNG

## Tổng quan

Hệ thống đã được cấu hình để tự động khởi tạo database và dữ liệu mẫu khi chạy backend. Có 2 cách chính:

## Cách 1: Auto-Initialization (Khuyến nghị cho Development)

### Bước 1: Đảm bảo MySQL đang chạy
```bash
# Kiểm tra MySQL service
mysql -u root -p -e "SELECT VERSION();"
```

### Bước 2: Chạy ứng dụng với profile dev
```bash
# Windows
run-dev.bat

# Hoặc thủ công
gradlew bootRun --args='--spring.profiles.active=dev'
```

### Bước 3: Kiểm tra kết quả
Khi ứng dụng khởi động, bạn sẽ thấy log như sau:
```
🚀 Starting DataInitializer...
👥 Creating roles...
✅ ADMIN role created
✅ RESIDENT role created
✅ STAFF role created
👤 Creating admin user...
✅ Admin user created successfully!
📱 Username: admin
🔑 Password: password
📧 Email: admin@apartment.com
📞 Phone: 0123456789
✅ DataInitializer completed successfully!
```

## Cách 2: Manual Setup (Cho Production)

### Bước 1: Setup database thủ công
```bash
# Windows
setup-database.bat

# Linux/Mac
chmod +x setup-database.sh
./setup-database.sh
```

### Bước 2: Chạy ứng dụng với profile prod
```bash
# Windows
run-prod.bat

# Hoặc thủ công
gradlew bootRun --args='--spring.profiles.active=prod'
```

## Cấu hình chi tiết

### Development Profile (application-dev.properties)
```properties
# Auto-initialization ENABLED
spring.sql.init.mode=always
spring.sql.init.schema-locations=classpath:complete-schema.sql
spring.sql.init.data-locations=classpath:sample-data.sql
spring.jpa.defer-datasource-initialization=true
spring.jpa.hibernate.ddl-auto=none
```

### Production Profile (application-prod.properties)
```properties
# Auto-initialization DISABLED
spring.sql.init.mode=never
spring.jpa.hibernate.ddl-auto=none
```

## Các Profile có sẵn

| Profile | Mô tả | Auto-Init | Sử dụng cho |
|---------|-------|-----------|-------------|
| `dev` | Development | ✅ Enabled | Phát triển, testing |
| `prod` | Production | ❌ Disabled | Production, staging |
| `default` | Default | ✅ Enabled | Fallback |

## Troubleshooting

### Lỗi 1: Database connection failed
```
Error: Could not create connection to database server
```
**Giải pháp:**
1. Kiểm tra MySQL đang chạy
2. Kiểm tra thông tin đăng nhập trong application.properties
3. Đảm bảo database `apartment_portal` tồn tại

### Lỗi 2: Duplicate key error
```
Error: Duplicate entry '1' for key 'PRIMARY'
```
**Giải pháp:**
- Dữ liệu đã tồn tại, đây là bình thường
- Ứng dụng sẽ skip việc tạo dữ liệu trùng lặp

### Lỗi 3: Permission denied
```
Error: Access denied for user 'root'@'localhost'
```
**Giải pháp:**
1. Kiểm tra password MySQL
2. Cập nhật password trong application.properties
3. Đảm bảo user có quyền tạo database

### Lỗi 4: Schema file not found
```
Error: Could not find schema file
```
**Giải pháp:**
1. Đảm bảo file `complete-schema.sql` và `sample-data.sql` tồn tại trong `src/main/resources/`
2. Kiểm tra đường dẫn trong application.properties

## Kiểm tra kết quả

### 1. Kiểm tra database
```sql
USE apartment_portal;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM apartments;
SELECT COUNT(*) FROM announcements;
```

### 2. Test API đăng nhập
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

### 3. Kiểm tra log ứng dụng
Tìm các log sau trong console:
- `🚀 Starting DataInitializer...`
- `✅ DataInitializer completed successfully!`
- `✅ Admin user created successfully!`

## Dữ liệu mẫu được tạo

### Tài khoản
- **Admin**: `admin` / `password`
- **Staff**: `staff1`, `staff2` / `password`
- **Residents**: `resident1-resident10` / `password`

### Dữ liệu
- **3 tòa nhà** với 20 căn hộ
- **7 tiện ích** (hồ bơi, gym, sảnh tiệc, v.v.)
- **8 thông báo** (bảo trì, sự kiện, cảnh báo)
- **5 sự kiện** (Giáng sinh, họp cư dân, yoga, v.v.)
- **10 yêu cầu dịch vụ** (điện nước, vệ sinh, bảo trì)
- **19 hóa đơn** đã thanh toán
- **10 phản hồi** từ cư dân

## Lưu ý quan trọng

1. **Development**: Sử dụng profile `dev` để tự động khởi tạo dữ liệu
2. **Production**: Sử dụng profile `prod` và setup database thủ công
3. **Reset Database**: Xóa database và chạy lại để reset dữ liệu
4. **Backup**: Backup database trước khi reset
5. **Security**: Thay đổi password mặc định trong production

## Commands nhanh

```bash
# Chạy development với auto-init
./run-dev.bat

# Chạy production (không auto-init)
./run-prod.bat

# Setup database thủ công
./setup-database.bat

# Build và chạy
./gradlew build
./gradlew bootRun --args='--spring.profiles.active=dev'
``` 