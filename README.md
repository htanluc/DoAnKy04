# Apartment Management Portal

Hệ thống quản lý chung cư với đầy đủ tính năng cho cư dân, nhân viên và quản trị viên.

## 🏗️ Kiến Trúc Hệ Thống

```
DoAnKy04/
├── apartment-portal-BE/          # Backend API (Spring Boot)
├── apartment-user-portal/        # Frontend User Portal (Next.js)
├── apartment-portal-Fe/          # Frontend Admin Portal (Next.js)
└── app-mobile-user/              # Mobile App (React Native)
```

## 🚀 Tính Năng Chính

### 👥 Cư Dân (User Portal)
- ✅ Đăng ký/Đăng nhập với xác thực email
- ✅ Quản lý thông tin cá nhân
- ✅ Đăng ký phương tiện với upload nhiều ảnh
- ✅ Xem thông báo và sự kiện
- ✅ Đặt chỗ tiện ích
- ✅ Gửi phản hồi và yêu cầu hỗ trợ
- ✅ Xem hóa đơn và thanh toán

### 👨‍💼 Nhân Viên (Staff Portal)
- ✅ Quản lý cư dân và căn hộ
- ✅ Xử lý yêu cầu hỗ trợ
- ✅ Quản lý đặt chỗ tiện ích
- ✅ Theo dõi hóa đơn

### 👨‍💻 Quản Trị Viên (Admin Portal)
- ✅ Quản lý toàn bộ hệ thống
- ✅ Quản lý người dùng và phân quyền
- ✅ Quản lý thông báo, sự kiện, tiện ích
- ✅ Báo cáo và thống kê
- ✅ Quản lý đồng hồ nước

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Spring Boot 3.x** - Framework chính
- **Spring Security** - Bảo mật và xác thực
- **Spring Data JPA** - ORM và database
- **MySQL** - Database chính
- **JWT** - Token authentication
- **MapStruct** - Object mapping
- **Gradle** - Build tool

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **React Hook Form** - Form handling

### Mobile
- **React Native** - Cross-platform mobile app

## 📦 Cài Đặt và Chạy

### 1. Backend (Spring Boot)

```bash
cd apartment-portal-BE

# Cài đặt dependencies
./gradlew build

# Chạy ứng dụng
./gradlew bootRun
```

**Backend sẽ chạy tại:** `http://localhost:8080`

### 2. Frontend User Portal

```bash
cd apartment-user-portal

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

**User Portal sẽ chạy tại:** `http://localhost:3000`

### 3. Frontend Admin Portal

```bash
cd apartment-portal-Fe

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

**Admin Portal sẽ chạy tại:** `http://localhost:3001`

## 🗄️ Database

### Cài đặt MySQL
1. Cài đặt MySQL Server
2. Tạo database: `apartment_portal`
3. Import file `complete-schema.sql`

### Cấu hình Database
Chỉnh sửa `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/apartment_portal
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## 🔐 Authentication

Hệ thống sử dụng JWT token với các role:
- **ROLE_USER** - Cư dân
- **ROLE_STAFF** - Nhân viên  
- **ROLE_ADMIN** - Quản trị viên

## 📁 Cấu Trúc API

### Auth APIs
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/verify-email` - Xác thực email
- `POST /api/auth/forgot-password` - Quên mật khẩu

### Vehicle APIs
- `GET /api/vehicles/my` - Lấy xe của user
- `POST /api/vehicles` - Đăng ký xe mới
- `POST /api/vehicles/upload-images` - Upload ảnh xe

### Admin APIs
- `GET /api/admin/users` - Quản lý người dùng
- `GET /api/admin/vehicles` - Quản lý xe
- `POST /api/admin/announcements` - Quản lý thông báo

## 🚀 Deployment

### Backend
```bash
./gradlew build
java -jar build/libs/apartment-portal-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
npm run build
npm start
```

## 📝 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Contributors

- **Developer** - [Your Name]
- **Mentor** - [Mentor Name]

## 📞 Support

Nếu có vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ:
- Email: your.email@example.com
- Phone: +84 xxx xxx xxx 