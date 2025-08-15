import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/db_service.dart';
import '../models/service_request.dart';
import 'request_detail_page.dart';

class RequestsListPage extends StatefulWidget {
  const RequestsListPage({super.key});

  @override
  State<RequestsListPage> createState() => _RequestsListPageState();
}

class _RequestsListPageState extends State<RequestsListPage> {
  bool _loading = true;
  List<ServiceRequestModel> _items = [];
  String _query = '';
  String _status = 'all';

  Future<void> _load() async {
    setState(() {
      _loading = true;
    });
    // 1) Load từ cache SQLite trước
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
    // 2) Đồng bộ từ API và cập nhật cache
    try {
      final user = await AuthService.getUser();
      final staffId = (user?['id'] as num?)?.toInt();
      if (staffId == null) throw Exception('Không tìm thấy staffId');
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
    } catch (_) {
      // Giữ nguyên dữ liệu cache nếu lỗi mạng
    } finally {
      if (mounted)
        setState(() {
          _loading = false;
        });
    }
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _items.where((e) {
      final q = _query.toLowerCase();
      final match = (e.residentName ?? '').toLowerCase().contains(q) ||
          (e.description ?? '').toLowerCase().contains(q) ||
          (e.categoryName ?? '').toLowerCase().contains(q);
      final ok = _status == 'all' || (e.status ?? '').toUpperCase() == _status;
      return match && ok;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Yêu cầu được gán'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.search),
                      hintText: 'Tìm theo cư dân, mô tả...',
                    ),
                    onChanged: (v) => setState(() {
                      _query = v;
                    }),
                  ),
                ),
                const SizedBox(width: 8),
                DropdownButton<String>(
                  value: _status,
                  items: const [
                    DropdownMenuItem(value: 'all', child: Text('Tất cả')),
                    DropdownMenuItem(value: 'OPEN', child: Text('Mở')),
                    DropdownMenuItem(value: 'ASSIGNED', child: Text('Đã giao')),
                    DropdownMenuItem(
                      value: 'IN_PROGRESS',
                      child: Text('Đang xử lý'),
                    ),
                    DropdownMenuItem(
                      value: 'COMPLETED',
                      child: Text('Hoàn thành'),
                    ),
                    DropdownMenuItem(value: 'CANCELLED', child: Text('Đã huỷ')),
                  ],
                  onChanged: (v) => setState(() {
                    _status = v ?? 'all';
                  }),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : ListView.separated(
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final r = filtered[index];
                      return ListTile(
                        title: Text(r.description ?? '-'),
                        subtitle: Text(
                          '${r.categoryName ?? '-'} • ${r.residentName ?? '-'} • ${r.residentPhone ?? '-'}',
                        ),
                        trailing: Text(r.status ?? ''),
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => RequestDetailPage(request: r),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
