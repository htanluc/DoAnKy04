# Hướng dẫn VNPay theo chuẩn mới nhất

## Các thay đổi đã thực hiện

### 1. Sửa đổi VNPayGateway.java
- ✅ Sử dụng `TreeMap` để đảm bảo thứ tự tham số theo alphabet
- ✅ IP Address: Sử dụng `0.0.0.0` thay vì `127.0.0.1`
- ✅ Thời gian hết hạn: Tăng từ 15 phút lên 30 phút
- ✅ Loại bỏ dấu tiếng Việt trong `OrderInfo`
- ✅ Sử dụng dấu `|` làm separator cho hash data (theo chuẩn VNPay)

### 2. Thứ tự tham số VNPay (theo alphabet)
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

### 3. Cách test
```bash
# Chạy file batch
test-vnpay-standard.bat

# Hoặc chạy trực tiếp
javac VNPayStandardTest.java
java VNPayStandardTest
```

### 4. Các vấn đề đã khắc phục
- ❌ Thứ tự tham số không đúng → ✅ Sử dụng TreeMap
- ❌ IP localhost bị từ chối → ✅ Sử dụng 0.0.0.0
- ❌ Thời gian hết hạn quá ngắn → ✅ Tăng lên 30 phút
- ❌ OrderInfo có dấu tiếng Việt → ✅ Loại bỏ dấu
- ❌ Hash data sai separator → ✅ Sử dụng dấu |

## Bước tiếp theo
1. Khởi động lại Spring Boot backend
2. Chạy test để kiểm tra
3. Test tạo giao dịch thanh toán mới

