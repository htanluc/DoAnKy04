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
  final List<String> beforeImages;
  final List<String> afterImages;

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
    this.beforeImages = const [],
    this.afterImages = const [],
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
      imageUrls: _parseImageUrls(json),
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
      beforeImages:
          (json['beforeImages'] as List?)?.whereType<String>().toList() ??
              const <String>[],
      afterImages:
          (json['afterImages'] as List?)?.whereType<String>().toList() ??
              const <String>[],
    );
  }

  static double? _parseDouble(Object? v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    final s = v.toString();
    if (s.isEmpty) return null;
    return double.tryParse(s);
  }

  static List<String> _parseImageUrls(Map<String, dynamic> json) {
    final Set<String> urlSet = {}; // Dùng Set để tránh duplicate

    // Thử các trường có thể chứa hình ảnh từ backend
    final possibleFields = [
      'imageUrls',
      'attachmentUrls', // Backend đã fix để combine attachmentUrls vào imageUrls
      'imageAttachments',
      'imageAttachment',
      'attachments',
      'images',
      'photos',
      'mediaUrls',
      'fileUrls'
    ];

    for (final field in possibleFields) {
      final value = json[field];
      if (value == null) continue;

      print('[ServiceRequestModel] Processing field "$field": $value');

      if (value is List) {
        // Nếu là list, thêm tất cả string hợp lệ
        for (final item in value) {
          if (item is String && item.trim().isNotEmpty) {
            final trimmed = item.trim();
            print('[ServiceRequestModel] Adding URL from $field: "$trimmed"');
            urlSet.add(trimmed);
          } else if (item is Map<String, dynamic>) {
            // Thử các trường trong object
            final urlFields = ['url', 'path', 'filename', 'src'];
            for (final urlField in urlFields) {
              final url = item[urlField]?.toString();
              if (url != null && url.trim().isNotEmpty) {
                final trimmed = url.trim();
                print(
                    '[ServiceRequestModel] Adding URL from $field.$urlField: "$trimmed"');
                urlSet.add(trimmed);
                break;
              }
            }
          }
        }
      } else if (value is String && value.trim().isNotEmpty) {
        // Nếu là string đơn lẻ
        final trimmed = value.trim();
        print('[ServiceRequestModel] Adding URL from $field: "$trimmed"');
        urlSet.add(trimmed);
      }
    }

    final urls = urlSet.toList();

    // Debug log để kiểm tra
    print('[ServiceRequestModel] Parsed imageUrls (deduplicated): $urls');
    print('[ServiceRequestModel] From fields: $possibleFields');

    return urls;
  }
}
