import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart' show MediaType;
import 'auth_service.dart';

class ApiService {
  static String baseUrl = const String.fromEnvironment(
    'API_BASE_URL',
    // For real device, use your computer's IP address instead of 10.0.3.2 (emulator only)
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
          // Save token + basic info first so subsequent APIs can use it
          await AuthService.saveAuth(userData['token'] as String, userData);

          // Try calling /api/auth/me to fetch full profile (fullName, avatar,...)
          Map<String, dynamic> merged = Map<String, dynamic>.from(userData);
          try {
            final profile = await getProfile();
            if (profile != null && profile.isNotEmpty) {
              merged.addAll(profile);
              await AuthService.saveAuth(userData['token'] as String, merged);
            }
          } catch (_) {
            // Ignore if profile fetch fails; still consider login successful
          }

          return merged;
        }

        // No JWT -> account not active (LOCKED/INACTIVE/...).
        final status = payload is Map<String, dynamic>
            ? payload['status']?.toString()
            : null;
        final message = data['message']?.toString();
        final hint = status == 'LOCKED'
            ? 'Please contact the administrator for more details.'
            : (status == 'INACTIVE'
                ? 'Account not activated. Please check email to verify.'
                : 'Account is not active.');
        throw Exception(message != null && message.isNotEmpty ? message : hint);
      }
      final serverMsg =
          data is Map<String, dynamic> ? (data['message']?.toString()) : null;
      throw Exception(serverMsg ?? 'Login failed (${res.statusCode})');
    } on TimeoutException {
      // ignore: avoid_print
      print('[ApiService] Timeout when calling /api/auth/login');
      throw Exception('Connection to server timed out');
    } on http.ClientException catch (e) {
      // ignore: avoid_print
      print('[ApiService] ClientException: ${e.message}');
      throw Exception('Network error: ${e.message}');
    } on FormatException {
      // ignore: avoid_print
      print('[ApiService] FormatException: invalid JSON response');
      throw Exception('Invalid response from server');
    } catch (e) {
      // ignore: avoid_print
      print('[ApiService] Unknown error: $e');
      throw Exception(e.toString());
    }
  }

  /// Get current user profile from server for [fullName], [avatarUrl],...
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
      throw Exception('Timed out while fetching user profile');
    } catch (e) {
      // Trả null để không chặn luồng đăng nhập
      return null;
    }
  }

  // Normalize file/image URL for emulator/device
  static String normalizeFileUrl(String url) {
    try {
      if (url.isEmpty) return url;
      final base = Uri.parse(baseUrl);

      // Chuẩn hoá backslash -> slash (một số API có thể trả "\\uploads\\a.jpg")
      url = url.replaceAll('\\\\', '/').replaceAll('\\', '/');

      // Bỏ khoảng trắng thừa
      url = url.trim();

      // If relative path, attach baseUrl
      if (url.startsWith('/')) {
        return base.replace(path: url).toString();
      }

      // Nếu trả về path tương đối (không có scheme), gắn vào base
      final looksLikeRelative =
          !url.contains('://') && !url.startsWith('data:');
      if (looksLikeRelative) {
        // Xử lý trường hợp thiếu slash
        final joined = url.startsWith('/')
            ? base.replace(path: url)
            : base.replace(
                path:
                    '${base.path.endsWith('/') ? base.path : base.path + '/'}$url');
        return joined.toString();
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
      throw Exception('Failed to load list (${res.statusCode})');
    } on TimeoutException {
      throw Exception('Timed out while loading list');
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
    List<String>? beforeImages,
    List<String>? afterImages,
  }) async {
    try {
      final token = await AuthService.getToken();

      // Tạo body JSON
      final body = <String, dynamic>{
        'status': status,
        'isCompleted': status == 'COMPLETED',
      };

      // Only include resolutionNotes if provided and non-empty
      if (notes != null && notes.trim().isNotEmpty) {
        body['resolutionNotes'] = notes.trim();
      }

      if (beforeImages != null && beforeImages.isNotEmpty) {
        body['beforeImages'] = beforeImages;
      }
      if (afterImages != null && afterImages.isNotEmpty) {
        body['afterImages'] = afterImages;
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
        throw Exception('Failed to update status (${res.statusCode})');
      }
    } on TimeoutException {
      throw Exception('Timed out while updating status');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Change password
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
          throw Exception(
              msg ?? 'Failed to change password (${res.statusCode})');
        } catch (_) {
          throw Exception('Failed to change password (${res.statusCode})');
        }
      }
    } on TimeoutException {
      throw Exception('Timed out while changing password');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Helper: find apartmentId by code (unitNumber)
  static Future<int?> _findApartmentIdByCode(String apartmentCode) async {
    try {
      final token = await AuthService.getToken();
      final res = await http.get(Uri.parse('$baseUrl/api/apartments'),
          headers: {
            'Authorization': 'Bearer $token'
          }).timeout(const Duration(seconds: 20));

      if (res.statusCode >= 200 && res.statusCode < 300) {
        final body = jsonDecode(res.body);
        if (body is List) {
          for (final item in body) {
            if (item is Map<String, dynamic>) {
              final code = item['unitNumber']?.toString();
              if (code != null &&
                  code.toLowerCase() == apartmentCode.toLowerCase()) {
                final id = item['id'];
                if (id is num) return id.toInt();
              }
            }
          }
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // Submit new water reading
  static Future<void> submitWaterReading({
    required String apartmentCode,
    required int currentReading,
    DateTime? readingAt,
    String? readingMonth, // yyyy-MM
    String? note,
  }) async {
    try {
      final token = await AuthService.getToken();
      final body = <String, dynamic>{
        'apartmentCode': apartmentCode,
        'currentReading': currentReading,
        if (readingAt != null) 'readingAt': readingAt.toIso8601String(),
        if (readingMonth != null && readingMonth.isNotEmpty)
          'readingMonth': readingMonth,
        if (note != null && note.trim().isNotEmpty) 'note': note.trim(),
      };

      // Debug log
      // ignore: avoid_print
      print('[ApiService] POST '
          '$baseUrl/api/staff/water-readings');
      // ignore: avoid_print
      print('[ApiService] Body: ' + jsonEncode(body));

      final primaryRes = await http
          .post(
            Uri.parse('$baseUrl/api/staff/water-readings'),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 25));

      // ignore: avoid_print
      print('[ApiService] Status: ${primaryRes.statusCode}');
      // ignore: avoid_print
      print('[ApiService] Response: ${primaryRes.body}');

      if (primaryRes.statusCode >= 200 && primaryRes.statusCode < 300) {
        return; // success via staff endpoint
      }

      // Fallback: use existing admin endpoint
      final aptId = await _findApartmentIdByCode(apartmentCode);
      if (aptId == null) {
        throw Exception('Apartment "$apartmentCode" not found');
      }

      final adminBody = <String, dynamic>{
        'apartmentId': aptId,
        // backend DTO hỗ trợ cả readingDate hoặc readingMonth
        if (readingAt != null)
          'readingDate': readingAt.toIso8601String().substring(0, 10),
        if (readingMonth != null && readingMonth.isNotEmpty)
          'readingMonth': readingMonth,
        'currentReading': currentReading,
        'meterReading': currentReading,
      };

      // ignore: avoid_print
      print('[ApiService] Fallback POST $baseUrl/api/admin/water-readings');
      // ignore: avoid_print
      print('[ApiService] Body: ${jsonEncode(adminBody)}');

      final res = await http
          .post(
            Uri.parse('$baseUrl/api/admin/water-readings'),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
            body: jsonEncode(adminBody),
          )
          .timeout(const Duration(seconds: 25));

      // ignore: avoid_print
      print('[ApiService] Admin Status: ${res.statusCode}');
      // ignore: avoid_print
      print('[ApiService] Admin Response: ${res.body}');

      if (res.statusCode < 200 || res.statusCode >= 300) {
        try {
          final m = jsonDecode(res.body);
          final msg = m is Map<String, dynamic>
              ? (m['message']?.toString() ?? m['error']?.toString())
              : null;
          throw Exception(
              msg ?? 'Failed to submit water reading (${res.statusCode})');
        } catch (_) {
          throw Exception('Failed to submit water reading (${res.statusCode})');
        }
      }
    } on TimeoutException {
      throw Exception('Timed out while submitting water reading');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Lookup apartment info and latest reading by code
  static Future<Map<String, dynamic>?> lookupWaterReading(
      String apartmentCode) async {
    try {
      final token = await AuthService.getToken();
      final uri = Uri.parse(
          '$baseUrl/api/staff/water-readings/lookup?apartmentCode=${Uri.encodeQueryComponent(apartmentCode)}');

      // ignore: avoid_print
      print('[ApiService] GET $uri');

      final res = await http.get(uri, headers: {
        'Authorization': 'Bearer $token'
      }).timeout(const Duration(seconds: 20));

      // ignore: avoid_print
      print('[ApiService] Status: ${res.statusCode}');
      // ignore: avoid_print
      print('[ApiService] Response: ${res.body}');

      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          final body = jsonDecode(res.body);
          if (body is Map<String, dynamic>) {
            // Chuẩn hoá vài key phổ biến
            final data = body['data'];
            if (data is Map<String, dynamic>) return data;
            return body;
          }
        } catch (_) {}
      }

      // Fallback: self-lookup using available admin APIs
      final aptId = await _findApartmentIdByCode(apartmentCode);
      if (aptId == null) return null;

      final adminUri =
          Uri.parse('$baseUrl/api/admin/apartments/$aptId/water-readings');
      // ignore: avoid_print
      print('[ApiService] Fallback GET $adminUri');

      final res2 = await http.get(adminUri, headers: {
        'Authorization': 'Bearer $token'
      }).timeout(const Duration(seconds: 20));

      // ignore: avoid_print
      print('[ApiService] Fallback Status: ${res2.statusCode}');
      // ignore: avoid_print
      print('[ApiService] Fallback Response: ${res2.body}');

      if (res2.statusCode >= 200 && res2.statusCode < 300) {
        try {
          final list = jsonDecode(res2.body);
          if (list is List && list.isNotEmpty) {
            // assume list is already sorted by date desc from service
            final latest = list.first;
            if (latest is Map<String, dynamic>) {
              final reading =
                  latest['currentReading'] ?? latest['meterReading'];
              final date = latest['readingDate'] ?? latest['readingMonth'];
              return {
                'apartmentCode': apartmentCode,
                'apartmentName': latest['apartmentName'] ?? apartmentCode,
                'latest': {
                  'reading': reading,
                  'time': date?.toString(),
                },
                'lastReading': (reading is num) ? reading : null,
                'lastReadingAt': date?.toString(),
              };
            }
          }
        } catch (_) {}
      }
      return null;
    } on TimeoutException {
      throw Exception('Timed out while looking up apartment');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Get list of readings for an apartment by month (yyyy-MM). Returns List<Map>.
  static Future<List<Map<String, dynamic>>> getMonthlyWaterReadings({
    required String apartmentCode,
    required String month, // yyyy-MM
  }) async {
    final token = await AuthService.getToken();
    // Thử staff route nếu có
    final staffUri =
        Uri.parse('$baseUrl/api/admin/water-readings/by-month?month=$month');
    try {
      // ignore: avoid_print
      print('[ApiService] GET $staffUri');
      final res = await http.get(staffUri, headers: {
        'Authorization': 'Bearer $token'
      }).timeout(const Duration(seconds: 20));
      // ignore: avoid_print
      print('[ApiService] Status: ${res.statusCode}');
      // ignore: avoid_print
      print('[ApiService] Response: ${res.body}');
      if (res.statusCode >= 200 && res.statusCode < 300) {
        final arr = jsonDecode(res.body);
        if (arr is List) {
          final codeLower = apartmentCode.toLowerCase();
          // 1) Prefer filtering by apartment name/code present in DTO
          final filteredByName = arr
              .whereType<Map<String, dynamic>>()
              .where((e) {
                final name = e['apartmentName']?.toString().toLowerCase();
                final code = e['apartmentCode']?.toString().toLowerCase();
                return (name != null && name == codeLower) ||
                    (code != null && code == codeLower);
              })
              .map((e) => e)
              .toList();
          if (filteredByName.isNotEmpty) return filteredByName;

          // 2) Fallback: filter by apartmentId if necessary
          final id = await _findApartmentIdByCode(apartmentCode);
          if (id == null) return const [];
          final byId = arr
              .whereType<Map<String, dynamic>>()
              .where((e) => (e['apartmentId'] as num?)?.toInt() == id)
              .map((e) => e)
              .toList();
          if (byId.isNotEmpty) return byId;

          // 3) Final fallback: call API to get readings by apartment then filter by month
          final alt = await http.get(
              Uri.parse('$baseUrl/api/admin/apartments/$id/water-readings'),
              headers: {
                'Authorization': 'Bearer $token'
              }).timeout(const Duration(seconds: 20));
          if (alt.statusCode >= 200 && alt.statusCode < 300) {
            final list = jsonDecode(alt.body);
            if (list is List) {
              return list.whereType<Map<String, dynamic>>().where((e) {
                final d = (e['readingDate'] ?? e['readingMonth'])?.toString();
                return d != null && d.toString().startsWith(month);
              }).toList();
            }
          }
        }
      }
    } catch (_) {}
    return const [];
  }

  // Utility: get latest record of the specified month for an apartment
  static Future<Map<String, dynamic>?> getMonthlyLatestReading({
    required String apartmentCode,
    required String month,
  }) async {
    final list = await getMonthlyWaterReadings(
        apartmentCode: apartmentCode, month: month);
    if (list.isEmpty) return null;
    // Normalize: list is already within one month; pick record with max readingDate
    list.sort((a, b) => (b['readingDate'] ?? '')
        .toString()
        .compareTo((a['readingDate'] ?? '').toString()));
    return list.first;
  }

  /// Get the latest record of each of the last [months] months.
  /// Returns a list sorted from newest -> oldest month: [{ 'month': 'yyyy-MM', 'record': Map? }]
  static Future<List<Map<String, dynamic>>> getLatestReadingsForLastMonths({
    required String apartmentCode,
    int months = 12,
  }) async {
    final now = DateTime.now();
    final result = <Map<String, dynamic>>[];
    for (int i = 0; i < months; i++) {
      final d = DateTime(now.year, now.month - i, 1);
      final month = '${d.year}-${d.month.toString().padLeft(2, '0')}';
      try {
        final rec = await getMonthlyLatestReading(
            apartmentCode: apartmentCode, month: month);
        result.add({'month': month, 'record': rec});
      } catch (_) {
        result.add({'month': month, 'record': null});
      }
    }
    return result;
  }

  // Quick update reading by id (mobile can update only, not create)
  static Future<void> updateWaterReadingById({
    required int id,
    required int currentReading,
  }) async {
    try {
      final token = await AuthService.getToken();
      final uri = Uri.parse('$baseUrl/api/admin/water-readings/$id');
      final res = await http
          .patch(uri,
              headers: {
                'Authorization': 'Bearer $token',
                'Content-Type': 'application/json',
              },
              body: jsonEncode({'currentReading': currentReading}))
          .timeout(const Duration(seconds: 20));
      if (res.statusCode < 200 || res.statusCode >= 300) {
        try {
          final body = jsonDecode(res.body);
          final msg = body is Map<String, dynamic>
              ? (body['message']?.toString() ?? body['error']?.toString())
              : null;
          throw Exception(
              msg ?? 'Failed to update reading (${res.statusCode})');
        } catch (_) {
          throw Exception('Failed to update reading (${res.statusCode})');
        }
      }
    } on TimeoutException {
      throw Exception('Timed out while updating reading');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  /// Upload ảnh service request, trả về URL ảnh từ server
  static Future<String> uploadServiceRequestFile(String filePath,
      {String? fileName, String? contentType}) async {
    final token = await AuthService.getToken();
    final uri = Uri.parse('$baseUrl/api/upload/service-request');

    Future<http.Response> _send({bool withContentType = true}) async {
      final request = http.MultipartRequest('POST', uri);
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      final file = File(filePath);
      final multipart = await http.MultipartFile.fromPath(
        'files',
        file.path,
        filename: fileName ?? file.uri.pathSegments.last,
        contentType: withContentType && contentType != null
            ? MediaTypeHelper.parse(contentType)
            : null,
      );
      request.files.add(multipart);

      // Debug logs
      // ignore: avoid_print
      print('[ApiService] UPLOAD POST $uri');
      // ignore: avoid_print
      print(
          '[ApiService] File: ${multipart.filename} (${file.lengthSync()} bytes)');
      // ignore: avoid_print
      print(
          '[ApiService] WithContentType: $withContentType, Declared: ${contentType ?? 'auto'}');

      final streamed =
          await request.send().timeout(const Duration(seconds: 40));
      return http.Response.fromStream(streamed);
    }

    http.Response res;
    try {
      res = await _send(withContentType: true);
    } catch (_) {
      // Thử lại không set contentType nếu lần đầu lỗi ở tầng gửi
      res = await _send(withContentType: false);
    }

    // ignore: avoid_print
    print('[ApiService] Upload Status: ${res.statusCode}');
    // ignore: avoid_print
    print('[ApiService] Upload Response: ${res.body}');

    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        final body = jsonDecode(res.body);
        final success =
            body is Map<String, dynamic> ? (body['success'] == true) : false;
        if (success) {
          final data = body['data'];
          // Accept both string and list of urls
          if (data is String && data.isNotEmpty) return data;
          if (data is List && data.isNotEmpty) {
            final first = data.first;
            if (first is String && first.startsWith('http')) return first;
            // Some BE may wrap each item as object {url: "..."}
            if (first is Map<String, dynamic>) {
              final url = first['url']?.toString();
              if (url != null && url.startsWith('http')) return url;
            }
          }
        }
        // Nếu backend trả string trực tiếp trong body
        if (body is String && body.startsWith('http')) return body;
        // Một số backend trả { url: '...' }
        if (body is Map<String, dynamic>) {
          final url = body['url']?.toString();
          if (url != null && url.startsWith('http')) return url;
        }
      } catch (_) {
        // Nếu backend trả thẳng URL string
        if (res.body.isNotEmpty && res.body.startsWith('http')) return res.body;
      }
    }

    // Cố gắng trích xuất thông điệp lỗi có nghĩa
    try {
      final body = jsonDecode(res.body);
      if (body is Map<String, dynamic>) {
        final msg = body['message']?.toString() ?? body['error']?.toString();
        if (msg != null && msg.isNotEmpty) {
          throw Exception('Upload failed: $msg');
        }
      }
    } catch (_) {}

    throw Exception('Upload failed (${res.statusCode})');
  }
}

/// Helper parse content-type to MediaType compatible with http
class MediaTypeHelper {
  static MediaType? parse(String input) {
    try {
      final parts = input.split('/');
      if (parts.length == 2) {
        return MediaType(parts[0], parts[1]);
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
