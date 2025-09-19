import 'package:flutter/material.dart';

import '../../core/storage/secure_storage.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _decide();
  }

  Future<void> _decide() async {
    try {
      // Thêm timeout để tránh bị kẹt vô hạn
      await Future.delayed(const Duration(milliseconds: 500));

      final token = await TokenStorage.instance.getToken();
      if (!mounted) return;

      if (token == null || token.isEmpty) {
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/login');
        }
      } else {
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/dashboard');
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Lỗi khởi tạo ứng dụng: $e';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_isLoading) ...[
              const SizedBox(
                height: 32,
                width: 32,
                child: CircularProgressIndicator(),
              ),
              const SizedBox(height: 16),
              const Text('Đang khởi tạo...'),
            ] else if (_error != null) ...[
              const Icon(Icons.error, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _error = null;
                  });
                  _decide();
                },
                child: const Text('Thử lại'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
