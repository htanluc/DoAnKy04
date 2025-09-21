import 'package:flutter/material.dart';
import 'dart:convert';
import '../../core/api/api_helper.dart';
import 'service_request_detail_page.dart';

class _ServiceRequest {
  _ServiceRequest({
    required this.id,
    required this.title,
    required this.category,
    required this.priority,
    required this.status,
    required this.createdAt,
  });
  final String id;
  final String title;
  final String category;
  final String priority;
  final String status;
  final String createdAt;
}

class ServiceRequestsPage extends StatelessWidget {
  const ServiceRequestsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Yêu cầu dịch vụ')),
      body: FutureBuilder<List<_ServiceRequest>>(
        future: _fetchMyRequests(),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Lỗi tải dữ liệu: ${snapshot.error}'));
          }
          final list = snapshot.data ?? const <_ServiceRequest>[];
          if (list.isEmpty) return const Center(child: Text('Chưa có yêu cầu'));
          return SingleChildScrollView(
            child: Column(
              children: [
                for (int index = 0; index < list.length; index++) ...[
                  if (index > 0) const Divider(height: 1),
                  Builder(
                    builder: (context) {
                      final r = list[index];
                      return ListTile(
                        title: Text(r.title),
                        subtitle: Text(
                          'Loại: ${r.category} • Ưu tiên: ${r.priority}\nTrạng thái: ${r.status}',
                        ),
                        isThreeLine: true,
                        trailing: Text(_shortDate(r.createdAt)),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) =>
                                  ServiceRequestDetailPage(requestId: r.id),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ],
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          // Mở form tạo mới (tối giản)
          final created = await showDialog<bool>(
            context: context,
            builder: (context) => const _CreateRequestDialog(),
          );
          if (created == true && context.mounted) {
            // Gọi setState gián tiếp bằng cách dùng StatefulBuilder ở trên list (đơn giản: pop & push lại route)
            Navigator.of(context).pushReplacementNamed('/service-requests');
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

Future<List<_ServiceRequest>> _fetchMyRequests() async {
  final resp = await ApiHelper.get('/api/support-requests/my');
  final raw = jsonDecode(resp.body);
  final list = ApiHelper.extractList(raw);
  return list.whereType<Object>().map((e) {
    if (e is! Map) {
      return _ServiceRequest(
        id: '',
        title: '',
        category: '',
        priority: '',
        status: '',
        createdAt: '',
      );
    }
    final m = Map<String, dynamic>.from(e);
    return _ServiceRequest(
      id: (m['id'] ?? m['requestId'] ?? '').toString(),
      title: (m['title'] ?? m['subject'] ?? '').toString(),
      category: (m['category'] ?? m['categoryName'] ?? '').toString(),
      priority: (m['priority'] ?? m['level'] ?? '').toString(),
      status: (m['status'] ?? m['state'] ?? '').toString(),
      createdAt: (m['createdAt'] ?? m['submittedAt'] ?? '').toString(),
    );
  }).toList();
}

String _shortDate(String iso) {
  try {
    final d = DateTime.parse(iso);
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}';
  } catch (_) {
    return '';
  }
}

class _CreateRequestDialog extends StatefulWidget {
  const _CreateRequestDialog();

  @override
  State<_CreateRequestDialog> createState() => _CreateRequestDialogState();
}

class _CreateRequestDialogState extends State<_CreateRequestDialog> {
  final _title = TextEditingController();
  final _description = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      // Mapping category string to categoryId như web frontend
      const categoryMapping = {
        'MAINTENANCE': 1,
        'CLEANING': 2,
        'SECURITY': 3,
        'UTILITY': 4,
        'OTHER': 5,
      };

      await ApiHelper.post(
        '/api/support-requests',
        data: {
          'title': _title.text.trim(),
          'description': _description.text.trim(),
          'categoryId': categoryMapping['OTHER'] ?? 5, // Default to OTHER
          'priority': 'MEDIUM',
        },
      );
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (e) {
      setState(() => _error = 'Tạo yêu cầu thất bại');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Tạo yêu cầu'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_error != null)
            Text(_error!, style: const TextStyle(color: Colors.red)),
          TextField(
            controller: _title,
            decoration: const InputDecoration(labelText: 'Tiêu đề'),
          ),
          TextField(
            controller: _description,
            decoration: const InputDecoration(labelText: 'Mô tả'),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _loading ? null : () => Navigator.of(context).pop(false),
          child: const Text('Hủy'),
        ),
        FilledButton(
          onPressed: _loading ? null : _submit,
          child: _loading
              ? const SizedBox(
                  height: 16,
                  width: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Tạo'),
        ),
      ],
    );
  }
}

// TODO: Service Requests UI
