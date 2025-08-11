# Hướng dẫn khắc phục lỗi VNPay Integration

## Vấn đề đã được khắc phục

### 1. Cập nhật VNPayGateway.java
- **Version**: Thay đổi từ `2.1.0` thành `2.1.1` (chuẩn VNPay mới nhất)
- **OrderType**: Thay đổi từ `other` thành `topup` (theo payload mẫu)
- **Thứ tự tham số**: Sử dụng `TreeMap` để đảm bảo thứ tự alphabet chính xác
- **Cải thiện logging**: Thêm log chi tiết để debug

### 2. Cập nhật application.properties
- **TMN Code**: Thay đổi từ `XHXOSV1S` thành `CTTVNP01` (theo payload mẫu)

### 3. Tạo file test
- **VNPayTest.java**: File test để kiểm tra việc tạo hash
- **test-vnpay.bat**: Script để chạy test

## Các thay đổi chính

### Trong VNPayGateway.java:
```java
// Cập nhật version
String vnp_Version = "2.1.1";

// Cập nhật OrderType
String vnp_OrderType = "topup";

// Sử dụng TreeMap để tự động sắp xếp theo alphabet
Map<String, String> vnp_Params = new TreeMap<>();

// Thứ tự tham số theo chuẩn VNPay
vnp_Params.put("vnp_Amount", vnp_Amount);
vnp_Params.put("vnp_Command", vnp_Command);
vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
vnp_Params.put("vnp_Locale", vnp_Locale);
vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
vnp_Params.put("vnp_OrderType", vnp_OrderType);
vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
vnp_Params.put("vnp_Version", vnp_Version);
```

## Cách test

### 1. Chạy test tự động:
```bash
cd apartment-portal-BE
test-vnpay.bat
```

### 2. Chạy test thủ công:
```bash
cd apartment-portal-BE
javac -cp ".;lib/*" src/main/java/com/mytech/apartment/portal/services/gateways/VNPayTest.java
java -cp ".;src/main/java" com.mytech.apartment.portal.services.gateways.VNPayTest
```

## Kiểm tra kết quả

Test sẽ so sánh hash được tạo với hash từ payload mẫu VNPay:
- ✅ **Hash khớp**: VNPay integration hoạt động chính xác
- ❌ **Hash không khớp**: Cần kiểm tra lại logic

## Các điểm quan trọng

### 1. Thứ tự tham số
VNPay yêu cầu thứ tự tham số theo alphabet:
```
vnp_Amount
vnp_Command
vnp_CreateDate
vnp_CurrCode
vnp_ExpireDate
vnp_IpAddr
vnp_Locale
vnp_OrderInfo
vnp_OrderType
vnp_ReturnUrl
vnp_TmnCode
vnp_TxnRef
vnp_Version
```

### 2. Format hash data
Chuỗi hash data phải có format: `key=value|key=value`
```
vnp_Amount=1000000|vnp_Command=pay|vnp_CreateDate=20250811013138|...
```

### 3. Thông số cấu hình
- **Endpoint**: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- **TMN Code**: `CTTVNP01`
- **Hash Secret**: `EVBR12NW84MVQJ4HW1OD1V2IMYHHNRPY`

## Troubleshooting

### Nếu hash vẫn không khớp:
1. Kiểm tra thứ tự tham số
2. Kiểm tra giá trị hash secret
3. Kiểm tra encoding (UTF-8)
4. Kiểm tra format thời gian (yyyyMMddHHmmss)

### Nếu gặp lỗi compile:
1. Kiểm tra Java version (>= 8)
2. Kiểm tra classpath
3. Kiểm tra dependencies

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, hãy:
1. Chạy test và gửi log
2. Kiểm tra cấu hình VNPay
3. So sánh với payload mẫu từ VNPay demo
