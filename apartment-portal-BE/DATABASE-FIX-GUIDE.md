# 🚨 HƯỚNG DẪN SỬA DATABASE

## Vấn đề
Database vẫn có cột `opening_schedule` là `JSON` thay vì `LONGTEXT`, gây ra lỗi "Data truncation: Data too long for column".

## Giải pháp

### Bước 1: Chạy SQL để sửa database
```sql
USE apartment_portal;
ALTER TABLE facilities MODIFY COLUMN opening_schedule LONGTEXT NULL;
```

### Bước 2: Hoặc chạy file SQL
```bash
mysql -u root -p < fix-database.sql
```

### Bước 3: Sau khi sửa database
1. Khôi phục lại `openingSchedule` trong `DataInitializer.java`
2. Restart backend
3. Backend sẽ có lịch mở cửa theo tuần

## Trạng thái hiện tại
- ✅ Backend đang chạy với `openingSchedule = null`
- ⏳ Cần sửa database để có lịch mở cửa theo tuần
- ✅ Thanh toán OVERDUE hoạt động
- ✅ Flutter app đã sửa lỗi

## Lý do lỗi
- File `complete-schema.sql` đã có `LONGTEXT` nhưng database hiện tại chưa được cập nhật
- Cần chạy lệnh `ALTER TABLE` để cập nhật cột trong database đang chạy
