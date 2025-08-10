import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../shared/services/api_client.dart';

class AuthState {
  final String? accessToken;
  final String? refreshToken;
  final List<String> roles;

  const AuthState({this.accessToken, this.refreshToken, this.roles = const []});

  bool get isAuthenticated => (accessToken != null && accessToken!.isNotEmpty);
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._api) : super(const AuthState());

  final ApiClient _api;
  final _controller = StreamController<AuthState>.broadcast();
  @override
  Stream<AuthState> get stream => _controller.stream;

  Future<void> loadPersisted() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('accessToken');
    final refresh = prefs.getString('refreshToken');
    final roles = prefs.getStringList('roles') ?? [];
    state = AuthState(accessToken: token, refreshToken: refresh, roles: roles);
    _controller.add(state);
    _api.setToken(token);
    _api.setRefreshTokenProvider(_refreshAccessToken);
  }

  Future<String?> login({
    required String phoneNumber,
    required String password,
  }) async {
    try {
      final resp = await _api.post(
        '/api/auth/login',
        data: {'phoneNumber': phoneNumber, 'password': password},
      );
      final jwt = resp['data']?['jwt'];
      if (jwt == null) return 'Đăng nhập thất bại';
      final token = jwt['token'] as String?;
      final refresh = jwt['refreshToken'] as String?;
      final roles =
          (jwt['roles'] as List?)?.map((e) => e.toString()).toList() ??
          <String>[];

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('accessToken', token ?? '');
      await prefs.setString('refreshToken', refresh ?? '');
      await prefs.setStringList('roles', roles);

      state = AuthState(
        accessToken: token,
        refreshToken: refresh,
        roles: roles,
      );
      _controller.add(state);
      _api.setToken(token);
      _api.setRefreshTokenProvider(_refreshAccessToken);
      return null;
    } on DioException catch (e) {
      // Dio on web often throws connection error for CORS/network issues
      final message =
          e.type == DioExceptionType.connectionError || e.response == null
          ? 'Không thể kết nối tới máy chủ. Kiểm tra mạng/CORS và API_BASE_URL.'
          : 'Đăng nhập thất bại (${e.response?.statusCode}).';
      return message;
    } catch (_) {
      return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('accessToken');
    await prefs.remove('refreshToken');
    await prefs.remove('roles');
    state = const AuthState();
    _controller.add(state);
    _api.setToken(null);
  }

  Future<String?> _refreshAccessToken() async {
    try {
      final currentRefresh = state.refreshToken;
      if (currentRefresh == null || currentRefresh.isEmpty) return null;
      final resp = await _api.post(
        '/api/auth/refresh-token',
        data: {'refreshToken': currentRefresh},
      );
      final data = resp['data'] as Map<String, dynamic>?;
      final newToken = data?['token'] as String?;
      if (newToken == null) return null;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('accessToken', newToken);
      state = AuthState(
        accessToken: newToken,
        refreshToken: state.refreshToken,
        roles: state.roles,
      );
      _controller.add(state);
      return newToken;
    } catch (_) {
      return null;
    }
  }
}

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>(
  (ref) {
    final api = ref.watch(apiClientProvider);
    final controller = AuthController(api);
    // lazy load persisted tokens
    controller.loadPersisted();
    return controller;
  },
);

final authStateProvider = Provider<AuthController>((ref) {
  return ref.read(authControllerProvider.notifier);
});
