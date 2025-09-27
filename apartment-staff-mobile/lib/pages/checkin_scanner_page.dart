import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../services/api_service.dart';

class CheckinScannerPage extends StatefulWidget {
  const CheckinScannerPage({super.key});

  @override
  State<CheckinScannerPage> createState() => _CheckinScannerPageState();
}

class _CheckinScannerPageState extends State<CheckinScannerPage> {
  MobileScannerController scannerController = MobileScannerController();
  bool _isProcessing = false;
  bool _torchEnabled = false;
  bool _isFrontCamera = false;
  String? _lastScannedCode;
  DateTime? _lastScanTime;

  @override
  void dispose() {
    scannerController.dispose();
    super.dispose();
  }

  Future<void> _processQRCode(String qrCode) async {
    // Prevent processing if already processing
    if (_isProcessing) return;

    // Prevent processing same QR code within 3 seconds
    final now = DateTime.now();
    if (_lastScannedCode == qrCode &&
        _lastScanTime != null &&
        now.difference(_lastScanTime!).inSeconds < 3) {
      print('[CheckinScanner] Ignoring duplicate QR code within 3 seconds');
      return;
    }

    setState(() {
      _isProcessing = true;
      _lastScannedCode = qrCode;
      _lastScanTime = now;
    });

    try {
      print('[CheckinScanner] Processing QR code: $qrCode');

      // Stop scanner temporarily to prevent continuous scanning
      await scannerController.stop();

      // Process QR code through API
      final result = await ApiService.processQRCode(qrCode);

      if (!mounted) return;

      // Show result dialog
      await _showResultDialog(result);
    } catch (e) {
      print('[CheckinScanner] Error processing QR code: $e');
      if (!mounted) return;

      _showErrorDialog(e.toString());
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });

        // Restart scanner after a short delay
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) {
            scannerController.start();
          }
        });
      }
    }
  }

  Future<void> _showResultDialog(Map<String, dynamic> result) async {
    final type = result['type'] as String? ?? 'unknown';
    final message = result['message'] as String? ?? 'Không có thông tin';
    final success = result['success'] as bool? ?? false;

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(
              success ? Icons.check_circle : Icons.error,
              color: success ? Colors.green : Colors.red,
            ),
            const SizedBox(width: 8),
            Text(success ? 'Thành công' : 'Lỗi'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (type == 'facility')
              const Text('Check-in tiện ích:')
            else if (type == 'event')
              const Text('Check-in sự kiện:')
            else
              const Text('Kết quả:'),
            const SizedBox(height: 8),
            Text(message),
            if (result['bookingId'] != null) ...[
              const SizedBox(height: 8),
              Text('ID: ${result['bookingId']}'),
            ],
            if (result['userName'] != null) ...[
              const SizedBox(height: 4),
              Text('Cư dân: ${result['userName']}'),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              if (success) {
                // Add delay before going back to allow user to see the success message
                await Future.delayed(const Duration(milliseconds: 500));
                if (mounted) {
                  Navigator.of(context).pop(); // Go back to previous page
                }
              }
            },
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String error) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.error, color: Colors.red),
            SizedBox(width: 8),
            Text('Lỗi'),
          ],
        ),
        content: Text(error),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quét QR Check-in'),
        actions: [
          IconButton(
            onPressed: () {
              setState(() {
                _torchEnabled = !_torchEnabled;
              });
              scannerController.toggleTorch();
            },
            icon: Icon(_torchEnabled ? Icons.flash_on : Icons.flash_off),
          ),
          IconButton(
            onPressed: () {
              setState(() {
                _isFrontCamera = !_isFrontCamera;
              });
              scannerController.switchCamera();
            },
            icon: Icon(_isFrontCamera ? Icons.camera_front : Icons.camera_rear),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: scannerController,
            onDetect: (capture) {
              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null) {
                  _processQRCode(barcode.rawValue!);
                  break;
                }
              }
            },
          ),

          // Scanning overlay
          Container(
            decoration: BoxDecoration(color: Colors.black.withOpacity(0.5)),
            child: Center(
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white, width: 2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.qr_code_scanner,
                        color: Colors.white,
                        size: 48,
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Đưa mã QR vào khung',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Processing overlay
          if (_isProcessing)
            Container(
              color: Colors.black.withOpacity(0.7),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircularProgressIndicator(color: Colors.white),
                    const SizedBox(height: 16),
                    const Text(
                      'Đang xử lý...',
                      style: TextStyle(color: Colors.white, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Scanner tạm dừng để tránh quét liên tục',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 12,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),

          // Instructions
          Positioned(
            bottom: 50,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Hướng dẫn:',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text(
                    '• Quét mã QR từ ứng dụng cư dân\n'
                    '• Đảm bảo mã QR rõ nét và trong khung\n'
                    '• Scanner sẽ tạm dừng 3 giây sau mỗi lần quét\n'
                    '• Hỗ trợ check-in tiện ích và sự kiện',
                    style: TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
