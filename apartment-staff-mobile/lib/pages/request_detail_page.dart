import 'package:flutter/material.dart';
import '../models/service_request.dart';
import '../services/api_service.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';

class RequestDetailPage extends StatefulWidget {
  final ServiceRequestModel request;
  const RequestDetailPage({super.key, required this.request});

  @override
  State<RequestDetailPage> createState() => _RequestDetailPageState();
}

class _RequestDetailPageState extends State<RequestDetailPage> {
  late ServiceRequestModel _req;
  final _notesCtrl = TextEditingController();
  String _status = 'OPEN';
  final _chatCtrl = TextEditingController();
  final List<Map<String, String>> _messages = [];
  StompClient? _stomp;

  @override
  void initState() {
    super.initState();
    _req = widget.request;
    _status = (_req.status ?? 'OPEN').toUpperCase();
    _connectChat();
  }

  void _connectChat() async {
    final base = ApiService.baseUrl.replaceFirst('http', 'ws');
    _stomp = StompClient(
      config: StompConfig.sockJS(
        url: '$base/ws',
        onConnect: (StompFrame frame) {
          _stomp?.subscribe(
            destination: '/topic/support-requests/${_req.id}/chat',
            callback: (frame) {
              if (!mounted) return;
              final body = frame.body;
              if (body == null) return;
              _messages.add({'sender': 'user', 'content': body});
              setState(() {});
            },
          );
        },
      ),
    );
    _stomp?.activate();
  }

  void _sendMessage() {
    if (_chatCtrl.text.trim().isEmpty || _status == 'COMPLETED') return;
    final payload =
        '{"sender":"STAFF","content":"${_chatCtrl.text.trim()}","timestamp":"${DateTime.now().toIso8601String()}"}';
    _stomp?.send(
      destination: '/app/support-requests/${_req.id}/chat',
      body: payload,
    );
    _chatCtrl.clear();
  }

  @override
  void dispose() {
    _stomp?.deactivate();
    super.dispose();
  }

  Future<void> _saveStatus() async {
    await ApiService.updateStatus(_req.id, _status, notes: _notesCtrl.text);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Cập nhật trạng thái thành công')),
    );
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    // final dateFmt = DateFormat('dd/MM/yyyy HH:mm');
    return Scaffold(
      appBar: AppBar(title: Text('Yêu cầu #${_req.id}')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _req.description ?? '-',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text('Cư dân: ${_req.residentName ?? '-'}'),
              Text('Liên hệ: ${_req.residentPhone ?? '-'}'),
              Text('Danh mục: ${_req.categoryName ?? '-'}'),
              Text('Ưu tiên: ${_req.priority ?? '-'}'),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Text('Trạng thái: '),
                  DropdownButton<String>(
                    value: _status,
                    items: const [
                      DropdownMenuItem(value: 'OPEN', child: Text('Mở')),
                      DropdownMenuItem(
                        value: 'IN_PROGRESS',
                        child: Text('Đang xử lý'),
                      ),
                      DropdownMenuItem(
                        value: 'COMPLETED',
                        child: Text('Hoàn thành'),
                      ),
                      DropdownMenuItem(value: 'CANCELLED', child: Text('Huỷ')),
                    ],
                    onChanged: (v) => setState(() {
                      _status = v ?? 'OPEN';
                    }),
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: _saveStatus,
                    child: const Text('Lưu'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _notesCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Ghi chú xử lý (tuỳ chọn)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Chat với cư dân',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  if (_status == 'COMPLETED')
                    const Chip(label: Text('Đã hoàn thành - Chat khóa')),
                ],
              ),
              const SizedBox(height: 8),
              Container(
                height: 320,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final m = _messages[index];
                          return ListTile(
                            title: Text(m['content'] ?? ''),
                            subtitle: Text(m['sender'] ?? ''),
                          );
                        },
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _chatCtrl,
                              enabled: _status != 'COMPLETED',
                              decoration: const InputDecoration(
                                hintText: 'Nhập tin nhắn...',
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed:
                                _status == 'COMPLETED' ? null : _sendMessage,
                            icon: const Icon(Icons.send),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
