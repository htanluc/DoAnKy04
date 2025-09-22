import 'dart:typed_data';
import '../models/dashboard_stats.dart';
import '../models/activity.dart';
import 'dashboard_api.dart';

class DashboardRepository {
  final DashboardApi _api;

  DashboardRepository({DashboardApi? api}) : _api = api ?? DashboardApi();

  // Lấy thống kê dashboard
  Future<DashboardStats> getDashboardStats() async {
    try {
      return await _api.getDashboardStats();
    } catch (e) {
      // Log error và trả về dữ liệu mặc định
      print('Error getting dashboard stats: $e');
      return const DashboardStats(
        totalInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
        totalAmount: 0,
        unreadAnnouncements: 0,
        upcomingEvents: 0,
        activeBookings: 0,
        supportRequests: 0,
      );
    }
  }

  // Lấy hoạt động gần đây
  Future<List<RecentActivity>> getRecentActivities() async {
    try {
      return await _api.getRecentActivities();
    } catch (e) {
      // Log error và trả về mảng rỗng
      print('Error getting recent activities: $e');
      return [];
    }
  }

  // Lấy thông tin căn hộ
  Future<ApartmentInfo> getMyApartment() async {
    try {
      return await _api.getMyApartment();
    } catch (e) {
      // Log error và trả về dữ liệu mặc định
      print('Error getting apartment info: $e');
      return const ApartmentInfo();
    }
  }

  // Lấy nhật ký hoạt động chi tiết
  Future<List<Activity>> getActivityLogs({
    int page = 0,
    int size = 20,
    String? actionType,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      return await _api.getActivityLogs(
        page: page,
        size: size,
        actionType: actionType,
        startDate: startDate,
        endDate: endDate,
      );
    } catch (e) {
      print('Error getting activity logs: $e');
      return [];
    }
  }

  // Xuất nhật ký hoạt động
  Future<Uint8List?> exportActivityLogs({
    String? actionType,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      return await _api.exportActivityLogs(
        actionType: actionType,
        startDate: startDate,
        endDate: endDate,
      );
    } catch (e) {
      print('Error exporting activity logs: $e');
      return null;
    }
  }

  // Lấy tất cả dữ liệu dashboard cùng lúc
  Future<Map<String, dynamic>> getAllDashboardData() async {
    try {
      final results = await Future.wait([
        getDashboardStats(),
        getRecentActivities(),
        getMyApartment(),
      ]);

      return {
        'stats': results[0] as DashboardStats,
        'activities': results[1] as List<RecentActivity>,
        'apartment': results[2] as ApartmentInfo,
      };
    } catch (e) {
      print('Error getting all dashboard data: $e');
      return {
        'stats': const DashboardStats(
          totalInvoices: 0,
          pendingInvoices: 0,
          overdueInvoices: 0,
          totalAmount: 0,
          unreadAnnouncements: 0,
          upcomingEvents: 0,
          activeBookings: 0,
          supportRequests: 0,
        ),
        'activities': <RecentActivity>[],
        'apartment': const ApartmentInfo(),
      };
    }
  }
}
