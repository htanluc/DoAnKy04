import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../models/dashboard_stats.dart';
import '../providers/dashboard_riverpod_providers.dart';
import 'widgets/stats_grid.dart';
import 'widgets/compact_activity_list.dart';
import 'widgets/main_scaffold.dart';
import '../../announcements/data/announcements_api.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  int _currentBottomNavIndex = 0;
  int _unreadAnnouncementsCount = 0;
  final AnnouncementsApi _announcementsApi = AnnouncementsApi();

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _loadData();
    _loadUnreadAnnouncementsCount();
  }

  Future<void> _loadUnreadAnnouncementsCount() async {
    try {
      final announcements = await _announcementsApi.getAnnouncements();
      final unreadCount = announcements.where((a) => !a.read).length;
      if (mounted) {
        setState(() {
          _unreadAnnouncementsCount = unreadCount;
        });
      }
    } catch (e) {
      print('Error loading unread announcements count: $e');
    }
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );

    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(
          CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
        );

    _animationController.forward();
  }

  void _loadData() {
    // Data will be loaded by Riverpod provider
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      title: 'Bảng điều khiển',
      currentBottomNavIndex: _currentBottomNavIndex,
      onBottomNavTap: _onBottomNavTap,
      floatingActionButton: FloatingActionButton(
        onPressed: _onFloatingActionPressed,
        backgroundColor: const Color(0xFF3B82F6),
        foregroundColor: Colors.white,
        elevation: 4,
        child: const FaIcon(FontAwesomeIcons.plus, size: 20),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      body: Consumer(
        builder: (context, ref, child) {
          final dashboardData = ref.watch(dashboardDataProvider);

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(dashboardDataProvider);
            },
            child: _buildContent(dashboardData),
          );
        },
      ),
    );
  }

  Widget _buildContent(AsyncValue<Map<String, dynamic>> dashboardData) {
    return dashboardData.when(
      loading: () => _buildLoadingState(),
      error: (error, stack) => _buildErrorState(error.toString()),
      data: (data) {
        final stats = data['stats'] as DashboardStats;
        final activities = data['activities'] as List<RecentActivity>;
        final apartmentInfo = data['apartmentInfo'] as ApartmentInfo;

        return FadeTransition(
          opacity: _fadeAnimation,
          child: SlideTransition(
            position: _slideAnimation,
            child: _buildDashboardContent(stats, activities, apartmentInfo),
          ),
        );
      },
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 16),
          Text(
            'Đang tải dữ liệu...',
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(
              'Lỗi tải dữ liệu',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600], fontSize: 14),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                // Refresh will be handled by Riverpod
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Thử lại'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDashboardContent(
    DashboardStats stats,
    List<RecentActivity> activities,
    ApartmentInfo apartmentInfo,
  ) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(
        16,
        8,
        16,
        80,
      ), // Thêm padding bottom cho bottom nav
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Section với glass effect
          _buildWelcomeSection(apartmentInfo),
          const SizedBox(height: 24),

          // Stats Grid (ghi đè số thông báo chưa đọc nếu tự tính được)
          StatsGrid(
            stats: DashboardStats(
              totalInvoices: stats.totalInvoices,
              pendingInvoices: stats.pendingInvoices,
              overdueInvoices: stats.overdueInvoices,
              totalAmount: stats.totalAmount,
              unreadAnnouncements: _unreadAnnouncementsCount > 0
                  ? _unreadAnnouncementsCount
                  : stats.unreadAnnouncements,
              upcomingEvents: stats.upcomingEvents,
              activeBookings: stats.activeBookings,
              supportRequests: stats.supportRequests,
            ),
            isLoading: false,
          ),
          const SizedBox(height: 24),

          // Recent Activities (Compact version)
          CompactActivityList(
            activities: activities,
            isLoading: false,
            onViewAll: () => _navigateToActivityLogs(),
            onActivityTap: _handleActivityTap,
          ),
          const SizedBox(height: 24),

          // Apartment Info Card
          _buildApartmentInfoCard(apartmentInfo),
        ],
      ),
    );
  }

  Widget _buildWelcomeSection(ApartmentInfo apartmentInfo) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF3B82F6), // Blue
            Color(0xFF8B5CF6), // Purple
            Color(0xFF06B6D4), // Cyan
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF3B82F6).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            colors: [
              Colors.white.withOpacity(0.1),
              Colors.white.withOpacity(0.05),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.auto_awesome,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Chào mừng trở lại! 👋',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                'Căn hộ ${apartmentInfo.apartmentNumber ?? 'N/A'} - ${apartmentInfo.buildingName ?? 'N/A'}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 12,
                runSpacing: 8,
                children: [
                  _buildInfoChip(
                    icon: Icons.location_on,
                    text: 'Tầng ${apartmentInfo.floor ?? 'N/A'}',
                  ),
                  _buildInfoChip(
                    icon: Icons.square_foot,
                    text: '${apartmentInfo.area ?? 'N/A'}m²',
                  ),
                  _buildInfoChip(
                    icon: Icons.bed,
                    text: '${apartmentInfo.bedrooms ?? 'N/A'} phòng ngủ',
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip({required IconData icon, required String text}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.25),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.3), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 16),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildApartmentInfoCard(ApartmentInfo apartmentInfo) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFF8FAFC), Color(0xFFF1F5F9)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.home,
                    color: Color(0xFF3B82F6),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Thông tin căn hộ',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildInfoRow('Số căn hộ', apartmentInfo.apartmentNumber ?? 'N/A'),
            _buildInfoRow('Tòa nhà', apartmentInfo.buildingName ?? 'N/A'),
            _buildInfoRow('Diện tích', '${apartmentInfo.area ?? 'N/A'}m²'),
            _buildInfoRow('Phòng ngủ', '${apartmentInfo.bedrooms ?? 'N/A'}'),
            _buildInfoRow('Tầng', '${apartmentInfo.floor ?? 'N/A'}'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.5),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0xFFE2E8F0).withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: Color(0xFF1E293B),
            ),
          ),
        ],
      ),
    );
  }

  void _handleActivityTap(RecentActivity activity) {
    // Navigate to specific activity detail based on type
    switch (activity.type) {
      case ActivityType.invoice:
        Navigator.pushNamed(context, '/invoices');
        break;
      case ActivityType.announcement:
        Navigator.pushNamed(context, '/announcements');
        break;
      case ActivityType.event:
        Navigator.pushNamed(context, '/events');
        break;
      case ActivityType.booking:
      case ActivityType.facilityBooking:
        Navigator.pushNamed(context, '/facility-bookings');
        break;
      case ActivityType.payment:
        Navigator.pushNamed(context, '/invoices');
        break;
      case ActivityType.login:
        // No navigation for login activities
        break;
    }
  }

  void _navigateToActivityLogs() {
    Navigator.pushNamed(context, '/activity-logs');
  }

  void _onBottomNavTap(int index) {
    setState(() {
      _currentBottomNavIndex = index;
    });

    switch (index) {
      case 0:
        // Dashboard - đã ở trang chủ
        break;
      case 1:
        Navigator.pushNamed(context, '/invoices');
        break;
      case 2:
        Navigator.pushNamed(context, '/events');
        break;
      case 3:
        Navigator.pushNamed(context, '/facility-bookings');
        break;
      case 4:
        Navigator.pushNamed(context, '/vehicles');
        break;
    }
  }

  void _onFloatingActionPressed() {
    // Show action sheet với các tùy chọn nhanh
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Thao tác nhanh',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            _buildQuickActionItem(
              icon: Icons.receipt,
              title: 'Thanh toán hóa đơn',
              subtitle: 'Thanh toán hóa đơn nhanh',
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/invoices');
              },
            ),
            _buildQuickActionItem(
              icon: Icons.business,
              title: 'Đặt tiện ích',
              subtitle: 'Đặt phòng gym, hồ bơi...',
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/facility-bookings');
              },
            ),
            _buildQuickActionItem(
              icon: Icons.build,
              title: 'Yêu cầu dịch vụ',
              subtitle: 'Báo sửa chữa, vệ sinh...',
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/service-requests');
              },
            ),
            _buildQuickActionItem(
              icon: Icons.directions_car,
              title: 'Đăng ký xe',
              subtitle: 'Thêm xe mới vào hệ thống',
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/vehicles');
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFF3B82F6).withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: const Color(0xFF3B82F6)),
      ),
      title: Text(title),
      subtitle: Text(subtitle),
      onTap: onTap,
    );
  }
}

// Widget cho loading skeleton
class DashboardSkeleton extends StatelessWidget {
  const DashboardSkeleton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome section skeleton
          Container(
            height: 120,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(20),
            ),
          ),
          const SizedBox(height: 24),
          // Stats grid skeleton
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.5,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: List.generate(
              4,
              (index) => Container(
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          // Quick actions skeleton
          Container(
            height: 120,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          const SizedBox(height: 24),
          // Activities skeleton
          Row(
            children: [
              Expanded(
                flex: 2,
                child: Container(
                  height: 200,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 1,
                child: Container(
                  height: 200,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
