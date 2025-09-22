import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/dashboard_stats.dart';
import '../providers/dashboard_providers.dart';
import '../ui/dashboard_screen.dart';
import '../ui/widgets/stats_grid.dart';
import '../ui/widgets/activity_list.dart';
import '../ui/widgets/quick_actions.dart';

class DashboardDemo extends StatelessWidget {
  const DashboardDemo({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => DashboardProvider())],
      child: MaterialApp(
        title: 'Dashboard Demo',
        theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
        home: const DashboardDemoScreen(),
      ),
    );
  }
}

class DashboardDemoScreen extends StatefulWidget {
  const DashboardDemoScreen({Key? key}) : super(key: key);

  @override
  State<DashboardDemoScreen> createState() => _DashboardDemoScreenState();
}

class _DashboardDemoScreenState extends State<DashboardDemoScreen> {
  @override
  void initState() {
    super.initState();
    // Load demo data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadDemoData();
    });
  }

  void _loadDemoData() {
    // Demo data sẽ được load từ API thực tế
    // hoặc có thể tạo mock data trong repository
    final provider = context.read<DashboardProvider>();
    provider.loadDashboardData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Demo'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              _loadDemoData();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Dữ liệu đã được làm mới')),
              );
            },
          ),
        ],
      ),
      body: const DashboardScreen(),
    );
  }
}

// Demo cho các widgets riêng lẻ
class DashboardWidgetsDemo extends StatelessWidget {
  const DashboardWidgetsDemo({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard Widgets Demo')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Stats Grid Demo',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            StatsGrid(
              stats: const DashboardStats(
                totalInvoices: 5,
                pendingInvoices: 2,
                overdueInvoices: 1,
                totalAmount: 2500000,
                unreadAnnouncements: 3,
                upcomingEvents: 2,
                activeBookings: 1,
                supportRequests: 0,
              ),
              isLoading: false,
            ),
            const SizedBox(height: 32),
            const Text(
              'Activity List Demo',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ActivityList(
              activities: [
                const RecentActivity(
                  id: '1',
                  type: ActivityType.invoice,
                  title: 'Hóa đơn tháng 12/2024',
                  description: 'Hóa đơn dịch vụ căn hộ đã được tạo',
                  timestamp: '2024-12-20T10:30:00Z',
                  status: 'pending',
                ),
                const RecentActivity(
                  id: '2',
                  type: ActivityType.announcement,
                  title: 'Thông báo bảo trì thang máy',
                  description: 'Thang máy sẽ được bảo trì vào ngày 25/12',
                  timestamp: '2024-12-19T14:20:00Z',
                  status: 'active',
                ),
              ],
              isLoading: false,
              onViewAll: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Navigate to activity logs')),
                );
              },
              onActivityTap: (activity) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Tapped: ${activity.title}')),
                );
              },
            ),
            const SizedBox(height: 32),
            const Text(
              'Quick Actions Demo',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            QuickActions(
              onActionTap: (action) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Action tapped: $action')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
