# QR Code Logic Fix

## Vấn đề

QR code được tạo thành công sau khi đăng ký sự kiện, nhưng UI hiển thị "QR code đã hết hạn" và không hiển thị QR code.

## Nguyên nhân

### 1. Logic `isQrCodeValid` không đúng
```dart
// ❌ Logic cũ - QR code chỉ hợp lệ từ 1 giờ trước khi event bắt đầu
bool get isQrCodeValid {
  if (qrCode == null || qrCodeExpiresAt == null) {
    return false;
  }

  final now = DateTime.now();
  return now.isBefore(qrCodeExpiresAt!) &&
      now.isAfter(startTime.subtract(const Duration(hours: 1))) &&  // ❌ Vấn đề ở đây
      now.isBefore(endTime.add(const Duration(hours: 1)));
}
```

**Vấn đề**: Sự kiện "Tiệc Giáng sinh 2025" bắt đầu lúc `2025-12-24 18:00:00`, nhưng hiện tại là `2025-09-22`. Logic cũ yêu cầu QR code chỉ hợp lệ từ 1 giờ trước khi event bắt đầu (`2025-12-24 17:00:00`), nên QR code hiện tại bị coi là hết hạn.

### 2. UI không hiển thị QR code khi hợp lệ
QR dialog luôn hiển thị text thay vì kiểm tra trạng thái hợp lệ.

## Giải pháp đã thực hiện

### 1. **Sửa Logic `isQrCodeValid`**
```dart
// ✅ Logic mới - QR code hợp lệ ngay sau khi đăng ký
bool get isQrCodeValid {
  if (qrCode == null || qrCodeExpiresAt == null) {
    return false;
  }

  final now = DateTime.now();
  // QR code is valid if:
  // 1. Not expired yet (before qrExpiresAt)
  // 2. Event hasn't ended yet (before endTime + 1 hour grace period)
  return now.isBefore(qrCodeExpiresAt!) &&
      now.isBefore(endTime.add(const Duration(hours: 1)));
}
```

**Thay đổi**:
- ✅ Loại bỏ điều kiện `now.isAfter(startTime.subtract(const Duration(hours: 1)))`
- ✅ QR code hợp lệ ngay sau khi đăng ký và chỉ hết hạn khi:
  - Quá `qrExpiresAt` (thời gian hết hạn được set bởi backend)
  - Hoặc event đã kết thúc + 1 giờ grace period

### 2. **Cải thiện QR Dialog UI**
```dart
Container(
  width: 200,
  height: 200,
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: Colors.grey[300]!),
  ),
  child: event.isQrCodeValid
      ? Center(
          child: Text(
            event.qrCode ?? 'QR Code không có sẵn',
            style: const TextStyle(
              fontSize: 10,
              fontFamily: 'monospace',
            ),
            textAlign: TextAlign.center,
          ),
        )
      : Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.warning_amber_rounded,
              color: Colors.red,
              size: 40,
            ),
            const SizedBox(height: 8),
            Text(
              'QR code đã hết hạn',
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

**Thay đổi**:
- ✅ Hiển thị QR code text khi `event.isQrCodeValid = true`
- ✅ Hiển thị warning icon và message khi QR code hết hạn
- ✅ Text hướng dẫn thay đổi dựa trên trạng thái QR code

### 3. **Cải thiện Text Hướng dẫn**
```dart
Text(
  event.isQrCodeValid 
      ? 'Quét mã QR này để check-in'
      : 'QR code không thể sử dụng để check-in',
  style: TextStyle(
    color: event.isQrCodeValid ? Colors.grey[600] : Colors.red[600],
    fontSize: 14,
  ),
  textAlign: TextAlign.center,
),
```

## Kết quả mong đợi

### Trước khi sửa:
- ❌ QR code luôn hiển thị "đã hết hạn"
- ❌ Không hiển thị QR code text
- ❌ Logic không hợp lý (yêu cầu QR code chỉ hợp lệ gần thời gian event)

### Sau khi sửa:
- ✅ QR code hiển thị đúng trạng thái
- ✅ Hiển thị QR code text khi hợp lệ
- ✅ Hiển thị warning khi thực sự hết hạn
- ✅ Logic hợp lý: QR code hợp lệ ngay sau đăng ký

## Test Case

### Sự kiện "Tiệc Giáng sinh 2025":
- **Start Time**: `2025-12-24 18:00:00`
- **End Time**: `2025-12-24 22:00:00`
- **QR Expires**: `2025-12-24 23:00:00`
- **Current Time**: `2025-09-22` (hiện tại)

**Kết quả**:
- ✅ `isQrCodeValid = true` (vì `now < qrExpiresAt` và `now < endTime + 1h`)
- ✅ QR dialog hiển thị QR code text: `EVENT_1_5_1758482239367`
- ✅ Text hướng dẫn: "Quét mã QR này để check-in"
- ✅ Thời gian hết hạn: "Hết hạn: 24/12/2025 23:00"

## Files đã thay đổi

1. **`apartment-resident-mobile/lib/features/events/models/event.dart`**
   - Sửa logic `isQrCodeValid` getter

2. **`apartment-resident-mobile/lib/features/events/ui/events_screen.dart`**
   - Cải thiện QR dialog UI
   - Thêm conditional rendering cho QR code
   - Cải thiện text hướng dẫn

## Lưu ý

- QR code hợp lệ ngay sau khi đăng ký (không cần chờ gần thời gian event)
- QR code chỉ hết hạn khi thực sự quá `qrExpiresAt` hoặc event đã kết thúc
- UI hiển thị rõ ràng trạng thái QR code (hợp lệ/hết hạn)
- Logic này phù hợp với thực tế sử dụng QR code cho check-in
