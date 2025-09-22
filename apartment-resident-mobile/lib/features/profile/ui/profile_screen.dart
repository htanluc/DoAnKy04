import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../models/user_profile.dart';
import '../data/profile_api.dart';

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

  Future<void> _logout() async {
    try {
      await _profileApi.logout();
      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi khi đăng xuất: $e')));
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
                      onTap: () {
                        // TODO: Navigate to edit profile
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Tính năng đang phát triển'),
                          ),
                        );
                      },
                    ),
                    _buildInfoCard(
                      title: 'Đổi mật khẩu',
                      value: 'Thay đổi mật khẩu đăng nhập',
                      icon: FontAwesomeIcons.lock,
                      iconColor: Colors.orange,
                      onTap: () {
                        // TODO: Navigate to change password
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Tính năng đang phát triển'),
                          ),
                        );
                      },
                    ),
                    _buildInfoCard(
                      title: 'Cài đặt',
                      value: 'Cài đặt ứng dụng',
                      icon: FontAwesomeIcons.cog,
                      iconColor: Colors.grey,
                      onTap: () {
                        // TODO: Navigate to settings
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Tính năng đang phát triển'),
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
