import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_profile.dart';

class ProfileApi {
  static const String _baseUrl = 'http://localhost:8080/api';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<UserProfile> getUserProfile() async {
    try {
      final token = await _getToken();
      final response = await http.get(
        Uri.parse('$_baseUrl/user/profile'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return UserProfile.fromJson(data);
      } else {
        // Trả về dữ liệu mẫu nếu API lỗi
        return _getSampleUserProfile();
      }
    } catch (e) {
      print('API Error getting user profile: $e');
      // Trả về dữ liệu mẫu nếu API lỗi
      return _getSampleUserProfile();
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

      // Xóa token khỏi local storage
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
    } catch (e) {
      print('API Error during logout: $e');
      // Vẫn xóa token khỏi local storage ngay cả khi API lỗi
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
    }
  }

  // Dữ liệu mẫu cho testing
  UserProfile _getSampleUserProfile() {
    return const UserProfile(
      fullName: 'Nguyễn Văn An',
      phoneNumber: '0123456789',
      email: 'nguyenvanan@email.com',
      dateOfBirth: '15/03/1990',
      idCardNumber: '123456789012',
      role: 'Cư dân',
      avatarUrl: null,
      apartmentNumber: 'A1-101',
      buildingName: 'Tòa A1',
      floor: 1,
      area: 85.5,
      bedrooms: 2,
      emergencyContacts: [
        EmergencyContact(
          name: 'Nguyễn Thị Bình',
          phone: '0987654321',
          relationship: 'Vợ/Chồng',
        ),
        EmergencyContact(
          name: 'Nguyễn Văn Cường',
          phone: '0912345678',
          relationship: 'Anh/Em trai',
        ),
        EmergencyContact(
          name: 'Nguyễn Thị Dung',
          phone: '0934567890',
          relationship: 'Mẹ',
        ),
      ],
    );
  }
}
