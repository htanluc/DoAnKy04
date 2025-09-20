# 🔧 DEBUG: GIÁ VÀ THỜI GIAN HOẠT ĐỘNG TIỆN ÍCH

## 🚨 VẤN ĐỀ

Tiện ích hiển thị giá "$ 0 đ" và không có thời gian hoạt động.

## ✅ ĐÃ SỬA

1. **API Client Mapping** - Sửa lỗi mapping dữ liệu từ database
2. **Debug Logs** - Thêm console logs để kiểm tra dữ liệu
3. **Fallback Data** - Cập nhật dữ liệu mẫu với giá và thời gian đúng

## 🔍 CÁCH KIỂM TRA

### 1. **Mở Developer Console**
```bash
# Chạy ứng dụng
npm run dev

# Mở trang Đặt tiện ích
# Mở Developer Tools (F12) và xem Console
```

### 2. **Kiểm tra Debug Logs**
Bạn sẽ thấy các log sau trong console:
```
Raw facility data: {id: 1, name: "Phòng Gym Premium", usage_fee: 80000, ...}
Facilities Data: [{id: "1", name: "Phòng Gym Premium", usageFee: 80000, ...}]
First facility usageFee: 80000
First facility openingHours: "06:00 - 22:00"
```

### 3. **Kiểm tra Dữ liệu Database**
Nếu API không hoạt động, hệ thống sẽ hiển thị fallback data:
- Phòng Gym Premium: 80,000 VND (06:00 - 22:00)
- Hồ bơi Olympic: 120,000 VND (05:00 - 21:00)
- Sân tennis: 100,000 VND (06:00 - 22:00)
- Sân bóng rổ: 60,000 VND (06:00 - 22:00)
- Phòng sinh hoạt cộng đồng: 30,000 VND (08:00 - 22:00)
- Phòng họp đa năng: 50,000 VND (08:00 - 20:00)

## 🛠️ TROUBLESHOOTING

### Nếu vẫn hiển thị "$ 0 đ":

1. **Kiểm tra API Response**
   - Mở Network tab trong Developer Tools
   - Tìm request đến `/api/facilities`
   - Kiểm tra response data có `usage_fee` không

2. **Kiểm tra Database**
   - Đảm bảo bảng `facilities` có cột `usage_fee`
   - Kiểm tra dữ liệu: `SELECT id, name, usage_fee, opening_hours FROM facilities;`

3. **Kiểm tra Mapping**
   - Xem console logs để kiểm tra dữ liệu raw
   - Kiểm tra xem `facility.usage_fee` có giá trị không

### Nếu không có thời gian hoạt động:

1. **Kiểm tra Database**
   - Đảm bảo bảng `facilities` có cột `opening_hours`
   - Kiểm tra dữ liệu: `SELECT id, name, opening_hours FROM facilities;`

2. **Kiểm tra Mapping**
   - Xem console logs để kiểm tra `facility.opening_hours`
   - Kiểm tra xem có fallback về `facility.openingHours` không

## 📊 DỮ LIỆU MONG ĐỢI

### Database Format:
```sql
SELECT id, name, usage_fee, opening_hours FROM facilities;
-- Kết quả:
-- 1 | Phòng Gym Premium | 80000 | 06:00 - 22:00
-- 2 | Hồ bơi Olympic | 120000 | 05:00 - 21:00
-- 3 | Sân tennis chuyên nghiệp | 100000 | 06:00 - 22:00
-- ...
```

### Frontend Format:
```typescript
interface Facility {
  id: string
  name: string
  usageFee: number  // ← Mapped từ usage_fee
  openingHours: string  // ← Mapped từ opening_hours
  // ... other fields
}
```

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi sửa, mỗi tiện ích sẽ hiển thị:
- ✅ **Giá đúng** (ví dụ: 80,000 VND thay vì 0 VND)
- ✅ **Thời gian hoạt động** (ví dụ: 06:00 - 22:00)
- ✅ **Thông tin đầy đủ** cho mỗi tiện ích

## 🚀 BƯỚC TIẾP THEO

1. **Test API**: Kiểm tra API `/api/facilities` hoạt động
2. **Kiểm tra Database**: Đảm bảo có dữ liệu `usage_fee` và `opening_hours`
3. **Test Frontend**: Refresh trang và kiểm tra console logs
4. **Report Issues**: Nếu vẫn có vấn đề, gửi console logs và database data

---

**Lưu ý**: Nếu backend API trả về format khác, có thể cần điều chỉnh mapping logic trong `api-client.ts`.
