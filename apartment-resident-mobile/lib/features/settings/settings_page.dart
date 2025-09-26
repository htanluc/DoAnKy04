import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/services/biometric_service.dart';
import '../../core/storage/secure_storage.dart';
import '../../core/ui/notification_helper.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final BiometricService _biometricService = BiometricService();
  bool _biometricEnabled = false;
  bool _isLoading = true;
  bool _biometricAvailable = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Kiểm tra biometric availability
      _biometricAvailable = await _biometricService.isBiometricAvailable();

      // Load biometric preference
      final prefs = await SharedPreferences.getInstance();
      _biometricEnabled = prefs.getBool('biometric_enabled') ?? false;
    } catch (e) {
      print('Error loading settings: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleBiometric(bool value) async {
    if (!_biometricAvailable) {
      AppNotify.error(context, 'Thiết bị không hỗ trợ sinh trắc học');
      return;
    }

    if (value) {
      // Kích hoạt biometric - cần test authentication
      try {
        final authenticated = await _biometricService.authenticate(
          localizedReason: 'Kích hoạt đăng nhập bằng sinh trắc học',
        );

        if (authenticated) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setBool('biometric_enabled', true);

          setState(() {
            _biometricEnabled = true;
          });

          AppNotify.success(
            context,
            'Đã kích hoạt đăng nhập bằng sinh trắc học',
          );
        }
      } catch (e) {
        AppNotify.error(context, 'Không thể kích hoạt: $e');
      }
    } else {
      // Tắt biometric
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('biometric_enabled', false);

      setState(() {
        _biometricEnabled = false;
      });

      AppNotify.success(context, 'Đã tắt đăng nhập bằng sinh trắc học');
    }
  }

  Future<void> _testBiometric() async {
    if (!_biometricAvailable) {
      AppNotify.error(context, 'Thiết bị không hỗ trợ sinh trắc học');
      return;
    }

    try {
      final authenticated = await _biometricService.authenticate(
        localizedReason: 'Test đăng nhập bằng sinh trắc học',
      );

      if (authenticated) {
        AppNotify.success(
          context,
          'Test thành công! Sinh trắc học hoạt động bình thường.',
        );
      } else {
        AppNotify.error(context, 'Test thất bại');
      }
    } catch (e) {
      AppNotify.error(context, 'Lỗi test: $e');
    }
  }

  Widget _buildSettingTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 16,
            color: Color(0xFF1E293B),
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
        ),
        trailing: trailing,
        onTap: onTap,
      ),
    );
  }

  Widget _buildBiometricStatusCard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _biometricAvailable
              ? [Colors.green.shade50, Colors.green.shade100]
              : [Colors.orange.shade50, Colors.orange.shade100],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _biometricAvailable
              ? Colors.green.shade200
              : Colors.orange.shade200,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _biometricAvailable
                      ? Colors.green.shade100
                      : Colors.orange.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _biometricAvailable
                      ? FontAwesomeIcons.fingerprint
                      : FontAwesomeIcons.exclamationTriangle,
                  color: _biometricAvailable
                      ? Colors.green.shade700
                      : Colors.orange.shade700,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _biometricAvailable
                          ? 'Sinh trắc học khả dụng'
                          : 'Sinh trắc học không khả dụng',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: _biometricAvailable
                            ? Colors.green.shade800
                            : Colors.orange.shade800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _biometricAvailable
                          ? 'Thiết bị hỗ trợ vân tay và Face ID'
                          : 'Thiết bị không hỗ trợ hoặc chưa thiết lập',
                      style: TextStyle(
                        fontSize: 14,
                        color: _biometricAvailable
                            ? Colors.green.shade700
                            : Colors.orange.shade700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (_biometricAvailable) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _testBiometric,
                    icon: const Icon(Icons.security, size: 18),
                    label: const Text('Test'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.shade600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Cài đặt',
          style: TextStyle(
            color: Color(0xFF1E293B),
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E293B)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Biometric Status Card
                  _buildBiometricStatusCard(),

                  // Security Section
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                    child: Text(
                      'Bảo mật',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade800,
                      ),
                    ),
                  ),

                  // Biometric Login Toggle
                  _buildSettingTile(
                    title: 'Đăng nhập bằng sinh trắc học',
                    subtitle: _biometricEnabled
                        ? 'Đã kích hoạt - Sử dụng vân tay hoặc Face ID để đăng nhập'
                        : 'Sử dụng vân tay hoặc Face ID để đăng nhập nhanh',
                    icon: FontAwesomeIcons.fingerprint,
                    iconColor: _biometricEnabled ? Colors.green : Colors.blue,
                    trailing: Switch(
                      value: _biometricEnabled,
                      onChanged: _biometricAvailable ? _toggleBiometric : null,
                      activeColor: Colors.green,
                    ),
                  ),

                  // Test Biometric
                  if (_biometricAvailable && _biometricEnabled)
                    _buildSettingTile(
                      title: 'Test sinh trắc học',
                      subtitle: 'Kiểm tra vân tay và Face ID hoạt động',
                      icon: FontAwesomeIcons.shield,
                      iconColor: Colors.blue,
                      trailing: const Icon(
                        Icons.arrow_forward_ios,
                        color: Colors.grey,
                        size: 16,
                      ),
                      onTap: _testBiometric,
                    ),

                  const SizedBox(height: 20),

                  // Privacy Section
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                    child: Text(
                      'Quyền riêng tư',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade800,
                      ),
                    ),
                  ),

                  _buildSettingTile(
                    title: 'Xóa dữ liệu sinh trắc học',
                    subtitle: 'Xóa tất cả dữ liệu sinh trắc học đã lưu',
                    icon: FontAwesomeIcons.trash,
                    iconColor: Colors.red,
                    trailing: const Icon(
                      Icons.arrow_forward_ios,
                      color: Colors.grey,
                      size: 16,
                    ),
                    onTap: () async {
                      final confirmed = await showDialog<bool>(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('Xác nhận'),
                          content: const Text(
                            'Bạn có chắc chắn muốn xóa tất cả dữ liệu sinh trắc học?',
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context, false),
                              child: const Text('Hủy'),
                            ),
                            ElevatedButton(
                              onPressed: () => Navigator.pop(context, true),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                              ),
                              child: const Text('Xóa'),
                            ),
                          ],
                        ),
                      );

                      if (confirmed == true) {
                        await TokenStorage.instance.clearSavedCredentials();
                        setState(() {
                          _biometricEnabled = false;
                        });
                        AppNotify.success(
                          context,
                          'Đã xóa dữ liệu sinh trắc học',
                        );
                      }
                    },
                  ),

                  const SizedBox(height: 100),
                ],
              ),
            ),
    );
  }
}
