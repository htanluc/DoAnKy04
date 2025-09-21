// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'announcement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AnnouncementImpl _$$AnnouncementImplFromJson(Map<String, dynamic> json) =>
    _$AnnouncementImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      type: $enumDecode(_$AnnouncementTypeEnumMap, json['type']),
      read: json['read'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      createdBy: json['createdBy'] as String,
    );

Map<String, dynamic> _$$AnnouncementImplToJson(_$AnnouncementImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'content': instance.content,
      'type': _$AnnouncementTypeEnumMap[instance.type]!,
      'read': instance.read,
      'createdAt': instance.createdAt.toIso8601String(),
      'createdBy': instance.createdBy,
    };

const _$AnnouncementTypeEnumMap = {
  AnnouncementType.news: 'NEWS',
  AnnouncementType.regular: 'REGULAR',
  AnnouncementType.urgent: 'URGENT',
  AnnouncementType.event: 'EVENT',
};
