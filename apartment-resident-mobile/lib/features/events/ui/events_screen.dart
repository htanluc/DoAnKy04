import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../models/event.dart';
import '../providers/events_providers.dart';
import '../data/events_repository.dart';
import 'event_detail_screen.dart';

class EventsScreen extends ConsumerStatefulWidget {
  const EventsScreen({super.key});

  @override
  ConsumerState<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends ConsumerState<EventsScreen> {
  final RefreshController _refreshController = RefreshController();
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(eventsProvider.notifier).loadEvents();
    });
  }

  @override
  void dispose() {
    _refreshController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(eventsProvider);
    final stats = ref.watch(eventsStatsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sự kiện'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => _showSearchDialog(),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildStatsHeader(stats),
          _buildFilterChips(state),
          Expanded(child: _buildEventsList(state)),
        ],
      ),
    );
  }

  Widget _buildStatsHeader(EventsStats stats) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          _buildStatItem(
            'Tổng sự kiện',
            stats.totalEvents.toString(),
            Icons.event,
            Colors.blue,
          ),
          _buildStatItem(
            'Đã đăng ký',
            stats.registeredCount.toString(),
            Icons.check_circle,
            Colors.green,
          ),
          _buildStatItem(
            'Sắp diễn ra',
            stats.upcomingCount.toString(),
            Icons.schedule,
            Colors.orange,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildFilterChips(EventsState state) {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildFilterChip('Tất cả', null, state.selectedStatus == null),
          const SizedBox(width: 8),
          ...EventStatus.values.map(
            (status) => Padding(
              padding: const EdgeInsets.only(right: 8),
              child: _buildFilterChip(
                status.displayName,
                status,
                state.selectedStatus == status,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, EventStatus? status, bool isSelected) {
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => _onFilterChanged(status),
      selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
      checkmarkColor: Theme.of(context).primaryColor,
    );
  }

  Widget _buildEventsList(EventsState state) {
    if (state.isLoading && state.events.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'Lỗi tải dữ liệu',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              state.error!,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref
                  .read(eventsProvider.notifier)
                  .loadEvents(forceRefresh: true),
              child: const Text('Thử lại'),
            ),
          ],
        ),
      );
    }

    if (state.filteredEvents.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              state.searchQuery != null
                  ? 'Không tìm thấy sự kiện'
                  : 'Chưa có sự kiện',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              state.searchQuery != null
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Các sự kiện mới sẽ hiển thị ở đây',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return SmartRefresher(
      controller: _refreshController,
      onRefresh: () async {
        await ref.read(eventsProvider.notifier).loadEvents(forceRefresh: true);
        _refreshController.refreshCompleted();
      },
      child: ListView.builder(
        itemCount: state.filteredEvents.length,
        itemBuilder: (context, index) {
          final event = state.filteredEvents[index];
          return _buildEventCard(event);
        },
      ),
    );
  }

  Widget _buildEventCard(Event event) {
    final status = event.status;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(status.icon, style: const TextStyle(fontSize: 12)),
                      const SizedBox(width: 4),
                      Text(
                        status.displayName,
                        style: TextStyle(
                          color: _getStatusColor(status),
                          fontSize: 12,
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
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.check_circle, size: 16, color: Colors.green),
                        SizedBox(width: 4),
                        Text(
                          'Đã đăng ký',
                          style: TextStyle(
                            color: Colors.green,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              event.title,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            if (event.description.isNotEmpty) ...[
              Text(
                event.description,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
            ],
            Row(
              children: [
                Icon(Icons.schedule, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(
                  '${DateFormat('dd/MM/yyyy HH:mm').format(event.startTime)} - ${DateFormat('HH:mm').format(event.endTime)}',
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    event.location,
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ),
              ],
            ),
            if (event.participantCount > 0) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.people, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    '${event.participantCount} người tham gia',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 16),
            // Action buttons based on event status
            if (event.registered) ...[
              // User has registered - show check-in status or cancel button
              if (event.checkedIn == true)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle, color: Colors.green, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Đã check-in lúc ${event.checkedInAt != null ? DateFormat('HH:mm dd/MM').format(event.checkedInAt!) : 'N/A'}',
                        style: TextStyle(
                          color: Colors.green,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                )
              else if (event.isOngoing)
                FilledButton.icon(
                  onPressed: () => _manualCheckIn(event.id),
                  icon: const Icon(Icons.qr_code_scanner),
                  label: const Text('Check-in ngay'),
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.blue,
                    minimumSize: const Size(double.infinity, 48),
                  ),
                )
              else if (event.isUpcoming)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.qr_code, color: Colors.blue, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'QR code đã sẵn sàng cho check-in',
                        style: TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 8),
              // Cancel registration button (only for upcoming events)
              if (event.isUpcoming)
                OutlinedButton.icon(
                  onPressed: () => _cancelRegistration(event.id),
                  icon: const Icon(Icons.cancel),
                  label: const Text('Hủy đăng ký'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    minimumSize: const Size(double.infinity, 48),
                  ),
                ),
            ] else ...[
              // User hasn't registered - show registration button based on status
              if (event.isUpcoming)
                event.canStillRegister
                    ? FilledButton.icon(
                        onPressed: () => _registerEvent(event.id),
                        icon: const Icon(Icons.add),
                        label: const Text('Đăng ký tham gia'),
                        style: FilledButton.styleFrom(
                          minimumSize: const Size(double.infinity, 48),
                        ),
                      )
                    : Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: Colors.red.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.access_time,
                              color: Colors.red,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Hết hạn đăng ký',
                              style: TextStyle(
                                color: Colors.red,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      )
              else if (event.isOngoing)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.orange.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.event, color: Colors.orange, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Sự kiện đang diễn ra',
                        style: TextStyle(
                          color: Colors.orange,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                )
              else if (event.isCompleted)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.event_busy, color: Colors.grey, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Sự kiện đã kết thúc',
                        style: TextStyle(
                          color: Colors.grey,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
            const SizedBox(height: 12),
            // Action buttons row
            Row(
              children: [
                // View details button
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _onEventTap(event),
                    icon: const Icon(Icons.visibility),
                    label: const Text('Xem chi tiết'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 40),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // View QR code button (only for registered users)
                if (event.registered && event.qrCode != null)
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () => _showQrCodeDialog(context, event),
                      icon: const Icon(Icons.qr_code),
                      label: const Text('Xem QR'),
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.blue,
                        minimumSize: const Size(0, 40),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
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

  void _onFilterChanged(EventStatus? status) {
    ref.read(eventsProvider.notifier).filterByStatus(status);
  }

  void _onEventTap(Event event) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => EventDetailScreen(event: event)),
    );
  }

  void _registerEvent(String eventId) {
    ref.read(eventsProvider.notifier).registerEvent(eventId);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đăng ký sự kiện thành công!')),
    );
  }

  void _cancelRegistration(String eventId) {
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
              ref.read(eventsProvider.notifier).cancelRegistration(eventId);
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

  void _manualCheckIn(String eventId) {
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
              ref.read(eventsProvider.notifier).manualCheckIn(eventId);
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

  void _showSearchDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tìm kiếm sự kiện'),
        content: TextField(
          controller: _searchController,
          decoration: const InputDecoration(
            hintText: 'Nhập từ khóa tìm kiếm...',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              ref
                  .read(eventsProvider.notifier)
                  .searchEvents(_searchController.text);
              Navigator.of(context).pop();
            },
            child: const Text('Tìm kiếm'),
          ),
        ],
      ),
    );
  }

  void _shareQrCode(Event event) {
    if (event.qrCode == null) return;

    final shareText =
        '''
🎫 QR Code Check-in cho sự kiện: ${event.title}

📍 Địa điểm: ${event.location}
📅 Thời gian: ${DateFormat('dd/MM/yyyy HH:mm').format(event.startTime)} - ${DateFormat('HH:mm').format(event.endTime)}
⏰ Hết hạn QR: ${event.qrCodeExpiresAt != null ? DateFormat('dd/MM/yyyy HH:mm').format(event.qrCodeExpiresAt!) : 'Không xác định'}

🔗 Mã QR: ${event.qrCode}

Quét mã QR này để check-in vào sự kiện!
''';

    Share.share(shareText, subject: 'QR Code Check-in - ${event.title}');
  }

  void _showQrCodeDialog(BuildContext context, Event event) {
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
                child: event.isQrCodeValid && event.qrCode != null
                    ? Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: QrImageView(
                          data: event.qrCode!,
                          version: QrVersions.auto,
                          size: 168.0,
                          backgroundColor: Colors.white,
                          dataModuleStyle: const QrDataModuleStyle(
                            dataModuleShape: QrDataModuleShape.square,
                            color: Colors.black,
                          ),
                          eyeStyle: const QrEyeStyle(
                            eyeShape: QrEyeShape.square,
                            color: Colors.black,
                          ),
                        ),
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.warning_amber_rounded,
                            color: Colors.red,
                            size: 40,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            event.qrCode == null
                                ? 'QR code chưa được tạo'
                                : 'QR code đã hết hạn',
                            style: TextStyle(
                              color: Colors.red,
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
              ),
              const SizedBox(height: 20),
              Text(
                event.isQrCodeValid && event.qrCode != null
                    ? 'Quét mã QR này để check-in vào sự kiện'
                    : 'QR code không thể sử dụng để check-in',
                style: TextStyle(
                  color: event.isQrCodeValid && event.qrCode != null
                      ? Colors.grey[600]
                      : Colors.red[600],
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
              if (event.qrCodeExpiresAt != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Hết hạn: ${DateFormat('dd/MM/yyyy HH:mm').format(event.qrCodeExpiresAt!)}',
                  style: TextStyle(
                    color: event.isQrCodeValid && event.qrCode != null
                        ? Colors.grey[600]
                        : Colors.red[600],
                    fontSize: 12,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
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
                      onPressed: event.isQrCodeValid && event.qrCode != null
                          ? () => _shareQrCode(event)
                          : null,
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
}
