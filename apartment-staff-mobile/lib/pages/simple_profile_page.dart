import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'login_page.dart';

class SimpleProfilePage extends StatefulWidget {
  const SimpleProfilePage({super.key});

  @override
  State<SimpleProfilePage> createState() => _SimpleProfilePageState();
}

class _SimpleProfilePageState extends State<SimpleProfilePage> {
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final user = await AuthService.getUser();
    if (!mounted) return;
    setState(() => _user = user);
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginPage()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    final name = (() {
      final u = _user;
      if (u == null) return 'Staff';
      for (final k in ['fullName', 'name', 'username', 'staffName']) {
        final v = u[k];
        if (v is String && v.trim().isNotEmpty) return v.trim();
      }
      return u['phoneNumber']?.toString() ?? 'Staff';
    })();

    final phone = _user?['phoneNumber']?.toString() ?? '';
    final email = _user?['email']?.toString();

    return Scaffold(
      appBar: AppBar(title: const Text('Cá nhân'), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [cs.primary, cs.primary.withOpacity(0.8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: Colors.white.withOpacity(0.2),
                    child: Icon(Icons.person, size: 40, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  if (phone.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      phone,
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                  if (email != null && email.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      email,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Menu items
            _buildMenuSection(
              title: 'Thông tin tài khoản',
              items: [
                _buildMenuItem(
                  icon: Icons.person_outline,
                  title: 'Thông tin cá nhân',
                  subtitle: 'Xem và chỉnh sửa thông tin',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Tính năng đang phát triển'),
                      ),
                    );
                  },
                ),
                _buildMenuItem(
                  icon: Icons.security_outlined,
                  title: 'Bảo mật',
                  subtitle: 'Đổi mật khẩu và bảo mật',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Tính năng đang phát triển'),
                      ),
                    );
                  },
                ),
              ],
            ),

            const SizedBox(height: 16),

            _buildMenuSection(
              title: 'Hỗ trợ',
              items: [
                _buildMenuItem(
                  icon: Icons.help_outline,
                  title: 'Trợ giúp',
                  subtitle: 'Hướng dẫn sử dụng',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Tính năng đang phát triển'),
                      ),
                    );
                  },
                ),
                _buildMenuItem(
                  icon: Icons.info_outline,
                  title: 'Giới thiệu',
                  subtitle: 'Thông tin ứng dụng',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Tính năng đang phát triển'),
                      ),
                    );
                  },
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Logout button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _logout,
                icon: const Icon(Icons.logout),
                label: const Text('Đăng xuất'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuSection({
    required String title,
    required List<Widget> items,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
        Card(child: Column(children: items)),
      ],
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
