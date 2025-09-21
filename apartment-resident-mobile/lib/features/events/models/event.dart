import 'package:freezed_annotation/freezed_annotation.dart';

part 'event.freezed.dart';
part 'event.g.dart';

@freezed
class Event with _$Event {
  const factory Event({
    required String id,
    required String title,
    required String description,
    required DateTime startTime,
    required DateTime endTime,
    required String location,
    required DateTime createdAt,
    required int participantCount,
    required bool registered,
    String? qrCode, // QR code for check-in
    DateTime? qrCodeExpiresAt, // QR code expiration time
    bool? checkedIn, // Check-in status
    DateTime? checkedInAt, // Check-in timestamp
    DateTime? registrationDeadline, // Registration deadline
    @Default(true) bool canRegister, // Whether user can still register
  }) = _Event;

  factory Event.fromJson(Map<String, dynamic> json) => _$EventFromJson(json);
}

// Custom JSON converters
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

@JsonEnum()
enum EventStatus {
  @JsonValue('UPCOMING')
  upcoming,
  @JsonValue('ONGOING')
  ongoing,
  @JsonValue('COMPLETED')
  completed;

  String get displayName {
    switch (this) {
      case EventStatus.upcoming:
        return 'Sắp diễn ra';
      case EventStatus.ongoing:
        return 'Đang diễn ra';
      case EventStatus.completed:
        return 'Đã kết thúc';
    }
  }

  String get icon {
    switch (this) {
      case EventStatus.upcoming:
        return '📅';
      case EventStatus.ongoing:
        return '🎉';
      case EventStatus.completed:
        return '✅';
    }
  }
}

extension EventStatusExtension on Event {
  EventStatus get status {
    final now = DateTime.now();

    if (now.isBefore(startTime)) {
      return EventStatus.upcoming;
    } else if (now.isAfter(startTime) && now.isBefore(endTime)) {
      return EventStatus.ongoing;
    } else {
      return EventStatus.completed;
    }
  }

  bool get isUpcoming => status == EventStatus.upcoming;
  bool get isOngoing => status == EventStatus.ongoing;
  bool get isCompleted => status == EventStatus.completed;

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

    // Can't register if already registered
    if (registered) {
      return false;
    }

    // Check registration deadline if set
    if (registrationDeadline != null && now.isAfter(registrationDeadline!)) {
      return false;
    }

    // Default registration deadline is 1 hour before event starts
    final defaultDeadline = startTime.subtract(const Duration(hours: 1));
    if (now.isAfter(defaultDeadline)) {
      return false;
    }

    return canRegister;
  }

  /// Check if event has ended
  bool get hasEnded {
    final now = DateTime.now();
    return now.isAfter(endTime);
  }

  /// Check if QR code is valid for check-in
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

  /// Get time remaining until registration deadline
  Duration? get timeUntilRegistrationDeadline {
    final now = DateTime.now();
    final deadline =
        registrationDeadline ?? startTime.subtract(const Duration(hours: 1));

    if (now.isAfter(deadline)) {
      return null;
    }

    return deadline.difference(now);
  }
}
