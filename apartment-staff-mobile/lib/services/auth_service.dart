import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const _tokenKey = 'token';
  static const _userKey = 'user';

  static Future<void> saveAuth(String token, Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user));
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final value = prefs.getString(_userKey);
    if (value == null) return null;
    return jsonDecode(value) as Map<String, dynamic>;
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  static Future<List<String>> getRoles() async {
    final user = await getUser();
    if (user == null) return const <String>[];
    final possibleKeys = ['roles', 'authorities', 'role', 'userRoles'];
    final result = <String>[];
    for (final key in possibleKeys) {
      final v = user[key];
      if (v is List) {
        for (final item in v) {
          if (item is String) {
            result.add(item);
          } else if (item is Map<String, dynamic>) {
            final name = item['name']?.toString();
            if (name != null) result.add(name);
            final code = item['code']?.toString();
            if (code != null) result.add(code);
            final authority = item['authority']?.toString();
            if (authority != null) result.add(authority);
          }
        }
      } else if (v is String) {
        result.add(v);
      }
    }
    return result.map((e) => e.toUpperCase()).toSet().toList();
  }

  static Future<bool> isStaff() async {
    final roles = await getRoles();
    return roles.any((r) => r.contains('STAFF'));
  }
}
