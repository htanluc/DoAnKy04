// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'facility.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FacilityImpl _$$FacilityImplFromJson(Map<String, dynamic> json) =>
    _$FacilityImpl(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      description: json['description'] as String,
      location: json['location'] as String,
      capacity: (json['capacity'] as num).toInt(),
      otherDetails: json['otherDetails'] as String,
      usageFee: (json['usageFee'] as num).toDouble(),
      openingHours: json['openingHours'] as String?,
      isVisible: json['isVisible'] as bool? ?? true,
    );

Map<String, dynamic> _$$FacilityImplToJson(_$FacilityImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'location': instance.location,
      'capacity': instance.capacity,
      'otherDetails': instance.otherDetails,
      'usageFee': instance.usageFee,
      'openingHours': instance.openingHours,
      'isVisible': instance.isVisible,
    };

_$FacilityCreateRequestImpl _$$FacilityCreateRequestImplFromJson(
  Map<String, dynamic> json,
) => _$FacilityCreateRequestImpl(
  name: json['name'] as String,
  description: json['description'] as String,
  location: json['location'] as String,
  capacity: (json['capacity'] as num).toInt(),
  otherDetails: json['otherDetails'] as String,
  usageFee: (json['usageFee'] as num).toDouble(),
  openingHours: json['openingHours'] as String?,
  isVisible: json['isVisible'] as bool? ?? true,
);

Map<String, dynamic> _$$FacilityCreateRequestImplToJson(
  _$FacilityCreateRequestImpl instance,
) => <String, dynamic>{
  'name': instance.name,
  'description': instance.description,
  'location': instance.location,
  'capacity': instance.capacity,
  'otherDetails': instance.otherDetails,
  'usageFee': instance.usageFee,
  'openingHours': instance.openingHours,
  'isVisible': instance.isVisible,
};

_$FacilityUpdateRequestImpl _$$FacilityUpdateRequestImplFromJson(
  Map<String, dynamic> json,
) => _$FacilityUpdateRequestImpl(
  name: json['name'] as String?,
  description: json['description'] as String?,
  location: json['location'] as String?,
  capacity: (json['capacity'] as num?)?.toInt(),
  otherDetails: json['otherDetails'] as String?,
  usageFee: (json['usageFee'] as num?)?.toDouble(),
  openingHours: json['openingHours'] as String?,
  isVisible: json['isVisible'] as bool?,
);

Map<String, dynamic> _$$FacilityUpdateRequestImplToJson(
  _$FacilityUpdateRequestImpl instance,
) => <String, dynamic>{
  'name': instance.name,
  'description': instance.description,
  'location': instance.location,
  'capacity': instance.capacity,
  'otherDetails': instance.otherDetails,
  'usageFee': instance.usageFee,
  'openingHours': instance.openingHours,
  'isVisible': instance.isVisible,
};
