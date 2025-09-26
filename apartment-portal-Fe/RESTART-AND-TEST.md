# Hướng dẫn restart và test

## Bước 1: Restart Development Server
```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại:
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

## Bước 2: Kiểm tra cấu hình
1. Mở file `env.local` (đã tạo)
2. Xác nhận `NEXT_PUBLIC_API_BASE_URL=http://10.0.3.2:8080`

## Bước 3: Test hình ảnh
1. Truy cập `/test-image`
2. Click "Direct backend URL (10.0.3.2)"
3. Kiểm tra console để xem log

## Bước 4: Kiểm tra vehicle registration
1. Truy cập `/admin-dashboard/vehicle-registrations/pending-cars`
2. Xem hình ảnh xe có hiển thị placeholder không

## Kết quả mong đợi
- ✅ Hình ảnh hiển thị placeholder đẹp thay vì "Lỗi tải ảnh"
- ✅ Console không còn lỗi timeout liên tục
- ✅ UI responsive và user-friendly

## Nếu vẫn lỗi
1. Kiểm tra backend có chạy trên `10.0.3.2:8080` không
2. Test ping: `ping 10.0.3.2`
3. Kiểm tra firewall/network
