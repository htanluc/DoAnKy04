import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import '../../../core/storage/secure_storage.dart';
import '../../../core/api/api_service.dart';
import '../../../core/ui/notification_helper.dart';
import '../models/user_profile.dart';
import '../data/profile_api.dart';
import '../../settings/settings_page.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ProfileApi _profileApi = ProfileApi();
  UserProfile? _userProfile;
  bool _isLoading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final profile = await _profileApi.getUserProfile();
      setState(() {
        _userProfile = profile;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Lỗi khi tải thông tin: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _pickAndUploadAvatar() async {
    try {
      final picker = ImagePicker();
      final file = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1024,
        imageQuality: 85,
      );
      if (file == null) return;

      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiService.baseUrl}/api/auth/me/avatar'),
      );
      final token = await TokenStorage.instance.getToken();
      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          file.path,
          filename: 'avatar.jpg',
        ),
      );
      final streamed = await request.send();
      final resp = await http.Response.fromStream(streamed);
      if (resp.statusCode < 200 || resp.statusCode >= 300) {
        throw Exception('Upload failed ${resp.statusCode}');
      }
      if (!mounted) return;
      await _loadUserProfile();
      if (!mounted) return;
      AppNotify.success(context, 'Cập nhật avatar thành công');
    } catch (e) {
      if (!mounted) return;
      AppNotify.error(context, 'Tải avatar thất bại: $e');
    }
  }

  Future<void> _logout() async {
    try {
      await _profileApi.logout();
      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
      }
    } catch (e) {
      AppNotify.error(context, 'Lỗi khi đăng xuất: $e');
    }
  }

  Widget _buildInfoCard({
    required String title,
    required String value,
    required IconData icon,
    Color? iconColor,
    VoidCallback? onTap,
  }) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: (iconColor ?? Theme.of(context).primaryColor)
                      .withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: FaIcon(
                  icon,
                  color: iconColor ?? Theme.of(context).primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      value,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                  ],
                ),
              ),
              if (onTap != null)
                Icon(
                  Icons.arrow_forward_ios,
                  color: Colors.grey.shade400,
                  size: 16,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Color(0xFF1E293B),
        ),
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
          'Hồ sơ',
          style: TextStyle(
            color: Color(0xFF1E293B),
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E293B)),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            onPressed: _loadUserProfile,
            icon: const Icon(Icons.refresh, color: Color(0xFF1E293B)),
            tooltip: 'Làm mới',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.red.shade300,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _error,
                    style: TextStyle(color: Colors.red.shade600),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadUserProfile,
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            )
          : _userProfile == null
          ? const Center(child: Text('Không có thông tin người dùng'))
          : RefreshIndicator(
              onRefresh: _loadUserProfile,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header với avatar
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(24),
                          bottomRight: Radius.circular(24),
                        ),
                      ),
                      child: Column(
                        children: [
                          Stack(
                            children: [
                              CircleAvatar(
                                radius: 50,
                                backgroundColor: Theme.of(
                                  context,
                                ).primaryColor.withOpacity(0.1),
                                child: _userProfile!.avatarUrl != null
                                    ? ClipOval(
                                        child: Image.network(
                                          _userProfile!.avatarUrl!,
                                          width: 100,
                                          height: 100,
                                          fit: BoxFit.cover,
                                          errorBuilder:
                                              (context, error, stackTrace) {
                                                return const FaIcon(
                                                  FontAwesomeIcons.user,
                                                  size: 40,
                                                  color: Color(0xFF64748B),
                                                );
                                              },
                                        ),
                                      )
                                    : const FaIcon(
                                        FontAwesomeIcons.user,
                                        size: 40,
                                        color: Color(0xFF64748B),
                                      ),
                              ),
                              Positioned(
                                bottom: 0,
                                right: 0,
                                child: InkWell(
                                  onTap: _pickAndUploadAvatar,
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).primaryColor,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.white,
                                        width: 2,
                                      ),
                                    ),
                                    child: const FaIcon(
                                      FontAwesomeIcons.pencil,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _userProfile!.fullName,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _userProfile!.role,
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey.shade600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green.shade100,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.circle,
                                  color: Colors.green.shade600,
                                  size: 8,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Đang hoạt động',
                                  style: TextStyle(
                                    color: Colors.green.shade800,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Thông tin cá nhân
                    _buildSectionTitle('Thông tin cá nhân'),
                    _buildInfoCard(
                      title: 'Họ và tên',
                      value: _userProfile!.fullName,
                      icon: FontAwesomeIcons.user,
                      iconColor: Colors.blue,
                    ),
                    _buildInfoCard(
                      title: 'Số điện thoại',
                      value: _userProfile!.phoneNumber,
                      icon: FontAwesomeIcons.phone,
                      iconColor: Colors.green,
                    ),
                    _buildInfoCard(
                      title: 'Email',
                      value: _userProfile!.email,
                      icon: FontAwesomeIcons.envelope,
                      iconColor: Colors.orange,
                    ),
                    _buildInfoCard(
                      title: 'Ngày sinh',
                      value: _userProfile!.dateOfBirth,
                      icon: FontAwesomeIcons.calendar,
                      iconColor: Colors.purple,
                    ),
                    _buildInfoCard(
                      title: 'CCCD/CMND',
                      value: _userProfile!.idCardNumber,
                      icon: FontAwesomeIcons.idCard,
                      iconColor: Colors.red,
                    ),

                    // Thông tin căn hộ
                    _buildSectionTitle('Thông tin căn hộ'),
                    _buildInfoCard(
                      title: 'Số căn hộ',
                      value: _userProfile!.apartmentNumber,
                      icon: FontAwesomeIcons.home,
                      iconColor: Colors.blue,
                    ),
                    _buildInfoCard(
                      title: 'Tòa nhà',
                      value: _userProfile!.buildingName,
                      icon: FontAwesomeIcons.building,
                      iconColor: Colors.green,
                    ),
                    _buildInfoCard(
                      title: 'Tầng',
                      value: 'Tầng ${_userProfile!.floor}',
                      icon: FontAwesomeIcons.stairs,
                      iconColor: Colors.orange,
                    ),
                    _buildInfoCard(
                      title: 'Diện tích',
                      value: '${_userProfile!.area} m²',
                      icon: FontAwesomeIcons.ruler,
                      iconColor: Colors.purple,
                    ),
                    _buildInfoCard(
                      title: 'Số phòng ngủ',
                      value: '${_userProfile!.bedrooms} phòng',
                      icon: FontAwesomeIcons.bed,
                      iconColor: Colors.red,
                    ),

                    // Thông tin liên hệ khẩn cấp
                    _buildSectionTitle('Liên hệ khẩn cấp'),
                    ..._userProfile!.emergencyContacts
                        .map(
                          (contact) => _buildInfoCard(
                            title: contact.name,
                            value: '${contact.phone} - ${contact.relationship}',
                            icon: FontAwesomeIcons.phoneAlt,
                            iconColor: Colors.red,
                          ),
                        )
                        .toList(),

                    // Các tùy chọn
                    _buildSectionTitle('Tùy chọn'),
                    _buildInfoCard(
                      title: 'Cập nhật thông tin',
                      value: 'Thay đổi thông tin cá nhân',
                      icon: FontAwesomeIcons.edit,
                      iconColor: Colors.blue,
                      onTap: () async {
                        // Demo: cập nhật tên hiển thị (có thể thay bằng màn form riêng)
                        final controller = TextEditingController(
                          text: _userProfile!.fullName,
                        );
                        final newName = await showDialog<String>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Cập nhật thông tin'),
                            content: TextField(
                              controller: controller,
                              decoration: const InputDecoration(
                                labelText: 'Họ và tên',
                              ),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx),
                                child: const Text('Hủy'),
                              ),
                              ElevatedButton(
                                onPressed: () =>
                                    Navigator.pop(ctx, controller.text.trim()),
                                child: const Text('Lưu'),
                              ),
                            ],
                          ),
                        );
                        if (newName != null && newName.isNotEmpty) {
                          try {
                            await _profileApi.updateProfile({
                              'fullName': newName,
                            });
                            await _loadUserProfile();
                            AppNotify.success(
                              context,
                              'Cập nhật thông tin thành công',
                            );
                          } catch (e) {
                            AppNotify.error(context, 'Cập nhật thất bại: $e');
                          }
                        }
                      },
                    ),
                    _buildInfoCard(
                      title: 'Đổi mật khẩu',
                      value: 'Thay đổi mật khẩu đăng nhập',
                      icon: FontAwesomeIcons.lock,
                      iconColor: Colors.orange,
                      onTap: () async {
                        final oldCtrl = TextEditingController();
                        final newCtrl = TextEditingController();
                        final confirmCtrl = TextEditingController();
                        final result = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Đổi mật khẩu'),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                TextField(
                                  controller: oldCtrl,
                                  obscureText: true,
                                  decoration: const InputDecoration(
                                    labelText: 'Mật khẩu hiện tại',
                                  ),
                                ),
                                TextField(
                                  controller: newCtrl,
                                  obscureText: true,
                                  decoration: const InputDecoration(
                                    labelText: 'Mật khẩu mới',
                                  ),
                                ),
                                TextField(
                                  controller: confirmCtrl,
                                  obscureText: true,
                                  decoration: const InputDecoration(
                                    labelText: 'Xác nhận mật khẩu mới',
                                  ),
                                ),
                              ],
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: const Text('Hủy'),
                              ),
                              ElevatedButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                child: const Text('Đổi'),
                              ),
                            ],
                          ),
                        );
                        if (result == true) {
                          try {
                            await _profileApi.changePassword(
                              oldPassword: oldCtrl.text,
                              newPassword: newCtrl.text,
                              confirmNewPassword: confirmCtrl.text,
                            );
                            AppNotify.success(
                              context,
                              'Đổi mật khẩu thành công',
                            );
                          } catch (e) {
                            AppNotify.error(context, '$e');
                          }
                        }
                      },
                    ),
                    _buildInfoCard(
                      title: 'Cài đặt',
                      value: 'Cài đặt ứng dụng',
                      icon: FontAwesomeIcons.cog,
                      iconColor: Colors.grey,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const SettingsPage(),
                          ),
                        );
                      },
                    ),

                    // Nút đăng xuất
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton.icon(
                          onPressed: _logout,
                          icon: const FaIcon(FontAwesomeIcons.signOutAlt),
                          label: const Text(
                            'Đăng xuất',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red.shade600,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 2,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
    );
  }
}
