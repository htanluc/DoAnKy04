# Sửa lỗi Mobile IP (10.0.3.2)

## Vấn đề
Backend trả về URL với IP mobile `10.0.3.2:8080` thay vì `localhost:8080`, gây ra lỗi kết nối.

## Giải pháp đã áp dụng

### 1. Cập nhật cấu hình (`env.local`)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 2. Cập nhật image proxy (`app/api/image-proxy/route.ts`)
- Tự động convert `10.0.3.2` thành `localhost`
- Log rõ ràng khi convert URL

### 3. Cập nhật test page
- Thêm button test cho mobile IP
- Hiển thị rõ ràng việc convert URL

## Cách test

1. **Restart server**:
   ```bash
   # Dừng server (Ctrl+C) và chạy lại
   npm run dev
   ```

2. **Test tại `/test-image`**:
   - Click "Mobile IP URL" để test convert
   - Kiểm tra console log

3. **Kiểm tra vehicle registration**:
   - Hình ảnh sẽ hiển thị placeholder đẹp
   - Console sẽ log việc convert URL

## Kết quả mong đợi

- ✅ URL `10.0.3.2:8080` được convert thành `localhost:8080`
- ✅ Hình ảnh load được từ backend localhost
- ✅ Console log rõ ràng quá trình convert
- ✅ UI hiển thị placeholder đẹp khi lỗi

## Lưu ý
- Backend phải chạy trên `localhost:8080`
- Mobile app sẽ vẫn sử dụng `10.0.3.2` (bình thường)
- Frontend web sẽ tự động convert sang `localhost`
