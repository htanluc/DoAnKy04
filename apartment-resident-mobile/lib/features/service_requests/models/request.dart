import 'package:freezed_annotation/freezed_annotation.dart';
import 'request_status.dart';

part 'request.freezed.dart';
part 'request.g.dart';

@freezed
class ServiceRequest with _$ServiceRequest {
  const factory ServiceRequest({
    required String id,
    required String title,
    required String description,
    required String category,
    required String priority,
    required String status,
    required DateTime createdAt,
    required DateTime updatedAt,
    String? assignedTo,
    int? assignedToId,
    String? assignedToPhone,
    DateTime? assignedAt,
    DateTime? completedAt,
    DateTime? estimatedCompletion,
    DateTime? actualCompletion,
    String? staffPhone,
    String? resolutionNotes,
    @Default([]) List<String> imageUrls,
    @Default([]) List<String> attachmentUrls,
    @Default([]) List<Comment> comments,
  }) = _ServiceRequest;

  factory ServiceRequest.fromJson(Map<String, dynamic> json) =>
      _$ServiceRequestFromJson(json);

  // Custom fromJson to handle type casting issues
  factory ServiceRequest.fromJsonSafe(Map<String, dynamic> json) {
    return ServiceRequest(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      priority: json['priority']?.toString() ?? 'MEDIUM',
      status: json['status']?.toString() ?? 'PENDING',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      assignedTo: json['assignedTo']?.toString(),
      assignedToId: json['assignedToId'] is int
          ? json['assignedToId'] as int
          : int.tryParse(json['assignedToId']?.toString() ?? ''),
      assignedToPhone: json['assignedToPhone']?.toString(),
      assignedAt: json['assignedAt'] != null
          ? DateTime.tryParse(json['assignedAt'].toString())
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'].toString())
          : null,
      estimatedCompletion: json['estimatedCompletion'] != null
          ? DateTime.tryParse(json['estimatedCompletion'].toString())
          : null,
      actualCompletion: json['actualCompletion'] != null
          ? DateTime.tryParse(json['actualCompletion'].toString())
          : null,
      staffPhone: json['staffPhone']?.toString(),
      resolutionNotes: json['resolutionNotes']?.toString(),
      imageUrls: json['imageUrls'] is List
          ? (json['imageUrls'] as List).map((e) => e.toString()).toList()
          : [],
      attachmentUrls: json['attachmentUrls'] is List
          ? (json['attachmentUrls'] as List).map((e) => e.toString()).toList()
          : [],
      comments: json['comments'] is List
          ? (json['comments'] as List)
                .map((e) => Comment.fromJsonSafe(e as Map<String, dynamic>))
                .toList()
          : [],
    );
  }
}

// Extension for ServiceRequest helper methods
extension ServiceRequestExtension on ServiceRequest {
  RequestStatus get requestStatus => RequestStatus.fromString(status);

  String get categoryDisplayName {
    switch (category) {
      case 'MAINTENANCE':
        return 'Bảo trì';
      case 'CLEANING':
        return 'Vệ sinh';
      case 'SECURITY':
        return 'An ninh';
      case 'UTILITY':
        return 'Tiện ích';
      case 'OTHER':
        return 'Khác';
      default:
        return 'Khác';
    }
  }

  String get priorityDisplayName {
    switch (priority) {
      case 'LOW':
        return 'Thấp';
      case 'MEDIUM':
        return 'Trung bình';
      case 'HIGH':
        return 'Cao';
      case 'URGENT':
        return 'Khẩn cấp';
      default:
        return 'Trung bình';
    }
  }

  String get effectiveStaffPhone {
    return assignedToPhone ?? staffPhone ?? '';
  }

  List<String> get allImages {
    return [...imageUrls, ...attachmentUrls];
  }

  bool get canBeCancelled {
    return status == 'PENDING';
  }

  bool get isCompleted {
    return status == 'COMPLETED';
  }

  bool get isCancelled {
    return status == 'CANCELLED';
  }

  bool get isInProgress {
    return status == 'IN_PROGRESS' || status == 'ASSIGNED';
  }
}

@freezed
class Comment with _$Comment {
  const factory Comment({
    required String id,
    required String content,
    required String author,
    required DateTime createdAt,
    required bool isStaff,
    @Default([]) List<String> imageUrls,
  }) = _Comment;

  factory Comment.fromJson(Map<String, dynamic> json) =>
      _$CommentFromJson(json);

  // Custom fromJson to handle type casting issues
  factory Comment.fromJsonSafe(Map<String, dynamic> json) {
    return Comment(
      id: json['id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      author: json['author']?.toString() ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      isStaff: json['isStaff'] is bool
          ? json['isStaff'] as bool
          : (json['isStaff']?.toString().toLowerCase() == 'true'),
      imageUrls: json['imageUrls'] is List
          ? (json['imageUrls'] as List).map((e) => e.toString()).toList()
          : [],
    );
  }
}

@freezed
class ServiceCategory with _$ServiceCategory {
  const factory ServiceCategory({
    required int id,
    required String categoryCode,
    required String categoryName,
    String? description,
  }) = _ServiceCategory;

  factory ServiceCategory.fromJson(Map<String, dynamic> json) =>
      _$ServiceCategoryFromJson(json);

  // Custom fromJson to handle type casting issues
  factory ServiceCategory.fromJsonSafe(Map<String, dynamic> json) {
    return ServiceCategory(
      id: json['id'] is int
          ? json['id'] as int
          : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      categoryCode: json['categoryCode']?.toString() ?? '',
      categoryName: json['categoryName']?.toString() ?? '',
      description: json['description']?.toString(),
    );
  }
}

// Extension for ServiceCategory helper methods
extension ServiceCategoryExtension on ServiceCategory {
  String get displayName {
    switch (categoryCode) {
      case 'MAINTENANCE':
        return 'Bảo trì';
      case 'CLEANING':
        return 'Vệ sinh';
      case 'SECURITY':
        return 'An ninh';
      case 'UTILITY':
        return 'Tiện ích';
      case 'OTHER':
        return 'Khác';
      default:
        return categoryName;
    }
  }
}

@freezed
class CreateServiceRequest with _$CreateServiceRequest {
  const factory CreateServiceRequest({
    required String title,
    required String description,
    required int categoryId,
    required String priority,
    @Default([]) List<String> attachmentUrls,
    @Default([]) List<String> imageAttachment,
  }) = _CreateServiceRequest;

  factory CreateServiceRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateServiceRequestFromJson(json);
}

// Priority levels
enum PriorityLevel {
  low('LOW', 'Thấp'),
  medium('MEDIUM', 'Trung bình'),
  high('HIGH', 'Cao'),
  urgent('URGENT', 'Khẩn cấp');

  const PriorityLevel(this.value, this.displayName);
  final String value;
  final String displayName;
}

// Category types
enum CategoryType {
  maintenance('MAINTENANCE', 'Bảo trì'),
  cleaning('CLEANING', 'Vệ sinh'),
  security('SECURITY', 'An ninh'),
  utility('UTILITY', 'Tiện ích'),
  other('OTHER', 'Khác');

  const CategoryType(this.value, this.displayName);
  final String value;
  final String displayName;
}
