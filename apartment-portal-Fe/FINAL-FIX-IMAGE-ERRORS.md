# Sửa hoàn toàn lỗi hình ảnh xe

## Vấn đề đã sửa

### 1. URL lồng nhau (Nested URLs)
- **Lỗi cũ**: `/api/image-proxy?url=/api/image-proxy?url=...`
- **Nguyên nhân**: Gọi `buildImageUrl()` nhiều lần trên cùng URL
- **Giải pháp**: Lưu URL đã proxy và sử dụng lại

### 2. Lỗi 500 khi click chi tiết ảnh
- **Lỗi cũ**: `❌ Image fetch failed: 500`
- **Nguyên nhân**: `onError` vẫn gọi `getImageSrc()` tạo URL lồng nhau
- **Giải pháp**: Sử dụng URL trực tiếp từ backend trong `onError`

### 3. Hàm `getImageSrc()` không cần thiết
- **Lỗi cũ**: Logic phức tạp với nhiều fallback
- **Giải pháp**: Xóa hàm, chỉ sử dụng `buildImageUrl()`

## Các thay đổi chính

### 1. Modal hình ảnh
```typescript
// Trước
onClick={() => window.open(buildImageUrl(imageUrl.trim()), '_blank')}

// Sau
const proxyUrl = buildImageUrl(imageUrl.trim());
onClick={() => window.open(proxyUrl, '_blank')}
```

### 2. Xử lý lỗi hình ảnh
```typescript
// Trước
img.src = getImageSrc(imageUrl.trim(), !isProxy, Date.now());

// Sau
const directUrl = imageUrl.trim().replace('10.0.3.2', 'localhost');
img.src = directUrl;
```

### 3. Validate URL
```typescript
// Trước
const tryList = [getImageSrc(rawUrl, true), getImageSrc(rawUrl, false)];

// Sau
const proxyUrl = buildImageUrl(rawUrl);
```

## Kết quả

- ✅ **Không còn URL lồng nhau**: URL sạch sẽ và hợp lệ
- ✅ **Không còn lỗi 500**: Console không còn lỗi
- ✅ **Click chi tiết ảnh hoạt động**: Mở đúng URL trong tab mới
- ✅ **Code đơn giản hơn**: Ít hàm, logic rõ ràng
- ✅ **Performance tốt hơn**: Ít request không cần thiết

## Test

1. Truy cập vehicle registration page
2. Click vào hình ảnh xe để mở modal
3. Click vào hình ảnh trong modal
4. Kiểm tra hình ảnh mở đúng trong tab mới
5. Kiểm tra console không còn lỗi
