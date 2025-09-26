import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:apartment_resident_mobile/core/app_config.dart';
import 'package:apartment_resident_mobile/core/storage/secure_storage.dart';
import '../models/user_profile.dart';

class ProfileApi {
  static String get _baseUrl => '${AppConfig.apiBaseUrl}/api';

  Future<String?> _getToken() async => TokenStorage.instance.getToken();

  Future<UserProfile> getUserProfile() async {
    try {
      final token = await _getToken();
      final response = await http.get(
        Uri.parse('$_baseUrl/auth/me'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        // ApiResponse { success, message, data }
        final data = decoded is Map<String, dynamic>
            ? (decoded['data'] ?? decoded)
            : decoded;
        if (data is Map<String, dynamic>) {
          final user = data['user'] is Map<String, dynamic>
              ? Map<String, dynamic>.from(data['user'] as Map)
              : <String, dynamic>{};
          final apartment = data['apartment'] is Map<String, dynamic>
              ? Map<String, dynamic>.from(data['apartment'] as Map)
              : <String, dynamic>{};
          final apartmentResident =
              data['apartmentResident'] is Map<String, dynamic>
              ? Map<String, dynamic>.from(data['apartmentResident'] as Map)
              : <String, dynamic>{};

          final combined = <String, dynamic>{
            'fullName': user['fullName'] ?? user['username'] ?? '',
            'phoneNumber': user['phoneNumber'] ?? '',
            'email': user['email'] ?? '',
            'dateOfBirth': user['dateOfBirth'] ?? '',
            'idCardNumber': user['idCardNumber'] ?? '',
            'role':
                (user['roles'] is List && (user['roles'] as List).isNotEmpty)
                ? (user['roles'] as List).first.toString()
                : (user['status']?.toString() ?? 'Cư dân'),
            'avatarUrl': user['avatarUrl'],
            // Apartment info mapping
            'apartmentNumber':
                apartment['unitNumber'] ??
                apartmentResident['apartmentUnitNumber'] ??
                '',
            'buildingName': apartmentResident['buildingName'] ?? '',
            'floor': apartment['floorNumber'] ?? 0,
            'area': (apartment['area'] ?? 0).toDouble(),
            'bedrooms': apartment['bedrooms'] ?? 0,
            'emergencyContacts': <Map<String, dynamic>>[],
          };

          return UserProfile.fromJson(combined);
        }
        throw Exception('Dữ liệu hồ sơ không hợp lệ');
      } else {
        throw Exception('Lỗi lấy hồ sơ: ${response.statusCode}');
      }
    } catch (e) {
      print('API Error getting user profile: $e');
      // Trả về dữ liệu rỗng tối thiểu để UI tự xử lý
      return const UserProfile(
        fullName: '',
        phoneNumber: '',
        email: '',
        dateOfBirth: '',
        idCardNumber: '',
        role: '',
        avatarUrl: null,
        apartmentNumber: '',
        buildingName: '',
        floor: 0,
        area: 0,
        bedrooms: 0,
        emergencyContacts: <EmergencyContact>[],
      );
    }
  }

  Future<void> logout() async {
    try {
      final token = await _getToken();
      await http.post(
        Uri.parse('$_baseUrl/auth/logout'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      await TokenStorage.instance.clear();
    } catch (e) {
      print('API Error during logout: $e');
      await TokenStorage.instance.clear();
    }
  }

  Future<void> changePassword({
    required String oldPassword,
    required String newPassword,
    required String confirmNewPassword,
  }) async {
    final token = await _getToken();
    final res = await http.post(
      Uri.parse('$_baseUrl/auth/change-password'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'oldPassword': oldPassword,
        'newPassword': newPassword,
        'confirmNewPassword': confirmNewPassword,
      }),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Đổi mật khẩu thất bại: ${res.body}');
    }
  }

  Future<void> updateProfile(Map<String, dynamic> payload) async {
    final token = await _getToken();
    final res = await http.put(
      Uri.parse('$_baseUrl/users/residents/me'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(payload),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('Cập nhật hồ sơ thất bại');
    }
  }
}
