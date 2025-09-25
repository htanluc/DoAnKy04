import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';

class BiometricService {
  static final BiometricService _instance = BiometricService._internal();
  factory BiometricService() => _instance;
  BiometricService._internal();

  final LocalAuthentication _localAuth = LocalAuthentication();

  /// Kiểm tra xem thiết bị có hỗ trợ biometric authentication không
  Future<bool> isBiometricAvailable() async {
    try {
      // ignore: avoid_print
      print('[BiometricService] Checking biometric availability...');

      final bool isDeviceSupported = await _localAuth.isDeviceSupported();
      // ignore: avoid_print
      print('[BiometricService] Device supported: $isDeviceSupported');

      final bool canCheckBiometrics = await _localAuth.canCheckBiometrics;
      // ignore: avoid_print
      print('[BiometricService] Can check biometrics: $canCheckBiometrics');

      final List<BiometricType> availableBiometrics =
          await getAvailableBiometrics();
      // ignore: avoid_print
      print('[BiometricService] Available biometrics: $availableBiometrics');

      final bool hasAvailableBiometrics = availableBiometrics.isNotEmpty;
      // ignore: avoid_print
      print(
        '[BiometricService] Has available biometrics: $hasAvailableBiometrics',
      );

      final bool result =
          isDeviceSupported && canCheckBiometrics && hasAvailableBiometrics;
      // ignore: avoid_print
      print('[BiometricService] Final availability result: $result');

      return result;
    } catch (e) {
      // ignore: avoid_print
      print('[BiometricService] Error checking biometric availability: $e');
      return false;
    }
  }

  /// Lấy danh sách các loại biometric có sẵn
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      // ignore: avoid_print
      print('[BiometricService] Getting available biometrics...');

      final List<BiometricType> biometrics = await _localAuth
          .getAvailableBiometrics();
      // ignore: avoid_print
      print('[BiometricService] Available biometrics: $biometrics');

      return biometrics;
    } catch (e) {
      // ignore: avoid_print
      print('[BiometricService] Error getting available biometrics: $e');
      return [];
    }
  }

  /// Xác thực bằng biometric
  Future<bool> authenticate({
    String localizedReason = 'Xác thực danh tính để đăng nhập',
    String cancelButton = 'Hủy',
    String goToSettingsButton = 'Cài đặt',
    String goToSettingsDescription =
        'Vui lòng bật xác thực sinh trắc học trong cài đặt',
  }) async {
    try {
      // ignore: avoid_print
      print('[BiometricService] Starting authentication...');

      final List<BiometricType> availableBiometrics =
          await getAvailableBiometrics();
      if (availableBiometrics.isEmpty) {
        throw Exception(
          'Không có phương thức xác thực sinh trắc học nào được thiết lập',
        );
      }

      // ignore: avoid_print
      print('[BiometricService] Authenticating with reason: $localizedReason');

      final bool didAuthenticate = await _localAuth.authenticate(
        localizedReason: localizedReason,
        options: const AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
          sensitiveTransaction: true,
        ),
      );

      // ignore: avoid_print
      print('[BiometricService] Authentication result: $didAuthenticate');
      return didAuthenticate;
    } on PlatformException catch (e) {
      // ignore: avoid_print
      print('[BiometricService] PlatformException: ${e.code} - ${e.message}');

      switch (e.code) {
        case 'NotAvailable':
          throw Exception('Xác thực sinh trắc học không khả dụng');
        case 'NotEnrolled':
          throw Exception(
            'Chưa thiết lập xác thực sinh trắc học. Vui lòng thiết lập trong cài đặt thiết bị',
          );
        case 'LockedOut':
          throw Exception(
            'Xác thực sinh trắc học bị khóa. Vui lòng thử lại sau',
          );
        case 'PermanentlyLockedOut':
          throw Exception(
            'Xác thực sinh trắc học bị khóa vĩnh viễn. Vui lòng thiết lập lại',
          );
        case 'UserCancel':
          throw Exception('Người dùng hủy xác thực');
        case 'AuthenticationFailed':
          throw Exception('Xác thực thất bại. Vui lòng thử lại');
        case 'SystemCancel':
          throw Exception('Hệ thống hủy xác thực');
        case 'PasscodeNotSet':
          throw Exception(
            'Chưa thiết lập mã PIN. Vui lòng thiết lập trong cài đặt',
          );
        case 'FingerprintNotSet':
          throw Exception(
            'Chưa thiết lập vân tay. Vui lòng thiết lập trong cài đặt',
          );
        case 'FaceIDNotSet':
          throw Exception(
            'Chưa thiết lập Face ID. Vui lòng thiết lập trong cài đặt',
          );
        default:
          throw Exception('Lỗi xác thực: ${e.message}');
      }
    } catch (e) {
      // ignore: avoid_print
      print('[BiometricService] Unknown error: $e');
      throw Exception('Lỗi không xác định: $e');
    }
  }

  /// Xác thực bằng vân tay
  Future<bool> authenticateWithFingerprint() async {
    try {
      // ignore: avoid_print
      print('[BiometricService] Starting fingerprint authentication...');

      final List<BiometricType> availableBiometrics =
          await getAvailableBiometrics();

      if (!availableBiometrics.contains(BiometricType.fingerprint)) {
        throw Exception('Thiết bị không hỗ trợ vân tay hoặc chưa thiết lập');
      }

      return await authenticate(
        localizedReason: 'Đặt ngón tay lên cảm biến để đăng nhập',
        cancelButton: 'Hủy',
      );
    } catch (e) {
      // ignore: avoid_print
      print('[BiometricService] Fingerprint authentication error: $e');
      rethrow;
    }
  }

  /// Xác thực bằng Face ID
  Future<bool> authenticateWithFaceID() async {
    try {
      // ignore: avoid_print
      print('[BiometricService] Starting Face ID authentication...');

      final List<BiometricType> availableBiometrics =
          await getAvailableBiometrics();

      if (!availableBiometrics.contains(BiometricType.face)) {
        throw Exception('Thiết bị không hỗ trợ Face ID hoặc chưa thiết lập');
      }

      return await authenticate(
        localizedReason: 'Nhìn vào camera để đăng nhập bằng Face ID',
        cancelButton: 'Hủy',
      );
    } catch (e) {
      // ignore: avoid_print
      print('[BiometricService] Face ID authentication error: $e');
      rethrow;
    }
  }

  /// Xác thực bằng bất kỳ phương thức nào có sẵn
  Future<bool> authenticateWithAnyAvailable() async {
    try {
      // ignore: avoid_print
      print('[BiometricService] Starting any available authentication...');

      final List<BiometricType> availableBiometrics =
          await getAvailableBiometrics();

      if (availableBiometrics.isEmpty) {
        throw Exception(
          'Không có phương thức xác thực sinh trắc học nào khả dụng',
        );
      }

      String reason = 'Xác thực danh tính để đăng nhập';

      if (availableBiometrics.contains(BiometricType.face)) {
        reason = 'Nhìn vào camera để đăng nhập';
      } else if (availableBiometrics.contains(BiometricType.fingerprint)) {
        reason = 'Đặt ngón tay lên cảm biến để đăng nhập';
      }

      // ignore: avoid_print
      print('[BiometricService] Using reason: $reason');

      return await authenticate(localizedReason: reason);
    } catch (e) {
      // ignore: avoid_print
      print('[BiometricService] Any available authentication error: $e');
      rethrow;
    }
  }

  /// Kiểm tra trạng thái thiết lập biometric
  Future<BiometricStatus> getBiometricStatus() async {
    try {
      // ignore: avoid_print
      print('[BiometricService] Getting biometric status...');

      // Kiểm tra device support trước
      final bool isDeviceSupported = await _localAuth.isDeviceSupported();
      // ignore: avoid_print
      print('[BiometricService] Device supported: $isDeviceSupported');

      if (!isDeviceSupported) {
        // ignore: avoid_print
        print(
          '[BiometricService] Device not supported, returning notSupported',
        );
        return BiometricStatus.notSupported;
      }

      // Kiểm tra canCheckBiometrics
      final bool canCheckBiometrics = await _localAuth.canCheckBiometrics;
      // ignore: avoid_print
      print('[BiometricService] Can check biometrics: $canCheckBiometrics');

      if (!canCheckBiometrics) {
        // ignore: avoid_print
        print(
          '[BiometricService] Cannot check biometrics, returning notSupported',
        );
        return BiometricStatus.notSupported;
      }

      // Lấy available biometrics
      final List<BiometricType> availableBiometrics =
          await getAvailableBiometrics();
      // ignore: avoid_print
      print('[BiometricService] Available biometrics: $availableBiometrics');

      if (availableBiometrics.isEmpty) {
        // ignore: avoid_print
        print(
          '[BiometricService] No biometrics enrolled, returning notEnrolled',
        );
        return BiometricStatus.notEnrolled;
      }

      // ignore: avoid_print
      print('[BiometricService] Biometrics available, returning available');
      return BiometricStatus.available;
    } catch (e) {
      // ignore: avoid_print
      print('[BiometricService] Error getting biometric status: $e');
      return BiometricStatus.error;
    }
  }

  /// Debug method để kiểm tra chi tiết trạng thái
  Future<Map<String, dynamic>> getDetailedBiometricInfo() async {
    try {
      final bool isDeviceSupported = await _localAuth.isDeviceSupported();
      final bool canCheckBiometrics = await _localAuth.canCheckBiometrics;
      final List<BiometricType> availableBiometrics =
          await getAvailableBiometrics();

      return {
        'isDeviceSupported': isDeviceSupported,
        'canCheckBiometrics': canCheckBiometrics,
        'availableBiometrics': availableBiometrics
            .map((e) => e.toString())
            .toList(),
        'hasFingerprint': availableBiometrics.contains(
          BiometricType.fingerprint,
        ),
        'hasFace': availableBiometrics.contains(BiometricType.face),
        'hasIris': availableBiometrics.contains(BiometricType.iris),
        'hasStrong': availableBiometrics.contains(BiometricType.strong),
        'hasWeak': availableBiometrics.contains(BiometricType.weak),
      };
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  /// Test biometric authentication trực tiếp (bypass availability check)
  Future<Map<String, dynamic>> testBiometricAuthentication() async {
    try {
      // ignore: avoid_print
      print('[BiometricService] Testing biometric authentication directly...');

      final bool didAuthenticate = await _localAuth.authenticate(
        localizedReason: 'Test biometric authentication',
        options: const AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
          sensitiveTransaction: false, // Set to false for testing
        ),
      );

      return {
        'success': didAuthenticate,
        'message': didAuthenticate
            ? 'Authentication successful'
            : 'Authentication failed',
        'timestamp': DateTime.now().toIso8601String(),
      };
    } catch (e) {
      // ignore: avoid_print
      print('[BiometricService] Test authentication error: $e');
      return {
        'success': false,
        'error': e.toString(),
        'timestamp': DateTime.now().toIso8601String(),
      };
    }
  }
}

enum BiometricStatus { available, notSupported, notEnrolled, error }

extension BiometricStatusExtension on BiometricStatus {
  String get displayName {
    switch (this) {
      case BiometricStatus.available:
        return 'Khả dụng';
      case BiometricStatus.notSupported:
        return 'Không hỗ trợ';
      case BiometricStatus.notEnrolled:
        return 'Chưa thiết lập';
      case BiometricStatus.error:
        return 'Lỗi';
    }
  }

  bool get isAvailable => this == BiometricStatus.available;
}
