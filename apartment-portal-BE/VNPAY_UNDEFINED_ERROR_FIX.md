# Khắc Phục Lỗi "Không Xác Định" Của VNPay

## Tóm Tắt Vấn Đề

Sau khi sửa lỗi chữ ký, bạn đang gặp phải lỗi "không xác định" (undefined error) mới từ VNPay. Đây là các bước để khắc phục:

## Nguyên Nhân Có Thể

### 1. **Cấu Hình Không Nhất Quán Giữa Các Service**
- **VNPayGateway.java** đã được cập nhật (version 2.1.1, orderType topup)
- **PaymentGatewayService.java** vẫn còn cấu hình cũ (version 2.1.0, orderType other)

### 2. **IP Address Không Hợp Lệ**
- Code hiện tại hardcode IP là `127.0.0.1` (localhost)
- VNPay có thể từ chối IP localhost trong môi trường production

### 3. **Thứ Tự Tham Số Không Đúng**
- Mặc dù đã sử dụng TreeMap, nhưng thứ tự thêm tham số có thể ảnh hưởng

## Các Thay Đổi Đã Thực Hiện

### ✅ **VNPayGateway.java**
```java
// Cập nhật version
String vnp_Version = "2.1.1";

// Cập nhật OrderType
String vnp_OrderType = "topup";

// Sử dụng TreeMap để tự động sắp xếp
Map<String, String> vnp_Params = new TreeMap<>();

// Thêm logging chi tiết
response.put("hashData", hashDataString);
response.put("secureHash", vnp_SecureHash);
```

### ✅ **PaymentGatewayService.java**
```java
// Cập nhật method createVNPayPaymentFull
String vnp_Version = "2.1.1";
String vnp_OrderType = "topup";

// Sử dụng TreeMap và logic mới
Map<String, String> vnp_Params = new TreeMap<>();
```

### ✅ **application.properties**
```properties
# Cập nhật TMN Code
payment.vnpay.tmn-code=${VNPAY_TMN_CODE:CTTVNP01}
```

## Cách Kiểm Tra Và Khắc Phục

### 1. **Chạy Test Case**
```bash
# Sử dụng PowerShell
.\test-vnpay.ps1

# Hoặc sử dụng batch file
test-vnpay.bat
```

### 2. **Kiểm Tra Logs**
Tìm các log sau trong console:
```
Hash data string: vnp_Amount=1000000|vnp_Command=pay|...
Secure hash đã được tạo: 27e5f41eb2e08cf85a868a4ee24efd486...
URL thanh toán VNPay đã được tạo: https://sandbox.vnpayment.vn/...
```

### 3. **So Sánh Với Payload Demo**
Đảm bảo các tham số khớp với payload demo:
- `vnp_Version`: 2.1.1 ✅
- `vnp_OrderType`: topup ✅
- `vnp_TmnCode`: CTTVNP01 ✅
- `vnp_Amount`: 1000000 (1,000,000 VND) ✅

## Các Bước Tiếp Theo

### 1. **Restart Application**
```bash
# Dừng ứng dụng Spring Boot
# Khởi động lại
mvn spring-boot:run
```

### 2. **Test Thanh Toán**
- Tạo thanh toán mới với số tiền nhỏ (10,000 VND)
- Kiểm tra logs để đảm bảo không có lỗi
- Theo dõi response từ VNPay

### 3. **Kiểm Tra Network**
- Đảm bảo có thể truy cập `https://sandbox.vnpayment.vn`
- Kiểm tra firewall và proxy settings

## Troubleshooting

### Nếu Vẫn Gặp Lỗi "Không Xác Định"

1. **Kiểm tra TMN Code và Hash Secret**
   - Đảm bảo khớp với tài khoản VNPay sandbox của bạn
   - Có thể cần tạo tài khoản mới trên VNPay sandbox

2. **Kiểm tra Endpoint**
   - Đảm bảo sử dụng đúng sandbox endpoint
   - Không sử dụng production endpoint với sandbox credentials

3. **Kiểm tra Amount Format**
   - VNPay yêu cầu amount tính bằng xu (x100)
   - 10,000 VND = 1,000,000 xu

4. **Kiểm tra Timezone**
   - Đảm bảo sử dụng timezone `Etc/GMT+7` (Việt Nam)
   - Format thời gian: `yyyyMMddHHmmss`

## Liên Hệ Hỗ Trợ

Nếu vẫn gặp vấn đề, hãy cung cấp:
1. Logs chi tiết từ console
2. Response từ VNPay (nếu có)
3. Screenshot lỗi từ VNPay
4. Thông tin tài khoản VNPay sandbox

## Kết Luận

Các thay đổi đã được thực hiện để đảm bảo:
- ✅ Version và OrderType khớp với chuẩn VNPay mới nhất
- ✅ Tham số được sắp xếp đúng thứ tự alphabet
- ✅ Hash generation sử dụng đúng encoding
- ✅ Cả hai service sử dụng cấu hình nhất quán

Hãy test lại và cho biết kết quả!
