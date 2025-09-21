# API Debug Fix for Events

## Vấn đề

Lỗi "type 'Null' is not a subtype of type 'String' in type cast" khi lấy danh sách sự kiện từ API.

## So sánh Web vs Mobile

### React Web (hoạt động):
```javascript
// Direct fetch call
const res = await fetch('http://localhost:8080/api/events', {
  headers: token ? { 'Authorization': `Bearer ${token}` } : {},
});
const data = await res.json();
```

### Flutter Mobile (có vấn đề):
```dart
// Sử dụng ApiHelper với base URL khác
final response = await ApiHelper.get('/api/events');
// Base URL: http://10.0.3.2:8080 (Android emulator)
```

## Nguyên nhân có thể

1. **Base URL khác nhau**:
   - Web: `http://localhost:8080`
   - Mobile: `http://10.0.3.2:8080` (Android emulator)

2. **Authentication token** có thể không được gửi đúng cách

3. **JSON parsing** vẫn có vấn đề với null values

4. **Backend response format** có thể khác giữa authenticated và non-authenticated requests

## Giải pháp đã thực hiện

### 1. Thêm Debug Logging
```dart
Future<List<Event>> getEvents() async {
  try {
    print('[EventsApi] Fetching events from /api/events');
    final response = await ApiHelper.get('/api/events');
    print('[EventsApi] Response status: ${response.statusCode}');
    print('[EventsApi] Response body: ${response.body}');
    
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      print('[EventsApi] Parsed data length: ${data.length}');
      
      final List<Event> events = [];
      for (int i = 0; i < data.length; i++) {
        try {
          print('[EventsApi] Parsing event $i: ${data[i]}');
          final event = Event.fromJson(data[i]);
          events.add(event);
          print('[EventsApi] Successfully parsed event $i: ${event.title}');
        } catch (e) {
          print('[EventsApi] Error parsing event $i: $e');
          print('[EventsApi] Event data: ${data[i]}');
          rethrow;
        }
      }
      
      return events;
    } else {
      throw Exception('Failed to fetch events: ${response.statusCode} - ${response.body}');
    }
  } catch (e) {
    print('[EventsApi] Error in getEvents: $e');
    throw Exception('Failed to fetch events: $e');
  }
}
```

### 2. Cải thiện JSON Parsing với Null Safety
```dart
_$EventImpl _$$EventImplFromJson(Map<String, dynamic> json) => _$EventImpl(
  id: _idFromJson(json['id']),
  title: json['title'] as String? ?? '',
  description: json['description'] as String? ?? '',
  startTime: DateTime.parse(json['startTime'] as String? ?? DateTime.now().toIso8601String()),
  endTime: DateTime.parse(json['endTime'] as String? ?? DateTime.now().toIso8601String()),
  location: json['location'] as String? ?? '',
  createdAt: DateTime.parse(json['createdAt'] as String? ?? DateTime.now().toIso8601String()),
  participantCount: (json['participantCount'] as num?)?.toInt() ?? 0,
  registered: _registeredFromJson(json['isRegistered'] ?? json['registered']),
  qrCode: json['qrCode'] as String?,
  qrCodeExpiresAt: json['qrExpiresAt'] == null
      ? null
      : DateTime.parse(json['qrExpiresAt'] as String),
  checkedIn: json['checkedIn'] as bool?,
  checkedInAt: json['checkedInAt'] == null
      ? null
      : DateTime.parse(json['checkedInAt'] as String),
  registrationDeadline: json['registrationDeadline'] == null
      ? null
      : DateTime.parse(json['registrationDeadline'] as String),
  canRegister: json['canRegister'] as bool? ?? true,
);
```

### 3. Cải thiện Custom Converters
```dart
String _idFromJson(dynamic value) {
  if (value == null) return '0';
  if (value is String) return value;
  if (value is int) return value.toString();
  if (value is double) return value.toInt().toString();
  return value.toString();
}

bool _registeredFromJson(dynamic value) {
  if (value == null) return false;
  if (value is bool) return value;
  if (value is String) return value.toLowerCase() == 'true';
  if (value is int) return value != 0;
  return false;
}
```

## Các bước Debug tiếp theo

### 1. Kiểm tra Debug Logs
Khi chạy app, kiểm tra console logs để xem:
- API response status code
- API response body content
- JSON parsing errors (nếu có)

### 2. So sánh với Web
- Kiểm tra xem web có hoạt động không
- So sánh response format giữa web và mobile

### 3. Test API trực tiếp
```bash
# Test API endpoint trực tiếp
curl -X GET "http://10.0.3.2:8080/api/events" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Kiểm tra Authentication
- Đảm bảo token được lưu và gửi đúng cách
- Kiểm tra token có hợp lệ không

## Files đã thay đổi

1. **`apartment-resident-mobile/lib/features/events/data/events_api.dart`**
   - Thêm debug logging chi tiết
   - Cải thiện error handling

2. **`apartment-resident-mobile/lib/features/events/models/event.g.dart`**
   - Thêm null safety cho tất cả fields
   - Sử dụng fallback values

3. **`apartment-resident-mobile/lib/features/events/models/event.dart`**
   - Cải thiện custom converters để xử lý null values

## Kết quả mong đợi

Sau khi chạy app với debug logs, chúng ta sẽ thấy:
- API response status và body
- JSON parsing errors (nếu có)
- Từ đó có thể xác định chính xác nguyên nhân và sửa lỗi

## Lưu ý

- Debug logs sẽ giúp xác định chính xác vấn đề
- Có thể cần điều chỉnh base URL hoặc authentication
- Có thể cần sửa backend response format để tương thích với mobile
