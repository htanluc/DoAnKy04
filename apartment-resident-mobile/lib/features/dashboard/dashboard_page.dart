import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:async';
import '../../core/api/api_helper.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  late Future<_DashboardData> _dashboardFuture;

  @override
  void initState() {
    super.initState();
    _dashboardFuture = _fetchDashboardData();
  }

  void _retry() {
    setState(() {
      _dashboardFuture = _fetchDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bảng điều khiển'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _retry,
            tooltip: 'Làm mới',
          ),
        ],
      ),
      body: FutureBuilder<_DashboardData>(
        future: _dashboardFuture,
        builder: (context, snapshot) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Hiển thị stats nếu có data, nếu không thì hiển thị placeholder
              if (snapshot.connectionState == ConnectionState.waiting)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (snapshot.hasError)
                Card(
                  color: Colors.red.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        const Icon(Icons.warning, color: Colors.red),
                        const SizedBox(height: 8),
                        Text(
                          'Không thể tải dữ liệu thống kê',
                          style: TextStyle(
                            color: Colors.red.shade700,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Vui lòng kiểm tra kết nối mạng',
                          style: TextStyle(color: Colors.red.shade600),
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          onPressed: _retry,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Thử lại'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red.shade600,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else if (snapshot.hasData) ...[
                _StatsGrid(stats: snapshot.data!.stats),
                const SizedBox(height: 16),
                _RecentActivities(activities: snapshot.data!.activities),
                const SizedBox(height: 16),
              ],

              // Luôn hiển thị navigation cards
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: const [
                  _NavCard(
                    title: 'Hóa đơn',
                    route: '/invoices',
                    icon: Icons.receipt_long,
                  ),
                  _NavCard(
                    title: 'Đặt tiện ích',
                    route: '/facility-bookings',
                    icon: Icons.event_available,
                  ),
                  _NavCard(
                    title: 'Sự kiện',
                    route: '/events',
                    icon: Icons.event,
                  ),
                  _NavCard(
                    title: 'Thông báo',
                    route: '/announcements',
                    icon: Icons.notifications,
                  ),
                  _NavCard(
                    title: 'Yêu cầu dịch vụ',
                    route: '/service-requests',
                    icon: Icons.build,
                  ),
                  _NavCard(
                    title: 'Xe',
                    route: '/vehicles',
                    icon: Icons.directions_car,
                  ),
                  _NavCard(
                    title: 'Hồ sơ',
                    route: '/profile',
                    icon: Icons.person,
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

class _NavCard extends StatelessWidget {
  const _NavCard({
    required this.title,
    required this.route,
    required this.icon,
  });
  final String title;
  final String route;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      height: 120,
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed(route),
        child: Card(
          color: Colors.white,
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 32, color: const Color(0xFF0066CC)),
                const SizedBox(height: 12),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Stats {
  _Stats({
    required this.totalInvoices,
    required this.pendingInvoices,
    required this.overdueInvoices,
    required this.unreadAnnouncements,
    required this.upcomingEvents,
    required this.activeBookings,
  });
  final int totalInvoices;
  final int pendingInvoices;
  final int overdueInvoices;
  final int unreadAnnouncements;
  final int upcomingEvents;
  final int activeBookings;
}

class _Activity {
  _Activity({
    required this.id,
    required this.title,
    required this.description,
    required this.timestamp,
  });
  final String id;
  final String title;
  final String description;
  final String timestamp;
}

class _DashboardData {
  _DashboardData({required this.stats, required this.activities});
  final _Stats stats;
  final List<_Activity> activities;
}

Future<_DashboardData> _fetchDashboardData() async {
  // Stats - với timeout ngắn hơn để tránh bị kẹt
  _Stats stats;
  try {
    final resp = await ApiHelper.get(
      '/api/dashboard/stats',
    ).timeout(const Duration(seconds: 10));
    final s = jsonDecode(resp.body);
    stats = _Stats(
      totalInvoices: (s['totalInvoices'] ?? 0) as int,
      pendingInvoices: (s['pendingInvoices'] ?? 0) as int,
      overdueInvoices: (s['overdueInvoices'] ?? 0) as int,
      unreadAnnouncements: (s['unreadAnnouncements'] ?? 0) as int,
      upcomingEvents: (s['upcomingEvents'] ?? 0) as int,
      activeBookings: (s['activeBookings'] ?? 0) as int,
    );
  } catch (e) {
    // Log lỗi để debug
    print('[Dashboard] Stats API error: $e');
    stats = _Stats(
      totalInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      unreadAnnouncements: 0,
      upcomingEvents: 0,
      activeBookings: 0,
    );
  }

  // Activities - với timeout ngắn hơn
  List<_Activity> activities = const [];
  try {
    final resp = await ApiHelper.get(
      '/api/activity-logs/my',
      query: {'page': 0, 'size': 10},
    ).timeout(const Duration(seconds: 8));

    final raw = jsonDecode(resp.body);
    final content = ApiHelper.extractList(raw);
    activities = content.whereType<Object>().map((e) {
      if (e is! Map)
        return _Activity(id: '', title: '', description: '', timestamp: '');
      final m = Map<String, dynamic>.from(e);
      return _Activity(
        id: (m['logId'] ?? m['id'] ?? '').toString(),
        title:
            (m['actionTypeDisplayName'] ?? m['actionType'] ?? m['title'] ?? '')
                .toString(),
        description: (m['description'] ?? m['message'] ?? '').toString(),
        timestamp: (m['timestamp'] ?? m['createdAt'] ?? '').toString(),
      );
    }).toList();
  } catch (e) {
    // Log lỗi để debug
    print('[Dashboard] Activities API error: $e');
  }

  return _DashboardData(stats: stats, activities: activities);
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.stats});
  final _Stats stats;

  @override
  Widget build(BuildContext context) {
    final items = <_StatItemData>[
      _StatItemData(
        'Tổng HĐ',
        stats.totalInvoices,
        Icons.receipt_long,
        Colors.blue,
      ),
      _StatItemData(
        'Chờ TT',
        stats.pendingInvoices,
        Icons.pending_actions,
        Colors.orange,
      ),
      _StatItemData(
        'Quá hạn',
        stats.overdueInvoices,
        Icons.warning_amber,
        Colors.red,
      ),
      _StatItemData(
        'TB chưa đọc',
        stats.unreadAnnouncements,
        Icons.notifications,
        Colors.teal,
      ),
      _StatItemData(
        'Sự kiện sắp tới',
        stats.upcomingEvents,
        Icons.event_available,
        Colors.green,
      ),
      _StatItemData(
        'Đặt tiện ích',
        stats.activeBookings,
        Icons.meeting_room,
        Colors.purple,
      ),
    ];
    return GridView.builder(
      padding: const EdgeInsets.only(bottom: 12),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 2.4,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemBuilder: (context, index) => _StatItem(item: items[index]),
    );
  }
}

class _StatItemData {
  _StatItemData(this.label, this.value, this.icon, this.color);
  final String label;
  final int value;
  final IconData icon;
  final Color color;
}

class _StatItem extends StatelessWidget {
  const _StatItem({required this.item});
  final _StatItemData item;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: item.color.withOpacity(0.15),
              child: Icon(item.icon, color: item.color),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  item.label,
                  style: const TextStyle(fontSize: 12, color: Colors.black54),
                ),
                Text(
                  '${item.value}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _RecentActivities extends StatelessWidget {
  const _RecentActivities({required this.activities});
  final List<_Activity> activities;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Hoạt động gần đây',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            if (activities.isEmpty) const Text('Không có hoạt động'),
            for (final a in activities.take(5))
              ListTile(
                dense: true,
                title: Text(a.title),
                subtitle: Text(a.description),
                trailing: Text(_shortTime(a.timestamp)),
              ),
          ],
        ),
      ),
    );
  }
}

String _shortTime(String iso) {
  try {
    final d = DateTime.parse(iso);
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}';
  } catch (_) {
    return '';
  }
}
