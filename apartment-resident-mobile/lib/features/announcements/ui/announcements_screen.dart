import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import '../models/announcement.dart';
import '../providers/announcements_providers.dart';

class AnnouncementsScreen extends ConsumerStatefulWidget {
  const AnnouncementsScreen({super.key});

  @override
  ConsumerState<AnnouncementsScreen> createState() =>
      _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends ConsumerState<AnnouncementsScreen> {
  final RefreshController _refreshController = RefreshController();
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(announcementsProvider.notifier).loadAnnouncements();
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
    final state = ref.watch(announcementsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Thông báo'),
        actions: [
          if (state.announcements.any((a) => !a.read))
            IconButton(
              icon: const Icon(Icons.mark_email_read),
              onPressed: () => _markAllAsRead(),
              tooltip: 'Đánh dấu tất cả đã đọc',
            ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => _showSearchDialog(),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterChips(state),
          Expanded(child: _buildAnnouncementsList(state)),
        ],
      ),
    );
  }

  Widget _buildFilterChips(AnnouncementsState state) {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildFilterChip('Tất cả', null, state.selectedType == null),
          const SizedBox(width: 8),
          ...AnnouncementType.values.map(
            (type) => Padding(
              padding: const EdgeInsets.only(right: 8),
              child: _buildFilterChip(
                type.displayName,
                type,
                state.selectedType == type,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(
    String label,
    AnnouncementType? type,
    bool isSelected,
  ) {
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => _onFilterChanged(type),
      selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
      checkmarkColor: Theme.of(context).primaryColor,
    );
  }

  Widget _buildAnnouncementsList(AnnouncementsState state) {
    if (state.isLoading && state.announcements.isEmpty) {
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
                  .read(announcementsProvider.notifier)
                  .loadAnnouncements(forceRefresh: true),
              child: const Text('Thử lại'),
            ),
          ],
        ),
      );
    }

    if (state.filteredAnnouncements.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.notifications_none, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              state.searchQuery != null
                  ? 'Không tìm thấy thông báo'
                  : 'Chưa có thông báo',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              state.searchQuery != null
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Các thông báo mới sẽ hiển thị ở đây',
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
        await ref
            .read(announcementsProvider.notifier)
            .loadAnnouncements(forceRefresh: true);
        _refreshController.refreshCompleted();
      },
      child: ListView.builder(
        itemCount: state.filteredAnnouncements.length,
        itemBuilder: (context, index) {
          final announcement = state.filteredAnnouncements[index];
          return _buildAnnouncementCard(announcement);
        },
      ),
    );
  }

  Widget _buildAnnouncementCard(Announcement announcement) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: InkWell(
        onTap: () => _onAnnouncementTap(announcement),
        borderRadius: BorderRadius.circular(12),
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
                      color: _getTypeColor(announcement.type).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          announcement.type.icon,
                          style: const TextStyle(fontSize: 12),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          announcement.type.displayName,
                          style: TextStyle(
                            color: _getTypeColor(announcement.type),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  if (!announcement.read)
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Colors.blue,
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                announcement.title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: announcement.read
                      ? FontWeight.normal
                      : FontWeight.w600,
                  color: announcement.read ? null : Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                announcement.content,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.schedule, size: 16, color: Colors.grey[500]),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat(
                      'dd/MM/yyyy HH:mm',
                    ).format(announcement.createdAt),
                    style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                  ),
                  const Spacer(),
                  Text(
                    'Bởi ${announcement.createdBy}',
                    style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getTypeColor(AnnouncementType type) {
    switch (type) {
      case AnnouncementType.urgent:
        return Colors.red;
      case AnnouncementType.news:
        return Colors.blue;
      case AnnouncementType.event:
        return Colors.purple;
      case AnnouncementType.regular:
        return Colors.grey;
    }
  }

  void _onFilterChanged(AnnouncementType? type) {
    ref.read(announcementsProvider.notifier).filterByType(type);
  }

  void _onAnnouncementTap(Announcement announcement) {
    if (!announcement.read) {
      ref.read(announcementsProvider.notifier).markAsRead(announcement.id);
    }

    showDialog(
      context: context,
      builder: (context) =>
          AnnouncementDetailDialog(announcement: announcement),
    );
  }

  void _markAllAsRead() {
    ref.read(announcementsProvider.notifier).markAllAsRead();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đã đánh dấu tất cả thông báo đã đọc')),
    );
  }

  void _showSearchDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tìm kiếm thông báo'),
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
                  .read(announcementsProvider.notifier)
                  .searchAnnouncements(_searchController.text);
              Navigator.of(context).pop();
            },
            child: const Text('Tìm kiếm'),
          ),
        ],
      ),
    );
  }
}

class AnnouncementDetailDialog extends StatelessWidget {
  final Announcement announcement;

  const AnnouncementDetailDialog({super.key, required this.announcement});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Row(
        children: [
          Text(announcement.type.icon),
          const SizedBox(width: 8),
          Expanded(child: Text(announcement.title)),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _getTypeColor(announcement.type).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                announcement.type.displayName,
                style: TextStyle(
                  color: _getTypeColor(announcement.type),
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              announcement.content,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            Divider(color: Colors.grey[300]),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.schedule, size: 16, color: Colors.grey[500]),
                const SizedBox(width: 4),
                Text(
                  DateFormat('dd/MM/yyyy HH:mm').format(announcement.createdAt),
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
                const Spacer(),
                Text(
                  'Bởi ${announcement.createdBy}',
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
              ],
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Đóng'),
        ),
      ],
    );
  }

  Color _getTypeColor(AnnouncementType type) {
    switch (type) {
      case AnnouncementType.urgent:
        return Colors.red;
      case AnnouncementType.news:
        return Colors.blue;
      case AnnouncementType.event:
        return Colors.purple;
      case AnnouncementType.regular:
        return Colors.grey;
    }
  }
}
