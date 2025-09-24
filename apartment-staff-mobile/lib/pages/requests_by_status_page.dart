import 'package:flutter/material.dart';
import '../models/service_request.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/db_service.dart';
import 'request_detail_page.dart';

class RequestsByStatusPage extends StatefulWidget {
  final String
      status; // 'all', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  const RequestsByStatusPage({super.key, required this.status});

  @override
  State<RequestsByStatusPage> createState() => _RequestsByStatusPageState();
}

class _RequestsByStatusPageState extends State<RequestsByStatusPage> {
  bool _loading = true;
  String? _error;
  List<ServiceRequestModel> _items = [];

  DateTime? _tryParseDate(String? input) {
    if (input == null) return null;
    try {
      return DateTime.tryParse(input);
    } catch (_) {
      return null;
    }
  }

  String _titleForStatus(String s) {
    switch (s.toUpperCase()) {
      case 'OPEN':
        return 'Open';
      case 'ASSIGNED':
        return 'Assigned';
      case 'IN_PROGRESS':
        return 'In progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'All';
    }
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    // Load from cache first
    final cached = await DbService.loadAssignedRequests();
    if (mounted && cached.isNotEmpty) {
      setState(() {
        _items = cached
            .map((e) => ServiceRequestModel.fromJson({
                  'id': e['id'],
                  'userName': e['resident_name'],
                  'userPhone': e['resident_phone'],
                  'categoryName': e['category_name'],
                  'description': e['description'],
                  'priority': e['priority'],
                  'status': e['status'],
                  'submittedAt': e['submitted_at'],
                }))
            .toList();
      });
    }

    try {
      final user = await AuthService.getUser();
      final staffId = (user?['id'] as num?)?.toInt();
      if (staffId == null) throw Exception('staffId not found');
      final list = await ApiService.getAssignedRequests(staffId);
      await DbService.saveAssignedRequests(list.cast<Map<String, dynamic>>());
      if (mounted) {
        setState(() {
          _items = list
              .map((e) =>
                  ServiceRequestModel.fromJson(e as Map<String, dynamic>))
              .toList();
        });
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final status = widget.status.toUpperCase();
    final filtered = _items.where((e) {
      final ok = status == 'ALL' ||
          status == 'ALL' ||
          (e.status ?? '').toUpperCase() == status;
      return ok;
    }).toList();

    // Sort by submittedAt/createdAt desc (newest first). Fallback to id desc
    filtered.sort((a, b) {
      final da = _tryParseDate(a.submittedAt);
      final db = _tryParseDate(b.submittedAt);
      if (da == null && db == null) return b.id.compareTo(a.id);
      if (da == null) return 1; // a goes after b
      if (db == null) return -1; // a goes before b
      return db.compareTo(da); // newer first
    });

    return Scaffold(
      appBar: AppBar(
        title: Text('Requests • ${_titleForStatus(status)}'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _buildListOrState(filtered),
    );
  }

  Widget _buildListOrState(List<ServiceRequestModel> filtered) {
    if (_error != null && _items.isEmpty) {
      return _StatePlaceholder(
        icon: Icons.wifi_off,
        title: 'Unable to load data',
        message: 'Check your network connection and try again.',
        actionText: 'Retry',
        onAction: _load,
      );
    }
    if (filtered.isEmpty) {
      return _StatePlaceholder(
        icon: Icons.inbox,
        title: 'No requests',
        message: 'Pull down to refresh.',
        actionText: 'Refresh',
        onAction: _load,
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          final r = filtered[index];
          return _RequestCard(item: r);
        },
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  final ServiceRequestModel item;
  const _RequestCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final status = (item.status ?? '').toUpperCase();
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => RequestDetailPage(request: item),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 40,
                width: 40,
                decoration: BoxDecoration(
                  color: cs.primaryContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.build, color: cs.onPrimaryContainer),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.description ?? '-',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${item.categoryName ?? '-'}',
                      style: TextStyle(color: cs.onSurfaceVariant),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${item.residentName ?? '-'} • ${item.residentPhone ?? '-'}',
                      style: TextStyle(color: cs.onSurfaceVariant),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _StatusPill(status: status),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final String status;
  const _StatusPill({required this.status});

  Color _statusColor(String s, BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    switch (s.toUpperCase()) {
      case 'OPEN':
        return const Color(0xFFF37021);
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return const Color(0xFF0072BC);
      case 'COMPLETED':
        return const Color(0xFF5CB034);
      case 'CANCELLED':
        return const Color(0xFFE53935);
      default:
        return cs.outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _statusColor(status, context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.isEmpty ? '-' : status,
        style:
            const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _StatePlaceholder extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String actionText;
  final Future<void> Function() onAction;

  const _StatePlaceholder({
    required this.icon,
    required this.title,
    required this.message,
    required this.actionText,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64, color: Theme.of(context).colorScheme.outline),
            const SizedBox(height: 12),
            Text(title,
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: onAction, child: Text(actionText)),
          ],
        ),
      ),
    );
  }
}
