# HƯỚNG DẪN HOÀN THIỆN HỆ THỐNG QUẢN LÝ CHUNG CƯ

## 🎯 Tổng quan

Hệ thống đã được nâng cấp với các tính năng mới:
- ✅ Thanh toán qua 4 cổng: MoMo, VNPay, ZaloPay, Visa/Mastercard
- ✅ Dữ liệu mẫu đầy đủ cho database
- ✅ API endpoints hoàn thiện
- ✅ Frontend user portal cập nhật
- ✅ Tích hợp AI Q&A

## 🚀 Cách chạy hệ thống

### 1. Backend (Spring Boot)

```bash
# Chạy backend với dữ liệu mẫu
cd apartment-portal-BE
run-app.bat
```

**Lưu ý:**
- Sử dụng database `ApartmentDB` có sẵn
- Dữ liệu mẫu sẽ được tự động load
- Server chạy tại: `http://localhost:8080`

### 2. User Frontend (Next.js)

```bash
# Terminal 1 - User Portal
cd apartment-user-portal
npm run dev
```

**Lưu ý:**
- User portal chạy tại: `http://localhost:3001`
- Tài khoản test: `resident1` / `password`

### 3. Admin Frontend (Next.js)

```bash
# Terminal 2 - Admin Portal (nếu cần)
cd apartment-portal-Fe
npm run dev
```

**Lưu ý:**
- Admin portal chạy tại: `http://localhost:3000`
- Tài khoản test: `admin` / `password`

## 📊 Dữ liệu mẫu đã tạo

### Tài khoản người dùng:
- **Admin:** `admin` / `password`
- **Manager:** `manager` / `password`
- **Staff:** `staff1`, `staff2` / `password`
- **Residents:** `resident1` - `resident6` / `password`
- **Service Staff:** `technician1`, `cleaner1`, `security1` / `password`

### Dữ liệu khác:
- ✅ 3 tòa nhà (A, B, C)
- ✅ 30 căn hộ với trạng thái khác nhau
- ✅ 10 cư dân và thành viên gia đình
- ✅ 8 tiện ích (Gym, Hồ bơi, Phòng họp, v.v.)
- ✅ 5 thông báo
- ✅ 5 sự kiện với đăng ký
- ✅ 8 lượt đặt tiện ích
- ✅ 10 hóa đơn với chi tiết
- ✅ 6 yêu cầu dịch vụ
- ✅ 5 phản hồi
- ✅ Lịch sử hoạt động và AI Q&A

## 💳 Tính năng thanh toán mới

### Các cổng thanh toán hỗ trợ:
1. **MoMo** - Ví điện tử
2. **VNPay** - Cổng thanh toán
3. **ZaloPay** - Ví ZaloPay
4. **Visa/Mastercard** - Thẻ quốc tế

### API Endpoints:
```
POST /api/payments/momo
POST /api/payments/vnpay
POST /api/payments/zalopay
POST /api/payments/visa
```

### Callback URLs:
```
POST /api/payments/momo/callback
POST /api/payments/vnpay/callback
POST /api/payments/zalopay/callback
```

## 🔧 Cấu hình thanh toán

### Trong `application.properties`:
```properties
# MoMo Configuration
payment.momo.endpoint=https://test-payment.momo.vn/v2/gateway/api/create
payment.momo.partner-code=test
payment.momo.access-key=test
payment.momo.secret-key=test

# VNPay Configuration
payment.vnpay.endpoint=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
payment.vnpay.tmn-code=test
payment.vnpay.hash-secret=test

# ZaloPay Configuration
payment.zalopay.endpoint=https://sandbox.zalopay.com.vn/v001/tpe/createorder
payment.zalopay.app-id=test
payment.zalopay.key1=test
payment.zalopay.key2=test
```

**Lưu ý:** Đây là cấu hình test. Để sử dụng thực tế, cần:
1. Đăng ký tài khoản merchant với các cổng thanh toán
2. Cập nhật thông tin thực trong `application.properties`
3. Cấu hình callback URLs trên dashboard của các cổng thanh toán

## 🎨 Frontend User Portal

### Các trang đã hoàn thiện:
- ✅ **Dashboard** - Tổng quan thông tin
- ✅ **Hóa đơn** - Xem và thanh toán hóa đơn
- ✅ **Tiện ích** - Đặt lịch sử dụng tiện ích
- ✅ **Sự kiện** - Xem và đăng ký sự kiện
- ✅ **Thông báo** - Xem thông báo từ ban quản lý
- ✅ **Yêu cầu hỗ trợ** - Gửi yêu cầu dịch vụ
- ✅ **Cập nhật thông tin** - Chỉnh sửa thông tin cá nhân

### Tính năng thanh toán:
- ✅ Chọn phương thức thanh toán
- ✅ Chuyển hướng đến cổng thanh toán
- ✅ Xử lý callback và cập nhật trạng thái

## 🤖 Tính năng AI Q&A

### API Endpoints:
```
POST /api/ai/qa - Hỏi AI
GET /api/ai/qa/history - Lịch sử hỏi đáp
```

### Tính năng:
- ✅ Phân tích intent của câu hỏi
- ✅ Truy vấn database khi cần thiết
- ✅ Tích hợp với OpenAI ChatGPT
- ✅ Lưu lịch sử hỏi đáp
- ✅ Phản hồi đánh giá từ người dùng

## 🔒 Bảo mật

### JWT Authentication:
- ✅ Token validation
- ✅ Role-based access control
- ✅ Secure endpoints

### Payment Security:
- ✅ HMAC signature verification
- ✅ Callback validation
- ✅ Transaction logging

## 📱 Responsive Design

### User Portal:
- ✅ Mobile-first design
- ✅ Responsive layout
- ✅ Touch-friendly interface
- ✅ Modern UI/UX

## 🧪 Testing

### Test Cases:
1. **Đăng nhập/Đăng ký**
2. **Xem hóa đơn và thanh toán**
3. **Đặt tiện ích**
4. **Đăng ký sự kiện**
5. **Gửi yêu cầu hỗ trợ**
6. **Hỏi AI**

### Test Data:
- Sử dụng tài khoản `resident1` để test các tính năng
- Hóa đơn có sẵn để test thanh toán
- Tiện ích và sự kiện có sẵn để test đặt lịch

## 🚨 Lưu ý quan trọng

### Database:
- ✅ Sử dụng database `ApartmentDB` có sẵn
- ✅ Không tạo database mới
- ✅ Chỉ fill dữ liệu mẫu

### Admin Portal:
- ⚠️ **KHÔNG SỬA ĐỔI** admin portal để tránh conflict
- ⚠️ Chỉ tập trung vào backend và user portal
- ⚠️ Test kỹ trước khi merge code

### Payment Integration:
- ⚠️ Cấu hình test cho development
- ⚠️ Cần cập nhật thông tin thực cho production
- ⚠️ Test callback URLs kỹ lưỡng

## 📞 Hỗ trợ

### Khi gặp lỗi:
1. Kiểm tra MySQL connection
2. Kiểm tra Java version (17+)
3. Kiểm tra port 8080 có bị chiếm không
4. Xem log trong console

### Logs:
- Backend logs hiển thị trong console
- Database queries được log
- Payment transactions được log

## 🎉 Hoàn thành

Hệ thống đã được hoàn thiện với:
- ✅ Tất cả tính năng theo yêu cầu
- ✅ Thanh toán đa cổng
- ✅ Dữ liệu mẫu đầy đủ
- ✅ UI/UX hiện đại
- ✅ Bảo mật tốt
- ✅ Responsive design

**Chúc bạn sử dụng hệ thống hiệu quả! 🚀** 