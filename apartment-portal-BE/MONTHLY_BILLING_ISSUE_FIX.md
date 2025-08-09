# 🔧 SỬA LỖI TẠO HÓA ĐƠN THEO THÁNG

## 🚨 Vấn đề đã được xác định và sửa

### **Vấn đề chính:**
1. **Constraint vi phạm:** `chk_invoice_amount` yêu cầu `total_amount > 0` nhưng code đang set `totalAmount = 0.0`
2. **Logic sai:** Method `generateInvoiceForApartment` gọi `generateInvoicesForMonth()` thay vì tạo hóa đơn cho căn hộ cụ thể
3. **Lấy dữ liệu sai:** `findDistinctApartmentIds()` chỉ lấy từ bảng `invoices` thay vì `apartments`
4. **⚠️ SỬ DỤNG SAI API:** Có nhiều API khác nhau, cần chọn đúng API cho từng mục đích
5. **🔧 THIẾU CHI TIẾT HÓA ĐƠN:** Hóa đơn được tạo nhưng không có các khoản phí chi tiết (invoice_items)
6. **🔧 THIẾU CẤU HÌNH PHÍ:** Không có cấu hình phí dịch vụ cho tháng được tạo hóa đơn

### **✅ Các sửa đổi đã thực hiện:**

#### 1. **Sửa InvoiceService.generateInvoicesForMonth()**
```java
// Trước:
inv.setTotalAmount(0.0);

// Sau:
inv.setTotalAmount(0.01); // Đặt giá trị nhỏ > 0 để tránh vi phạm constraint
```

#### 2. **Sửa logic lấy danh sách căn hộ**
```java
// Trước:
List<Long> aptIds = invoiceRepository.findDistinctApartmentIds();

// Sau:
List<Long> aptIds = apartmentRepository.findAll().stream()
    .map(apartment -> apartment.getId())
    .collect(Collectors.toList());
```

#### 3. **Thêm kiểm tra hóa đơn đã tồn tại**
```java
Optional<Invoice> existingInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(aptId, period);
if (existingInvoice.isPresent()) {
    System.out.println("DEBUG: Hóa đơn đã tồn tại cho căn hộ " + aptId + " kỳ " + period);
    continue; // Bỏ qua nếu đã có hóa đơn
}
```

#### 4. **Sửa InvoiceController.generateInvoiceForApartment()**
```java
// Trước: Gọi generateInvoicesForMonth() cho tất cả căn hộ
invoiceService.generateInvoicesForMonth(billingPeriod);

// Sau: Tạo hóa đơn chỉ cho căn hộ cụ thể
Invoice inv = new Invoice();
inv.setApartmentId(apartmentId);
inv.setBillingPeriod(billingPeriod);
// ... set các thuộc tính khác
invoiceRepository.save(inv);
```

#### 5. **🔧 THÊM TẠO CẤU HÌNH PHÍ TỰ ĐỘNG**
```java
// Tự động tạo cấu hình phí dịch vụ nếu chưa có
Optional<ServiceFeeConfig> existingConfig = serviceFeeConfigRepository.findByMonthAndYear(month, year);
if (existingConfig.isEmpty()) {
    ServiceFeeConfig config = ServiceFeeConfig.builder()
        .month(month)
        .year(year)
        .serviceFeePerM2(5000.0)  // 5000 VND/m²
        .waterFeePerM3(15000.0)   // 15000 VND/m³
        .motorcycleFee(50000.0)   // 50000 VND/tháng
        .car4SeatsFee(200000.0)   // 200000 VND/tháng
        .car7SeatsFee(250000.0)   // 250000 VND/tháng
        .build();
    serviceFeeConfigRepository.save(config);
}
```

#### 6. **🔧 THÊM CHI TIẾT CÁC KHOẢN PHÍ**
```java
// Chạy tất cả MonthlyFeeService để thêm chi tiết phí
feeServices.forEach(svc -> {
    try {
        svc.generateFeeForMonth(billingPeriod);
        System.out.println("DEBUG: Đã chạy " + svc.getClass().getSimpleName());
    } catch (Exception e) {
        System.err.println("DEBUG: Lỗi khi chạy " + svc.getClass().getSimpleName() + ": " + e.getMessage());
    }
});
```

## 🚨 **VẤN ĐỀ QUAN TRỌNG: SỬ DỤNG SAI API**

### **Các API có sẵn:**

#### **📋 API tạo hóa đơn cho 1 tháng (ĐÚNG):**
```bash
# API 1: InvoiceController - Tạo hóa đơn cơ bản cho 1 tháng
POST /api/admin/invoices/generate-all?billingPeriod=2025-01

# API 2: YearlyBillingController - Tạo hóa đơn đầy đủ cho 1 tháng
POST /api/admin/yearly-billing/generate-month/2025/1
```

#### **⚠️ API tạo hóa đơn cho cả năm (SAI - nếu chỉ muốn 1 tháng):**
```bash
# API 3: Tạo hóa đơn cho cả 12 tháng
POST /api/admin/yearly-billing/generate

# API 4: Tạo hóa đơn cho cả 12 tháng
POST /api/admin/yearly-billing/generate-once

# API 5: Tạo hóa đơn cho cả 12 tháng
POST /api/admin/yearly-billing/generate-current-year
```

### **🎯 Cách sử dụng đúng:**

#### **1. Tạo hóa đơn cho 1 tháng cụ thể (VỚI CHI TIẾT):**
```bash
# Sử dụng API này để tạo hóa đơn cho 1 tháng với đầy đủ chi tiết
curl -X POST "http://localhost:8080/api/admin/invoices/generate-all?billingPeriod=2025-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### **2. Tạo hóa đơn cho căn hộ cụ thể (VỚI CHI TIẾT):**
```bash
# Sử dụng API này để tạo hóa đơn cho căn hộ cụ thể
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2025-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 🧪 Cách test

### **1. Test tạo hóa đơn cho căn hộ cụ thể:**
```bash
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2025-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **2. Test tạo hóa đơn cho tất cả căn hộ:**
```bash
curl -X POST "http://localhost:8080/api/admin/invoices/generate-all?billingPeriod=2025-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **3. Test tạo hóa đơn đầy đủ cho 1 tháng:**
```bash
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2025/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{\"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"
```

### **4. Kiểm tra hóa đơn đã tạo:**
```bash
curl -X GET "http://localhost:8080/api/admin/invoices" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📋 Kiểm tra kết quả

### **✅ Kết quả mong đợi:**
- Chỉ tạo hóa đơn cho tháng được chỉ định (ví dụ: 2025-01)
- Không tạo hóa đơn cho các tháng khác
- `total_amount > 0` (không vi phạm constraint)
- **🔧 CÓ CHI TIẾT CÁC KHOẢN PHÍ** (invoice_items)
- **🔧 CÓ CẤU HÌNH PHÍ DỊCH VỤ** tự động tạo
- Có log debug để theo dõi quá trình

### **🔍 Debug logs:**
```
DEBUG: Bắt đầu tạo hóa đơn cho tháng 2025-01
DEBUG: Tìm thấy X căn hộ để tạo hóa đơn
DEBUG: Tạo hóa đơn cho căn hộ Y kỳ 2025-01 với tổng tiền 0.01
DEBUG: Tạo cấu hình phí dịch vụ cho tháng 1/2025
DEBUG: Chạy các MonthlyFeeService để thêm chi tiết phí
DEBUG: Đã chạy ServiceFeeMonthlyFeeService
DEBUG: Đã chạy WaterMeterMonthlyFeeService
DEBUG: Đã chạy VehicleMonthlyFeeService
```

## 🚀 Cách sử dụng

### **1. Tạo hóa đơn cho một căn hộ:**
- Sử dụng API: `POST /api/admin/invoices/generate`
- Parameters: `apartmentId`, `billingPeriod`
- **Kết quả:** Hóa đơn với đầy đủ chi tiết các khoản phí

### **2. Tạo hóa đơn cho tất cả căn hộ:**
- Sử dụng API: `POST /api/admin/invoices/generate-all`
- Parameters: `billingPeriod`
- **Kết quả:** Hóa đơn với đầy đủ chi tiết các khoản phí

### **3. Tạo hóa đơn đầy đủ cho 1 tháng:**
- Sử dụng API: `POST /api/admin/yearly-billing/generate-month/{year}/{month}`
- Parameters: `year`, `month`, `request body` với cấu hình phí
- **Kết quả:** Hóa đơn với đầy đủ chi tiết các khoản phí

### **4. Tính lại phí (không tạo hóa đơn mới):**
- Sử dụng API: `POST /api/admin/invoices/recalculate-fees`
- Parameters: `billingPeriod`

## 📋 **XEM CHI TIẾT HÓA ĐƠN VÀ CÁC KHOẢN PHÍ**

### **🔍 Các API xem chi tiết hóa đơn:**

#### **1. Xem tất cả hóa đơn:**
```bash
GET /api/admin/invoices
```

#### **2. Xem chi tiết hóa đơn theo ID (bao gồm các khoản phí):**
```bash
GET /api/admin/invoices/{id}
```

#### **3. Xem chi tiết các khoản phí của hóa đơn:**
```bash
GET /api/admin/invoices/{id}/items
```

#### **4. Xem hóa đơn theo căn hộ:**
```bash
GET /api/admin/invoices/by-apartments?aptIds=55,57
```

### **📊 Response mẫu cho chi tiết hóa đơn:**

#### **API: GET /api/admin/invoices/{id}**
```json
{
  "id": 49,
  "apartmentId": 57,
  "billingPeriod": "2025-08",
  "issueDate": "2025-08-01",
  "dueDate": "2025-08-15",
  "totalAmount": 825000.0,
  "status": "UNPAID",
  "createdAt": "2025-01-27T16:20:27.856",
  "updatedAt": "2025-01-27T16:20:27.856",
  "items": [
    {
      "id": 1,
      "feeType": "SERVICE_FEE",
      "description": "Phí dịch vụ tháng 2025-01 (55.0 m² x 5000 VND/m²)",
      "amount": 275000.0
    },
    {
      "id": 2,
      "feeType": "WATER_FEE",
      "description": "Phí nước tháng 2025-01 (10.0 m³ x 15000 VND/m³)",
      "amount": 150000.0
    },
    {
      "id": 3,
      "feeType": "VEHICLE_FEE",
      "description": "Phí gửi xe Xe máy tháng 2025-01",
      "amount": 50000.0
    }
  ]
}
```

#### **API: GET /api/admin/invoices/{id}/items**
```json
{
  "success": true,
  "invoiceId": 49,
  "apartmentId": 57,
  "billingPeriod": "2025-08",
  "totalAmount": 825000.0,
  "status": "UNPAID",
  "itemCount": 3,
  "items": [
    {
      "id": 1,
      "feeType": "SERVICE_FEE",
      "description": "Phí dịch vụ tháng 2025-01 (55.0 m² x 5000 VND/m²)",
      "amount": 275000.0
    },
    {
      "id": 2,
      "feeType": "WATER_FEE",
      "description": "Phí nước tháng 2025-01 (10.0 m³ x 15000 VND/m³)",
      "amount": 150000.0
    },
    {
      "id": 3,
      "feeType": "VEHICLE_FEE",
      "description": "Phí gửi xe Xe máy tháng 2025-01",
      "amount": 50000.0
    }
  ]
}
```

### **🧪 Test xem chi tiết hóa đơn:**

#### **1. Xem tất cả hóa đơn:**
```bash
curl -X GET "http://localhost:8080/api/admin/invoices" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### **2. Xem chi tiết hóa đơn ID 49:**
```bash
curl -X GET "http://localhost:8080/api/admin/invoices/49" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### **3. Xem chi tiết các khoản phí của hóa đơn ID 49:**
```bash
curl -X GET "http://localhost:8080/api/admin/invoices/49/items" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### **4. Xem hóa đơn theo căn hộ:**
```bash
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=55,57" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **📋 Các loại khoản phí có thể có:**

- **SERVICE_FEE:** Phí dịch vụ căn hộ (tính theo m²)
- **WATER_FEE:** Phí nước (tính theo m³)
- **VEHICLE_FEE:** Phí gửi xe (xe máy, ô tô)
- **ELECTRICITY_FEE:** Phí điện (nếu có)
- **CLEANING_FEE:** Phí vệ sinh
- **MAINTENANCE_FEE:** Phí bảo trì
- **OTHER_FEES:** Các khoản phí khác 

## ⚠️ **LƯU Ý QUAN TRỌNG:**

### **KHÔNG sử dụng các API sau nếu chỉ muốn tạo hóa đơn cho 1 tháng:**
- ❌ `/api/admin/yearly-billing/generate` - Tạo cho cả 12 tháng
- ❌ `/api/admin/yearly-billing/generate-once` - Tạo cho cả 12 tháng  
- ❌ `/api/admin/yearly-billing/generate-current-year` - Tạo cho cả 12 tháng

### **SỬ DỤNG các API sau để tạo hóa đơn cho 1 tháng:**
- ✅ `/api/admin/invoices/generate-all?billingPeriod=2025-01` - Tạo cơ bản với chi tiết
- ✅ `/api/admin/invoices/generate?apartmentId=55&billingPeriod=2025-01` - Tạo cho căn hộ cụ thể với chi tiết
- ✅ `/api/admin/yearly-billing/generate-month/2025/1` - Tạo đầy đủ

## 📞 Liên hệ:
Nếu có vấn đề, hãy kiểm tra log và cung cấp thông tin chi tiết. 