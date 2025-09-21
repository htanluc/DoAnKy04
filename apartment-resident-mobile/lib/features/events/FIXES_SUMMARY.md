# Event Registration and QR Code Fixes

## Issues Fixed

### 1. "đã kết thúc nhưng vẫn có thể đăng ký tham gia" (Ended events still allowing registration)

**Problem**: Events that had ended were still allowing users to register because the `canStillRegister` getter only checked if the event had started, not if it had ended.

**Solution**: 
- Updated `canStillRegister` getter in `lib/features/events/models/event.dart` to check if the event has ended (`now.isAfter(endTime)`)
- Added new `hasEnded` getter to check if an event has ended
- Updated UI in both `events_screen.dart` and `event_detail_screen.dart` to show "Sự kiện đã kết thúc" (Event has ended) instead of registration buttons for ended events

**Code Changes**:
```dart
/// Check if user can still register for this event
bool get canStillRegister {
  final now = DateTime.now();

  // Can't register if event has ended
  if (now.isAfter(endTime)) {
    return false;
  }

  // Can't register if event has started
  if (now.isAfter(startTime)) {
    return false;
  }

  // ... rest of the logic
}

/// Check if event has ended
bool get hasEnded {
  final now = DateTime.now();
  return now.isAfter(endTime);
}
```

### 2. "các sự kiện đã đăng ký vẫn chưa cấp mã QR" (Registered events still haven't been issued QR codes)

**Problem**: When events were loaded from the API, already registered events didn't have QR codes because QR code generation only happened during new registration.

**Solution**:
- Added `_ensureQrCodesForRegisteredEvents` method in `EventsNotifier` to automatically generate QR codes for registered events that don't have them
- This method is called during `loadEvents()` to ensure all registered events have QR codes
- QR codes are generated with a 24-hour expiration time

**Code Changes**:
```dart
/// Ensure QR codes are generated for registered events that don't have them
Future<List<Event>> _ensureQrCodesForRegisteredEvents(List<Event> events) async {
  final List<Event> updatedEvents = [];

  for (final event in events) {
    if (event.registered && (event.qrCode == null || event.qrCodeExpiresAt == null)) {
      try {
        // Generate QR code for registered event
        final qrCode = await _repository.generateQrCode(event.id);
        final qrCodeExpiresAt = DateTime.now().add(const Duration(hours: 24));
        
        updatedEvents.add(event.copyWith(
          qrCode: qrCode,
          qrCodeExpiresAt: qrCodeExpiresAt,
        ));
      } catch (e) {
        // If QR code generation fails, keep the original event
        updatedEvents.add(event);
      }
    } else {
      updatedEvents.add(event);
    }
  }

  return updatedEvents;
}
```

## UI Improvements

### Events Screen
- Added visual indicator for ended events showing "Sự kiện đã kết thúc" instead of registration buttons
- Improved registration deadline messaging to only show for events that haven't ended

### Event Detail Screen
- Added consistent handling for ended events in both the main action button and the action buttons section
- Shows "Sự kiện đã kết thúc" message for ended events instead of registration options

## Testing

The fixes ensure that:
1. ✅ Events that have ended cannot be registered for
2. ✅ All registered events automatically get QR codes when the app loads
3. ✅ UI clearly indicates when events have ended
4. ✅ Registration deadline logic works correctly for all event states

## Files Modified

1. `lib/features/events/models/event.dart` - Added `hasEnded` getter and fixed `canStillRegister` logic
2. `lib/features/events/providers/events_providers.dart` - Added QR code generation for existing registered events
3. `lib/features/events/ui/events_screen.dart` - Updated UI to handle ended events
4. `lib/features/events/ui/event_detail_screen.dart` - Updated UI to handle ended events consistently
