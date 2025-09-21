import 'dart:convert';
import 'package:apartment_resident_mobile/core/api/api_helper.dart';
import '../models/announcement.dart';

class AnnouncementsApi {
  /// Fetch all announcements
  Future<List<Announcement>> getAnnouncements() async {
    try {
      final response = await ApiHelper.get('/api/announcements');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Announcement.fromJson(json)).toList();
      } else {
        throw Exception(
          'Failed to fetch announcements: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Failed to fetch announcements: $e');
    }
  }

  /// Mark a single announcement as read
  Future<void> markAsRead(String announcementId) async {
    try {
      final response = await ApiHelper.put(
        '/api/announcements/$announcementId/read',
      );
      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception(
          'Failed to mark announcement as read: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Failed to mark announcement as read: $e');
    }
  }

  /// Mark multiple announcements as read
  Future<void> markAllAsRead(List<String> announcementIds) async {
    try {
      // Try batch operation first
      final response = await ApiHelper.put(
        '/api/announcements/read-all',
        data: jsonEncode({'announcementIds': announcementIds}),
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        // Fallback to individual calls if batch not supported
        for (final id in announcementIds) {
          await markAsRead(id);
        }
      }
    } catch (e) {
      // Fallback to individual calls
      for (final id in announcementIds) {
        await markAsRead(id);
      }
    }
  }

  /// Search announcements by title or content
  Future<List<Announcement>> searchAnnouncements(String query) async {
    try {
      final response = await ApiHelper.get(
        '/api/announcements',
        query: {'search': query},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Announcement.fromJson(json)).toList();
      } else {
        throw Exception(
          'Failed to search announcements: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Failed to search announcements: $e');
    }
  }

  /// Filter announcements by type
  Future<List<Announcement>> filterByType(AnnouncementType type) async {
    try {
      final response = await ApiHelper.get(
        '/api/announcements',
        query: {'type': type.name},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Announcement.fromJson(json)).toList();
      } else {
        throw Exception(
          'Failed to filter announcements: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Failed to filter announcements: $e');
    }
  }
}
