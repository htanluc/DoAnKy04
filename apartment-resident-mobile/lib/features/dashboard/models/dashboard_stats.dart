class DashboardStats {
  final int totalInvoices;
  final int pendingInvoices;
  final int overdueInvoices;
  final double totalAmount;
  final int unreadAnnouncements;
  final int upcomingEvents;
  final int activeBookings;
  final int supportRequests;

  const DashboardStats({
    required this.totalInvoices,
    required this.pendingInvoices,
    required this.overdueInvoices,
    required this.totalAmount,
    required this.unreadAnnouncements,
    required this.upcomingEvents,
    required this.activeBookings,
    required this.supportRequests,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalInvoices: json['totalInvoices'] ?? 0,
      pendingInvoices: json['pendingInvoices'] ?? 0,
      overdueInvoices: json['overdueInvoices'] ?? 0,
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      unreadAnnouncements: json['unreadAnnouncements'] ?? 0,
      upcomingEvents: json['upcomingEvents'] ?? 0,
      activeBookings: json['activeBookings'] ?? 0,
      supportRequests: json['supportRequests'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalInvoices': totalInvoices,
      'pendingInvoices': pendingInvoices,
      'overdueInvoices': overdueInvoices,
      'totalAmount': totalAmount,
      'unreadAnnouncements': unreadAnnouncements,
      'upcomingEvents': upcomingEvents,
      'activeBookings': activeBookings,
      'supportRequests': supportRequests,
    };
  }
}

class RecentActivity {
  final String id;
  final ActivityType type;
  final String title;
  final String description;
  final String timestamp;
  final String? status;

  const RecentActivity({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.timestamp,
    this.status,
  });

  factory RecentActivity.fromJson(Map<String, dynamic> json) {
    final rawType = (json['type'] ?? json['actionType'] ?? '').toString();
    final actionDisplay =
        (json['title'] ?? json['actionTypeDisplayName'] ?? rawType).toString();
    final desc = (json['description'] ?? '').toString();

    return RecentActivity(
      id: (json['logId'] ?? json['id'] ?? '').toString(),
      type: _mapActionType(rawType),
      // Ưu tiên mô tả chi tiết làm tiêu đề; fallback sang tên hành động
      title: desc.isNotEmpty ? desc : actionDisplay,
      description: desc,
      timestamp: (json['timestamp'] ?? json['createdAt'] ?? '').toString(),
      status: (json['status'] ?? '').toString().isEmpty
          ? null
          : json['status'] as String?,
    );
  }

  static ActivityType _mapActionType(String action) {
    final a = action.toUpperCase();
    if (a.contains('INVOICE')) return ActivityType.invoice;
    if (a.contains('ANNOUNCEMENT')) return ActivityType.announcement;
    if (a.contains('EVENT')) return ActivityType.event;
    if (a.contains('FACILITY') || a.contains('BOOK'))
      return ActivityType.facilityBooking;
    if (a.contains('PAY')) return ActivityType.payment;
    if (a.contains('LOGIN')) return ActivityType.login;
    return ActivityType.login;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'title': title,
      'description': description,
      'timestamp': timestamp,
      'status': status,
    };
  }
}

class ApartmentInfo {
  final String? apartmentNumber;
  final String? buildingName;
  final double? area;
  final int? bedrooms;
  final int? floor;

  const ApartmentInfo({
    this.apartmentNumber,
    this.buildingName,
    this.area,
    this.bedrooms,
    this.floor,
  });

  factory ApartmentInfo.fromJson(Map<String, dynamic> json) {
    return ApartmentInfo(
      apartmentNumber: json['apartmentNumber'],
      buildingName: json['buildingName'],
      area: json['area']?.toDouble(),
      bedrooms: json['bedrooms'],
      floor: json['floor'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'apartmentNumber': apartmentNumber,
      'buildingName': buildingName,
      'area': area,
      'bedrooms': bedrooms,
      'floor': floor,
    };
  }
}

enum ActivityType {
  invoice,
  announcement,
  event,
  booking,
  payment,
  login,
  facilityBooking,
}

extension ActivityTypeExtension on ActivityType {
  String get displayName {
    switch (this) {
      case ActivityType.invoice:
        return 'Hóa đơn';
      case ActivityType.announcement:
        return 'Thông báo';
      case ActivityType.event:
        return 'Sự kiện';
      case ActivityType.booking:
        return 'Đặt chỗ';
      case ActivityType.payment:
        return 'Thanh toán';
      case ActivityType.login:
        return 'Đăng nhập';
      case ActivityType.facilityBooking:
        return 'Đặt tiện ích';
    }
  }
}
