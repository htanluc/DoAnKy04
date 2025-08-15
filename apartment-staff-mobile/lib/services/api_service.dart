import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class ApiService {
  static String baseUrl = const String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8080',
  );

  static Future<Map<String, dynamic>> login(
    String phone,
    String password,
  ) async {
    try {
      final res = await http
          .post(
            Uri.parse('$baseUrl/api/auth/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'phoneNumber': phone, 'password': password}),
          )
          .timeout(const Duration(seconds: 12));
      final data = jsonDecode(res.body);
      if (res.statusCode >= 200 &&
          res.statusCode < 300 &&
          data['success'] == true) {
        final userData =
            (data['data']?['jwt'] ?? data['data']) as Map<String, dynamic>;
        await AuthService.saveAuth(userData['token'] as String, userData);
        return userData;
      }
      throw Exception(data['message'] ?? 'Login failed (${res.statusCode})');
    } on TimeoutException {
      throw Exception('Hết thời gian chờ kết nối máy chủ');
    } on http.ClientException catch (e) {
      throw Exception('Lỗi mạng: ${e.message}');
    } on FormatException {
      throw Exception('Phản hồi không hợp lệ từ máy chủ');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  static Future<List<dynamic>> getAssignedRequests(int staffId) async {
    try {
      final token = await AuthService.getToken();
      final res = await http.get(
        Uri.parse(
          '$baseUrl/api/staff/support-requests/assigned?staffId=$staffId',
        ),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200) {
        return jsonDecode(res.body) as List<dynamic>;
      }
      throw Exception('Tải danh sách thất bại (${res.statusCode})');
    } on TimeoutException {
      throw Exception('Hết thời gian chờ khi tải danh sách');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  static Future<void> updateStatus(
    int id,
    String status, {
    String? notes,
  }) async {
    try {
      final token = await AuthService.getToken();
      final res = await http
          .put(
            Uri.parse('$baseUrl/api/staff/support-requests/$id/status'),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
            body: jsonEncode({
              'status': status,
              'isCompleted': status == 'COMPLETED',
              if (notes != null && notes.trim().isNotEmpty)
                'resolutionNotes': notes.trim(),
            }),
          )
          .timeout(const Duration(seconds: 12));
      if (res.statusCode < 200 || res.statusCode >= 300) {
        throw Exception('Cập nhật trạng thái thất bại (${res.statusCode})');
      }
    } on TimeoutException {
      throw Exception('Hết thời gian chờ khi cập nhật trạng thái');
    } catch (e) {
      throw Exception(e.toString());
    }
  }
}
