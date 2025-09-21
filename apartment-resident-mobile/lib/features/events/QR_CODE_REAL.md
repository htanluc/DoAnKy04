# QR Code Thật Implementation

## Yêu cầu

Tạo QR code thật (hình ảnh QR code) thay vì chỉ hiển thị text để có thể scan và check-in thực sự.

## Giải pháp đã thực hiện

### 1. **Thêm Package `qr_flutter`**
```yaml
dependencies:
  qr_flutter: ^4.1.0  # Đã có sẵn trong pubspec.yaml
```

### 2. **Import Packages**
```dart
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
```

### 3. **Cập nhật QR Dialog với QR Code Thật**
```dart
Container(
  width: 200,
  height: 200,
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: Colors.grey[300]!),
  ),
  child: event.isQrCodeValid && event.qrCode != null
      ? Padding(
          padding: const EdgeInsets.all(16.0),
          child: QrImageView(
            data: event.qrCode!,
            version: QrVersions.auto,
            size: 168.0,
            backgroundColor: Colors.white,
            dataModuleStyle: const QrDataModuleStyle(
              dataModuleShape: QrDataModuleShape.square,
              color: Colors.black,
            ),
            eyeStyle: const QrEyeStyle(
              eyeShape: QrEyeShape.square,
              color: Colors.black,
            ),
          ),
        )
      : Column(
          // Hiển thị warning khi QR code không hợp lệ
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.red, size: 40),
            const SizedBox(height: 8),
            Text(
              event.qrCode == null 
                  ? 'QR code chưa được tạo'
                  : 'QR code đã hết hạn',
              style: TextStyle(
                color: Colors.red,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ],
        ),
),
```

### 4. **Thêm Chức năng Share QR Code**
```dart
void _shareQrCode(Event event) {
  if (event.qrCode == null) return;
  
  final shareText = '''
🎫 QR Code Check-in cho sự kiện: ${event.title}

📍 Địa điểm: ${event.location}
📅 Thời gian: ${DateFormat('dd/MM/yyyy HH:mm').format(event.startTime)} - ${DateFormat('HH:mm').format(event.endTime)}
⏰ Hết hạn QR: ${event.qrCodeExpiresAt != null ? DateFormat('dd/MM/yyyy HH:mm').format(event.qrCodeExpiresAt!) : 'Không xác định'}

🔗 Mã QR: ${event.qrCode}

Quét mã QR này để check-in vào sự kiện!
''';
  
  Share.share(shareText, subject: 'QR Code Check-in - ${event.title}');
}
```

### 5. **Cập nhật Nút Share**
```dart
Expanded(
  child: FilledButton.icon(
    onPressed: event.isQrCodeValid && event.qrCode != null
        ? () => _shareQrCode(event)
        : null,
    icon: const Icon(Icons.share),
    label: const Text('Chia sẻ'),
  ),
),
```

### 6. **Cải thiện UI Text**
```dart
Text(
  event.isQrCodeValid && event.qrCode != null
      ? 'Quét mã QR này để check-in vào sự kiện'
      : 'QR code không thể sử dụng để check-in',
  style: TextStyle(
    color: event.isQrCodeValid && event.qrCode != null
        ? Colors.grey[600]
        : Colors.red[600],
    fontSize: 14,
  ),
  textAlign: TextAlign.center,
),
```

## Tính năng mới

### ✅ **QR Code Thật**
- Hiển thị QR code hình ảnh thật thay vì text
- Có thể scan bằng camera để check-in
- Thiết kế đẹp với border và padding

### ✅ **Chức năng Share**
- Share QR code qua các ứng dụng khác
- Bao gồm thông tin sự kiện đầy đủ
- Format đẹp với emoji và thông tin chi tiết

### ✅ **UI/UX Cải thiện**
- Hiển thị warning rõ ràng khi QR code không hợp lệ
- Phân biệt "chưa được tạo" vs "đã hết hạn"
- Nút share chỉ active khi QR code hợp lệ

## QR Code Specifications

### **Data Format**
```
EVENT_1_5_1758482239367
```

**Cấu trúc**: `EVENT_{eventId}_{userId}_{timestamp}`

### **QR Code Properties**
- **Version**: Auto (tự động chọn version phù hợp)
- **Size**: 168x168 pixels
- **Background**: Trắng
- **Foreground**: Đen
- **Shape**: Square (hình vuông)
- **Error Correction**: Mặc định

## Test Case

### **Sự kiện "Tiệc Giáng sinh 2025"**:
- **Event ID**: 1
- **User ID**: 5
- **QR Code**: `EVENT_1_5_1758482239367`
- **Expires**: 24/12/2025 23:00

### **Kết quả mong đợi**:
1. ✅ Hiển thị QR code hình ảnh thật
2. ✅ Có thể scan QR code bằng camera
3. ✅ Nút "Chia sẻ" hoạt động và share thông tin đầy đủ
4. ✅ UI hiển thị đúng trạng thái (hợp lệ/hết hạn)

## Files đã thay đổi

1. **`apartment-resident-mobile/lib/features/events/ui/events_screen.dart`**
   - Thêm imports cho `qr_flutter` và `share_plus`
   - Cập nhật QR dialog với `QrImageView`
   - Thêm method `_shareQrCode`
   - Cải thiện UI logic và text

## Lưu ý

- QR code chỉ hiển thị khi `event.isQrCodeValid && event.qrCode != null`
- Nút share chỉ active khi QR code hợp lệ
- Share text bao gồm đầy đủ thông tin sự kiện
- QR code có thể được scan bằng bất kỳ QR scanner nào
- Thiết kế responsive và đẹp mắt

## Cách sử dụng

1. **Xem QR Code**: Tap "Xem QR" trên event card
2. **Scan QR Code**: Mở camera và scan QR code hiển thị
3. **Share QR Code**: Tap "Chia sẻ" để gửi QR code qua các app khác
4. **Check-in**: Staff scan QR code để check-in user vào sự kiện

Bây giờ bạn có QR code thật có thể scan để check-in! 🎯
