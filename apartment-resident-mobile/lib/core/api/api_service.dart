import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import '../storage/secure_storage.dart';
import '../app_config.dart';

class ApiService {
  static String get baseUrl => AppConfig.apiBaseUrl;

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
          await TokenStorage.instance.saveToken(userData['token'] as String);

          // Cố gắng gọi /api/auth/me để lấy đầy đủ hồ sơ (fullName, avatar,...)
          Map<String, dynamic> merged = Map<String, dynamic>.from(userData);
          try {
            final profile = await getProfile();
            if (profile != null && profile.isNotEmpty) {
              merged.addAll(profile);
              // Lưu lại profile đầy đủ
              await TokenStorage.instance.saveToken(
                userData['token'] as String,
              );
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
      final serverMsg = data is Map<String, dynamic>
          ? (data['message']?.toString())
          : null;
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
      final token = await TokenStorage.instance.getToken();
      if (token == null || token.isEmpty) return null;

      final res = await http
          .get(
            Uri.parse('$baseUrl/api/auth/me'),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
          )
          .timeout(const Duration(seconds: 20));

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
}
