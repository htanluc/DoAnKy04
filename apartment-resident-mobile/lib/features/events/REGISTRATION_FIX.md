# Event Registration Fix

## Vấn đề

Đăng ký sự kiện thông báo thành công nhưng báo lỗi 400 từ backend.

## Nguyên nhân

Từ backend logs:
```
Cannot construct instance of `com.mytech.apartment.portal.dtos.EventRegistrationRequest` (although at least one Creator exists): no String-argument constructor/factory method to deserialize from String value ('{"eventId":"1"}')
```

**Vấn đề**: Flutter đang gửi JSON string thay vì object, gây ra lỗi deserialization ở backend.

### Trước khi sửa:
```dart
// ❌ Double encoding - gửi JSON string
data: jsonEncode({'eventId': eventId})
```

Backend nhận được:
```
'{"eventId":"1"}'  // String thay vì object
```

### Sau khi sửa:
```dart
// ✅ Gửi object - ApiHelper sẽ tự động jsonEncode
data: {'eventId': int.parse(eventId)}
```

Backend nhận được:
```json
{"eventId": 1}  // Object đúng format
```

## Giải pháp đã thực hiện

### 1. Sửa Event Registration
```dart
Future<void> registerEvent(String eventId) async {
  try {
    print('[EventsApi] Registering for event: $eventId');
    final response = await ApiHelper.post(
      '/api/event-registrations/register',
      data: {'eventId': int.parse(eventId)}, // ✅ Gửi object, không phải JSON string
    );
    print('[EventsApi] Registration response status: ${response.statusCode}');
    print('[EventsApi] Registration response body: ${response.body}');
    
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to register for event: ${response.statusCode} - ${response.body}');
    }
  } catch (e) {
    print('[EventsApi] Registration error: $e');
    throw Exception('Failed to register for event: $e');
  }
}
```

### 2. Sửa QR Code Check-in
```dart
Future<Map<String, dynamic>> checkInWithQrCode(String qrCode) async {
  try {
    print('[EventsApi] Check-in with QR code: $qrCode');
    final response = await ApiHelper.post(
      '/api/event-registrations/check-in',
      data: {'qrCode': qrCode}, // ✅ Gửi object, không phải JSON string
    );
    print('[EventsApi] Check-in response status: ${response.statusCode}');
    print('[EventsApi] Check-in response body: ${response.body}');
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to check-in: ${response.statusCode} - ${response.body}');
    }
  } catch (e) {
    print('[EventsApi] Check-in error: $e');
    throw Exception('Failed to check-in: $e');
  }
}
```

### 3. Thêm Debug Logging
- Thêm debug logs để track registration process
- Log request data, response status, và response body
- Giúp debug các vấn đề tương tự trong tương lai

## Cách ApiHelper hoạt động

```dart
// ApiHelper.post method
static Future<http.Response> post(
  String path, {
  dynamic data,  // Nhận object hoặc string
  Map<String, dynamic>? query,
}) async {
  final headers = await _getAuthHeaders();
  final uri = Uri.parse('${ApiService.baseUrl}$path');
  
  return http.post(
    uri,
    headers: headers,
    body: data != null ? jsonEncode(data) : null, // ✅ Tự động jsonEncode nếu data là object
  );
}
```

**Lưu ý quan trọng**: `ApiHelper.post` sẽ tự động `jsonEncode(data)` nếu `data` là object, vì vậy:
- ✅ **Đúng**: `data: {'eventId': 1}` → `jsonEncode({'eventId': 1})` → `'{"eventId":1}'`
- ❌ **Sai**: `data: jsonEncode({'eventId': 1})` → `jsonEncode('{"eventId":1}')` → `'"{\\"eventId\\":1}"'`

## Kết quả mong đợi

Sau khi sửa:
1. **Registration request** sẽ gửi đúng format object
2. **Backend** sẽ deserialize thành công `EventRegistrationRequest`
3. **Registration** sẽ thành công với status 200/201
4. **UI** sẽ hiển thị thông báo thành công thay vì lỗi

## Files đã thay đổi

1. **`apartment-resident-mobile/lib/features/events/data/events_api.dart`**
   - Sửa `registerEvent()` method để gửi object thay vì JSON string
   - Sửa `checkInWithQrCode()` method tương tự
   - Thêm debug logging chi tiết

## Testing

### Các bước test:
1. ✅ Mở app và đăng nhập
2. ✅ Vào dashboard → Tap "Sự kiện"
3. ✅ Tap "Đăng ký tham gia" cho một sự kiện
4. ✅ Kiểm tra debug logs trong console
5. ✅ Kiểm tra thông báo thành công thay vì lỗi

### Debug logs mong đợi:
```
[EventsApi] Registering for event: 1
[EventsApi] Registration response status: 200
[EventsApi] Registration response body: {"success": true, "message": "Registration successful"}
```

## Lưu ý

- Luôn gửi object thay vì JSON string khi sử dụng `ApiHelper.post`
- `ApiHelper` sẽ tự động xử lý JSON encoding
- Debug logs giúp track request/response để debug các vấn đề tương tự
- Kiểm tra backend logs để xác nhận request format đúng
