import 'dart:convert';

import 'package:dio/dio.dart';

class ApiClient {
  ApiClient()
    : _dio = Dio(
        BaseOptions(
          baseUrl: const String.fromEnvironment(
            'API_BASE_URL',
            defaultValue: 'http://localhost:8080',
          ),
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 20),
          headers: {'Content-Type': 'application/json'},
        ),
      );

  final Dio _dio;
  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  Options _authOptions([Options? options]) {
    final headers = Map<String, dynamic>.from(options?.headers ?? {});
    if (_token != null && _token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return (options ?? Options()).copyWith(headers: headers);
  }

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? query,
    Options? options,
  }) async {
    final res = await _dio.get(
      path,
      queryParameters: query,
      options: _authOptions(options),
    );
    return res.data;
  }

  Future<dynamic> post(String path, {dynamic data, Options? options}) async {
    try {
      final res = await _dio.post(
        path,
        data: jsonEncode(data),
        options: _authOptions(options),
      );
      return res.data;
    } on DioException catch (e) {
      if (e.response?.statusCode == 401 &&
          _token != null &&
          _refreshTokenProvider != null) {
        // attempt refresh
        final newToken = await _refreshTokenProvider!();
        if (newToken != null) {
          _token = newToken;
          final res = await _dio.post(
            path,
            data: jsonEncode(data),
            options: _authOptions(options),
          );
          return res.data;
        }
      }
      rethrow;
    }
  }

  Future<dynamic> put(String path, {dynamic data, Options? options}) async {
    final res = await _dio.put(
      path,
      data: jsonEncode(data),
      options: _authOptions(options),
    );
    return res.data;
  }

  Future<dynamic> delete(String path, {Options? options}) async {
    final res = await _dio.delete(path, options: _authOptions(options));
    return res.data;
  }

  // Refresh token support
  Future<String?> Function()? _refreshTokenProvider;
  void setRefreshTokenProvider(Future<String?> Function() provider) {
    _refreshTokenProvider = provider;
  }
}
