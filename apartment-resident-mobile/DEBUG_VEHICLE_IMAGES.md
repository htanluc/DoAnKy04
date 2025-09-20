# Debug Vấn đề Hiển thị Hình ảnh Xe máy

## Vấn đề
Sau khi sửa để có thể xem hình ảnh xe máy thì không hoạt động bình thường như lúc đầu nữa.

## Nguyên nhân có thể
1. **URL hình ảnh không được normalize** - Hình ảnh từ API có thể là relative path hoặc localhost URL
2. **API timeout** - Các API calls đang bị timeout (thấy trong log: `TimeoutException after 0:00:10.000000`)
3. **Network connectivity** - Emulator không thể kết nối đến backend

## Giải pháp đã áp dụng

### 1. Normalize URL hình ảnh
- ✅ Thêm `ApiService.normalizeFileUrl()` cho tất cả URL hình ảnh
- ✅ Sửa `VehicleCard` để normalize URL khi hiển thị
- ✅ Sửa `VehicleImageViewer` để normalize URL khi xem fullscreen

### 2. Cải thiện error handling
- ✅ Thêm error builder cho `Image.network`
- ✅ Hiển thị icon lỗi khi không load được ảnh

## Cách kiểm tra

### 1. Kiểm tra URL hình ảnh
Thêm debug log để xem URL trước và sau khi normalize:
```dart
print('Original URL: ${v.imageUrls[index]}');
print('Normalized URL: ${ApiService.normalizeFileUrl(v.imageUrls[index])}');
```

### 2. Kiểm tra API connectivity
```bash
# Test API từ emulator
adb shell
curl http://10.0.2.2:8080/api/vehicles/my
```

### 3. Kiểm tra hình ảnh trực tiếp
```bash
# Test load hình ảnh
curl -I http://10.0.2.2:8080/uploads/vehicle-images/example.jpg
```

## Debug steps

1. **Chạy ứng dụng và vào màn hình "Xe của tôi"**
2. **Kiểm tra console logs** - Xem có log `[Dashboard] Stats API error:` không
3. **Kiểm tra hình ảnh** - Xem có hiển thị icon broken_image không
4. **Test navigation** - Nhấn vào hình ảnh để mở fullscreen viewer

## Cấu hình API

API base URL: `http://10.0.2.2:8080` (cho Android emulator)

Nếu backend chạy trên port khác, cập nhật trong `app_config.dart`:
```dart
defaultValue: 'http://10.0.2.2:YOUR_PORT',
```

## Troubleshooting

### Nếu hình ảnh không hiển thị:
1. Kiểm tra backend có chạy không
2. Kiểm tra URL hình ảnh có đúng không
3. Kiểm tra network connectivity
4. Xem console logs để debug

### Nếu ứng dụng bị kẹt loading:
1. Đã sửa AuthGate với timeout
2. Đã sửa Dashboard với fallback UI
3. Navigation cards luôn hiển thị ngay cả khi API lỗi

## Test cases

1. **Không có internet** - Ứng dụng vẫn hiển thị UI cơ bản
2. **Backend down** - Hiển thị error message và nút retry
3. **Hình ảnh lỗi** - Hiển thị icon broken_image
4. **API timeout** - Hiển thị fallback data



