import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/api/api_service.dart';
import '../../core/storage/secure_storage.dart';
import '../../core/services/biometric_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emailController = TextEditingController();

  bool _loading = false;
  bool _rememberMe = false;
  bool _showForgotPassword = false;
  bool _showPassword = false;
  String? _error;
  bool _biometricAvailable = false;
  bool _biometricEnabled = false;
  bool _hasSavedCredentials = false;
  bool _hasBackupAccount = false;
  BiometricStatus _biometricStatus = BiometricStatus.notSupported;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(
          CurvedAnimation(
            parent: _animationController,
            curve: Curves.easeOutCubic,
          ),
        );

    _animationController.forward();
    _loadSavedCredentials();
    _checkBiometricAvailability();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Refresh biometric status and saved credentials when returning from settings
    _checkBiometricAvailability();
    _loadSavedCredentials();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _loadSavedCredentials() async {
    try {
      final savedPhone = await TokenStorage.instance.getSavedPhone();
      final savedPassword = await TokenStorage.instance.getSavedPassword();
      if (savedPhone != null && savedPassword != null) {
        setState(() {
          _hasSavedCredentials = true;
          // Only auto-fill if biometric is NOT enabled (for security)
          if (!_biometricEnabled) {
            _phoneController.text = savedPhone;
            _passwordController.text = savedPassword;
            _rememberMe = true;
          } else {
            // If biometric is enabled, don't auto-fill for security
            _phoneController.clear();
            _passwordController.clear();
            _rememberMe = false;
          }
        });
      } else {
        setState(() {
          _hasSavedCredentials = false;
        });
      }
    } catch (e) {
      // ignore: avoid_print
      print('[LoginPage] Error loading saved credentials: $e');
      setState(() {
        _hasSavedCredentials = false;
      });
    }
  }

  Future<void> _saveCredentials() async {
    if (_rememberMe) {
      await TokenStorage.instance.saveCredentials(
        _phoneController.text.trim(),
        _passwordController.text,
      );
      setState(() {
        _hasSavedCredentials = true;
      });
    } else if (!_biometricAvailable) {
      // Only clear credentials if biometric is not available
      // If biometric is available, keep credentials for biometric login
      await TokenStorage.instance.clearSavedCredentials();
      setState(() {
        _hasSavedCredentials = false;
      });
    }
    // If biometric is available and remember me is false, keep credentials for biometric login
  }

  // Method removed - no longer needed as form is hidden when biometric is enabled

  Future<void> _switchToOtherAccount() async {
    // Show confirmation dialog with backup option
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.swap_horiz, color: Colors.orange.shade600),
            const SizedBox(width: 8),
            const Text('Chuyển tài khoản'),
          ],
        ),
        content: const Text(
          'Bạn có muốn đăng nhập bằng tài khoản khác?\n\n'
          '• Thông tin đăng nhập hiện tại sẽ được lưu tạm thời\n'
          '• Bạn có thể khôi phục tài khoản cũ bất kỳ lúc nào\n'
          '• Cần nhập thông tin mới để đăng nhập',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, 'cancel'),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, 'backup'),
            child: const Text('Lưu và chuyển'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, 'clear'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              foregroundColor: Colors.white,
            ),
            child: const Text('Xóa hết'),
          ),
        ],
      ),
    );

    if (result == 'cancel') {
      return; // User cancelled
    }

    if (result == 'backup') {
      // Backup current account before switching
      await _backupCurrentAccount();
    }

    // Clear current session
    await _clearCurrentSession();

    // Show success message
    if (mounted) {
      String message = result == 'backup'
          ? 'Đã lưu tài khoản hiện tại. Vui lòng nhập thông tin đăng nhập mới.'
          : 'Đã xóa tài khoản. Vui lòng nhập thông tin đăng nhập mới.';

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.green.shade600,
          action: result == 'backup'
              ? SnackBarAction(
                  label: 'Khôi phục tài khoản cũ',
                  textColor: Colors.white,
                  onPressed: _restoreBackupAccount,
                )
              : null,
        ),
      );
    }
  }

  Future<void> _backupCurrentAccount() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final currentPhone = await TokenStorage.instance.getSavedPhone();
      final currentPassword = await TokenStorage.instance.getSavedPassword();
      final biometricEnabled = prefs.getBool('biometric_enabled') ?? false;

      if (currentPhone != null && currentPassword != null) {
        // Save backup account
        await prefs.setString('backup_phone', currentPhone);
        await prefs.setString('backup_password', currentPassword);
        await prefs.setBool('backup_biometric_enabled', biometricEnabled);
        await prefs.setBool('has_backup_account', true);

        print('[LoginPage] Account backed up: $currentPhone');
      }
    } catch (e) {
      print('[LoginPage] Error backing up account: $e');
    }
  }

  Future<void> _clearCurrentSession() async {
    // Clear saved credentials and biometric settings
    await TokenStorage.instance.clearAll();

    // Disable biometric
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('biometric_enabled', false);

    // Clear form
    _phoneController.clear();
    _passwordController.clear();
    _emailController.clear();

    // Reset state
    setState(() {
      _hasSavedCredentials = false;
      _biometricEnabled = false;
      _hasBackupAccount = false;
      _rememberMe = false;
      _showForgotPassword = false;
      _showPassword = false;
      _error = null;
    });

    // Refresh biometric status
    _checkBiometricAvailability();
  }

  Future<void> _restoreBackupAccount() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final backupPhone = prefs.getString('backup_phone');
      final backupPassword = prefs.getString('backup_password');
      final backupBiometric =
          prefs.getBool('backup_biometric_enabled') ?? false;

      if (backupPhone != null && backupPassword != null) {
        // Restore backup account
        await TokenStorage.instance.saveCredentials(
          backupPhone,
          backupPassword,
        );
        await prefs.setBool('biometric_enabled', backupBiometric);

        // Clear backup
        await prefs.remove('backup_phone');
        await prefs.remove('backup_password');
        await prefs.remove('backup_biometric_enabled');
        await prefs.setBool('has_backup_account', false);

        // Refresh state
        await _checkBiometricAvailability();
        await _loadSavedCredentials();

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Đã khôi phục tài khoản: $backupPhone'),
              backgroundColor: Colors.green.shade600,
            ),
          );
        }

        print('[LoginPage] Account restored: $backupPhone');
      }
    } catch (e) {
      print('[LoginPage] Error restoring backup account: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Không thể khôi phục tài khoản. Vui lòng đăng nhập lại.',
            ),
            backgroundColor: Colors.red.shade600,
          ),
        );
      }
    }
  }

  Future<void> _checkBiometricAvailability() async {
    try {
      // ignore: avoid_print
      print('[LoginPage] Checking biometric availability...');

      final biometricService = BiometricService();

      // Lấy thông tin chi tiết để debug
      final detailedInfo = await biometricService.getDetailedBiometricInfo();
      // ignore: avoid_print
      print('[LoginPage] Detailed biometric info: $detailedInfo');

      final status = await biometricService.getBiometricStatus();
      // ignore: avoid_print
      print('[LoginPage] Biometric status: $status');

      // Load biometric preference and backup account
      final prefs = await SharedPreferences.getInstance();
      final biometricEnabled = prefs.getBool('biometric_enabled') ?? false;
      final hasBackupAccount = prefs.getBool('has_backup_account') ?? false;
      // ignore: avoid_print
      print('[LoginPage] Biometric enabled preference: $biometricEnabled');
      // ignore: avoid_print
      print('[LoginPage] Has backup account: $hasBackupAccount');

      setState(() {
        _biometricStatus = status;
        _biometricAvailable = status.isAvailable;
        _biometricEnabled = biometricEnabled;
        _hasBackupAccount = hasBackupAccount;
      });
    } catch (e) {
      // ignore: avoid_print
      print('[LoginPage] Error checking biometric availability: $e');
      setState(() {
        _biometricStatus = BiometricStatus.error;
        _biometricAvailable = false;
        _biometricEnabled = false;
      });
    }
  }

  Future<void> _authenticateWithBiometric() async {
    if (!_biometricAvailable) {
      _showBiometricError('Xác thực sinh trắc học không khả dụng');
      return;
    }

    if (!_biometricEnabled) {
      _showBiometricError(
        'Chưa kích hoạt đăng nhập bằng sinh trắc học. Vui lòng vào Cài đặt để kích hoạt.',
      );
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final biometricService = BiometricService();
      final success = await biometricService.authenticateWithAnyAvailable();

      if (success) {
        // Lấy thông tin đăng nhập đã lưu
        final savedPhone = await TokenStorage.instance.getSavedPhone();
        final savedPassword = await TokenStorage.instance.getSavedPassword();

        if (savedPhone != null && savedPassword != null) {
          // Đăng nhập với thông tin đã lưu
          await ApiService.login(savedPhone, savedPassword);

          if (!mounted) return;

          // ignore: avoid_print
          print('[LoginPage] Biometric login success');
          Navigator.of(context).pushReplacementNamed('/dashboard');
        } else {
          // Không có thông tin đăng nhập đã lưu - yêu cầu đăng nhập thủ công
          if (!mounted) return;

          setState(() {
            _loading = false;
          });

          _showBiometricError(
            'Chưa có thông tin đăng nhập được lưu.\n\nVui lòng:\n1. Đăng nhập bằng phone + password\n2. Check "Ghi nhớ đăng nhập"\n3. Sau đó mới sử dụng được biometric',
          );
        }
      } else {
        _showBiometricError('Xác thực sinh trắc học thất bại');
      }
    } catch (e) {
      // ignore: avoid_print
      print('[LoginPage] Biometric authentication error: $e');
      _showBiometricError(e.toString());
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _authenticateWithFingerprint() async {
    if (!_biometricAvailable) {
      _showBiometricError('Vân tay không khả dụng');
      return;
    }

    if (!_biometricEnabled) {
      _showBiometricError(
        'Chưa kích hoạt đăng nhập bằng sinh trắc học. Vui lòng vào Cài đặt để kích hoạt.',
      );
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final biometricService = BiometricService();
      final success = await biometricService.authenticateWithFingerprint();

      if (success) {
        // Lấy thông tin đăng nhập đã lưu
        final savedPhone = await TokenStorage.instance.getSavedPhone();
        final savedPassword = await TokenStorage.instance.getSavedPassword();

        if (savedPhone != null && savedPassword != null) {
          // Đăng nhập với thông tin đã lưu
          await ApiService.login(savedPhone, savedPassword);

          if (!mounted) return;

          // ignore: avoid_print
          print('[LoginPage] Fingerprint login success');
          Navigator.of(context).pushReplacementNamed('/dashboard');
        } else {
          // Không có thông tin đăng nhập đã lưu
          if (!mounted) return;

          setState(() {
            _loading = false;
          });

          _showBiometricError(
            'Chưa có thông tin đăng nhập được lưu.\n\nVui lòng:\n1. Đăng nhập bằng phone + password\n2. Check "Ghi nhớ đăng nhập"\n3. Sau đó mới sử dụng được biometric',
          );
        }
      } else {
        _showBiometricError('Xác thực vân tay thất bại');
      }
    } catch (e) {
      // ignore: avoid_print
      print('[LoginPage] Fingerprint authentication error: $e');
      _showBiometricError(e.toString());
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _authenticateWithFaceID() async {
    if (!_biometricAvailable) {
      _showBiometricError('Face ID không khả dụng');
      return;
    }

    if (!_biometricEnabled) {
      _showBiometricError(
        'Chưa kích hoạt đăng nhập bằng sinh trắc học. Vui lòng vào Cài đặt để kích hoạt.',
      );
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final biometricService = BiometricService();
      final success = await biometricService.authenticateWithFaceID();

      if (success) {
        // Lấy thông tin đăng nhập đã lưu
        final savedPhone = await TokenStorage.instance.getSavedPhone();
        final savedPassword = await TokenStorage.instance.getSavedPassword();

        if (savedPhone != null && savedPassword != null) {
          // Đăng nhập với thông tin đã lưu
          await ApiService.login(savedPhone, savedPassword);

          if (!mounted) return;

          // ignore: avoid_print
          print('[LoginPage] Face ID login success');
          Navigator.of(context).pushReplacementNamed('/dashboard');
        } else {
          // Không có thông tin đăng nhập đã lưu
          if (!mounted) return;

          setState(() {
            _loading = false;
          });

          _showBiometricError(
            'Chưa có thông tin đăng nhập được lưu.\n\nVui lòng:\n1. Đăng nhập bằng phone + password\n2. Check "Ghi nhớ đăng nhập"\n3. Sau đó mới sử dụng được biometric',
          );
        }
      } else {
        _showBiometricError('Xác thực Face ID thất bại');
      }
    } catch (e) {
      // ignore: avoid_print
      print('[LoginPage] Face ID authentication error: $e');
      _showBiometricError(e.toString());
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  void _showBiometricError(String message) {
    setState(() {
      _error = message;
    });
  }

  String _getBiometricStatusMessage() {
    switch (_biometricStatus) {
      case BiometricStatus.notSupported:
        return 'Thiết bị không hỗ trợ xác thực sinh trắc học';
      case BiometricStatus.notEnrolled:
        return 'Vui lòng thiết lập vân tay hoặc Face ID trong cài đặt thiết bị';
      case BiometricStatus.error:
        return 'Lỗi kiểm tra xác thực sinh trắc học';
      case BiometricStatus.available:
        return 'Xác thực sinh trắc học khả dụng';
    }
  }

  Future<void> _showBiometricDebugInfo() async {
    try {
      final biometricService = BiometricService();
      final detailedInfo = await biometricService.getDetailedBiometricInfo();

      if (!mounted) return;

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Row(
            children: [
              Icon(Icons.bug_report, color: Colors.blue),
              const SizedBox(width: 8),
              const Text('Debug Biometric Info'),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Status Summary
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _biometricAvailable
                        ? Colors.green.shade50
                        : Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _biometricAvailable ? Colors.green : Colors.red,
                      width: 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Trạng thái: ${_biometricStatus.displayName}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: _biometricAvailable
                              ? Colors.green.shade700
                              : Colors.red.shade700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Khả dụng: $_biometricAvailable',
                        style: TextStyle(
                          color: _biometricAvailable
                              ? Colors.green.shade600
                              : Colors.red.shade600,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Detailed Info
                const Text(
                  'Chi tiết kỹ thuật:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),

                ...detailedInfo.entries.map((entry) {
                  Color textColor = Colors.black87;
                  if (entry.key == 'isDeviceSupported' ||
                      entry.key == 'canCheckBiometrics' ||
                      entry.key == 'hasFingerprint' ||
                      entry.key == 'hasFace') {
                    textColor = (entry.value == true)
                        ? Colors.green.shade700
                        : Colors.red.shade700;
                  }

                  return Container(
                    margin: const EdgeInsets.only(bottom: 4),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            '${entry.key}:',
                            style: const TextStyle(fontWeight: FontWeight.w500),
                          ),
                        ),
                        Text(
                          '${entry.value}',
                          style: TextStyle(
                            color: textColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),

                if (detailedInfo.containsKey('error')) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Text(
                      'Lỗi: ${detailedInfo['error']}',
                      style: TextStyle(color: Colors.red.shade700),
                    ),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Đóng'),
            ),
            TextButton(
              onPressed: _testBiometricDirectly,
              child: const Text('Test Trực Tiếp'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _checkBiometricAvailability();
              },
              child: const Text('Kiểm tra lại'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lỗi lấy thông tin biometric: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _testBiometricDirectly() async {
    try {
      final biometricService = BiometricService();
      final result = await biometricService.testBiometricAuthentication();

      if (!mounted) return;

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Row(
            children: [
              Icon(
                result['success'] == true ? Icons.check_circle : Icons.error,
                color: result['success'] == true ? Colors.green : Colors.red,
              ),
              const SizedBox(width: 8),
              Text(
                result['success'] == true ? 'Test Thành Công' : 'Test Thất Bại',
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Kết quả: ${result['message'] ?? result['error']}'),
              const SizedBox(height: 8),
              Text('Thời gian: ${result['timestamp']}'),
              if (result.containsKey('error')) ...[
                const SizedBox(height: 8),
                Text(
                  'Chi tiết lỗi:',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(
                    result['error'],
                    style: TextStyle(color: Colors.red.shade700),
                  ),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Đóng'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lỗi test biometric: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  String? _validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập số điện thoại';
    }
    final phoneRegex = RegExp(r'^(0|\+84)[3-9]\d{8}$');
    if (!phoneRegex.hasMatch(value)) {
      return 'Số điện thoại không hợp lệ';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập mật khẩu';
    }
    if (value.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập email';
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Email không hợp lệ';
    }
    return null;
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // ignore: avoid_print
      print('[LoginPage] Start login');
      await ApiService.login(
        _phoneController.text.trim(),
        _passwordController.text,
      );

      // Auto-save credentials if biometric is available (for future biometric login)
      if (_biometricAvailable) {
        await TokenStorage.instance.saveCredentials(
          _phoneController.text.trim(),
          _passwordController.text,
        );
        setState(() {
          _hasSavedCredentials = true;
        });
      }

      // Save credentials based on remember me checkbox
      await _saveCredentials();

      if (!mounted) return;

      // ignore: avoid_print
      print('[LoginPage] Login success, navigating to Dashboard');
      Navigator.of(context).pushReplacementNamed('/dashboard');
    } catch (e) {
      // ignore: avoid_print
      print('[LoginPage] Login error: $e');
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _forgotPassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // ignore: avoid_print
      print('[LoginPage] Start forgot password');

      // Gọi API quên mật khẩu với phone và email
      await ApiService.forgotPasswordWithPhoneAndEmail(
        _phoneController.text.trim(),
        _emailController.text.trim(),
      );

      if (!mounted) return;

      // Hiển thị thông báo thành công
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Mật khẩu mới đã được gửi qua email!'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );

      setState(() {
        _showForgotPassword = false;
      });
    } catch (e) {
      // ignore: avoid_print
      print('[LoginPage] Forgot password error: $e');
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0066CC), // FPT Blue
              Color(0xFF009966), // FPT Green
              Color(0xFF8B5CF6), // Purple
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SlideTransition(
                position: _slideAnimation,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 40),

                    // Logo và Header
                    _buildHeader(),

                    const SizedBox(height: 40),

                    // Form Container - Show if biometric is not enabled OR if user wants to switch account
                    if (!(_biometricAvailable &&
                        _biometricEnabled &&
                        _hasSavedCredentials))
                      _buildFormContainer(),

                    // Restore Backup Account Button - Show when form is visible and backup exists
                    if (!(_biometricAvailable &&
                            _biometricEnabled &&
                            _hasSavedCredentials) &&
                        _hasBackupAccount) ...[
                      const SizedBox(height: 16),
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16),
                        child: ElevatedButton.icon(
                          onPressed: _restoreBackupAccount,
                          icon: Icon(
                            FontAwesomeIcons.arrowRotateLeft,
                            size: 18,
                            color: Colors.white,
                          ),
                          label: const Text(
                            'Khôi phục tài khoản cũ',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue.shade600,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ),
                    ],

                    const SizedBox(height: 30),

                    // Social Login (Future feature)
                    _buildSocialLogin(),

                    const SizedBox(height: 20),

                    // Always visible debug button
                    TextButton(
                      onPressed: _showBiometricDebugInfo,
                      child: Text(
                        '🔍 Debug Biometric Info',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 12,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        // Logo Container
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.15),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: Colors.white.withOpacity(0.2), width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: const Icon(
            FontAwesomeIcons.building,
            size: 50,
            color: Colors.white,
          ),
        ),

        const SizedBox(height: 24),

        // Title
        Text(
          'Smart Building',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 28,
          ),
        ),

        const SizedBox(height: 8),

        Text(
          'Hệ thống quản lý tòa nhà thông minh',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: Colors.white.withOpacity(0.9),
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildFormContainer() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Form Title
            Text(
              _showForgotPassword ? 'Quên mật khẩu' : 'Đăng nhập',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: const Color(0xFF1E293B),
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 8),

            Text(
              _showForgotPassword
                  ? 'Nhập số điện thoại và email để nhận mật khẩu mới'
                  : 'Nhập thông tin để tiếp tục',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: const Color(0xFF64748B)),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 24),

            // Error Message
            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(
                      FontAwesomeIcons.triangleExclamation,
                      color: Colors.red.shade600,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _error!,
                        style: TextStyle(
                          color: Colors.red.shade700,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Phone Number Field
            _buildInputField(
              controller: _phoneController,
              label: 'Số điện thoại',
              hint: 'Nhập số điện thoại',
              icon: FontAwesomeIcons.phone,
              keyboardType: TextInputType.phone,
              validator: _validatePhone,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(11),
              ],
            ),

            const SizedBox(height: 16),

            // Password Field (only show if not forgot password)
            if (!_showForgotPassword) ...[
              _buildInputField(
                controller: _passwordController,
                label: 'Mật khẩu',
                hint: 'Nhập mật khẩu',
                icon: FontAwesomeIcons.lock,
                obscureText: !_showPassword,
                suffixIcon: IconButton(
                  icon: Icon(
                    _showPassword
                        ? FontAwesomeIcons.eyeSlash
                        : FontAwesomeIcons.eye,
                    size: 16,
                    color: const Color(0xFF64748B),
                  ),
                  onPressed: () {
                    setState(() {
                      _showPassword = !_showPassword;
                    });
                  },
                ),
                validator: _validatePassword,
              ),
              const SizedBox(height: 16),
            ],

            // Email Field (only show if forgot password)
            if (_showForgotPassword) ...[
              _buildInputField(
                controller: _emailController,
                label: 'Email',
                hint: 'Nhập email đã đăng ký',
                icon: FontAwesomeIcons.envelope,
                keyboardType: TextInputType.emailAddress,
                validator: _validateEmail,
              ),
              const SizedBox(height: 16),
            ],

            // Remember Me & Forgot Password
            if (!_showForgotPassword) ...[
              Row(
                children: [
                  // Always show "Ghi nhớ đăng nhập" checkbox
                  ...[
                    Checkbox(
                      value: _rememberMe,
                      onChanged: (value) {
                        setState(() {
                          _rememberMe = value ?? false;
                        });
                      },
                      activeColor: const Color(0xFF0066CC),
                    ),
                    const Text('Ghi nhớ đăng nhập'),
                  ],
                  const Spacer(),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _showForgotPassword = true;
                        _error = null;
                      });
                    },
                    child: const Text(
                      'Quên mật khẩu?',
                      style: TextStyle(
                        color: Color(0xFF0066CC),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],

            // Back to Login (if forgot password)
            if (_showForgotPassword) ...[
              TextButton(
                onPressed: () {
                  setState(() {
                    _showForgotPassword = false;
                    _error = null;
                  });
                },
                child: const Text(
                  'Quay lại đăng nhập',
                  style: TextStyle(
                    color: Color(0xFF0066CC),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Login/Forgot Password Button
            _buildActionButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool obscureText = false,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    Widget? suffixIcon,
    List<TextInputFormatter>? inputFormatters,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      validator: validator,
      inputFormatters: inputFormatters,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Container(
          margin: const EdgeInsets.all(12),
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFF0066CC).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16, color: const Color(0xFF0066CC)),
        ),
        suffixIcon: suffixIcon,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF0066CC), width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.red.shade300),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.red.shade500, width: 2),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
      ),
    );
  }

  Widget _buildActionButton() {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0066CC), Color(0xFF009966)],
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0066CC).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: _loading
            ? null
            : (_showForgotPassword ? _forgotPassword : _login),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: _loading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _showForgotPassword
                        ? FontAwesomeIcons.paperPlane
                        : FontAwesomeIcons.rightToBracket,
                    size: 18,
                    color: Colors.white,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _showForgotPassword ? 'Gửi mật khẩu mới' : 'Đăng nhập',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildSocialLogin() {
    return Column(
      children: [
        // Divider
        Row(
          children: [
            Expanded(
              child: Container(height: 1, color: Colors.white.withOpacity(0.3)),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Hoặc',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
                  fontSize: 14,
                ),
              ),
            ),
            Expanded(
              child: Container(height: 1, color: Colors.white.withOpacity(0.3)),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Biometric Security Mode (when biometric is enabled)
        if (_biometricAvailable &&
            _biometricEnabled &&
            _hasSavedCredentials) ...[
          // Biometric Security Card
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.green.shade50, Colors.green.shade100],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.green.shade200),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Icon(
                      FontAwesomeIcons.fingerprint,
                      color: Colors.green.shade700,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Chế độ bảo mật sinh trắc học',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                              color: Colors.green.shade800,
                            ),
                          ),
                          Text(
                            'Thông tin đăng nhập đã được ẩn để bảo mật',
                            style: TextStyle(
                              color: Colors.green.shade700,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Biometric Login Buttons
                _buildSocialButton(
                  icon: FontAwesomeIcons.fingerprint,
                  label: 'Đăng nhập nhanh',
                  onTap: _authenticateWithBiometric,
                  enabled: true,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildSocialButton(
                        icon: FontAwesomeIcons.fingerprint,
                        label: 'Vân tay',
                        onTap: _authenticateWithFingerprint,
                        enabled: true,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildSocialButton(
                        icon: FontAwesomeIcons.faceSmile,
                        label: 'Face ID',
                        onTap: _authenticateWithFaceID,
                        enabled: true,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Switch Account Button
                TextButton(
                  onPressed: _switchToOtherAccount,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      vertical: 12,
                      horizontal: 16,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(color: Colors.green.shade300),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        FontAwesomeIcons.userPlus,
                        color: Colors.green.shade700,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Đăng nhập tài khoản khác',
                        style: TextStyle(
                          color: Colors.green.shade700,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ] else if (_biometricAvailable) ...[
          // Always show biometric button when biometric is available
          _buildSocialButton(
            icon: FontAwesomeIcons.fingerprint,
            label: 'Vân tay',
            onTap: () {
              if (!_biometricEnabled) {
                _showBiometricError(
                  'Chưa cài đặt đăng nhập bằng vân tay. Vui lòng đăng nhập vào app trước, sau đó vào Cài đặt để kích hoạt.',
                );
              } else if (!_hasSavedCredentials) {
                _showBiometricError(
                  'Chưa có thông tin đăng nhập. Vui lòng đăng nhập lần đầu trước.',
                );
              } else {
                // Biometric is enabled and has credentials - use biometric login
                _authenticateWithBiometric();
              }
            },
            enabled: true,
          ),

          const SizedBox(height: 12),

          // Debug button for available biometric
          TextButton(
            onPressed: _showBiometricDebugInfo,
            child: Text(
              'Kiểm tra chi tiết',
              style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: 12,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ] else ...[
          // Biometric not available message
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1,
              ),
            ),
            child: Column(
              children: [
                Icon(
                  FontAwesomeIcons.lock,
                  color: Colors.white.withOpacity(0.7),
                  size: 24,
                ),
                const SizedBox(height: 8),
                Text(
                  'Xác thực sinh trắc học không khả dụng',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  _getBiometricStatusMessage(),
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 12,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                // Debug button
                TextButton(
                  onPressed: _showBiometricDebugInfo,
                  child: Text(
                    'Kiểm tra chi tiết',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 12,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildSocialButton({
    required IconData icon,
    required String label,
    required VoidCallback? onTap,
    bool enabled = true,
  }) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: enabled
            ? Colors.white.withOpacity(0.15)
            : Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: enabled
              ? Colors.white.withOpacity(0.2)
              : Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: enabled ? onTap : null,
          borderRadius: BorderRadius.circular(12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 20,
                color: enabled ? Colors.white : Colors.white.withOpacity(0.5),
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  color: enabled ? Colors.white : Colors.white.withOpacity(0.5),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
