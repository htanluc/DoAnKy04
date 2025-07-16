# HƯỚNG DẪN SETUP DATABASE VÀ DỮ LIỆU MẪU

## Tổng quan hệ thống

Hệ thống quản lý chung cư bao gồm các module chính:
- **Quản lý người dùng**: Admin, Staff, Resident
- **Quản lý tòa nhà và căn hộ**: Buildings, Apartments
- **Quản lý cư dân**: Residents, ApartmentResidents
- **Thông báo và sự kiện**: Announcements, Events
- **Tiện ích**: Facilities, FacilityBookings
- **Dịch vụ**: ServiceRequests, ServiceCategories
- **Hóa đơn và thanh toán**: Invoices, Payments
- **Phản hồi**: Feedbacks
- **Báo cáo**: ActivityLogs, AiQaHistory

## Cấu trúc Database

### 1. Bảng chính
- `roles` - Vai trò người dùng (ADMIN, RESIDENT, STAFF)
- `users` - Thông tin người dùng
- `user_roles` - Phân quyền người dùng
- `buildings` - Tòa nhà
- `apartments` - Căn hộ
- `residents` - Thông tin cư dân
- `apartment_residents` - Liên kết căn hộ - cư dân

### 2. Bảng chức năng
- `facilities` - Tiện ích
- `facility_bookings` - Đặt tiện ích
- `announcements` - Thông báo
- `events` - Sự kiện
- `event_registrations` - Đăng ký sự kiện
- `service_categories` - Danh mục dịch vụ
- `service_requests` - Yêu cầu dịch vụ
- `invoices` - Hóa đơn
- `invoice_items` - Chi tiết hóa đơn
- `payments` - Thanh toán
- `feedbacks` - Phản hồi

### 3. Bảng hỗ trợ
- `activity_logs` - Nhật ký hoạt động
- `ai_qa_history` - Lịch sử hỏi đáp AI
- `email_verification_tokens` - Token xác thực email
- `refresh_tokens` - Token làm mới
- `apartment_invitations` - Lời mời căn hộ
- `recurring_bookings` - Đặt tiện ích định kỳ

## Setup Database

### Bước 1: Tạo database
```sql
CREATE DATABASE apartment_portal;
USE apartment_portal;
```

### Bước 2: Chạy schema
```bash
# Chạy file schema hoàn chỉnh
mysql -u username -p apartment_portal < src/main/resources/complete-schema.sql
```

### Bước 3: Import dữ liệu mẫu
```bash
# Chạy file dữ liệu mẫu
mysql -u username -p apartment_portal < src/main/resources/sample-data.sql
```

## Dữ liệu mẫu

### Tài khoản đăng nhập

#### Admin
- **Username**: admin
- **Email**: admin@apartment.com
- **Phone**: 0123456789
- **Password**: password
- **Role**: ADMIN

#### Staff
- **Username**: staff1, staff2
- **Email**: staff1@apartment.com, staff2@apartment.com
- **Phone**: 0123456790, 0123456791
- **Password**: password
- **Role**: STAFF

#### Residents
- **Username**: resident1-resident10
- **Email**: resident1@email.com - resident10@email.com
- **Phone**: 0123456792 - 0123456801
- **Password**: password
- **Role**: RESIDENT

### Dữ liệu tòa nhà và căn hộ

#### Tòa nhà
1. **Tòa A**: 20 tầng, cao cấp
2. **Tòa B**: 15 tầng, trung cấp
3. **Tòa C**: 25 tầng, cao cấp nhất

#### Căn hộ
- **20 căn hộ** với diện tích từ 70-120m²
- **19 căn hộ đã có người ở** (OCCUPIED)
- **1 căn hộ trống** (VACANT)

### Tiện ích
1. **Hồ bơi** - 50 người, 50k/giờ
2. **Phòng gym** - 30 người, 30k/giờ
3. **Sảnh tiệc** - 100 người, 200k/giờ
4. **Vườn BBQ** - 20 người, 100k/giờ
5. **Phòng sinh hoạt chung** - 40 người, 50k/giờ
6. **Bãi đỗ xe** - 200 chỗ, miễn phí
7. **Khu vui chơi trẻ em** - 25 người, miễn phí

### Dữ liệu chức năng

#### Thông báo (8 thông báo)
- Thông báo bảo trì
- Lịch thu phí
- Sự kiện Giáng sinh
- Cảnh báo mất điện
- Thông báo an ninh
- Lịch phun thuốc
- Thông báo hồ bơi
- Chương trình khuyến mãi

#### Sự kiện (5 sự kiện)
- Tiệc Giáng sinh 2024
- Họp cư dân thường niên
- Lớp yoga miễn phí
- Workshop nấu ăn
- Tiệc Tất niên

#### Yêu cầu dịch vụ (10 yêu cầu)
- Điện nước, vệ sinh, bảo trì
- An ninh, internet, thang máy
- Các vấn đề khác

#### Hóa đơn (19 hóa đơn)
- Tất cả đã thanh toán
- Số tiền từ 2-3.5 triệu VND

## Testing

### Test đăng nhập
```bash
# Test API đăng nhập
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

### Test các API chính
```bash
# Lấy danh sách thông báo
curl -X GET http://localhost:8080/api/announcements \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lấy danh sách sự kiện
curl -X GET http://localhost:8080/api/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lấy danh sách tiện ích
curl -X GET http://localhost:8080/api/facilities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Lưu ý quan trọng

1. **Mật khẩu**: Tất cả tài khoản có mật khẩu là "password" (đã được hash)
2. **JWT Token**: Sau khi đăng nhập thành công, sử dụng JWT token trong header Authorization
3. **Phân quyền**: Mỗi role có quyền truy cập khác nhau vào các API
4. **Dữ liệu thời gian**: Các sự kiện và thông báo có thời gian trong tháng 12/2024
5. **Trạng thái**: Các yêu cầu dịch vụ có trạng thái khác nhau (OPEN, IN_PROGRESS, COMPLETED)

## Troubleshooting

### Lỗi thường gặp
1. **Foreign key constraint**: Đảm bảo chạy schema trước khi import data
2. **Duplicate key**: Sử dụng ON DUPLICATE KEY UPDATE trong MySQL
3. **Connection refused**: Kiểm tra cấu hình database trong application.properties

### Reset database
```sql
-- Xóa và tạo lại database
DROP DATABASE IF EXISTS apartment_portal;
CREATE DATABASE apartment_portal;
USE apartment_portal;
```

## Cấu hình ứng dụng

Đảm bảo file `application.properties` có cấu hình database đúng:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/apartment_portal
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=none
spring.sql.init.mode=always
spring.sql.init.schema-locations=classpath:complete-schema.sql
spring.sql.init.data-locations=classpath:sample-data.sql
``` 