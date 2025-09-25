import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  TokenStorage._();
  static final TokenStorage instance = TokenStorage._();

  static const _kTokenKey = 'auth_token';
  static const _kSavedPhoneKey = 'saved_phone';
  static const _kSavedPasswordKey = 'saved_password';

  final _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  Future<void> saveToken(String token) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString(_kTokenKey, token);
  }

  Future<String?> getToken() async {
    final sp = await SharedPreferences.getInstance();
    return sp.getString(_kTokenKey);
  }

  Future<void> clear() async {
    final sp = await SharedPreferences.getInstance();
    await sp.remove(_kTokenKey);
  }

  // Credential storage methods
  Future<void> saveCredentials(String phone, String password) async {
    await _secureStorage.write(key: _kSavedPhoneKey, value: phone);
    await _secureStorage.write(key: _kSavedPasswordKey, value: password);
  }

  Future<String?> getSavedPhone() async {
    return await _secureStorage.read(key: _kSavedPhoneKey);
  }

  Future<String?> getSavedPassword() async {
    return await _secureStorage.read(key: _kSavedPasswordKey);
  }

  Future<void> clearSavedCredentials() async {
    await _secureStorage.delete(key: _kSavedPhoneKey);
    await _secureStorage.delete(key: _kSavedPasswordKey);
  }

  Future<void> clearAll() async {
    await clear();
    await clearSavedCredentials();
  }
}
