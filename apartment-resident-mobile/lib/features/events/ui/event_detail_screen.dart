import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/event.dart';
import '../providers/events_providers.dart';

class EventDetailScreen extends ConsumerWidget {
  final Event event;

  const EventDetailScreen({super.key, required this.event});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = event.status;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết sự kiện'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () => _shareEvent(context),
            tooltip: 'Chia sẻ',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(context, status),
            const SizedBox(height: 24),
            _buildEventInfo(context),
            const SizedBox(height: 24),
            _buildDescription(context),
            const SizedBox(height: 24),
            _buildParticipants(context),
            const SizedBox(height: 24),
            _buildActionButton(context, ref),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, EventStatus status) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(status.icon, style: const TextStyle(fontSize: 16)),
                      const SizedBox(width: 6),
                      Text(
                        status.displayName,
                        style: TextStyle(
                          color: _getStatusColor(status),
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                if (event.registered)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.check_circle, size: 18, color: Colors.green),
                        SizedBox(width: 6),
                        Text(
                          'Đã đăng ký',
                          style: TextStyle(
                            color: Colors.green,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              event.title,
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Được tạo lúc ${DateFormat('dd/MM/yyyy HH:mm').format(event.createdAt)}',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEventInfo(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Thông tin sự kiện',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildInfoRow(
              icon: Icons.schedule,
              label: 'Thời gian bắt đầu',
              value: DateFormat('dd/MM/yyyy HH:mm').format(event.startTime),
            ),
            const SizedBox(height: 12),
            _buildInfoRow(
              icon: Icons.schedule_outlined,
              label: 'Thời gian kết thúc',
              value: DateFormat('dd/MM/yyyy HH:mm').format(event.endTime),
            ),
            const SizedBox(height: 12),
            _buildInfoRow(
              icon: Icons.location_on,
              label: 'Địa điểm',
              value: event.location,
            ),
            const SizedBox(height: 12),
            _buildInfoRow(
              icon: Icons.people,
              label: 'Số người tham gia',
              value: '${event.participantCount} người',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDescription(BuildContext context) {
    if (event.description.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Mô tả',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(
              event.description,
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(height: 1.5),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildParticipants(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.people, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Text(
                  'Người tham gia',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(Icons.person, color: Colors.grey[600]),
                  const SizedBox(width: 12),
                  Text(
                    '${event.participantCount} người đã đăng ký',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, WidgetRef ref) {
    // Show completed event message
    if (event.isCompleted) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Icon(Icons.event_available, size: 48, color: Colors.grey[400]),
              const SizedBox(height: 12),
              Text(
                'Sự kiện đã kết thúc',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(color: Colors.grey[600]),
              ),
              const SizedBox(height: 8),
              Text(
                'Sự kiện này đã kết thúc và không thể đăng ký',
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: Colors.grey[500]),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    // Show QR Code section for registered users
    if (event.registered && event.qrCode != null) {
      return Column(
        children: [
          // QR Code Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Icon(Icons.qr_code, size: 48, color: Colors.blue),
                  const SizedBox(height: 12),
                  Text(
                    'Mã QR Check-in',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    event.isQrCodeValid
                        ? 'QR code có hiệu lực cho check-in'
                        : 'QR code đã hết hạn',
                    style: TextStyle(
                      color: event.isQrCodeValid ? Colors.green : Colors.red,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  if (event.qrCodeExpiresAt != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Hết hạn: ${DateFormat('dd/MM/yyyy HH:mm').format(event.qrCodeExpiresAt!)}',
                      style: TextStyle(color: Colors.grey[600], fontSize: 12),
                    ),
                  ],
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () {
                      _showQrCodeDialog(context);
                    },
                    icon: const Icon(Icons.visibility),
                    label: const Text('Xem QR Code'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Check-in status
          if (event.checkedIn == true)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green, size: 32),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Đã check-in',
                            style: TextStyle(
                              color: Colors.green,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            event.checkedInAt != null
                                ? 'Lúc ${DateFormat('HH:mm dd/MM/yyyy').format(event.checkedInAt!)}'
                                : 'Thời gian không xác định',
                            style: TextStyle(
                              color: Colors.green[700],
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          if (event.checkedIn == true) const SizedBox(height: 16),
          // Action buttons
          _buildActionButtons(context, ref),
        ],
      );
    }

    // Show action buttons based on event status and registration status
    return SizedBox(
      width: double.infinity,
      child: event.registered
          ? // User has registered
            event.isUpcoming
                ? OutlinedButton.icon(
                    onPressed: () => _showCancelDialog(context, ref),
                    icon: const Icon(Icons.cancel),
                    label: const Text('Hủy đăng ký'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  )
                : event.isOngoing
                ? FilledButton.icon(
                    onPressed: () => _manualCheckIn(context, ref),
                    icon: const Icon(Icons.qr_code_scanner),
                    label: const Text('Check-in ngay'),
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.blue,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  )
                : const SizedBox.shrink()
          : // User hasn't registered
            event.isUpcoming
          ? FilledButton.icon(
              onPressed: () => _registerEvent(context, ref),
              icon: const Icon(Icons.add),
              label: const Text('Đăng ký tham gia'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            )
          : event.isOngoing
          ? Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.event, color: Colors.orange, size: 24),
                  const SizedBox(width: 12),
                  Text(
                    'Sự kiện đang diễn ra',
                    style: TextStyle(
                      color: Colors.orange,
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            )
          : const SizedBox.shrink(),
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

  void _shareEvent(BuildContext context) {
    // In a real app, you would use the share_plus package here
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tính năng chia sẻ sẽ được thêm vào trong phiên bản sau'),
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, WidgetRef ref) {
    // This method is now simplified since main logic is in _buildActionButton
    return const SizedBox.shrink();
  }

  void _showQrCodeDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'QR Code Check-in',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: Center(
                  child: Text(
                    event.qrCode ?? 'QR Code không có sẵn',
                    style: const TextStyle(
                      fontSize: 10,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Quét mã QR này để check-in',
                style: TextStyle(color: Colors.grey[600], fontSize: 14),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Đóng'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () {
                        // TODO: Implement share QR code
                        Navigator.of(context).pop();
                      },
                      icon: const Icon(Icons.share),
                      label: const Text('Chia sẻ'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _manualCheckIn(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Check-in thủ công'),
        content: const Text('Bạn có chắc chắn muốn check-in sự kiện này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(context).pop();
              ref.read(eventsProvider.notifier).manualCheckIn(event.id);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Check-in thành công!')),
              );
            },
            child: const Text('Check-in'),
          ),
        ],
      ),
    );
  }

  void _registerEvent(BuildContext context, WidgetRef ref) {
    ref.read(eventsProvider.notifier).registerEvent(event.id);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đăng ký sự kiện thành công!')),
    );
  }

  void _showCancelDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hủy đăng ký'),
        content: const Text('Bạn có chắc chắn muốn hủy đăng ký sự kiện này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              ref.read(eventsProvider.notifier).cancelRegistration(event.id);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Hủy đăng ký thành công!')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
  }
}
