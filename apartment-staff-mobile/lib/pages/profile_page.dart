import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  Map<String, dynamic>? _user;
  bool _loading = false;
  bool _showChange = false;

  final _oldCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _ob1 = true, _ob2 = true, _ob3 = true;

  @override
  void initState() {
    super.initState();
    _load();
    _syncProfileIfMissing();
  }

  Future<void> _load() async {
    final u = await AuthService.getUser();
    if (!mounted) return;
    setState(() => _user = u);
  }

  Future<void> _syncProfileIfMissing() async {
    try {
      final current = await AuthService.getUser();
      // Nếu thiếu các trường chuẩn (fullName/email/avatarUrl), gọi API để đồng bộ
      final bool needSync = current == null ||
          (current['fullName'] == null && current['name'] == null) ||
          (current['avatarUrl'] == null && current['avatar'] == null);
      if (!needSync) return;
      final profile = await ApiService.getProfile();
      if (profile != null && profile.isNotEmpty) {
        final token = await AuthService.getToken();
        if (token != null) {
          final merged = <String, dynamic>{}
            ..addAll(current ?? const <String, dynamic>{})
            ..addAll(profile);
          await AuthService.saveAuth(token, merged);
          if (mounted) setState(() => _user = merged);
        }
      }
    } catch (_) {
      // bỏ qua lỗi đồng bộ để không chặn UI
    }
  }

  Future<void> _changePassword() async {
    final oldP = _oldCtrl.text;
    final newP = _newCtrl.text;
    final reP = _confirmCtrl.text;

    if (newP.trim().length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mật khẩu mới phải từ 6 ký tự')),
      );
      return;
    }
    if (newP != reP) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Xác nhận mật khẩu không khớp')),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      await ApiService.changePassword(oldP, newP);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đổi mật khẩu thành công')),
      );
      setState(() {
        _showChange = false;
        _oldCtrl.clear();
        _newCtrl.clear();
        _confirmCtrl.clear();
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Lỗi: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final name = (() {
      final u = _user;
      if (u == null) return '';
      for (final k in ['fullName', 'name', 'username', 'staffName']) {
        final v = u[k];
        if (v is String && v.trim().isNotEmpty) return v.trim();
      }
      return u['phoneNumber']?.toString() ?? '';
    })();
    final email = _user?['email']?.toString();
    final status = _user?['status']?.toString();
    final roles = (() {
      final r = _user?['roles'];
      if (r is List) return r.map((e) => e.toString()).toList();
      if (r is Set) return r.map((e) => e.toString()).toList();
      return const <String>[];
    })();
    final dob = _user?['dateOfBirth']?.toString();
    final idCard = _user?['idCardNumber']?.toString();
    final createdAt = _user?['createdAt']?.toString();

    final avatarUrl = ApiService.normalizeFileUrl(
        (_user?['avatarUrl'] ?? _user?['avatar'])?.toString() ?? '');

    String _formatDate(String? input) {
      if (input == null || input.trim().isEmpty) return '-';
      try {
        if (RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(input)) {
          final dt = DateTime.parse(input);
          return DateFormat('dd/MM/yyyy').format(dt);
        }
        final parsed = DateTime.tryParse(input);
        if (parsed != null) {
          return DateFormat('dd/MM/yyyy').format(parsed);
        }
        if (RegExp(r'^\d{10,13}$').hasMatch(input)) {
          final epoch = int.parse(input);
          final ms = input.length == 13 ? epoch : epoch * 1000;
          final dt =
              DateTime.fromMillisecondsSinceEpoch(ms, isUtc: true).toLocal();
          return DateFormat('dd/MM/yyyy').format(dt);
        }
      } catch (_) {}
      if (input.length >= 10 && RegExp(r'^\d{4}-\d{2}-\d{2}').hasMatch(input)) {
        try {
          final dt = DateTime.parse(input.substring(0, 10));
          return DateFormat('dd/MM/yyyy').format(dt);
        } catch (_) {}
      }
      return input;
    }

    final createdAtText = _formatDate(createdAt);
    final dobText = _formatDate(dob);

    return Scaffold(
      appBar: AppBar(title: const Text('Cá nhân')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: cs.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: cs.shadow.withOpacity(0.06),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: cs.primary.withOpacity(0.15),
                    backgroundImage:
                        (avatarUrl.isNotEmpty) ? NetworkImage(avatarUrl) : null,
                    child: avatarUrl.isEmpty
                        ? Text(
                            name.isNotEmpty ? name[0].toUpperCase() : 'S',
                            style: TextStyle(
                              color: cs.primary,
                              fontWeight: FontWeight.w800,
                              fontSize: 18,
                            ),
                          )
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name,
                            style: const TextStyle(
                                fontSize: 18, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 4),
                        Text(
                          _user?['phoneNumber']?.toString() ?? '',
                          style: TextStyle(color: cs.onSurfaceVariant),
                        ),
                        if (email != null && email.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(email,
                              style: TextStyle(color: cs.onSurfaceVariant)),
                        ]
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Thông tin chi tiết
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Thông tin tài khoản',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    _InfoRow(
                        icon: Icons.badge_outlined,
                        label: 'Trạng thái',
                        value: status ?? '-'),
                    _InfoRow(
                        icon: Icons.event,
                        label: 'Ngày tạo',
                        value: createdAtText),
                    _InfoRow(
                        icon: Icons.perm_identity,
                        label: 'CMND/CCCD',
                        value: idCard ?? '-'),
                    _InfoRow(
                        icon: Icons.cake_outlined,
                        label: 'Ngày sinh',
                        value: dobText),
                    if (roles.isNotEmpty)
                      _InfoRow(
                          icon: Icons.shield_outlined,
                          label: 'Vai trò',
                          value: roles.join(', ')),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Button to reveal change password UI
            FilledButton.icon(
              onPressed: _loading
                  ? null
                  : () => setState(() => _showChange = !_showChange),
              icon: const Icon(Icons.lock_reset),
              label: Text(_showChange ? 'Đóng đổi mật khẩu' : 'Đổi mật khẩu'),
            ),

            if (_showChange) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cs.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: cs.outlineVariant.withOpacity(0.3)),
                ),
                child: Column(
                  children: [
                    TextField(
                      controller: _oldCtrl,
                      obscureText: _ob1,
                      decoration: InputDecoration(
                        labelText: 'Mật khẩu hiện tại',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          icon: Icon(
                              _ob1 ? Icons.visibility : Icons.visibility_off),
                          onPressed: () => setState(() => _ob1 = !_ob1),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _newCtrl,
                      obscureText: _ob2,
                      decoration: InputDecoration(
                        labelText: 'Mật khẩu mới',
                        prefixIcon: const Icon(Icons.vpn_key_outlined),
                        suffixIcon: IconButton(
                          icon: Icon(
                              _ob2 ? Icons.visibility : Icons.visibility_off),
                          onPressed: () => setState(() => _ob2 = !_ob2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _confirmCtrl,
                      obscureText: _ob3,
                      decoration: InputDecoration(
                        labelText: 'Xác nhận mật khẩu mới',
                        prefixIcon: const Icon(Icons.vpn_key_rounded),
                        suffixIcon: IconButton(
                          icon: Icon(
                              _ob3 ? Icons.visibility : Icons.visibility_off),
                          onPressed: () => setState(() => _ob3 = !_ob3),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _loading
                                ? null
                                : () {
                                    setState(() {
                                      _showChange = false;
                                      _oldCtrl.clear();
                                      _newCtrl.clear();
                                      _confirmCtrl.clear();
                                    });
                                  },
                            child: const Text('Hủy'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: FilledButton(
                            onPressed: _loading ? null : _changePassword,
                            child: _loading
                                ? const SizedBox(
                                    height: 18,
                                    width: 18,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2),
                                  )
                                : const Text('Lưu'),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 3,
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: 'Trang chủ'),
          NavigationDestination(
              icon: Icon(Icons.work_outline),
              selectedIcon: Icon(Icons.work),
              label: 'Công việc'),
          NavigationDestination(
              icon: Icon(Icons.insights_outlined),
              selectedIcon: Icon(Icons.insights),
              label: 'Thống kê'),
          NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'Cá nhân'),
        ],
        onDestinationSelected: (i) async {
          if (i == 0) {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            }
            return;
          }
          if (i != 3) {
            await showDialog<void>(
              context: context,
              builder: (ctx) => AlertDialog(
                title: const Text('Thông báo'),
                content: const Text('Tính năng đang phát triển'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: const Text('Đóng'),
                  ),
                ],
              ),
            );
          }
        },
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 20, color: cs.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(label,
                style: TextStyle(
                    color: cs.onSurfaceVariant, fontWeight: FontWeight.w500)),
          ),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
