import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:apartment_resident_mobile/core/app_config.dart';
import 'package:apartment_resident_mobile/core/storage/secure_storage.dart';
import '../models/announcement.dart';

class AnnouncementsApi {
  static String get _baseUrl => '${AppConfig.apiBaseUrl}/api';

  Future<String?> _getToken() async => TokenStorage.instance.getToken();

  Future<List<Announcement>> getAnnouncements() async {
    try {
      final token = await _getToken();
      final response = await http.get(
        Uri.parse('$_baseUrl/announcements'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        List<dynamic> dataList;
        if (decoded is List) {
          dataList = decoded;
        } else if (decoded is Map<String, dynamic>) {
          final data = decoded['data'];
          if (data is List) {
            dataList = data;
          } else if (data is Map && data['content'] is List) {
            dataList = data['content'] as List<dynamic>;
          } else if (decoded['content'] is List) {
            dataList = decoded['content'] as List<dynamic>;
          } else if (decoded['items'] is List) {
            dataList = decoded['items'] as List<dynamic>;
          } else {
            dataList = const [];
          }
        } else {
          dataList = const [];
        }
        return dataList
            .whereType<Map<String, dynamic>>()
            .map(_mapBackendAnnouncement)
            .toList();
      }
      // Trường hợp lỗi: trả danh sách rỗng thay vì mock
      return const <Announcement>[];
    } catch (e) {
      print('API Error getting announcements: $e');
      // Trả về danh sách rỗng để tránh dữ liệu giả
      return const <Announcement>[];
    }
  }

  Future<void> markAsRead(String announcementId) async {
    try {
      final token = await _getToken();
      await http.put(
        Uri.parse('$_baseUrl/announcements/$announcementId/read'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
    } catch (e) {
      print('API Error marking announcement as read: $e');
      // Không throw error để không làm crash app
    }
  }

  Future<void> markAllAsRead(List<String> announcementIds) async {
    try {
      final token = await _getToken();
      await http.put(
        Uri.parse('$_baseUrl/announcements/mark-all-read'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode({'announcementIds': announcementIds}),
      );
    } catch (e) {
      print('API Error marking all announcements as read: $e');
      // Không throw error để không làm crash app
    }
  }

  // Bỏ dữ liệu mẫu để tránh hiển thị giả trên môi trường thật
  Announcement _mapBackendAnnouncement(Map<String, dynamic> json) {
    final typeRaw = (json['type'] ?? '').toString().toUpperCase();
    final AnnouncementType type;
    switch (typeRaw) {
      case 'URGENT':
        type = AnnouncementType.urgent;
        break;
      case 'NEWS':
        type = AnnouncementType.news;
        break;
      case 'EVENT':
        type = AnnouncementType.event;
        break;
      default:
        type = AnnouncementType.regular;
    }

    final createdAtStr = (json['createdAt'] ?? json['created_at'] ?? '')
        .toString();
    DateTime createdAt;
    try {
      createdAt = DateTime.parse(createdAtStr);
    } catch (_) {
      createdAt = DateTime.now();
    }

    final read = (json['isRead'] ?? json['read'] ?? false) == true;

    return Announcement(
      id: (json['id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      content: (json['content'] ?? '').toString(),
      type: type,
      read: read,
      createdAt: createdAt,
      createdBy: (json['createdBy'] ?? '').toString(),
    );
  }
}
