# Chức Năng Tạo Hóa Đơn Chi Tiết

## 📋 Tổng quan

Chức năng tạo hóa đơn chi tiết là một tính năng quan trọng trong hệ thống quản lý tòa nhà, cho phép tự động tạo và quản lý các hóa đơn phí dịch vụ hàng tháng cho tất cả cư dân. Hệ thống hỗ trợ tính toán chính xác các khoản phí dựa trên diện tích căn hộ, mức sử dụng nước, số lượng phương tiện và các dịch vụ khác.

## 🎯 Mục tiêu

- Tự động hóa việc tạo hóa đơn hàng tháng cho tất cả căn hộ
- Đảm bảo tính chính xác trong việc tính toán các khoản phí
- Cung cấp hóa đơn chi tiết với đầy đủ thông tin
- Hỗ trợ quản lý và theo dõi trạng thái thanh toán
- Tích hợp với hệ thống gửi email thông báo

## 🏗️ Kiến trúc hệ thống

### Các thành phần chính:

1. **Backend (Spring Boot)**: Xử lý logic nghiệp vụ tạo hóa đơn
2. **Frontend Web (Next.js)**: Giao diện quản trị viên
3. **Database (MySQL)**: Lưu trữ hóa đơn và chi tiết
4. **Email Service**: Gửi thông báo hóa đơn

## 📊 Cấu trúc Database

### Bảng `invoices`
```sql
CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    billing_period VARCHAR(10) NOT NULL, -- yyyy-MM
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status ENUM('UNPAID', 'PAID', 'OVERDUE', 'CANCELLED') DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id)
);
```

### Bảng `invoice_items`
```sql
CREATE TABLE invoice_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    fee_type VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
```

### Bảng `yearly_billing_config`
```sql
CREATE TABLE yearly_billing_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    service_fee_per_m2 DECIMAL(10,2) NOT NULL,
    water_fee_per_m3 DECIMAL(10,2) NOT NULL,
    motorcycle_fee DECIMAL(10,2) NOT NULL,
    car_4_seats_fee DECIMAL(10,2) NOT NULL,
    car_7_seats_fee DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_year_month (year, month)
);
```

## 💰 Các khoản phí trong hóa đơn

### 1. Phí dịch vụ chung cư
- **Tính toán**: `Diện tích căn hộ × Đơn giá/m²`
- **Đơn vị**: VND/m²/tháng
- **Ví dụ**: Căn hộ 100m² × 5,000 VND/m² = 500,000 VND

### 2. Phí nước
- **Tính toán**: `Lượng nước tiêu thụ × Đơn giá/m³`
- **Đơn vị**: VND/m³
- **Dữ liệu**: Từ chỉ số đồng hồ nước
- **Ví dụ**: 10m³ × 15,000 VND/m³ = 150,000 VND

### 3. Phí gửi xe máy
- **Tính toán**: `Số lượng xe máy × Phí cố định`
- **Đơn vị**: VND/tháng/xe
- **Ví dụ**: 2 xe × 50,000 VND/xe = 100,000 VND

### 4. Phí gửi ô tô 4 chỗ
- **Tính toán**: `Số lượng ô tô 4 chỗ × Phí cố định`
- **Đơn vị**: VND/tháng/xe
- **Ví dụ**: 1 xe × 200,000 VND/xe = 200,000 VND

### 5. Phí gửi ô tô 7 chỗ
- **Tính toán**: `Số lượng ô tô 7 chỗ × Phí cố định`
- **Đơn vị**: VND/tháng/xe
- **Ví dụ**: 1 xe × 250,000 VND/xe = 250,000 VND

## 🔄 Quy trình tạo hóa đơn

### Bước 1: Thiết lập cấu hình phí

#### Từ phía quản trị viên:
1. Truy cập menu "Quản lý hóa đơn" → "Cấu hình phí"
2. Chọn năm và tháng cần cấu hình
3. Nhập các mức phí:
   - Phí dịch vụ (VND/m²)
   - Phí nước (VND/m³)
   - Phí xe máy (VND/tháng)
   - Phí ô tô 4 chỗ (VND/tháng)
   - Phí ô tô 7 chỗ (VND/tháng)
4. Lưu cấu hình

#### API Endpoint:
```typescript
PUT /api/admin/yearly-billing/config/{year}/{month}
Body: {
  serviceFeePerM2: number,
  waterFeePerM3: number,
  motorcycleFee: number,
  car4SeatsFee: number,
  car7SeatsFee: number
}
```

### Bước 2: Chuẩn bị dữ liệu

#### Dữ liệu cần thiết:
1. **Thông tin căn hộ**: Diện tích, số phòng, vị trí
2. **Chỉ số đồng hồ nước**: Đầu kỳ, cuối kỳ
3. **Danh sách xe**: Loại xe, trạng thái đăng ký
4. **Thông tin cư dân**: Tên, email, số điện thoại

#### Validation dữ liệu:
- Kiểm tra chỉ số nước phải có đầy đủ
- Xe phải ở trạng thái APPROVED
- Căn hộ phải có cư dân chính

### Bước 3: Tạo hóa đơn

#### Tạo hóa đơn đơn lẻ:
```typescript
POST /api/admin/invoices/generate?apartmentId={id}&billingPeriod={yyyy-MM}
```

#### Tạo hóa đơn hàng loạt:
```typescript
POST /api/admin/yearly-billing/generate-monthly-invoices
Body: {
  year: number,
  month: number,
  skipWaterValidation: boolean
}
```

#### Logic tạo hóa đơn:

```java
// 1. Lấy thông tin căn hộ
Apartment apartment = apartmentRepository.findById(apartmentId);

// 2. Tính phí dịch vụ
double serviceFee = apartment.getArea() * config.getServiceFeePerM2();

// 3. Tính phí nước
WaterReading reading = getLatestWaterReading(apartmentId, billingPeriod);
double waterUsage = reading.getEndValue() - reading.getStartValue();
double waterFee = waterUsage * config.getWaterFeePerM3();

// 4. Tính phí xe
List<Vehicle> vehicles = vehicleRepository.findApprovedVehiclesByApartment(apartmentId);
double vehicleFee = calculateVehicleFees(vehicles, config);

// 5. Tạo hóa đơn và items
Invoice invoice = createInvoice(apartmentId, billingPeriod, serviceFee + waterFee + vehicleFee);
createInvoiceItems(invoice, serviceFee, waterFee, vehicleFee);
```

### Bước 4: Gửi thông báo

#### Tự động gửi email:
- Gửi đến tất cả cư dân trong căn hộ
- Đính kèm file PDF hóa đơn
- Thông báo hạn thanh toán

#### API gửi email:
```typescript
POST /api/admin/invoices/{id}/send-email
```

## 📱 API Endpoints

### API tạo hóa đơn:

```typescript
// Tạo hóa đơn cho một căn hộ
POST /api/admin/invoices/generate
Params: apartmentId, billingPeriod

// Tạo hóa đơn cho tất cả căn hộ
POST /api/admin/invoices/generate-all
Params: billingPeriod

// Tạo hóa đơn theo tháng (có kiểm tra chỉ số nước)
POST /api/admin/yearly-billing/generate-monthly-invoices
Body: {
  year: number,
  month: number,
  skipWaterValidation?: boolean
}
```

### API quản lý cấu hình:

```typescript
// Lấy cấu hình phí tháng
GET /api/admin/yearly-billing/config/{year}/{month}

// Cập nhật cấu hình phí tháng
PUT /api/admin/yearly-billing/config/{year}/{month}
Params: serviceFeePerM2, waterFeePerM3, motorcycleFee, car4SeatsFee, car7SeatsFee

// Tạo cấu hình phí năm
POST /api/admin/yearly-billing/fee-config
Body: {
  year: number,
  serviceFeePerM2: number,
  waterFeePerM3: number,
  motorcycleFee: number,
  car4SeatsFee: number,
  car7SeatsFee: number
}
```

### API quản lý hóa đơn:

```typescript
// Lấy danh sách hóa đơn
GET /api/admin/invoices

// Lấy hóa đơn theo ID
GET /api/admin/invoices/{id}

// Lấy hóa đơn của căn hộ
GET /api/admin/invoices/by-apartments?aptIds={ids}

// Lấy hóa đơn quá hạn
GET /api/admin/invoices/overdue

// Tải PDF hóa đơn
GET /api/invoices/{id}/download
```

## 🎨 Giao diện người dùng

### Web Admin (Next.js)

#### Trang cấu hình phí:
- **Form cấu hình**: Input các mức phí theo tháng/năm
- **Bảng hiển thị**: Danh sách cấu hình đã tạo
- **Validation**: Kiểm tra không để trống, giá trị hợp lệ

#### Trang tạo hóa đơn:
- **Form tạo hóa đơn**: Chọn tháng, năm, tùy chọn
- **Progress bar**: Hiển thị tiến trình tạo hóa đơn
- **Kết quả**: Thống kê số hóa đơn tạo thành công/thất bại

#### Trang quản lý hóa đơn:
- **Data table**: Danh sách hóa đơn với filter và search
- **Status badges**: Trạng thái với màu sắc phân biệt
- **Actions**: Xem chi tiết, gửi email, tải PDF

### Mobile App (Flutter)

#### Màn hình hóa đơn:
- **Tabs**: Tất cả, Chưa thanh toán, Đã thanh toán, Quá hạn
- **Card hóa đơn**: Thông tin cơ bản và tổng tiền
- **Chi tiết**: Danh sách các khoản phí

## 🔐 Quy tắc nghiệp vụ

### Validation tạo hóa đơn:

1. **Cấu hình phí**: Phải có cấu hình cho tháng tạo hóa đơn
2. **Chỉ số nước**: Bắt buộc có chỉ số nước (trừ khi skip validation)
3. **Căn hộ**: Phải có cư dân đang ở
4. **Trùng lặp**: Không tạo hóa đơn trùng tháng cho cùng căn hộ

### Quy tắc tính phí:

1. **Phí dịch vụ**: Tính dựa trên diện tích thực tế của căn hộ
2. **Phí nước**: Tính dựa trên chỉ số đồng hồ, không âm
3. **Phí xe**: Chỉ tính xe có trạng thái APPROVED
4. **Làm tròn**: Làm tròn đến hàng nghìn VND

### Quy tắc gửi thông báo:

1. **Thời gian**: Gửi ngay sau khi tạo hóa đơn thành công
2. **Người nhận**: Tất cả cư dân trong căn hộ
3. **Nội dung**: Bao gồm tổng tiền và hạn thanh toán
4. **Đính kèm**: File PDF hóa đơn chi tiết

## 📊 Báo cáo và thống kê

### Thống kê hóa đơn:
- **Tổng số hóa đơn**: Theo tháng/năm
- **Trạng thái**: UNPAID, PAID, OVERDUE
- **Doanh thu**: Tổng tiền đã thu, chưa thu
- **Tỷ lệ thu phí**: Theo thời gian

### Báo cáo theo căn hộ:
- **Lịch sử hóa đơn**: Các tháng đã tạo
- **Tình trạng thanh toán**: Đã thanh toán những tháng nào
- **Tổng nợ**: Số tiền chưa thanh toán

## 🔔 Hệ thống thông báo

### Thông báo cho cư dân:
- **Hóa đơn mới**: Khi có hóa đơn mới được tạo
- **Nhắc nhở**: Trước hạn thanh toán 3 ngày
- **Quá hạn**: Khi hóa đơn quá hạn thanh toán
- **Xác nhận**: Khi thanh toán thành công

### Thông báo cho quản trị viên:
- **Tạo hóa đơn thành công**: Số lượng hóa đơn đã tạo
- **Lỗi tạo hóa đơn**: Các căn hộ không thể tạo được
- **Thanh toán**: Khi cư dân thanh toán hóa đơn
- **Báo cáo**: Thống kê thu phí hàng tháng

## 🔧 Bảo trì và hỗ trợ

### Các tác vụ định kỳ:
- **Backup dữ liệu**: Sao lưu bảng invoices và invoice_items
- **Xóa dữ liệu cũ**: Xóa hóa đơn quá hạn sau 5 năm
- **Cập nhật cấu hình**: Điều chỉnh phí theo chính sách mới
- **Kiểm tra tính toàn vẹn**: Validate dữ liệu hóa đơn

### Xử lý sự cố:
- **Thiếu chỉ số nước**: Skip validation hoặc tạo hóa đơn tạm thời
- **Lỗi tính toán**: Công cụ recalculate fees
- **Trùng lặp hóa đơn**: Kiểm tra và xóa hóa đơn trùng
- **Lỗi gửi email**: Retry mechanism với queue

## 🚀 Tối ưu hóa hiệu suất

### Database optimization:
- **Indexing**: Trên apartment_id, billing_period, status, due_date
- **Partitioning**: Chia bảng theo năm để query nhanh hơn
- **Caching**: Cache cấu hình phí thường dùng

### API optimization:
- **Batch processing**: Tạo nhiều hóa đơn cùng lúc
- **Async processing**: Xử lý tạo hóa đơn trong background
- **Pagination**: Cho danh sách hóa đơn lớn
- **Rate limiting**: Giới hạn tốc độ tạo hóa đơn

### Frontend optimization:
- **Lazy loading**: Load hóa đơn theo trang
- **Real-time updates**: Cập nhật trạng thái tự động
- **Offline support**: Cache dữ liệu hóa đơn
- **Progressive loading**: Hiển thị trước dữ liệu quan trọng

## 📋 Checklist triển khai

### Backend:
- [x] Model Invoice và InvoiceItem
- [x] YearlyBillingService với logic tính toán
- [x] InvoiceController với đầy đủ endpoints
- [x] PDF generation service
- [x] Email notification service
- [x] Validation và error handling
- [x] Activity logging

### Frontend Web:
- [x] Trang cấu hình phí dịch vụ
- [x] Trang tạo hóa đơn hàng loạt
- [x] Trang quản lý hóa đơn
- [x] Component xem chi tiết hóa đơn
- [x] PDF viewer và download
- [x] Real-time notifications

### Mobile App:
- [x] Màn hình danh sách hóa đơn
- [x] Chi tiết hóa đơn với các khoản phí
- [x] Thông báo push về hóa đơn mới
- [x] Thanh toán hóa đơn (tích hợp)
- [x] Lịch sử thanh toán

### Testing:
- [x] Unit tests cho service tính toán
- [x] Integration tests cho API
- [x] UI tests cho web và mobile
- [x] Performance tests với 1000+ hóa đơn
- [x] End-to-end tests cho quy trình hoàn chỉnh

## 🔮 Phát triển tương lai

### Tính năng nâng cao:
- **Tự động tạo hóa đơn**: Schedule job tạo hóa đơn hàng tháng
- **Nhắc nhở thông minh**: Dự đoán khả năng thanh toán
- **Thanh toán online**: Tích hợp VNPay, MoMo
- **Hóa đơn điện tử**: Ký số và xác thực
- **AI phân tích**: Dự đoán xu hướng thu phí

### Tích hợp:
- **IoT**: Tự động ghi chỉ số đồng hồ
- **Chatbot**: Hỗ trợ thanh toán qua chatbot
- **QR Code**: Thanh toán nhanh bằng QR
- **Blockchain**: Lưu trữ hóa đơn an toàn
- **Machine Learning**: Tối ưu hóa mức phí

---

## 📞 Liên hệ hỗ trợ

**Đội ngũ phát triển**: Nhóm 1 - Đồ án Kỹ 4
**Email**: support@apartment-portal.com
**Version**: 1.0.0
**Last updated**: September 2025
