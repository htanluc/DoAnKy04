import 'package:flutter/material.dart';
import 'dart:convert';
import '../../core/api/api_helper.dart';

class _Announcement {
  _Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    required this.createdAt,
    required this.read,
  });
  final String id;
  final String title;
  final String content;
  final String type;
  final String createdAt;
  final bool read;
}

class AnnouncementsPage extends StatelessWidget {
  const AnnouncementsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thông báo')),
      body: FutureBuilder<List<_Announcement>>(
        future: _fetchAnnouncements(),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Lỗi tải dữ liệu: ${snapshot.error}'));
          }
          final list = snapshot.data ?? const <_Announcement>[];
          if (list.isEmpty)
            return const Center(child: Text('Chưa có thông báo'));
          return SingleChildScrollView(
            child: Column(
              children: [
                for (int index = 0; index < list.length; index++) ...[
                  if (index > 0) const Divider(height: 1),
                  ListTile(
                    leading: Icon(
                      list[index].type == 'URGENT'
                          ? Icons.warning_amber
                          : list[index].type == 'NEWS'
                          ? Icons.campaign
                          : Icons.info,
                      color: list[index].type == 'URGENT'
                          ? Colors.red
                          : list[index].type == 'NEWS'
                          ? Colors.blue
                          : Colors.grey,
                    ),
                    title: Text(
                      list[index].title,
                      style: TextStyle(
                        fontWeight: list[index].read
                            ? FontWeight.normal
                            : FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      list[index].content,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: Text(_formatDate(list[index].createdAt)),
                    onTap: () async {
                      try {
                        await ApiHelper.post(
                          '/api/announcements/${list[index].id}/read',
                        );
                        if (context.mounted) {
                          Navigator.of(
                            context,
                          ).pushReplacementNamed('/announcements');
                        }
                      } catch (_) {}
                    },
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

Future<List<_Announcement>> _fetchAnnouncements() async {
  final resp = await ApiHelper.get('/api/announcements');
  final raw = jsonDecode(resp.body);
  List list;
  if (raw is List) {
    list = raw;
  } else if (raw is Map) {
    final data = raw['data'];
    if (data is List) {
      list = data;
    } else if (data is Map && data['content'] is List) {
      list = data['content'] as List;
    } else if (raw['content'] is List) {
      list = raw['content'] as List;
    } else if (raw['items'] is List) {
      list = raw['items'] as List;
    } else {
      list = const [];
    }
  } else {
    list = const [];
  }

  return list
      .whereType<Object>()
      .map((e) {
        if (e is! Map)
          return _Announcement(
            id: '',
            title: '',
            content: '',
            type: '',
            createdAt: '',
            read: true,
          );
        final m = Map<String, dynamic>.from(e);
        return _Announcement(
          id: (m['id'] ?? '').toString(),
          title: (m['title'] ?? m['name'] ?? '').toString(),
          content: (m['content'] ?? m['message'] ?? '').toString(),
          type: (m['type'] ?? m['category'] ?? '').toString(),
          createdAt: (m['createdAt'] ?? m['created_at'] ?? m['timestamp'] ?? '')
              .toString(),
          read: (m['read'] ?? m['isRead'] ?? false) == true,
        );
      })
      .where((a) => a.title.isNotEmpty || a.content.isNotEmpty)
      .toList();
}

String _formatDate(String iso) {
  try {
    final d = DateTime.parse(iso);
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}';
  } catch (_) {
    return '';
  }
}

// TODO: Announcements UI
