import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:apartment_resident_mobile/core/storage/secure_storage.dart';
import 'package:apartment_resident_mobile/core/app_config.dart';
import '../models/dashboard_stats.dart';
import '../models/activity.dart';

class DashboardApi {
  static String get baseUrl => '${AppConfig.apiBaseUrl}/api';

  // Lấy token từ SharedPreferences
  Future<String?> _getToken() async => TokenStorage.instance.getToken();

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
      final uri = Uri.parse('$baseUrl/dashboard/stats');
      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        // ignore: avoid_print
        print('[DashboardApi] GET $uri => ${response.statusCode}');
        // ignore: avoid_print
        print('[DashboardApi] Body: ${response.body}');
        final decoded = json.decode(response.body);
        final data = decoded is Map<String, dynamic>
            ? (decoded['data'] ?? decoded)
            : decoded;
        return DashboardStats.fromJson(
          data is Map<String, dynamic> ? data : <String, dynamic>{},
        );
      } else {
        throw Exception(
          'Lỗi khi lấy thống kê dashboard: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('API Error: $e');
      // Không trả mock; để UI xử lý empty/default
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

  // GET /dashboard/activities
  Future<List<RecentActivity>> getRecentActivities() async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse(
        '$baseUrl/activity-logs/my/recent',
      ).replace(queryParameters: {'limit': '10'});
      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        // ignore: avoid_print
        print('[DashboardApi] GET $uri => ${response.statusCode}');
        final decoded = json.decode(response.body);
        final list = decoded is Map<String, dynamic>
            ? (decoded['data'] as List<dynamic>? ?? const [])
            : (decoded as List<dynamic>? ?? const []);
        return list
            .whereType<Map<String, dynamic>>()
            .map((json) => RecentActivity.fromJson(json))
            .toList();
      } else {
        throw Exception(
          'Lỗi khi lấy hoạt động gần đây: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('API Error getting activities: $e');
      // Không trả mock
      return const <RecentActivity>[];
    }
  }

  // GET /apartments/my
  Future<ApartmentInfo> getMyApartment() async {
    try {
      final headers = await _getHeaders();
      // Ưu tiên lấy từ /auth/me để có buildingName (apartmentResident)
      final meUri = Uri.parse('${AppConfig.apiBaseUrl}/api/auth/me');
      final meRes = await http.get(meUri, headers: headers);
      if (meRes.statusCode == 200) {
        final decoded = json.decode(meRes.body);
        final data = decoded is Map<String, dynamic>
            ? (decoded['data'] ?? decoded)
            : decoded;
        if (data is Map<String, dynamic>) {
          final apt = data['apartment'] is Map<String, dynamic>
              ? Map<String, dynamic>.from(data['apartment'] as Map)
              : <String, dynamic>{};
          final link = data['apartmentResident'] is Map<String, dynamic>
              ? Map<String, dynamic>.from(data['apartmentResident'] as Map)
              : <String, dynamic>{};
          final mapped = <String, dynamic>{
            'apartmentNumber': apt['unitNumber'] ?? apt['apartmentNumber'],
            'buildingName': link['buildingName'] ?? '',
            'area': apt['area'],
            'bedrooms': apt['bedrooms'] ?? 0,
            'floor': apt['floorNumber'] ?? 0,
          };
          return ApartmentInfo.fromJson(mapped);
        }
      }

      // Fallback: /apartments/my (trả về list)
      final uri = Uri.parse('$baseUrl/apartments/my');
      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        // ignore: avoid_print
        print('[DashboardApi] GET $uri => ${response.statusCode}');
        final decoded = json.decode(response.body);
        if (decoded is List && decoded.isNotEmpty) {
          final first = Map<String, dynamic>.from(decoded.first as Map);
          final mapped = <String, dynamic>{
            'apartmentNumber': first['unitNumber'],
            'buildingName': first['buildingName'] ?? '',
            'area': first['area'],
            'bedrooms': first['bedrooms'] ?? 0,
            'floor': first['floorNumber'] ?? 0,
          };
          return ApartmentInfo.fromJson(mapped);
        } else if (decoded is Map<String, dynamic>) {
          // Một số BE có thể trả trực tiếp object
          final first = decoded;
          final mapped = <String, dynamic>{
            'apartmentNumber': first['unitNumber'] ?? first['apartmentNumber'],
            'buildingName': first['buildingName'] ?? '',
            'area': first['area'],
            'bedrooms': first['bedrooms'] ?? 0,
            'floor': first['floorNumber'] ?? first['floor'],
          };
          return ApartmentInfo.fromJson(mapped);
        }
        return const ApartmentInfo();
      } else {
        throw Exception('Lỗi khi lấy thông tin căn hộ: ${response.statusCode}');
      }
    } catch (e) {
      print('API Error getting apartment info: $e');
      // Trả về rỗng để UI tự xử lý
      return const ApartmentInfo();
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
