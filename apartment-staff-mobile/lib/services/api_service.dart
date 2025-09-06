import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class ApiService {
  static String baseUrl = const String.fromEnvironment(
    'API_BASE_URL',
    // Genymotion uses 10.0.3.2 to access host machine
    defaultValue: 'http://10.0.3.2:8080',
  );

  static Future<Map<String, dynamic>> login(
    String phone,
    String password,
  ) async {
    try {
      // Debug logs
      // ignore: avoid_print
      print('[ApiService] POST $baseUrl/api/auth/login');
      // ignore: avoid_print
      print('[ApiService] Body: {"phoneNumber": "$phone", "password": "***"}');

      final res = await http
          .post(
            Uri.parse('$baseUrl/api/auth/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'phoneNumber': phone, 'password': password}),
          )
          .timeout(const Duration(seconds: 25));
      // ignore: avoid_print
      print('[ApiService] Status: ${res.statusCode}');
      // ignore: avoid_print
      print('[ApiService] Response: ${res.body}');
      final data = jsonDecode(res.body);
      if (res.statusCode >= 200 &&
          res.statusCode < 300 &&
          data['success'] == true) {
        final payload = data['data'];
        final jwt = payload is Map<String, dynamic> ? payload['jwt'] : null;
        if (jwt is Map<String, dynamic> && jwt['token'] != null) {
          final userData = jwt;
          // Lưu token + thông tin cơ bản trước để các API sau dùng được
          await AuthService.saveAuth(userData['token'] as String, userData);

          // Cố gắng gọi /api/auth/me để lấy đầy đủ hồ sơ (fullName, avatar,...)
          Map<String, dynamic> merged = Map<String, dynamic>.from(userData);
          try {
            final profile = await getProfile();
            if (profile != null && profile.isNotEmpty) {
              merged.addAll(profile);
              await AuthService.saveAuth(userData['token'] as String, merged);
            }
          } catch (_) {
            // Bỏ qua nếu không lấy được hồ sơ, vẫn đăng nhập bình thường
          }

          return merged;
        }

        // Không có JWT -> tài khoản không hoạt động (LOCKED/INACTIVE/...).
        final status = payload is Map<String, dynamic>
            ? payload['status']?.toString()
            : null;
        final message = data['message']?.toString();
        final hint = status == 'LOCKED'
            ? 'Vui lòng liên hệ quản trị viên để biết thêm chi tiết.'
            : (status == 'INACTIVE'
                ? 'Tài khoản chưa kích hoạt. Vui lòng kiểm tra email để xác thực.'
                : 'Tài khoản không hoạt động.');
        throw Exception(message != null && message.isNotEmpty ? message : hint);
      }
      final serverMsg =
          data is Map<String, dynamic> ? (data['message']?.toString()) : null;
      throw Exception(serverMsg ?? 'Login failed (${res.statusCode})');
    } on TimeoutException {
      // ignore: avoid_print
      print('[ApiService] Timeout when calling /api/auth/login');
      throw Exception('Hết thời gian chờ kết nối máy chủ');
    } on http.ClientException catch (e) {
      // ignore: avoid_print
      print('[ApiService] ClientException: ${e.message}');
      throw Exception('Lỗi mạng: ${e.message}');
    } on FormatException {
      // ignore: avoid_print
      print('[ApiService] FormatException: invalid JSON response');
      throw Exception('Phản hồi không hợp lệ từ máy chủ');
    } catch (e) {
      // ignore: avoid_print
      print('[ApiService] Unknown error: $e');
      throw Exception(e.toString());
    }
  }

  /// Lấy hồ sơ người dùng hiện tại từ server để có [fullName], [avatarUrl],...
  static Future<Map<String, dynamic>?> getProfile() async {
    try {
      final token = await AuthService.getToken();
      if (token == null || token.isEmpty) return null;

      final res = await http.get(
        Uri.parse('$baseUrl/api/auth/me'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 20));

      final body = jsonDecode(res.body);
      if (res.statusCode >= 200 &&
          res.statusCode < 300 &&
          body['success'] == true) {
        final data = body['data'];
        if (data is Map<String, dynamic>) {
          final u = data['user'];
          if (u is Map<String, dynamic>) return u;
          return data;
        }
      }
      return null;
    } on TimeoutException {
      throw Exception('Hết thời gian chờ khi lấy hồ sơ người dùng');
    } catch (e) {
      // Trả null để không chặn luồng đăng nhập
      return null;
    }
  }

  // Chuẩn hoá URL file/ảnh để dùng được trong emulator/device
  static String normalizeFileUrl(String url) {
    try {
      if (url.isEmpty) return url;
      final base = Uri.parse(baseUrl);

      // Nếu là relative path, gắn baseUrl vào
      if (url.startsWith('/')) {
        return base.replace(path: url).toString();
      }

      final u = Uri.parse(url);
      if (u.host == 'localhost' ||
          u.host == '127.0.0.1' ||
          u.host == '10.0.2.2') {
        return u.replace(host: base.host, port: base.port).toString();
      }
      return url;
    } catch (_) {
      return url;
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
      ).timeout(const Duration(seconds: 25));
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

  static Future<Map<String, dynamic>?> getAssignedRequestById(
      int staffId, int requestId) async {
    final list = await getAssignedRequests(staffId);
    try {
      return list
          .cast<Map<String, dynamic>>()
          .firstWhere((e) => (e['id'] as num).toInt() == requestId);
    } catch (_) {
      return null;
    }
  }

  static Future<void> updateStatus(
    int id,
    String status, {
    String? notes,
  }) async {
    try {
      final token = await AuthService.getToken();

      // Tạo body JSON
      final body = <String, dynamic>{
        'status': status,
        'isCompleted': status == 'COMPLETED',
      };

      // Chỉ thêm resolutionNotes nếu có notes và không rỗng
      if (notes != null && notes.trim().isNotEmpty) {
        body['resolutionNotes'] = notes.trim();
      }

      // Debug log
      print('[ApiService] PUT $baseUrl/api/staff/support-requests/$id/status');
      print('[ApiService] Body: ${jsonEncode(body)}');

      final res = await http
          .put(
            Uri.parse('$baseUrl/api/staff/support-requests/$id/status'),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 25));

      print('[ApiService] Status: ${res.statusCode}');
      print('[ApiService] Response: ${res.body}');

      if (res.statusCode < 200 || res.statusCode >= 300) {
        throw Exception('Cập nhật trạng thái thất bại (${res.statusCode})');
      }
    } on TimeoutException {
      throw Exception('Hết thời gian chờ khi cập nhật trạng thái');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Đổi mật khẩu
  static Future<void> changePassword(
      String oldPassword, String newPassword) async {
    try {
      final token = await AuthService.getToken();
      final res = await http
          .post(
            Uri.parse('$baseUrl/api/auth/change-password'),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
            body: jsonEncode({
              'oldPassword': oldPassword,
              'newPassword': newPassword,
              'confirmNewPassword': newPassword,
            }),
          )
          .timeout(const Duration(seconds: 25));
      if (res.statusCode < 200 || res.statusCode >= 300) {
        try {
          final body = jsonDecode(res.body);
          final msg = body is Map<String, dynamic>
              ? (body['message']?.toString() ?? body['error']?.toString())
              : null;
          throw Exception(msg ?? 'Đổi mật khẩu thất bại (${res.statusCode})');
        } catch (_) {
          throw Exception('Đổi mật khẩu thất bại (${res.statusCode})');
        }
      }
    } on TimeoutException {
      throw Exception('Hết thời gian chờ khi đổi mật khẩu');
    } catch (e) {
      throw Exception(e.toString());
    }
  }
}
