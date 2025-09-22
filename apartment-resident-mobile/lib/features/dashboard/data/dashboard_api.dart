import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/dashboard_stats.dart';
import '../models/activity.dart';

class DashboardApi {
  static const String baseUrl = 'http://localhost:8080/api';

  // Lấy token từ SharedPreferences
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Tạo headers với token
  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // GET /dashboard/stats
  Future<DashboardStats> getDashboardStats() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/dashboard/stats'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return DashboardStats.fromJson(data);
      } else {
        throw Exception(
          'Lỗi khi lấy thống kê dashboard: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('API Error: $e');
      // Trả về dữ liệu mẫu nếu API lỗi
      return const DashboardStats(
        totalInvoices: 5,
        pendingInvoices: 2,
        overdueInvoices: 1,
        totalAmount: 2500000,
        unreadAnnouncements: 3,
        upcomingEvents: 2,
        activeBookings: 1,
        supportRequests: 0,
      );
    }
  }

  // GET /dashboard/activities
  Future<List<RecentActivity>> getRecentActivities() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/dashboard/recent-activities'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => RecentActivity.fromJson(json)).toList();
      } else {
        throw Exception(
          'Lỗi khi lấy hoạt động gần đây: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('API Error getting activities: $e');
      // Trả về dữ liệu mẫu nếu API lỗi
      return [
        const RecentActivity(
          id: '1',
          type: ActivityType.invoice,
          title: 'Hóa đơn tháng 12/2024',
          description: 'Hóa đơn dịch vụ căn hộ đã được tạo',
          timestamp: '2024-12-20T10:30:00Z',
          status: 'pending',
        ),
        const RecentActivity(
          id: '2',
          type: ActivityType.announcement,
          title: 'Thông báo bảo trì thang máy',
          description: 'Thang máy sẽ được bảo trì vào ngày 25/12',
          timestamp: '2024-12-19T14:20:00Z',
          status: 'active',
        ),
        const RecentActivity(
          id: '3',
          type: ActivityType.event,
          title: 'Tiệc Giáng sinh 2024',
          description: 'Đăng ký tham gia tiệc Giáng sinh',
          timestamp: '2024-12-18T09:15:00Z',
          status: 'confirmed',
        ),
      ];
    }
  }

  // GET /apartments/my
  Future<ApartmentInfo> getMyApartment() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/apartments/my'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return ApartmentInfo.fromJson(data);
      } else {
        throw Exception('Lỗi khi lấy thông tin căn hộ: ${response.statusCode}');
      }
    } catch (e) {
      print('API Error getting apartment info: $e');
      // Trả về dữ liệu mẫu nếu API lỗi
      return const ApartmentInfo(
        apartmentNumber: 'A1-101',
        buildingName: 'Tòa A1',
        area: 85.5,
        bedrooms: 2,
        floor: 1,
      );
    }
  }

  // GET /activity-logs/my (cho activity logs chi tiết)
  Future<List<Activity>> getActivityLogs({
    int page = 0,
    int size = 20,
    String? actionType,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final headers = await _getHeaders();
      final queryParams = <String, String>{
        'page': page.toString(),
        'size': size.toString(),
      };

      if (actionType != null) queryParams['actionType'] = actionType;
      if (startDate != null)
        queryParams['startDate'] = startDate.toIso8601String();
      if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();

      final uri = Uri.parse(
        '$baseUrl/activity-logs/my',
      ).replace(queryParameters: queryParams);

      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> activities = data['data']['content'] ?? [];
          return activities.map((json) => Activity.fromJson(json)).toList();
        }
        return [];
      } else {
        throw Exception(
          'Lỗi khi lấy nhật ký hoạt động: ${response.statusCode}',
        );
      }
    } catch (e) {
      return [];
    }
  }

  // Export activity logs
  Future<Uint8List?> exportActivityLogs({
    String? actionType,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final headers = await _getHeaders();
      final queryParams = <String, String>{};

      if (actionType != null) queryParams['actionType'] = actionType;
      if (startDate != null)
        queryParams['startDate'] = startDate.toIso8601String();
      if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();

      final uri = Uri.parse(
        '$baseUrl/activity-logs/my/export',
      ).replace(queryParameters: queryParams);

      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        return response.bodyBytes;
      } else {
        throw Exception(
          'Lỗi khi xuất nhật ký hoạt động: ${response.statusCode}',
        );
      }
    } catch (e) {
      return null;
    }
  }
}
