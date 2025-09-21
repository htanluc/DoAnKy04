import '../models/announcement.dart';
import 'announcements_api.dart';

class AnnouncementsRepository {
  final AnnouncementsApi _api;

  AnnouncementsRepository(this._api);

  /// Get all announcements with caching
  Future<List<Announcement>> getAnnouncements({
    bool forceRefresh = false,
  }) async {
    return await _api.getAnnouncements();
  }

  /// Mark announcement as read
  Future<void> markAsRead(String announcementId) async {
    await _api.markAsRead(announcementId);
  }

  /// Mark all announcements as read
  Future<void> markAllAsRead(List<String> announcementIds) async {
    if (announcementIds.isEmpty) return;
    await _api.markAllAsRead(announcementIds);
  }

  /// Search announcements
  Future<List<Announcement>> searchAnnouncements(String query) async {
    if (query.trim().isEmpty) {
      return await getAnnouncements();
    }
    return await _api.searchAnnouncements(query);
  }

  /// Filter announcements by type
  Future<List<Announcement>> filterByType(AnnouncementType type) async {
    return await _api.filterByType(type);
  }

  /// Get unread announcements count
  Future<int> getUnreadCount() async {
    final announcements = await getAnnouncements();
    return announcements.where((a) => !a.read).length;
  }

  /// Get announcements by type with count
  Future<Map<AnnouncementType, int>> getAnnouncementsByType() async {
    final announcements = await getAnnouncements();
    final Map<AnnouncementType, int> counts = {};

    for (final type in AnnouncementType.values) {
      counts[type] = announcements.where((a) => a.type == type).length;
    }

    return counts;
  }
}
