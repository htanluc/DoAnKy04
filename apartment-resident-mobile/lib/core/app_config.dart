import 'dart:io' show Platform;
import 'dart:async';
import 'package:http/http.dart' as http;

class AppConfig {
  AppConfig._();

  // Ưu tiên dart-define: --dart-define=API_BASE_URL=https://... (KHÔNG kèm /api)
  static String apiBaseUrl = _resolveBaseUrl();
  static bool _autoDetected = false;
  static Completer<void>? _initCompleter;

  /// Đảm bảo auto-detect chỉ chạy một lần; những nơi cần chắc chắn hãy await
  static Future<void> ensureAutoDetect() async {
    if (_autoDetected) return;
    if (_initCompleter != null) return _initCompleter!.future;
    _initCompleter = Completer<void>();
    try {
      final detected = await _detectBestBaseUrl();
      if (detected != null && detected.isNotEmpty) {
        apiBaseUrl = detected;
        // ignore: avoid_print
        print('[AppConfig] Auto-detected apiBaseUrl: $apiBaseUrl');
      }
      _autoDetected = true;
      _initCompleter!.complete();
    } catch (e) {
      _autoDetected = true;
      _initCompleter!.complete();
    }
  }

  static Future<String?> _detectBestBaseUrl() async {
    final fromDefine = const String.fromEnvironment('API_BASE_URL');
    final current = apiBaseUrl;

    final candidates = <String>[
      if (fromDefine.isNotEmpty) fromDefine,
      if (Platform.isAndroid) 'http://10.0.2.2:8080',
      if (Platform.isIOS) 'http://localhost:8080',
      'http://localhost:8080',
      current,
    ];

    final seen = <String>{};
    final unique = <String>[];
    for (final c in candidates) {
      if (c.isEmpty) continue;
      if (seen.add(c)) unique.add(c);
    }

    for (final base in unique) {
      if (await _probeBase(base)) return base;
    }
    return null;
  }

  static Future<bool> _probeBase(String base) async {
    final paths = <String>['/actuator/health', '/api/health', '/'];
    for (final p in paths) {
      try {
        final uri = Uri.parse(base).replace(path: p);
        final res = await http
            .get(uri)
            .timeout(const Duration(milliseconds: 900));
        if (res.statusCode >= 200 && res.statusCode < 600) {
          return true;
        }
      } catch (_) {}
    }
    return false;
  }

  static String _resolveBaseUrl() {
    const fromDefine = String.fromEnvironment('API_BASE_URL');
    if (fromDefine.isNotEmpty) return fromDefine;

    // Auto-detect theo nền tảng (KHÔNG kèm /api):
    // - Android emulator dùng 10.0.2.2 để trỏ về host
    // - iOS simulator có thể dùng localhost
    // - Thiết bị thật: thay bằng IP LAN của máy backend (có thể override bằng dart-define)
    if (_isAndroid) {
      return 'http://10.0.2.2:8080';
    }
    if (_isIOS) {
      return 'http://172.16.2.32:8080';
    }
    // Mặc định desktop/web phát triển
    return 'http://localhost:8080';
  }

  static bool get _isAndroid => Platform.isAndroid;
  static bool get _isIOS => Platform.isIOS;
}
