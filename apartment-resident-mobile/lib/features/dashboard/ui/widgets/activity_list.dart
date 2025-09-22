import 'package:flutter/material.dart';
import '../../models/dashboard_stats.dart';

class ActivityList extends StatelessWidget {
  final List<RecentActivity> activities;
  final bool isLoading;
  final VoidCallback? onViewAll;
  final Function(RecentActivity)? onActivityTap;

  const ActivityList({
    Key? key,
    required this.activities,
    this.isLoading = false,
    this.onViewAll,
    this.onActivityTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.timeline,
                      color: Theme.of(context).primaryColor,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Hoạt động gần đây',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                if (onViewAll != null)
                  TextButton(
                    onPressed: onViewAll,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Xem tất cả',
                          style: TextStyle(
                            color: Theme.of(context).primaryColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(
                          Icons.arrow_forward_ios,
                          size: 12,
                          color: Theme.of(context).primaryColor,
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (isLoading)
              _buildLoadingList()
            else if (activities.isEmpty)
              _buildEmptyState()
            else
              _buildActivitiesList(),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingList() {
    return Column(
      children: List.generate(
        3,
        (index) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 16,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 12,
                      width: 200,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          Icon(Icons.timeline, size: 48, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'Chưa có hoạt động nào',
            style: TextStyle(color: Colors.grey[600], fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildActivitiesList() {
    return Column(
      children: activities.take(5).map((activity) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildActivityItem(activity),
        );
      }).toList(),
    );
  }

  Widget _buildActivityItem(RecentActivity activity) {
    return InkWell(
      onTap: () => onActivityTap?.call(activity),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: _getActivityColor(activity.type).withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                _getActivityIcon(activity.type),
                color: _getActivityColor(activity.type),
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
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    activity.description,
                    style: TextStyle(color: Colors.grey[600], fontSize: 12),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        _formatTime(activity.timestamp),
                        style: TextStyle(color: Colors.grey[500], fontSize: 11),
                      ),
                      if (activity.status != null) ...[
                        const SizedBox(width: 8),
                        _buildStatusBadge(activity.status!),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String text;

    switch (status.toLowerCase()) {
      case 'pending':
        color = const Color(0xFFF59E0B);
        text = 'Chờ xử lý';
        break;
      case 'completed':
        color = const Color(0xFF10B981);
        text = 'Hoàn thành';
        break;
      case 'overdue':
        color = const Color(0xFFEF4444);
        text = 'Quá hạn';
        break;
      case 'active':
        color = const Color(0xFF3B82F6);
        text = 'Đang hoạt động';
        break;
      default:
        color = Colors.grey;
        text = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  IconData _getActivityIcon(ActivityType type) {
    switch (type) {
      case ActivityType.invoice:
        return Icons.receipt;
      case ActivityType.announcement:
        return Icons.notifications;
      case ActivityType.event:
        return Icons.event;
      case ActivityType.booking:
        return Icons.business;
      case ActivityType.payment:
        return Icons.payment;
      case ActivityType.login:
        return Icons.login;
      case ActivityType.facilityBooking:
        return Icons.coffee;
    }
  }

  Color _getActivityColor(ActivityType type) {
    switch (type) {
      case ActivityType.invoice:
        return const Color(0xFF3B82F6);
      case ActivityType.announcement:
        return const Color(0xFF10B981);
      case ActivityType.event:
        return const Color(0xFFF59E0B);
      case ActivityType.booking:
        return const Color(0xFF8B5CF6);
      case ActivityType.payment:
        return const Color(0xFF06B6D4);
      case ActivityType.login:
        return const Color(0xFF6B7280);
      case ActivityType.facilityBooking:
        return const Color(0xFFEF4444);
    }
  }

  String _formatTime(String timestamp) {
    try {
      final date = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inMinutes < 1) {
        return 'Vừa xong';
      } else if (difference.inHours < 1) {
        return '${difference.inMinutes} phút trước';
      } else if (difference.inDays < 1) {
        return '${difference.inHours} giờ trước';
      } else {
        return '${date.day}/${date.month}/${date.year}';
      }
    } catch (e) {
      return timestamp;
    }
  }
}

// Widget cho activity item đơn lẻ
class ActivityItem extends StatelessWidget {
  final RecentActivity activity;
  final VoidCallback? onTap;

  const ActivityItem({Key? key, required this.activity, this.onTap})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _getActivityColor(activity.type).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                _getActivityIcon(activity.type),
                color: _getActivityColor(activity.type),
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    activity.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    activity.description,
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        _formatTime(activity.timestamp),
                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                      ),
                      if (activity.status != null) ...[
                        const SizedBox(width: 12),
                        _buildStatusBadge(activity.status!),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getActivityIcon(ActivityType type) {
    switch (type) {
      case ActivityType.invoice:
        return Icons.receipt;
      case ActivityType.announcement:
        return Icons.notifications;
      case ActivityType.event:
        return Icons.event;
      case ActivityType.booking:
        return Icons.business;
      case ActivityType.payment:
        return Icons.payment;
      case ActivityType.login:
        return Icons.login;
      case ActivityType.facilityBooking:
        return Icons.coffee;
    }
  }

  Color _getActivityColor(ActivityType type) {
    switch (type) {
      case ActivityType.invoice:
        return const Color(0xFF3B82F6);
      case ActivityType.announcement:
        return const Color(0xFF10B981);
      case ActivityType.event:
        return const Color(0xFFF59E0B);
      case ActivityType.booking:
        return const Color(0xFF8B5CF6);
      case ActivityType.payment:
        return const Color(0xFF06B6D4);
      case ActivityType.login:
        return const Color(0xFF6B7280);
      case ActivityType.facilityBooking:
        return const Color(0xFFEF4444);
    }
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String text;

    switch (status.toLowerCase()) {
      case 'pending':
        color = const Color(0xFFF59E0B);
        text = 'Chờ xử lý';
        break;
      case 'completed':
        color = const Color(0xFF10B981);
        text = 'Hoàn thành';
        break;
      case 'overdue':
        color = const Color(0xFFEF4444);
        text = 'Quá hạn';
        break;
      case 'active':
        color = const Color(0xFF3B82F6);
        text = 'Đang hoạt động';
        break;
      default:
        color = Colors.grey;
        text = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _formatTime(String timestamp) {
    try {
      final date = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inMinutes < 1) {
        return 'Vừa xong';
      } else if (difference.inHours < 1) {
        return '${difference.inMinutes} phút trước';
      } else if (difference.inDays < 1) {
        return '${difference.inHours} giờ trước';
      } else {
        return '${date.day}/${date.month}/${date.year}';
      }
    } catch (e) {
      return timestamp;
    }
  }
}
