// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'event.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$EventImpl _$$EventImplFromJson(Map<String, dynamic> json) => _$EventImpl(
  id: _idFromJson(json['id']),
  title: json['title'] as String,
  description: json['description'] as String,
  startTime: DateTime.parse(json['startTime'] as String),
  endTime: DateTime.parse(json['endTime'] as String),
  location: json['location'] as String,
  createdAt: DateTime.parse(json['createdAt'] as String),
  participantCount: (json['participantCount'] as num).toInt(),
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

Map<String, dynamic> _$$EventImplToJson(_$EventImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'description': instance.description,
      'startTime': instance.startTime.toIso8601String(),
      'endTime': instance.endTime.toIso8601String(),
      'location': instance.location,
      'createdAt': instance.createdAt.toIso8601String(),
      'participantCount': instance.participantCount,
      'registered': instance.registered,
      'qrCode': instance.qrCode,
      'qrCodeExpiresAt': instance.qrCodeExpiresAt?.toIso8601String(),
      'checkedIn': instance.checkedIn,
      'checkedInAt': instance.checkedInAt?.toIso8601String(),
      'registrationDeadline': instance.registrationDeadline?.toIso8601String(),
      'canRegister': instance.canRegister,
    };
