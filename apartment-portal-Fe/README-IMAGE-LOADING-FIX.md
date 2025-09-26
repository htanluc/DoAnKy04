# Sửa lỗi load hình ảnh xe - Chỉ hoạt động trên localhost

## Vấn đề
Hình ảnh xe chỉ hiển thị được khi sử dụng localhost, không hoạt động trên các môi trường khác (production, staging, etc.).

## Nguyên nhân
- API_BASE_URL được hardcode là `http://localhost:8080` trong code
- Image proxy không xử lý URL động
- Không có cấu hình environment variables

## Giải pháp đã triển khai

### 1. Tạo file cấu hình động (`lib/config.ts`)
- Quản lý API_BASE_URL thông qua environment variables
- Cung cấp helper functions để build image URL
- Hỗ trợ fallback về localhost nếu không có cấu hình

### 2. Cập nhật các file liên quan
- `lib/auth.ts`: Sử dụng config động
- `lib/api.ts`: Sử dụng config động  
- `app/api/image-proxy/route.ts`: Xử lý URL động và cải thiện logging
- `app/admin-dashboard/vehicle-registrations/pending-cars/page.tsx`: Sử dụng helper functions

### 3. Tạo file cấu hình mẫu (`env.example`)
- Hướng dẫn cấu hình cho các môi trường khác nhau
- Ví dụ cho development, production, staging

## Cách sử dụng

### 1. Cấu hình Environment Variables
Tạo file `.env.local` (hoặc `.env`) với nội dung:

```bash
# Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Production (thay đổi theo domain thực tế)
# NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# Staging
# NEXT_PUBLIC_API_BASE_URL=https://staging-api.yourdomain.com
```

### 2. Sử dụng Helper Functions
```typescript
import { buildImageUrlWithToken, buildImageUrl } from '@/lib/config';

// Tự động lấy token từ localStorage
const imageUrl = buildImageUrlWithToken('/api/files/vehicles/image.jpg');

// Hoặc truyền token thủ công
const imageUrl = buildImageUrl('/api/files/vehicles/image.jpg', 'your-token');
```

### 3. Test hình ảnh
Truy cập `/test-image` để kiểm tra việc load hình ảnh với các cấu hình khác nhau.

## Các tính năng mới

### 1. Image Proxy cải tiến
- Xử lý URL động (relative và absolute)
- Logging chi tiết để debug
- Cache headers để tối ưu performance
- CORS headers để tránh lỗi cross-origin

### 2. Helper Functions
- `buildImageUrl(rawUrl, token?)`: Build URL với token tùy chọn
- `buildImageUrlWithToken(rawUrl)`: Build URL với token tự động
- Hỗ trợ cả relative và absolute URLs

### 3. Environment Configuration
- `NEXT_PUBLIC_API_BASE_URL`: URL backend
- `NEXT_PUBLIC_IMAGE_PROXY_ENABLED`: Bật/tắt image proxy
- `NEXT_PUBLIC_APP_NAME`: Tên ứng dụng
- `NEXT_PUBLIC_APP_VERSION`: Phiên bản ứng dụng

## Troubleshooting

### 1. Hình ảnh vẫn không load
- Kiểm tra console để xem lỗi
- Xác nhận API_BASE_URL đúng
- Kiểm tra backend có chạy không
- Xác nhận CORS được cấu hình đúng

### 2. Lỗi CORS
- Đảm bảo backend có cấu hình CORS cho frontend domain
- Kiểm tra headers trong image-proxy

### 3. Token không hợp lệ
- Kiểm tra token trong localStorage
- Xác nhận token chưa hết hạn
- Test với API trực tiếp

## Files đã thay đổi
- `lib/config.ts` (mới)
- `lib/auth.ts`
- `lib/api.ts`
- `app/api/image-proxy/route.ts`
- `app/admin-dashboard/vehicle-registrations/pending-cars/page.tsx`
- `app/test-image/page.tsx`
- `env.example` (mới)

## Lưu ý
- Cần restart development server sau khi thay đổi environment variables
- Trong production, đảm bảo environment variables được set đúng
- Test kỹ trên các môi trường khác nhau trước khi deploy
