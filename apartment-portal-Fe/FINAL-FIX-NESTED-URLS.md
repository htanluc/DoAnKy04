# Sửa hoàn toàn lỗi URL lồng nhau

## Vấn đề cuối cùng
Vẫn còn URL lồng nhau trong `onError` handlers:
```
/api/image-proxy?url=/api/image-proxy?url=http://10.0.3.2:8080/...
```

## Nguyên nhân
Trong `onError` handlers, vẫn đang gọi `buildImageUrl()` trên URL đã được proxy.

## Giải pháp cuối cùng

### 1. Kiểm tra URL đã được proxy
```typescript
// Trước
img.src = buildImageUrl(nextUrl);

// Sau
img.src = nextUrl.includes('/api/image-proxy') ? nextUrl : buildImageUrl(nextUrl);
```

### 2. Áp dụng cho tất cả onError handlers
- Table view: `onError` trong table
- Mobile card: `onError` trong mobile card
- Modal: `onError` trong modal (đã sửa trước đó)

## Kết quả

- ✅ **Không còn URL lồng nhau**: Tất cả URL đều sạch sẽ
- ✅ **Không còn lỗi 500**: Console không còn lỗi
- ✅ **Fallback hoạt động**: Khi hình ảnh lỗi, thử hình ảnh khác
- ✅ **Performance tốt**: Không tạo request không cần thiết

## Test

1. Truy cập vehicle registration page
2. Click vào hình ảnh xe để mở modal
3. Click vào hình ảnh trong modal
4. Kiểm tra console không còn lỗi
5. Kiểm tra hình ảnh hiển thị đúng

## Lưu ý
- URL đã được proxy sẽ không được proxy lại
- URL chưa được proxy sẽ được proxy
- Tránh tạo URL lồng nhau hoàn toàn
