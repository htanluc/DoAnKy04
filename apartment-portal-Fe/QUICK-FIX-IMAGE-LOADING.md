# Sửa nhanh lỗi hình ảnh xe không hiển thị

## Vấn đề
Hình ảnh xe hiển thị URL trực tiếp `http://10.0.3.2:8080/...` thay vì qua image proxy, gây ra lỗi CORS.

## Giải pháp đã áp dụng

### 1. Cập nhật `lib/config.ts`
- Luôn sử dụng image proxy cho tất cả URL
- Loại bỏ logic trả về URL trực tiếp

### 2. Cập nhật vehicle registration component
- Sử dụng `buildImageUrl()` thay vì `getImageSrc()`
- Đảm bảo tất cả hình ảnh đều qua proxy

### 3. Test với URL thực tế
- Cập nhật test page với URL `10.0.3.2:8080`
- Thêm button test cho URL thực tế

## Cách test

1. **Truy cập `/test-image`**
2. **Click "Direct backend URL (10.0.3.2)"**
3. **Kiểm tra hình ảnh hiển thị qua proxy**

## Kết quả mong đợi

- ✅ Hình ảnh hiển thị qua `/api/image-proxy?url=...`
- ✅ Không còn lỗi CORS
- ✅ Hoạt động trên mọi môi trường

## Files đã thay đổi
- `lib/config.ts` - Luôn sử dụng image proxy
- `app/admin-dashboard/vehicle-registrations/pending-cars/page.tsx` - Sử dụng buildImageUrl()
- `app/test-image/page.tsx` - Test với URL thực tế
