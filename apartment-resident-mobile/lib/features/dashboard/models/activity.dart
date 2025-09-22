class Activity {
  final String id;
  final String type;
  final String title;
  final String description;
  final String timestamp;
  final String? status;
  final String? icon;
  final String? color;

  const Activity({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.timestamp,
    this.status,
    this.icon,
    this.color,
  });

  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      timestamp: json['timestamp'] ?? '',
      status: json['status'],
      icon: json['icon'],
      color: json['color'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'description': description,
      'timestamp': timestamp,
      'status': status,
      'icon': icon,
      'color': color,
    };
  }
}

class ActivityStatus {
  final String status;
  final String color;
  final String icon;

  const ActivityStatus({
    required this.status,
    required this.color,
    required this.icon,
  });

  factory ActivityStatus.fromJson(Map<String, dynamic> json) {
    return ActivityStatus(
      status: json['status'] ?? '',
      color: json['color'] ?? '',
      icon: json['icon'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {'status': status, 'color': color, 'icon': icon};
  }
}

class ActivityConstants {
  static const Map<String, ActivityStatus> statusConfig = {
    'pending': ActivityStatus(
      status: 'Chờ xử lý',
      color: '0xFFF59E0B',
      icon: 'clock',
    ),
    'completed': ActivityStatus(
      status: 'Hoàn thành',
      color: '0xFF10B981',
      icon: 'check_circle',
    ),
    'overdue': ActivityStatus(
      status: 'Quá hạn',
      color: '0xFFEF4444',
      icon: 'alert_triangle',
    ),
    'active': ActivityStatus(
      status: 'Đang hoạt động',
      color: '0xFF3B82F6',
      icon: 'zap',
    ),
  };

  static const Map<String, String> typeIcons = {
    'invoice': 'receipt',
    'announcement': 'bell',
    'event': 'calendar',
    'booking': 'building',
    'payment': 'dollar_sign',
    'login': 'user',
    'facility_booking': 'coffee',
  };

  static const Map<String, String> typeColors = {
    'invoice': '0xFF3B82F6',
    'announcement': '0xFF10B981',
    'event': '0xFFF59E0B',
    'booking': '0xFF8B5CF6',
    'payment': '0xFF06B6D4',
    'login': '0xFF6B7280',
    'facility_booking': '0xFFEF4444',
  };
}
