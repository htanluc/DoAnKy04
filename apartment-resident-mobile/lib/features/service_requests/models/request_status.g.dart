// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'request_status.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RequestStatusImpl _$$RequestStatusImplFromJson(Map<String, dynamic> json) =>
    _$RequestStatusImpl(
      status: json['status'] as String,
      displayName: json['displayName'] as String,
      description: json['description'] as String,
      step: (json['step'] as num).toInt(),
      isCompleted: json['isCompleted'] as bool,
      isActive: json['isActive'] as bool,
      isCancelled: json['isCancelled'] as bool,
    );

Map<String, dynamic> _$$RequestStatusImplToJson(_$RequestStatusImpl instance) =>
    <String, dynamic>{
      'status': instance.status,
      'displayName': instance.displayName,
      'description': instance.description,
      'step': instance.step,
      'isCompleted': instance.isCompleted,
      'isActive': instance.isActive,
      'isCancelled': instance.isCancelled,
    };
