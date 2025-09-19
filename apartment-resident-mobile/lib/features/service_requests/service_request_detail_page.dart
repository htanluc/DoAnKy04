import 'package:flutter/material.dart';
import 'dart:convert';
import '../../core/api/api_helper.dart';

class ServiceRequestDetailPage extends StatelessWidget {
  const ServiceRequestDetailPage({super.key, required this.requestId});
  final String requestId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết yêu cầu')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _fetchDetail(requestId),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Lỗi tải dữ liệu: ${snapshot.error}'));
          }
          final d = snapshot.data ?? const {};
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(
                (d['title'] ?? '').toString(),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text((d['description'] ?? '').toString()),
              const SizedBox(height: 12),
              Text('Loại: ${(d['category'] ?? '').toString()}'),
              Text('Ưu tiên: ${(d['priority'] ?? '').toString()}'),
              Text('Trạng thái: ${(d['status'] ?? '').toString()}'),
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 8),
              const Text(
                'Bình luận',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              for (final c in ((d['comments'] as List?) ?? const []))
                ListTile(
                  title: Text((c['author'] ?? '').toString()),
                  subtitle: Text((c['content'] ?? '').toString()),
                  dense: true,
                ),
            ],
          );
        },
      ),
    );
  }
}

Future<Map<String, dynamic>> _fetchDetail(String id) async {
  final resp = await ApiHelper.get('/api/support-requests/$id');
  return jsonDecode(resp.body);
}
