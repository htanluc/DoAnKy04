import 'package:flutter/material.dart';
import 'dart:convert';
import '../../core/api/api_helper.dart';

class _Event {
  _Event({
    required this.id,
    required this.title,
    required this.description,
    required this.location,
    required this.startTime,
    required this.endTime,
    required this.registered,
    required this.participantCount,
  });
  final String id;
  final String title;
  final String description;
  final String location;
  final String startTime;
  final String endTime;
  final bool registered;
  final int participantCount;
}

class EventsPage extends StatefulWidget {
  const EventsPage({super.key});

  @override
  State<EventsPage> createState() => _EventsPageState();
}

class _EventsPageState extends State<EventsPage> {
  late Future<List<_Event>> _future;

  @override
  void initState() {
    super.initState();
    _future = _fetchEvents();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sự kiện')),
      body: FutureBuilder<List<_Event>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Lỗi tải dữ liệu: ${snapshot.error}'));
          }
          final list = snapshot.data ?? const <_Event>[];
          if (list.isEmpty) return const Center(child: Text('Chưa có sự kiện'));
          return SingleChildScrollView(
            child: Column(
              children: [
                // Header với thống kê
                _buildStatsHeader(list),
                const SizedBox(height: 16),
                // Danh sách sự kiện
                for (int index = 0; index < list.length; index++) ...[
                  if (index > 0) const SizedBox(height: 12),
                  _buildEventCard(context, list[index]),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

Future<List<_Event>> _fetchEvents() async {
  final resp = await ApiHelper.get('/api/events');
  final raw = jsonDecode(resp.body);
  final list = ApiHelper.extractList(raw);
  return list.whereType<Object>().map((e) {
    if (e is! Map)
      return _Event(
        id: '',
        title: '',
        description: '',
        location: '',
        startTime: '',
        endTime: '',
        registered: false,
        participantCount: 0,
      );
    final m = Map<String, dynamic>.from(e);
    return _Event(
      id: (m['id'] ?? m['eventId'] ?? '').toString(),
      title: (m['title'] ?? m['name'] ?? '').toString(),
      description: (m['description'] ?? m['content'] ?? '').toString(),
      location: (m['location'] ?? m['place'] ?? '').toString(),
      startTime: (m['startTime'] ?? m['start'] ?? '').toString(),
      endTime: (m['endTime'] ?? m['end'] ?? '').toString(),
      registered: (m['registered'] ?? m['isRegistered'] ?? false) == true,
      participantCount:
          (m['participantCount'] ?? m['participants'] ?? 0) as int,
    );
  }).toList();
}

String _fmtDateTime(String s) {
  try {
    return s.replaceFirst(' ', ' ');
  } catch (_) {
    return s;
  }
}

Widget _buildStatsHeader(List<_Event> events) {
  final registeredCount = events.where((e) => e.registered).length;
  final upcomingCount = events
      .where((e) => _getEventStatus(e) == 'UPCOMING')
      .length;

  return Card(
    child: Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Expanded(
            child: _buildStatItem(
              'Đã đăng ký',
              registeredCount.toString(),
              Icons.check_circle,
              Colors.green,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildStatItem(
              'Sắp diễn ra',
              upcomingCount.toString(),
              Icons.schedule,
              Colors.blue,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildStatItem(
              'Tổng sự kiện',
              events.length.toString(),
              Icons.event,
              Colors.orange,
            ),
          ),
        ],
      ),
    ),
  );
}

Widget _buildStatItem(String label, String value, IconData icon, Color color) {
  return Column(
    children: [
      Icon(icon, color: color, size: 24),
      const SizedBox(height: 4),
      Text(
        value,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
      Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
    ],
  );
}

Widget _buildEventCard(BuildContext context, _Event event) {
  final status = _getEventStatus(event);
  final statusColor = _getStatusColor(status);

  return Card(
    elevation: 2,
    child: Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header với status và đăng ký
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _getStatusText(status),
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
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

          // Title
          Text(
            event.title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),

          // Description
          if (event.description.isNotEmpty) ...[
            Text(
              event.description,
              style: const TextStyle(fontSize: 14, color: Colors.grey),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
          ],

          // Thông tin thời gian và địa điểm
          Row(
            children: [
              Icon(Icons.schedule, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 4),
              Text(
                '${_fmtDateTime(event.startTime)} - ${_fmtDateTime(event.endTime)}',
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

          // Action button
          SizedBox(
            width: double.infinity,
            child: event.registered
                ? OutlinedButton.icon(
                    onPressed: () => _unregister(context, event.id),
                    icon: const Icon(Icons.cancel),
                    label: const Text('Hủy đăng ký'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                    ),
                  )
                : FilledButton.icon(
                    onPressed: () => _register(context, event.id),
                    icon: const Icon(Icons.add),
                    label: const Text('Đăng ký tham gia'),
                  ),
          ),
        ],
      ),
    ),
  );
}

String _getEventStatus(_Event event) {
  try {
    final now = DateTime.now();
    final startTime = DateTime.parse(event.startTime);
    final endTime = DateTime.parse(event.endTime);

    if (now.isBefore(startTime)) {
      return 'UPCOMING';
    } else if (now.isAfter(startTime) && now.isBefore(endTime)) {
      return 'ONGOING';
    } else {
      return 'ENDED';
    }
  } catch (_) {
    return 'UNKNOWN';
  }
}

Color _getStatusColor(String status) {
  switch (status) {
    case 'UPCOMING':
      return Colors.blue;
    case 'ONGOING':
      return Colors.orange;
    case 'ENDED':
      return Colors.grey;
    default:
      return Colors.grey;
  }
}

String _getStatusText(String status) {
  switch (status) {
    case 'UPCOMING':
      return 'Sắp diễn ra';
    case 'ONGOING':
      return 'Đang diễn ra';
    case 'ENDED':
      return 'Đã kết thúc';
    default:
      return 'Không xác định';
  }
}

Future<void> _register(BuildContext context, String eventId) async {
  try {
    await ApiHelper.post(
      '/api/event-registrations/register',
      data: {'eventId': int.tryParse(eventId) ?? eventId},
    );
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đăng ký sự kiện thành công!')),
      );
      // Refresh the page by popping and pushing again
      Navigator.of(context).pushReplacementNamed('/events');
    }
  } catch (e) {
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi đăng ký: ${e.toString()}')));
    }
  }
}

Future<void> _unregister(BuildContext context, String eventId) async {
  try {
    await ApiHelper.delete('/api/event-registrations/cancel/$eventId');
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Hủy đăng ký sự kiện thành công!')),
      );
      // Refresh the page by popping and pushing again
      Navigator.of(context).pushReplacementNamed('/events');
    }
  } catch (e) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi hủy đăng ký: ${e.toString()}')),
      );
    }
  }
}
