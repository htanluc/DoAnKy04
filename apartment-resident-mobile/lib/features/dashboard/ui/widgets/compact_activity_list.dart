import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../models/dashboard_stats.dart';

class CompactActivityList extends StatelessWidget {
  final List<RecentActivity> activities;
  final bool isLoading;
  final VoidCallback? onViewAll;
  final Function(RecentActivity)? onActivityTap;

  const CompactActivityList({
    Key? key,
    required this.activities,
    this.isLoading = false,
    this.onViewAll,
    this.onActivityTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
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
        padding: const EdgeInsets.all(16),
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
                  child: const FaIcon(
                    FontAwesomeIcons.clock,
                    color: Color(0xFF3B82F6),
                    size: 16,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Hoạt động gần đây',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const Spacer(),
                if (onViewAll != null)
                  TextButton(
                    onPressed: onViewAll,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text(
                      'Xem tất cả',
                      style: TextStyle(
                        color: Color(0xFF3B82F6),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (isLoading)
              _buildLoadingSkeleton()
            else if (activities.isEmpty)
              _buildEmptyState()
            else
              _buildActivitiesList(),
          ],
        ),
      ),
    );
  }

  Widget _buildActivitiesList() {
    // Chỉ hiển thị 3 hoạt động gần nhất
    final displayActivities = activities.take(3).toList();

    return Column(
      children: displayActivities.map((activity) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildActivityItem(activity),
        );
      }).toList(),
    );
  }

  Widget _buildActivityItem(RecentActivity activity) {
    return GestureDetector(
      onTap: () => onActivityTap?.call(activity),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: _getActivityIconColor(activity.type).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: FaIcon(
                _getActivityIcon(activity.type),
                color: _getActivityIconColor(activity.type),
                size: 16,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    activity.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      color: Color(0xFF1E293B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _formatTime(activity.timestamp),
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            if (activity.status != null) _buildStatusBadge(activity.status!),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingSkeleton() {
    return Column(children: List.generate(3, (index) => _buildSkeletonItem()));
  }

  Widget _buildSkeletonItem() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    height: 12,
                    color: Colors.grey[300],
                    margin: const EdgeInsets.only(bottom: 4),
                  ),
                  Container(width: 80, height: 10, color: Colors.grey[300]),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            FaIcon(FontAwesomeIcons.clock, size: 32, color: Colors.grey[400]),
            const SizedBox(height: 8),
            Text(
              'Chưa có hoạt động nào',
              style: TextStyle(color: Colors.grey[600], fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    Color textColor;
    String text;

    switch (status.toLowerCase()) {
      case 'pending':
        bgColor = Colors.yellow[100]!;
        textColor = Colors.yellow[800]!;
        text = 'Chờ';
        break;
      case 'completed':
        bgColor = Colors.green[100]!;
        textColor = Colors.green[800]!;
        text = 'Xong';
        break;
      case 'overdue':
        bgColor = Colors.red[100]!;
        textColor = Colors.red[800]!;
        text = 'Quá hạn';
        break;
      case 'active':
        bgColor = Colors.blue[100]!;
        textColor = Colors.blue[800]!;
        text = 'Hoạt động';
        break;
      default:
        bgColor = Colors.grey[100]!;
        textColor = Colors.grey[800]!;
        text = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: textColor,
          fontSize: 10,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  IconData _getActivityIcon(ActivityType type) {
    switch (type) {
      case ActivityType.invoice:
        return FontAwesomeIcons.receipt;
      case ActivityType.announcement:
        return FontAwesomeIcons.bell;
      case ActivityType.event:
        return FontAwesomeIcons.calendarAlt;
      case ActivityType.booking:
        return FontAwesomeIcons.building;
      case ActivityType.payment:
        return FontAwesomeIcons.dollarSign;
      case ActivityType.login:
        return FontAwesomeIcons.user;
      case ActivityType.facilityBooking:
        return FontAwesomeIcons.coffee;
    }
  }

  Color _getActivityIconColor(ActivityType type) {
    switch (type) {
      case ActivityType.invoice:
        return const Color(0xFF3B82F6);
      case ActivityType.announcement:
        return const Color(0xFF8B5CF6);
      case ActivityType.event:
        return const Color(0xFF10B981);
      case ActivityType.booking:
        return const Color(0xFFF59E0B);
      case ActivityType.payment:
        return const Color(0xFF06B6D4);
      case ActivityType.login:
        return const Color(0xFF64748B);
      case ActivityType.facilityBooking:
        return const Color(0xFFEF4444);
    }
  }

  String _formatTime(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inMinutes < 1) {
        return 'Vừa xong';
      } else if (difference.inMinutes < 60) {
        return '${difference.inMinutes} phút trước';
      } else if (difference.inHours < 24) {
        return '${difference.inHours} giờ trước';
      } else if (difference.inDays < 7) {
        return '${difference.inDays} ngày trước';
      } else {
        return '${date.day}/${date.month}';
      }
    } catch (e) {
      return 'Không xác định';
    }
  }
}
