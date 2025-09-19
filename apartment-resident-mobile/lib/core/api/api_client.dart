import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import '../storage/secure_storage.dart';
import '../app_config.dart';

class ApiClient {
  static String get baseUrl => AppConfig.apiBaseUrl;

  static Future<Map<String, String>> _authHeaders() async {
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
    final headers = await _authHeaders();
    final uri = Uri.parse('$baseUrl$path');
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
    final headers = await _authHeaders();
    final uri = Uri.parse('$baseUrl$path');
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
    final headers = await _authHeaders();
    final uri = Uri.parse('$baseUrl$path');
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

  static Future<http.Response> deleteReq(
    String path, {
    dynamic data,
    Map<String, dynamic>? query,
  }) async {
    final headers = await _authHeaders();
    final uri = Uri.parse('$baseUrl$path');
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
}
