// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ServiceRequestImpl _$$ServiceRequestImplFromJson(Map<String, dynamic> json) =>
    _$ServiceRequestImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      category: json['category'] as String,
      priority: json['priority'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      assignedTo: json['assignedTo'] as String?,
      assignedToId: (json['assignedToId'] as num?)?.toInt(),
      assignedToPhone: json['assignedToPhone'] as String?,
      assignedAt: json['assignedAt'] == null
          ? null
          : DateTime.parse(json['assignedAt'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      estimatedCompletion: json['estimatedCompletion'] == null
          ? null
          : DateTime.parse(json['estimatedCompletion'] as String),
      actualCompletion: json['actualCompletion'] == null
          ? null
          : DateTime.parse(json['actualCompletion'] as String),
      staffPhone: json['staffPhone'] as String?,
      resolutionNotes: json['resolutionNotes'] as String?,
      imageUrls:
          (json['imageUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      attachmentUrls:
          (json['attachmentUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      comments:
          (json['comments'] as List<dynamic>?)
              ?.map((e) => Comment.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$ServiceRequestImplToJson(
  _$ServiceRequestImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'description': instance.description,
  'category': instance.category,
  'priority': instance.priority,
  'status': instance.status,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
  'assignedTo': instance.assignedTo,
  'assignedToId': instance.assignedToId,
  'assignedToPhone': instance.assignedToPhone,
  'assignedAt': instance.assignedAt?.toIso8601String(),
  'completedAt': instance.completedAt?.toIso8601String(),
  'estimatedCompletion': instance.estimatedCompletion?.toIso8601String(),
  'actualCompletion': instance.actualCompletion?.toIso8601String(),
  'staffPhone': instance.staffPhone,
  'resolutionNotes': instance.resolutionNotes,
  'imageUrls': instance.imageUrls,
  'attachmentUrls': instance.attachmentUrls,
  'comments': instance.comments,
};

_$CommentImpl _$$CommentImplFromJson(Map<String, dynamic> json) =>
    _$CommentImpl(
      id: json['id'] as String,
      content: json['content'] as String,
      author: json['author'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      isStaff: json['isStaff'] as bool,
      imageUrls:
          (json['imageUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$CommentImplToJson(_$CommentImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'content': instance.content,
      'author': instance.author,
      'createdAt': instance.createdAt.toIso8601String(),
      'isStaff': instance.isStaff,
      'imageUrls': instance.imageUrls,
    };

_$ServiceCategoryImpl _$$ServiceCategoryImplFromJson(
  Map<String, dynamic> json,
) => _$ServiceCategoryImpl(
  id: (json['id'] as num).toInt(),
  categoryCode: json['categoryCode'] as String,
  categoryName: json['categoryName'] as String,
  description: json['description'] as String?,
);

Map<String, dynamic> _$$ServiceCategoryImplToJson(
  _$ServiceCategoryImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'categoryCode': instance.categoryCode,
  'categoryName': instance.categoryName,
  'description': instance.description,
};

_$CreateServiceRequestImpl _$$CreateServiceRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreateServiceRequestImpl(
  title: json['title'] as String,
  description: json['description'] as String,
  categoryId: (json['categoryId'] as num).toInt(),
  priority: json['priority'] as String,
  attachmentUrls:
      (json['attachmentUrls'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  imageAttachment:
      (json['imageAttachment'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
);

Map<String, dynamic> _$$CreateServiceRequestImplToJson(
  _$CreateServiceRequestImpl instance,
) => <String, dynamic>{
  'title': instance.title,
  'description': instance.description,
  'categoryId': instance.categoryId,
  'priority': instance.priority,
  'attachmentUrls': instance.attachmentUrls,
  'imageAttachment': instance.imageAttachment,
};
