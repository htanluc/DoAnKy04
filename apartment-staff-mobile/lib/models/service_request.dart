class ServiceRequestModel {
  final int id;
  final String? residentName;
  final String? residentPhone;
  final String? categoryName;
  final String? description;
  final String? priority;
  final String? status;
  final String? submittedAt;

  ServiceRequestModel({
    required this.id,
    this.residentName,
    this.residentPhone,
    this.categoryName,
    this.description,
    this.priority,
    this.status,
    this.submittedAt,
  });

  factory ServiceRequestModel.fromJson(Map<String, dynamic> json) {
    return ServiceRequestModel(
      id: (json['id'] as num).toInt(),
      residentName:
          json['userName'] as String? ?? json['user']?['username'] as String?,
      residentPhone:
          json['userPhone'] as String? ??
          json['user']?['phoneNumber'] as String?,
      categoryName:
          json['categoryName'] as String? ??
          json['category']?['categoryName'] as String?,
      description: json['description'] as String?,
      priority: json['priority']?.toString(),
      status: json['status']?.toString(),
      submittedAt:
          json['createdAt']?.toString() ?? json['submittedAt']?.toString(),
    );
  }
}
