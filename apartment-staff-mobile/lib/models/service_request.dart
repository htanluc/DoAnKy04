class ServiceRequestModel {
  final int id;
  final String? residentName;
  final String? residentPhone;
  final String? categoryName;
  final String? description;
  final String? priority;
  final String? status;
  final String? submittedAt;
  final String? dueAt;
  final String? address;
  final double? latitude;
  final double? longitude;
  final List<String> imageUrls;
  final List<String> attachmentUrls;
  final int? assignedToId;
  final String? assignedToName;
  final String? assignedToPhone;

  ServiceRequestModel({
    required this.id,
    this.residentName,
    this.residentPhone,
    this.categoryName,
    this.description,
    this.priority,
    this.status,
    this.submittedAt,
    this.dueAt,
    this.address,
    this.latitude,
    this.longitude,
    this.imageUrls = const [],
    this.attachmentUrls = const [],
    this.assignedToId,
    this.assignedToName,
    this.assignedToPhone,
  });

  factory ServiceRequestModel.fromJson(Map<String, dynamic> json) {
    return ServiceRequestModel(
      id: (json['id'] as num).toInt(),
      residentName:
          json['userName'] as String? ?? json['user']?['username'] as String?,
      residentPhone: json['userPhone'] as String? ??
          json['user']?['phoneNumber'] as String?,
      categoryName: json['categoryName'] as String? ??
          json['category']?['categoryName'] as String?,
      description: json['description'] as String?,
      priority: json['priority']?.toString(),
      status: json['status']?.toString(),
      submittedAt:
          json['createdAt']?.toString() ?? json['submittedAt']?.toString(),
      dueAt: (json['dueAt'] ??
              json['dueDate'] ??
              json['deadline'] ??
              json['expectedAt'])
          ?.toString(),
      address:
          (json['address'] ?? json['location'] ?? json['place'])?.toString(),
      latitude: _parseDouble(json['latitude'] ?? json['lat']),
      longitude: _parseDouble(json['longitude'] ?? json['lng'] ?? json['long']),
      imageUrls: (json['imageUrls'] as List?)?.whereType<String>().toList() ??
          // Fallback nếu backend trả về một chuỗi đơn lẻ
          ((json['imageAttachment'] is String &&
                  (json['imageAttachment'] as String).trim().isNotEmpty)
              ? <String>[json['imageAttachment'] as String]
              : const <String>[]),
      attachmentUrls:
          (json['attachmentUrls'] as List?)?.whereType<String>().toList() ??
              const <String>[],
      assignedToId: (json['assignedToId'] as num?)?.toInt() ??
          (((json['assignedTo'] as Map<String, dynamic>?)?['id']) as num?)
              ?.toInt(),
      assignedToName: json['assignedTo'] as String? ??
          ((json['assignedTo'] as Map<String, dynamic>?)?['username']
              as String?),
      assignedToPhone: json['assignedToPhone'] as String? ??
          ((json['assignedTo'] as Map<String, dynamic>?)?['phoneNumber']
              as String?),
    );
  }

  static double? _parseDouble(Object? v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    final s = v.toString();
    if (s.isEmpty) return null;
    return double.tryParse(s);
  }
}
