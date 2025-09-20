import 'package:freezed_annotation/freezed_annotation.dart';

part 'availability.freezed.dart';
part 'availability.g.dart';

@freezed
class TimeSlot with _$TimeSlot {
  const factory TimeSlot({
    required String startTime,
    required String endTime,
    required bool isAvailable,
    @Default(false) bool isBooked,
    String? bookingId,
  }) = _TimeSlot;

  factory TimeSlot.fromJson(Map<String, dynamic> json) =>
      _$TimeSlotFromJson(json);
}

@freezed
class FacilityAvailability with _$FacilityAvailability {
  const factory FacilityAvailability({
    required int facilityId,
    required String date,
    required List<TimeSlot> timeSlots,
    @Default(0) int totalSlots,
    @Default(0) int availableSlots,
    @Default(0) int bookedSlots,
  }) = _FacilityAvailability;

  factory FacilityAvailability.fromJson(Map<String, dynamic> json) =>
      _$FacilityAvailabilityFromJson(json);
}

@freezed
class AvailabilityRequest with _$AvailabilityRequest {
  const factory AvailabilityRequest({
    required int facilityId,
    required String date,
    @Default(30) int slotDurationMinutes,
  }) = _AvailabilityRequest;

  factory AvailabilityRequest.fromJson(Map<String, dynamic> json) =>
      _$AvailabilityRequestFromJson(json);
}
