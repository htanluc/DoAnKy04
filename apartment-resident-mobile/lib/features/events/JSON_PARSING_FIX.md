# JSON Parsing Fix for Events

## Vấn đề

Lỗi "type 'int' is not a subtype of type 'String' in type cast" khi lấy danh sách sự kiện từ API.

## Nguyên nhân

Backend trả về JSON với các kiểu dữ liệu khác với những gì Flutter model đang expect:

### Backend JSON Response:
```json
{
  "id": 123,                    // Long (số nguyên)
  "isRegistered": true,         // boolean
  "participantCount": 5,        // int
  "qrExpiresAt": "2025-01-01T10:00:00"  // String
}
```

### Flutter Model (trước khi sửa):
```dart
// Đang cast tất cả thành String
id: json['id'] as String,                    // ❌ Lỗi: id là int
registered: json['registered'] as bool,      // ❌ Lỗi: field name là 'isRegistered'
qrCodeExpiresAt: json['qrCodeExpiresAt']     // ❌ Lỗi: field name là 'qrExpiresAt'
```

## Giải pháp

### 1. Thêm Custom JSON Converters

```dart
// Custom JSON converters
String _idFromJson(dynamic value) {
  if (value is String) return value;
  if (value is int) return value.toString();
  if (value is double) return value.toInt().toString();
  return value.toString();
}

bool _registeredFromJson(dynamic value) {
  if (value is bool) return value;
  if (value is String) return value.toLowerCase() == 'true';
  if (value is int) return value != 0;
  return false;
}
```

### 2. Sửa Generated JSON Parsing

```dart
_$EventImpl _$$EventImplFromJson(Map<String, dynamic> json) => _$EventImpl(
  id: _idFromJson(json['id']),                                    // ✅ Xử lý cả int và String
  registered: _registeredFromJson(json['isRegistered'] ?? json['registered']), // ✅ Xử lý cả field names
  qrCodeExpiresAt: json['qrExpiresAt'] == null                    // ✅ Đúng field name
      ? null
      : DateTime.parse(json['qrExpiresAt'] as String),
  // ... other fields
);
```

## Mapping Backend ↔ Flutter

| Backend Field | Backend Type | Flutter Field | Flutter Type | Converter |
|---------------|--------------|---------------|--------------|-----------|
| `id` | `Long` | `id` | `String` | `_idFromJson()` |
| `isRegistered` | `boolean` | `registered` | `bool` | `_registeredFromJson()` |
| `participantCount` | `int` | `participantCount` | `int` | `(json['participantCount'] as num).toInt()` |
| `qrExpiresAt` | `String` | `qrCodeExpiresAt` | `DateTime?` | `DateTime.parse()` |
| `qrCode` | `String` | `qrCode` | `String?` | Direct cast |
| `checkedIn` | `Boolean` | `checkedIn` | `bool?` | Direct cast |
| `checkedInAt` | `String` | `checkedInAt` | `DateTime?` | `DateTime.parse()` |

## Files đã thay đổi

1. **`apartment-resident-mobile/lib/features/events/models/event.dart`**
   - Thêm custom JSON converters
   - Loại bỏ JsonKey annotations gây lỗi

2. **`apartment-resident-mobile/lib/features/events/models/event.g.dart`**
   - Sửa generated JSON parsing để sử dụng custom converters
   - Xử lý field name mapping (`isRegistered` → `registered`, `qrExpiresAt` → `qrCodeExpiresAt`)

## Kết quả

✅ **Lỗi JSON parsing đã được sửa**
- App có thể parse thành công JSON response từ backend
- Xử lý được cả kiểu dữ liệu `int` và `String` cho `id`
- Xử lý được cả field names `isRegistered` và `registered`
- Xử lý được field name `qrExpiresAt` thay vì `qrCodeExpiresAt`

✅ **App chạy ổn định**
- Không có compilation errors
- Chỉ có linter warnings (không ảnh hưởng chức năng)

## Testing

### Các bước test:
1. ✅ Mở app và đăng nhập
2. ✅ Vào dashboard → Tap "Sự kiện"
3. ✅ Kiểm tra danh sách sự kiện load thành công
4. ✅ Kiểm tra không còn lỗi "type 'int' is not a subtype of type 'String'"

### Kết quả mong đợi:
- Danh sách sự kiện hiển thị bình thường
- Không có lỗi JSON parsing
- Tất cả thông tin sự kiện (id, title, description, etc.) hiển thị đúng

## Lưu ý

- Custom converters được thiết kế để xử lý nhiều kiểu dữ liệu khác nhau
- Fallback values được đặt để tránh null pointer exceptions
- Field name mapping được xử lý để tương thích với cả backend cũ và mới
