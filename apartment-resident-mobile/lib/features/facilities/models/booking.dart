import 'package:freezed_annotation/freezed_annotation.dart';

part 'booking.freezed.dart';
part 'booking.g.dart';

@freezed
class User with _$User {
  const factory User({
    required int id,
    required String username,
    required String email,
    String? phoneNumber,
    String? fullName,
    String? firstName,
    String? lastName,
    String? status,
    String? lockReason,
    String? createdAt,
    String? updatedAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

@freezed
class FacilityBooking with _$FacilityBooking {
  const factory FacilityBooking({
    required int id,
    required int facilityId,
    required String facilityName,
    required int userId,
    required String userName,
    required String startTime,
    required String endTime,
    required String status,
    required int numberOfPeople,
    String? purpose,
    String? createdAt,
    String? approvedAt,
    String? rejectionReason,
    String? qrCode,
    String? qrExpiresAt,
    int? checkedInCount,
    int? maxCheckins,
    double? totalCost,
    String? paymentStatus,
    String? paymentMethod,
    String? paymentDate,
    String? transactionId,
  }) = _FacilityBooking;

  factory FacilityBooking.fromJson(Map<String, dynamic> json) =>
      _$FacilityBookingFromJson(json);
}

@freezed
class FacilityBookingCreateRequest with _$FacilityBookingCreateRequest {
  const factory FacilityBookingCreateRequest({
    required int facilityId,
    required int userId,
    required String bookingTime,
    required int duration,
    required int numberOfPeople,
    required String purpose,
    String? paymentStatus,
    String? paymentMethod,
    double? totalCost,
    String? transactionId,
  }) = _FacilityBookingCreateRequest;

  factory FacilityBookingCreateRequest.fromJson(Map<String, dynamic> json) =>
      _$FacilityBookingCreateRequestFromJson(json);
}

@freezed
class FacilityBookingUpdateRequest with _$FacilityBookingUpdateRequest {
  const factory FacilityBookingUpdateRequest({
    String? bookingTime,
    int? duration,
    int? numberOfPeople,
    String? purpose,
  }) = _FacilityBookingUpdateRequest;

  factory FacilityBookingUpdateRequest.fromJson(Map<String, dynamic> json) =>
      _$FacilityBookingUpdateRequestFromJson(json);
}

enum BookingStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('APPROVED')
  approved,
  @JsonValue('CONFIRMED')
  confirmed,
  @JsonValue('REJECTED')
  rejected,
  @JsonValue('CANCELLED')
  cancelled,
}

extension BookingStatusExtension on BookingStatus {
  String get displayName {
    switch (this) {
      case BookingStatus.pending:
        return 'Chờ xác nhận';
      case BookingStatus.approved:
        return 'Đã xác nhận';
      case BookingStatus.confirmed:
        return 'Đã xác nhận';
      case BookingStatus.rejected:
        return 'Từ chối';
      case BookingStatus.cancelled:
        return 'Đã hủy';
    }
  }

  String get color {
    switch (this) {
      case BookingStatus.pending:
        return 'yellow';
      case BookingStatus.approved:
        return 'green';
      case BookingStatus.confirmed:
        return 'green';
      case BookingStatus.rejected:
        return 'red';
      case BookingStatus.cancelled:
        return 'gray';
    }
  }
}
