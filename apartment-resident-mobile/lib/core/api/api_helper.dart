import 'dart:convert';
import 'package:http/http.dart' as http;
import '../storage/secure_storage.dart';
import 'api_service.dart';

class ApiHelper {
  static Future<Map<String, String>> _getAuthHeaders() async {
    final token = await TokenStorage.instance.getToken();
    return {
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
  }

  static Future<http.Response> get(
    String path, {
    Map<String, dynamic>? query,
  }) async {
    final headers = await _getAuthHeaders();
    final uri = Uri.parse('${ApiService.baseUrl}$path');
    final uriWithQuery = query != null
        ? uri.replace(
            queryParameters: query.map((k, v) => MapEntry(k, v.toString())),
          )
        : uri;

    return http
        .get(uriWithQuery, headers: headers)
        .timeout(const Duration(seconds: 25));
  }

  static Future<http.Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? query,
  }) async {
    final headers = await _getAuthHeaders();
    final uri = Uri.parse('${ApiService.baseUrl}$path');
    final uriWithQuery = query != null
        ? uri.replace(
            queryParameters: query.map((k, v) => MapEntry(k, v.toString())),
          )
        : uri;

    return http
        .post(
          uriWithQuery,
          headers: headers,
          body: data != null ? jsonEncode(data) : null,
        )
        .timeout(const Duration(seconds: 25));
  }

  static Future<http.Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? query,
  }) async {
    final headers = await _getAuthHeaders();
    final uri = Uri.parse('${ApiService.baseUrl}$path');
    final uriWithQuery = query != null
        ? uri.replace(
            queryParameters: query.map((k, v) => MapEntry(k, v.toString())),
          )
        : uri;

    return http
        .put(
          uriWithQuery,
          headers: headers,
          body: data != null ? jsonEncode(data) : null,
        )
        .timeout(const Duration(seconds: 25));
  }

  static Future<http.Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? query,
  }) async {
    final headers = await _getAuthHeaders();
    final uri = Uri.parse('${ApiService.baseUrl}$path');
    final uriWithQuery = query != null
        ? uri.replace(
            queryParameters: query.map((k, v) => MapEntry(k, v.toString())),
          )
        : uri;

    return http
        .patch(
          uriWithQuery,
          headers: headers,
          body: data != null ? jsonEncode(data) : null,
        )
        .timeout(const Duration(seconds: 25));
  }

  static Future<http.Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? query,
  }) async {
    final headers = await _getAuthHeaders();
    final uri = Uri.parse('${ApiService.baseUrl}$path');
    final uriWithQuery = query != null
        ? uri.replace(
            queryParameters: query.map((k, v) => MapEntry(k, v.toString())),
          )
        : uri;

    return http
        .delete(
          uriWithQuery,
          headers: headers,
          body: data != null ? jsonEncode(data) : null,
        )
        .timeout(const Duration(seconds: 25));
  }

  // JSON helpers
  static List<dynamic> extractList(dynamic raw) {
    try {
      if (raw is List) return raw;
      if (raw is Map) {
        final data = raw['data'];
        if (data is List) return data;
        if (data is Map && data['content'] is List)
          return data['content'] as List;
        if (raw['content'] is List) return raw['content'] as List;
        if (raw['items'] is List) return raw['items'] as List;
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  static Map<String, dynamic> extractMap(dynamic raw) {
    try {
      if (raw is Map<String, dynamic>) {
        final data = raw['data'];
        if (data is Map<String, dynamic>) return data;
        return raw;
      }
      return <String, dynamic>{};
    } catch (_) {
      return <String, dynamic>{};
    }
  }
}
