import 'package:flutter/material.dart';
import '../../models/event.dart';

class EventStatusBadge extends StatelessWidget {
  final EventStatus status;
  final bool showIcon;
  final double? fontSize;

  const EventStatusBadge({
    super.key,
    required this.status,
    this.showIcon = true,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getStatusColor(status).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Text(status.icon, style: const TextStyle(fontSize: 12)),
            const SizedBox(width: 4),
          ],
          Text(
            status.displayName,
            style: TextStyle(
              color: _getStatusColor(status),
              fontSize: fontSize ?? 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(EventStatus status) {
    switch (status) {
      case EventStatus.upcoming:
        return Colors.blue;
      case EventStatus.ongoing:
        return Colors.orange;
      case EventStatus.completed:
        return Colors.grey;
    }
  }
}

class EventTypeBadge extends StatelessWidget {
  final String type;
  final bool showIcon;
  final double? fontSize;

  const EventTypeBadge({
    super.key,
    required this.type,
    this.showIcon = true,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getTypeColor(type).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(
              _getTypeIcon(type),
              size: fontSize ?? 12,
              color: _getTypeColor(type),
            ),
            const SizedBox(width: 4),
          ],
          Text(
            _getTypeDisplayName(type),
            style: TextStyle(
              color: _getTypeColor(type),
              fontSize: fontSize ?? 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Color _getTypeColor(String type) {
    switch (type.toLowerCase()) {
      case 'meeting':
        return Colors.blue;
      case 'party':
        return Colors.purple;
      case 'workshop':
        return Colors.green;
      case 'seminar':
        return Colors.orange;
      case 'celebration':
        return Colors.pink;
      default:
        return Colors.grey;
    }
  }

  IconData _getTypeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'meeting':
        return Icons.meeting_room;
      case 'party':
        return Icons.celebration;
      case 'workshop':
        return Icons.build;
      case 'seminar':
        return Icons.school;
      case 'celebration':
        return Icons.cake;
      default:
        return Icons.event;
    }
  }

  String _getTypeDisplayName(String type) {
    switch (type.toLowerCase()) {
      case 'meeting':
        return 'Họp mặt';
      case 'party':
        return 'Tiệc';
      case 'workshop':
        return 'Workshop';
      case 'seminar':
        return 'Hội thảo';
      case 'celebration':
        return 'Lễ kỷ niệm';
      default:
        return type;
    }
  }
}

class RegistrationStatusBadge extends StatelessWidget {
  final bool isRegistered;
  final double? fontSize;

  const RegistrationStatusBadge({
    super.key,
    required this.isRegistered,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isRegistered
            ? Colors.green.withOpacity(0.1)
            : Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isRegistered ? Icons.check_circle : Icons.circle_outlined,
            size: fontSize ?? 12,
            color: isRegistered ? Colors.green : Colors.grey,
          ),
          const SizedBox(width: 4),
          Text(
            isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký',
            style: TextStyle(
              color: isRegistered ? Colors.green : Colors.grey,
              fontSize: fontSize ?? 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
