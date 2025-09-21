import 'package:flutter/material.dart';
import '../../core/storage/secure_storage.dart';

/// Debug widget để kiểm tra token
class DebugTokenWidget extends StatefulWidget {
  const DebugTokenWidget({super.key});

  @override
  State<DebugTokenWidget> createState() => _DebugTokenWidgetState();
}

class _DebugTokenWidgetState extends State<DebugTokenWidget> {
  String? _token;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadToken();
  }

  Future<void> _loadToken() async {
    try {
      final token = await TokenStorage.instance.getToken();
      setState(() {
        _token = token;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _token = 'Error: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Debug Token'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadToken),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Token Status:',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              const CircularProgressIndicator()
            else ...[
              Text(
                'Token: ${_token ?? "null"}',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 8),
              Text(
                'Length: ${_token?.length ?? 0}',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 8),
              Text(
                'Is Empty: ${_token?.isEmpty ?? true}',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadToken,
                child: const Text('Refresh Token'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
