# HƯỚNG DẪN SETUP ĐƠN GIẢN - APARTMENT PORTAL

## Tổng quan dự án

Dự án có **2 frontend riêng biệt**:
- **Admin Portal** (port 3000) - Do người khác phụ trách
- **User Portal** (port 3001) - Do bạn phụ trách

**Backend** (port 8080) - Phục vụ cả 2 frontend

## Cách chạy nhanh

### 1. Chạy Backend
```bash
# Windows
run-app.bat

# Hoặc thủ công
gradlew bootRun
```

### 2. Chạy User Frontend
```bash
cd apartment-user-portal
npm run dev
# Hoặc
yarn dev
```

### 3. Chạy Admin Frontend (nếu cần)
```bash
cd apartment-portal-Fe
npm run dev
# Hoặc
yarn dev
```

## Cấu hình Database

### Auto-Setup (Khuyến nghị)
Backend sẽ **tự động**:
- Tạo database `apartment_portal` nếu chưa có
- Chạy schema từ `complete-schema.sql`
- Import dữ liệu mẫu từ `sample-data.sql`
- Tạo admin user và roles

### Manual Setup (Nếu cần)
```bash
# Windows
setup-database.bat

# Linux/Mac
chmod +x setup-database.sh
./setup-database.sh
```

## Tài khoản test

### Admin Portal
- **Username**: `admin`
- **Password**: `password`
- **Email**: `admin@apartment.com`

### User Portal
- **Username**: `resident1-resident10`
- **Password**: `password`
- **Email**: `resident1@email.com` - `resident10@email.com`

## API Endpoints

### Admin APIs (không chỉnh sửa)
- `/api/admin/*` - Quản lý admin
- `/api/announcements` - Thông báo
- `/api/events` - Sự kiện
- `/api/facilities` - Tiện ích

### User APIs (có thể chỉnh sửa)
- `/api/auth/*` - Xác thực
- `/api/residents/*` - Cư dân
- `/api/apartments/*` - Căn hộ
- `/api/invoices/*` - Hóa đơn
- `/api/service-requests/*` - Yêu cầu dịch vụ

## Lưu ý quan trọng

### ✅ Được phép chỉnh sửa
- User-related APIs
- Authentication logic
- Database schema (cẩn thận)
- User frontend

### ❌ KHÔNG được chỉnh sửa
- Admin APIs
- Admin frontend
- Core business logic
- Database structure của admin tables

### 🔄 Merge Code
Khi merge code:
1. **Backup** database trước
2. **Test** cả admin và user portal
3. **Kiểm tra** API compatibility
4. **Đảm bảo** không break admin functionality

## Troubleshooting

### Lỗi Database
```bash
# Reset database
mysql -u root -p -e "DROP DATABASE IF EXISTS apartment_portal;"
# Chạy lại backend
gradlew bootRun
```

### Lỗi Port
```bash
# Kiểm tra port đang sử dụng
netstat -ano | findstr :8080
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### Lỗi Frontend
```bash
# Clear cache
npm run build
npm run dev
```

## Development Workflow

1. **Chạy backend** → `run-app.bat`
2. **Chạy user frontend** → `npm run dev` (trong user portal)
3. **Test user functionality**
4. **Commit code** (chỉ user-related changes)
5. **Merge carefully** (đảm bảo admin không bị ảnh hưởng)

## Commands nhanh

```bash
# Backend
./run-app.bat

# User Frontend
cd apartment-user-portal && npm run dev

# Admin Frontend (nếu cần)
cd apartment-portal-Fe && npm run dev

# Database reset
./setup-database.bat
``` 