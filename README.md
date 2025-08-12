## Apartment Management Portal (Monorepo)

Hệ thống quản lý chung cư cho cư dân, nhân viên và quản trị viên, gồm Backend (Spring Boot) và hai Frontend (Admin Portal, User Portal) xây dựng bằng Next.js.

### 🏗️ Kiến trúc thư mục
```
DoAnKy04/
├── apartment-portal-BE/       # Backend API (Spring Boot 3)
├── apartment-portal-Fe/       # Frontend Admin Portal (Next.js)
└── apartment-user-portal/     # Frontend User Portal (Next.js)
```

Lưu ý: Hiện không có module mobile trong repo này; mobile có thể được cân nhắc trong tương lai.

## 🚀 Tính năng hiện tại

### 👥 Cư dân (User Portal)
- Đăng ký/đăng nhập, xác thực email/OTP
- Quản lý thông tin cá nhân, ảnh đại diện
- Đăng ký phương tiện (nhiều loại xe), upload ảnh
- Xem thông báo, sự kiện; đăng ký tham gia sự kiện
- Đặt chỗ tiện ích (bể bơi, sân chơi, phòng họp, ...)
- Gửi phản hồi/yêu cầu hỗ trợ, theo dõi trạng thái
- Xem hóa đơn, lịch sử thanh toán, VNPay result page

### 👨‍💼 Nhân viên (Staff)
- Quản lý cư dân và căn hộ, liên kết cư dân-căn hộ
- Quản lý đặt chỗ tiện ích, xử lý yêu cầu hỗ trợ
- Theo dõi hóa đơn, xác nhận thanh toán

### 👨‍💻 Quản trị (Admin Portal)
- Quản lý người dùng/phân quyền; hoạt động hệ thống (Activity Log)
- Quản lý căn hộ, cư dân, phương tiện
- Quản lý thông báo, sự kiện, tiện ích và đặt chỗ
- Quản lý hóa đơn: tạo theo tháng, tạo biểu phí theo năm, cấu hình phí
- Quản lý số nước (water meter), tác vụ theo lịch (schedulers)
- Báo cáo/tổng quan (dashboard, lịch sử thao tác)
- Tích hợp cổng thanh toán (VNPay/MoMo/ZaloPay/PayPal/Stripe)

## 🛠️ Công nghệ đang dùng

### Backend (apartment-portal-BE)
- Spring Boot 3.2 (Java 20), Gradle
- Spring Web, Data JPA, Validation, Security, Cache, WebSocket
- JWT (JJWT 0.11.5), Lombok, MapStruct 1.6.2
- MySQL (runtime), H2 (test)
- Springdoc OpenAPI (Swagger UI), Actuator, Micrometer + Prometheus
- Java Mail, Cloudinary SDK (chuẩn bị dùng)
- Cổng thanh toán: Stripe SDK, tích hợp VNPay/MoMo/ZaloPay/PayPal

### Frontend Admin (apartment-portal-Fe)
- Next.js 15, React 19, TypeScript
- Tailwind CSS, shadcn/ui, Radix UI, Lucide icons
- React Hook Form + Zod, Recharts, Sonner

### Frontend User (apartment-user-portal)
- Next.js 14, React 18, TypeScript
- Tailwind CSS, Bootstrap/Bootstrap Icons (một số trang)
- Radix UI, React Hook Form + Zod, Recharts

## ⚙️ Cài đặt & chạy cục bộ

### Yêu cầu
- Java 20+, Node.js 18+, MySQL 8+

### 1) Backend
```bash
cd apartment-portal-BE
./gradlew bootRun
```
Mặc định chạy tại: `http://localhost:8080`

Database cấu hình trong `src/main/resources/application.properties` (mặc định `root/123456`, DB `ApartmentDB`, `ddl-auto=create-drop` chỉ dùng dev). Có sẵn `complete-schema.sql` và `data.sql` để khởi tạo dữ liệu mẫu.

Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### 2) Frontend Admin
```bash
cd apartment-portal-Fe
npm install
npm run dev
```
Mặc định chạy tại: `http://localhost:3000`

### 3) Frontend User
```bash
cd apartment-user-portal
npm install
npm run dev # cổng 3001
```
Mặc định chạy tại: `http://localhost:3001`

Các URL frontend được backend sử dụng: `app.admin-frontend-url=http://localhost:3000`, `app.user-frontend-url=http://localhost:3001`.

## 🔐 Xác thực & phân quyền
- JWT Bearer Token, Spring Security
- Vai trò: `ROLE_USER`, `ROLE_STAFF`, `ROLE_ADMIN`
- Guard ở frontend theo vai trò; token refresh/redirect khi 401

## 💳 Thanh toán (tích hợp đa cổng)
- VNPay, MoMo, ZaloPay, PayPal, Stripe (test keys cấu hình qua ENV/property)
- Webhook/return URL có thể cấu hình; Stripe có trang `static/stripe-checkout.html`
- User Portal có trang kết quả VNPay: `app/payment/vnpay-result`

## ⏱️ Schedulers/Jobs
- `YearlyBillingScheduler`, `WaterMeterScheduler`, `BillingJob`, `WaterMeterAutoSeedRunner`
- Khuyến nghị tắt trong môi trường dev nếu không cần

## 📑 API chính (tham khảo)
- Auth: `/api/auth/**`
- Residents: `/api/admin/residents/**`
- Apartments: `/api/apartments/**`
- Facilities/Bookings: `/api/facilities/**`, `/api/facility-bookings/**`
- Announcements/Events: `/api/announcements/**`, `/api/events/**`
- Invoices/Billing: `/api/invoices/**`, `/api/admin/yearly-billing/**`
- Payments: `/api/payments/**`

Chi tiết xem Swagger UI.

## 🧩 Cấu hình môi trường (khuyến nghị)
- Không commit secrets (JWT, Mail, Payment keys) vào `application.properties`
- Sử dụng biến môi trường: `SPRING_DATASOURCE_*`, `JWT_*`, `SPRING_MAIL_*`, `STRIPE_*`, `VNPAY_*`, `MOMO_*`, `ZALOPAY_*`, `PAYPAL_*`
- Phân tách profile: `application-dev.properties`, `application-prod.properties`

## 🚀 Triển khai
- Backend: `./gradlew build` → chạy jar
- Frontend: `npm run build && npm start`
- Reverse proxy (Nginx) + HTTPS (Let's Encrypt) khuyến nghị cho production

## 📈 Đề xuất nâng cấp trong tương lai

### Hạ tầng & DevOps
- Docker/Docker Compose cho MySQL + Backend + 2 Frontend; healthcheck
- CI/CD (GitHub Actions): build/test/lint, tạo artifact, deploy theo môi trường
- Secrets management (GitHub/OIDC, Vault) thay cho properties commit cứng

### Quan sát hệ thống (Observability)
- Bật đầy đủ Actuator + Micrometer Prometheus; dashboard với Grafana
- Log tập trung (ELK/Loki) và alerting; request tracing (OpenTelemetry)

### CSDL & dữ liệu
- Quản lý migration bằng Flyway hoặc Liquibase (thay cho `ddl-auto`)
- Testcontainers cho integration test với MySQL

### Bảo mật
- Rotation JWT secret; refresh token rotation + revoke
- Rate limiting/Brute force protection; CORS theo môi trường
- Mã hóa mật khẩu mạnh (BCrypt), chính sách mật khẩu/2FA

### Backend
- Chuẩn hóa lỗi qua `GlobalExceptionHandler`, mã lỗi nhất quán
- Idempotency cho endpoints thanh toán/webhook; retry policy
- Phân tách module thanh toán; kiểm chữ ký VNPay/MoMo/ZaloPay/PayPal/Stripe

### Frontend
- Đồng bộ phiên bản (nâng `apartment-user-portal` lên Next 15/React 19)
- Chuẩn hóa UI kit (shadcn/ui), i18n, xử lý lỗi toàn cục, Sentry
- Dùng SWR/React Query cho caching; skeleton/loading chuẩn hóa
- PWA/offline cho User Portal; tối ưu ảnh/CDN

### Real-time
- Hoàn thiện WebSocket/STOMP hoặc SSE cho thông báo thời gian thực
- Push notifications (Web Push) cho sự kiện hệ thống

### Thanh toán
- Hoàn thiện luồng đối soát, hoàn tiền; lưu trữ hóa đơn và biên lai
- Idempotency keys khi tạo payment; sandbox/prod switch rõ ràng

## 📚 Tài liệu bổ sung trong repo
- `apartment-portal-Fe/README-*.md`: Hướng dẫn quản trị (hóa đơn, cư dân, sự kiện/tiện ích...)
- `apartment-user-portal/UI_UPDATE_SUMMARY.md`, `UX_IMPROVEMENTS.md`: Cải tiến UI/UX cho User Portal

## 📝 License
MIT – xem `LICENSE`.

## 👥 Liên hệ
- Tạo issue trong repository hoặc liên hệ email nội bộ của nhóm dự án.