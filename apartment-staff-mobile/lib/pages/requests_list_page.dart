import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/db_service.dart';
import '../models/service_request.dart';
import 'requests_by_status_page.dart';
import 'login_page.dart';
import 'profile_page.dart';

class RequestsListPage extends StatefulWidget {
  const RequestsListPage({super.key});

  @override
  State<RequestsListPage> createState() => _RequestsListPageState();
}

class _RequestsListPageState extends State<RequestsListPage> {
  bool _loading = true;
  List<ServiceRequestModel> _items = [];
  String? _error;
  String? _staffName;

  DateTime? _tryParseDate(String? input) {
    if (input == null || input.trim().isEmpty) return null;
    try {
      return DateTime.tryParse(input);
    } catch (_) {
      return null;
    }
  }

  String? _extractStaffName(Map<String, dynamic> user) {
    final candidates = <String>[
      'fullName',
      'name',
      'username',
      'staffName',
      'employeeName'
    ];
    for (final key in candidates) {
      final v = user[key];
      if (v is String && v.trim().isNotEmpty) return v.trim();
    }
    final phone = user['phoneNumber']?.toString();
    return phone?.isNotEmpty == true ? phone : null;
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final cached = await DbService.loadAssignedRequests();
    if (mounted && cached.isNotEmpty) {
      setState(() {
        _items = cached
            .map((e) => ServiceRequestModel.fromJson({
                  'id': e['id'],
                  'userName': e['resident_name'],
                  'userPhone': e['resident_phone'],
                  'categoryName': e['category_name'],
                  'description': e['description'],
                  'priority': e['priority'],
                  'status': e['status'],
                  'submittedAt': e['submitted_at'],
                }))
            .toList();
      });
    }
    try {
      final user = await AuthService.getUser();
      final staffId = (user?['id'] as num?)?.toInt();
      if (staffId == null) throw Exception('Không tìm thấy staffId');
      String? name = user != null ? _extractStaffName(user) : null;
      if (mounted && name != null) {
        setState(() => _staffName = name);
      }
      if (name == null ||
          (user?['fullName'] == null && user?['name'] == null)) {
        try {
          final profile = await ApiService.getProfile();
          if (profile != null && profile.isNotEmpty) {
            final token = await AuthService.getToken();
            if (token != null) {
              final merged = <String, dynamic>{}
                ..addAll(user ?? const <String, dynamic>{})
                ..addAll(profile);
              await AuthService.saveAuth(token, merged);
              final newName = _extractStaffName(merged);
              if (mounted && newName != null)
                setState(() => _staffName = newName);
            }
          }
        } catch (_) {}
      }
      final list = await ApiService.getAssignedRequests(staffId);
      await DbService.saveAssignedRequests(list.cast<Map<String, dynamic>>());
      if (mounted) {
        setState(() {
          _items = list
              .map((e) =>
                  ServiceRequestModel.fromJson(e as Map<String, dynamic>))
              .toList();
        });
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 12.0, right: 8.0),
              child: CircleAvatar(
                radius: 16,
                backgroundColor:
                    Theme.of(context).colorScheme.primary.withOpacity(0.15),
                child: Text(
                  (_staffName != null && _staffName!.isNotEmpty)
                      ? _staffName!.trim()[0].toUpperCase()
                      : 'S',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
            Expanded(
              child: Text(
                _staffName ?? 'Lê Văn Staff',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
              tooltip: 'Làm mới',
              onPressed: _load,
              icon: const Icon(Icons.refresh)),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (v) async {
              if (v == 'logout') {
                await AuthService.logout();
                if (!mounted) return;
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginPage()),
                  (route) => false,
                );
              }
            },
            itemBuilder: (context) => const [
              PopupMenuItem(value: 'logout', child: Text('Đăng xuất')),
            ],
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _buildMenuByStatus(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
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
          if (i == 3) {
            ScaffoldMessenger.of(context).clearSnackBars();
            await Navigator.of(context)
                .push(MaterialPageRoute(builder: (_) => const ProfilePage()));
            return;
          }
          if (i != 0) {
            // Tránh snackbar còn treo khi chuyển trang
            if (mounted) {
              await showDialog<void>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Thông báo'),
                  content: const Text('Tính năng đang phát triển'),
                  actions: [
                    TextButton(
                        onPressed: () => Navigator.of(ctx).pop(),
                        child: const Text('Đóng')),
                  ],
                ),
              );
            }
          }
        },
      ),
    );
  }

  Widget _buildMenuByStatus() {
    if (_error != null && _items.isEmpty) {
      return _StatePlaceholder(
        icon: Icons.wifi_off,
        title: 'Không thể tải dữ liệu',
        message: 'Kiểm tra kết nối mạng và thử lại.',
        actionText: 'Thử lại',
        onAction: _load,
      );
    }
    if (_items.isEmpty) {
      return _StatePlaceholder(
        icon: Icons.inbox,
        title: 'Không có dữ liệu',
        message: 'Kéo xuống để làm mới danh sách.',
        actionText: 'Làm mới',
        onAction: _load,
      );
    }

    final counts = <String, int>{
      'ALL': _items.length,
      'OPEN':
          _items.where((e) => (e.status ?? '').toUpperCase() == 'OPEN').length,
      'ASSIGNED': _items
          .where((e) => (e.status ?? '').toUpperCase() == 'ASSIGNED')
          .length,
      'IN_PROGRESS': _items
          .where((e) => (e.status ?? '').toUpperCase() == 'IN_PROGRESS')
          .length,
      'COMPLETED': _items
          .where((e) => (e.status ?? '').toUpperCase() == 'COMPLETED')
          .length,
      'CANCELLED': _items
          .where((e) => (e.status ?? '').toUpperCase() == 'CANCELLED')
          .length,
    };

    final now = DateTime.now();
    final sevenDaysAgo = now.subtract(const Duration(days: 7));
    final completedLast7Days = _items.where((e) {
      if ((e.status ?? '').toUpperCase() != 'COMPLETED') return false;
      final dt = _tryParseDate(e.submittedAt);
      if (dt == null) return false;
      return dt.isAfter(sevenDaysAgo);
    }).length;

    Widget summaryCard() {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Tổng quan công việc',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              _MetricPill(
                  label: 'Hoàn thành (7 ngày)',
                  value: '$completedLast7Days',
                  color: const Color(0xFF5CB034),
                  compact: true),
            ],
          ),
        ),
      );
    }

    Widget gridItem(String key, String title, Color color, IconData icon) {
      final bool isHighlighted = key == 'OPEN' || key == 'IN_PROGRESS';
      final Color cardColor = key == 'CANCELLED' ? Colors.grey : color;
      final Color titleColor = isHighlighted
          ? cardColor
          : (key == 'CANCELLED'
              ? Colors.grey
              : Theme.of(context).colorScheme.onSurface);
      final double iconSize = key == 'CANCELLED' ? 28 : 32;
      final int? count = counts[key];
      final String subtitle = count == null ? '' : '$count yêu cầu';

      return InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
                builder: (_) =>
                    RequestsByStatusPage(status: key == 'ALL' ? 'ALL' : key)),
          );
        },
        child: Ink(
          decoration: BoxDecoration(
            color: cardColor.withOpacity(key == 'CANCELLED' ? 0.06 : 0.08),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: cardColor, width: 1.2),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Icon(icon, color: cardColor, size: iconSize),
                const SizedBox(height: 12),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 18,
                      color: titleColor),
                ),
                const SizedBox(height: 6),
                Text(
                  subtitle,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                      fontSize: 13.5,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                      fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              summaryCard(),
              const SizedBox(height: 16),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisSpacing: 14,
                crossAxisSpacing: 14,
                childAspectRatio: 1.1,
                children: [
                  gridItem('ALL', 'Tất cả',
                      Theme.of(context).colorScheme.primary, Icons.list_alt),
                  gridItem('OPEN', 'Mở', const Color(0xFFF37021),
                      Icons.playlist_add_check_circle_outlined),
                  gridItem('ASSIGNED', 'Đã giao', const Color(0xFF0072BC),
                      Icons.assignment_ind_outlined),
                  gridItem('IN_PROGRESS', 'Đang xử lý', const Color(0xFF0072BC),
                      Icons.pending_actions_outlined),
                  gridItem('COMPLETED', 'Hoàn thành', const Color(0xFF5CB034),
                      Icons.check_circle_outline),
                  gridItem('CANCELLED', 'Đã huỷ', Colors.grey,
                      Icons.cancel_outlined),
                ],
              ),
              const SizedBox(height: 32),
              Text(
                'Gợi ý: chạm vào thẻ để xem danh sách theo trạng thái',
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontSize: 14),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MetricPill extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final bool compact;

  const _MetricPill(
      {required this.label,
      required this.value,
      required this.color,
      this.compact = false});

  @override
  Widget build(BuildContext context) {
    final double vPad = compact ? 8 : 10;
    final double valueSize = compact ? 18 : 20;
    final double labelSize = compact ? 13 : 14;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: vPad),
      decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(value,
              style: TextStyle(
                  color: color,
                  fontWeight: FontWeight.w800,
                  fontSize: valueSize)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style:
                  TextStyle(fontSize: labelSize, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatePlaceholder extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String actionText;
  final Future<void> Function() onAction;

  const _StatePlaceholder(
      {required this.icon,
      required this.title,
      required this.message,
      required this.actionText,
      required this.onAction});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64, color: Theme.of(context).colorScheme.outline),
            const SizedBox(height: 12),
            const Text('Không có dữ liệu',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(message,
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: onAction, child: Text(actionText)),
          ],
        ),
      ),
    );
  }
}
