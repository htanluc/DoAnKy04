# Sửa lỗi click vào chi tiết ảnh

## Vấn đề
Khi click vào hình ảnh trong modal để xem chi tiết, tạo ra URL lồng nhau không hợp lệ:
```
/api/image-proxy?url=/api/image-proxy?url=http://10.0.3.2:8080/...
```

## Nguyên nhân
- Hình ảnh đã được proxy qua `buildImageUrl()`
- Khi click, lại gọi `buildImageUrl()` một lần nữa
- Tạo ra URL lồng nhau và encode nhiều lần

## Giải pháp đã áp dụng

### 1. Lưu URL đã được proxy
```typescript
const proxyUrl = buildImageUrl(imageUrl.trim());
```

### 2. Sử dụng URL đã lưu cho cả src và onClick
```typescript
<img
  src={proxyUrl}
  onClick={() => window.open(proxyUrl, '_blank')}
/>
```

### 3. Tránh gọi buildImageUrl() nhiều lần
- Chỉ gọi một lần và lưu kết quả
- Sử dụng kết quả đã lưu cho tất cả mục đích

## Kết quả
- ✅ Click vào hình ảnh mở đúng URL
- ✅ Không còn URL lồng nhau
- ✅ Không còn lỗi 500 khi xem chi tiết
- ✅ Console sạch sẽ, không có lỗi

## Test
1. Truy cập vehicle registration page
2. Click vào hình ảnh xe
3. Click vào hình ảnh trong modal
4. Kiểm tra hình ảnh mở đúng trong tab mới
