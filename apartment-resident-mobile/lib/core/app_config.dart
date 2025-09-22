import 'dart:io' show Platform;

class AppConfig {
  AppConfig._();

  // Ưu tiên dart-define: --dart-define=API_BASE_URL=https://... (KHÔNG kèm /api)
  static final String apiBaseUrl = _resolveBaseUrl();

  static String _resolveBaseUrl() {
    const fromDefine = String.fromEnvironment('API_BASE_URL');
    if (fromDefine.isNotEmpty) return fromDefine;

    // Auto-detect theo nền tảng (KHÔNG kèm /api):
    // - Android emulator dùng 10.0.2.2 để trỏ về host
    // - iOS simulator có thể dùng localhost
    // - Thiết bị thật: thay bằng IP LAN của máy backend (có thể override bằng dart-define)
    if (_isAndroid) {
      return 'http://172.16.2.32:8080';
    }
    if (_isIOS) {
      return 'http://localhost:8080';
    }
    // Mặc định desktop/web phát triển
    return 'http://localhost:8080';
  }

  static bool get _isAndroid => Platform.isAndroid;
  static bool get _isIOS => Platform.isIOS;
}
