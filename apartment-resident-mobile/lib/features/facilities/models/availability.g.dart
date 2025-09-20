// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'availability.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TimeSlotImpl _$$TimeSlotImplFromJson(Map<String, dynamic> json) =>
    _$TimeSlotImpl(
      startTime: json['startTime'] as String,
      endTime: json['endTime'] as String,
      isAvailable: json['isAvailable'] as bool,
      isBooked: json['isBooked'] as bool? ?? false,
      bookingId: json['bookingId'] as String?,
    );

Map<String, dynamic> _$$TimeSlotImplToJson(_$TimeSlotImpl instance) =>
    <String, dynamic>{
      'startTime': instance.startTime,
      'endTime': instance.endTime,
      'isAvailable': instance.isAvailable,
      'isBooked': instance.isBooked,
      'bookingId': instance.bookingId,
    };

_$FacilityAvailabilityImpl _$$FacilityAvailabilityImplFromJson(
  Map<String, dynamic> json,
) => _$FacilityAvailabilityImpl(
  facilityId: (json['facilityId'] as num).toInt(),
  date: json['date'] as String,
  timeSlots: (json['timeSlots'] as List<dynamic>)
      .map((e) => TimeSlot.fromJson(e as Map<String, dynamic>))
      .toList(),
  totalSlots: (json['totalSlots'] as num?)?.toInt() ?? 0,
  availableSlots: (json['availableSlots'] as num?)?.toInt() ?? 0,
  bookedSlots: (json['bookedSlots'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$$FacilityAvailabilityImplToJson(
  _$FacilityAvailabilityImpl instance,
) => <String, dynamic>{
  'facilityId': instance.facilityId,
  'date': instance.date,
  'timeSlots': instance.timeSlots,
  'totalSlots': instance.totalSlots,
  'availableSlots': instance.availableSlots,
  'bookedSlots': instance.bookedSlots,
};

_$AvailabilityRequestImpl _$$AvailabilityRequestImplFromJson(
  Map<String, dynamic> json,
) => _$AvailabilityRequestImpl(
  facilityId: (json['facilityId'] as num).toInt(),
  date: json['date'] as String,
  slotDurationMinutes: (json['slotDurationMinutes'] as num?)?.toInt() ?? 30,
);

Map<String, dynamic> _$$AvailabilityRequestImplToJson(
  _$AvailabilityRequestImpl instance,
) => <String, dynamic>{
  'facilityId': instance.facilityId,
  'date': instance.date,
  'slotDurationMinutes': instance.slotDurationMinutes,
};
