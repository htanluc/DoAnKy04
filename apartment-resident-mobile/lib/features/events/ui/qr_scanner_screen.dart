import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../providers/events_providers.dart';

class QrScannerScreen extends ConsumerStatefulWidget {
  const QrScannerScreen({super.key});

  @override
  ConsumerState<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends ConsumerState<QrScannerScreen> {
  MobileScannerController cameraController = MobileScannerController();
  bool isScanning = true;

  @override
  void dispose() {
    cameraController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quét QR Code Check-in'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_off, color: Colors.grey),
            onPressed: () => cameraController.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.camera_rear),
            onPressed: () => cameraController.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Camera view
          MobileScanner(controller: cameraController, onDetect: _onDetect),

          // Overlay with scanning area
          _buildScanningOverlay(),

          // Instructions
          Positioned(
            bottom: 100,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.qr_code_scanner, color: Colors.white, size: 32),
                  const SizedBox(height: 8),
                  const Text(
                    'Đặt QR code vào khung quét',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Đảm bảo QR code rõ nét và đủ ánh sáng',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 14,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScanningOverlay() {
    return Container(
      decoration: ShapeDecoration(
        shape: QrScannerOverlayShape(
          borderColor: Colors.blue,
          borderRadius: 10,
          borderLength: 30,
          borderWidth: 10,
          cutOutSize: 250,
        ),
      ),
    );
  }

  void _onDetect(BarcodeCapture capture) {
    if (!isScanning) return;

    final List<Barcode> barcodes = capture.barcodes;

    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        _processQrCode(barcode.rawValue!);
        break;
      }
    }
  }

  void _processQrCode(String qrCode) {
    setState(() {
      isScanning = false;
    });

    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Đang xử lý QR code...'),
          ],
        ),
      ),
    );

    // Process QR code with API
    ref
        .read(eventsProvider.notifier)
        .checkInWithQrCode(qrCode)
        .then((_) {
          if (!mounted) return;
          Navigator.of(context).pop(); // Close loading dialog

          // Show success dialog
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.green),
                  SizedBox(width: 8),
                  Text('Check-in thành công'),
                ],
              ),
              content: const Text('Bạn đã check-in thành công vào sự kiện!'),
              actions: [
                FilledButton(
                  onPressed: () {
                    Navigator.of(context).pop(); // Close success dialog
                    Navigator.of(context).pop(); // Go back to previous screen
                  },
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        })
        .catchError((error) {
          if (!mounted) return;
          Navigator.of(context).pop(); // Close loading dialog

          // Show error dialog
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Row(
                children: [
                  Icon(Icons.error, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Lỗi check-in'),
                ],
              ),
              content: Text('Không thể check-in: ${error.toString()}'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop(); // Close error dialog
                    setState(() {
                      isScanning = true;
                    });
                  },
                  child: const Text('Thử lại'),
                ),
                FilledButton(
                  onPressed: () {
                    Navigator.of(context).pop(); // Close error dialog
                    Navigator.of(context).pop(); // Go back to previous screen
                  },
                  child: const Text('Đóng'),
                ),
              ],
            ),
          );
        });
  }
}

class QrScannerOverlayShape extends ShapeBorder {
  const QrScannerOverlayShape({
    this.borderColor = Colors.red,
    this.borderWidth = 3.0,
    this.overlayColor = const Color.fromRGBO(0, 0, 0, 80),
    this.borderRadius = 0,
    this.borderLength = 40,
    double? cutOutSize,
    this.cutOutBottomOffset = 0,
  }) : cutOutSize = cutOutSize ?? 250;

  final Color borderColor;
  final double borderWidth;
  final Color overlayColor;
  final double borderRadius;
  final double borderLength;
  final double cutOutSize;
  final double cutOutBottomOffset;

  @override
  EdgeInsetsGeometry get dimensions => const EdgeInsets.all(10);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) {
    return Path()
      ..fillType = PathFillType.evenOdd
      ..addPath(getOuterPath(rect), Offset.zero);
  }

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    Path getLeftTopPath(Rect rect) {
      return Path()
        ..moveTo(rect.left, rect.bottom)
        ..lineTo(rect.left, rect.top + borderRadius)
        ..quadraticBezierTo(
          rect.left,
          rect.top,
          rect.left + borderRadius,
          rect.top,
        )
        ..lineTo(rect.right, rect.top);
    }

    return getLeftTopPath(rect)
      ..lineTo(rect.right, rect.bottom)
      ..lineTo(rect.left, rect.bottom)
      ..lineTo(rect.left, rect.top);
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final width = rect.width;
    final height = rect.height;
    final borderOffset = borderWidth / 2;
    final cutOutWidth = cutOutSize < width ? cutOutSize : width - borderOffset;
    final cutOutHeight = cutOutSize < height
        ? cutOutSize
        : height - borderOffset;

    final backgroundPaint = Paint()
      ..color = overlayColor
      ..style = PaintingStyle.fill;

    final cutOutRect = Rect.fromLTWH(
      rect.left + width / 2 - cutOutWidth / 2 + borderOffset,
      rect.top + height / 2 - cutOutHeight / 2 + borderOffset,
      cutOutWidth - borderOffset * 2,
      cutOutHeight - borderOffset * 2,
    );

    canvas
      ..saveLayer(rect, backgroundPaint)
      ..drawRect(rect, backgroundPaint)
      ..drawRRect(
        RRect.fromRectAndRadius(cutOutRect, Radius.circular(borderRadius)),
        Paint()..blendMode = BlendMode.clear,
      )
      ..restore();

    // Draw border
    _drawBorder(canvas, cutOutRect);
  }

  void _drawBorder(Canvas canvas, Rect cutOutRect) {
    final path = Path();

    // Top left
    path.moveTo(
      cutOutRect.left - borderWidth / 2,
      cutOutRect.top + borderLength,
    );
    path.lineTo(
      cutOutRect.left - borderWidth / 2,
      cutOutRect.top + borderRadius,
    );
    path.quadraticBezierTo(
      cutOutRect.left - borderWidth / 2,
      cutOutRect.top - borderWidth / 2,
      cutOutRect.left + borderRadius,
      cutOutRect.top - borderWidth / 2,
    );
    path.lineTo(
      cutOutRect.left + borderLength,
      cutOutRect.top - borderWidth / 2,
    );

    // Top right
    path.moveTo(
      cutOutRect.right + borderWidth / 2,
      cutOutRect.top + borderLength,
    );
    path.lineTo(
      cutOutRect.right + borderWidth / 2,
      cutOutRect.top + borderRadius,
    );
    path.quadraticBezierTo(
      cutOutRect.right + borderWidth / 2,
      cutOutRect.top - borderWidth / 2,
      cutOutRect.right - borderRadius,
      cutOutRect.top - borderWidth / 2,
    );
    path.lineTo(
      cutOutRect.right - borderLength,
      cutOutRect.top - borderWidth / 2,
    );

    // Bottom left
    path.moveTo(
      cutOutRect.left - borderWidth / 2,
      cutOutRect.bottom - borderLength,
    );
    path.lineTo(
      cutOutRect.left - borderWidth / 2,
      cutOutRect.bottom - borderRadius,
    );
    path.quadraticBezierTo(
      cutOutRect.left - borderWidth / 2,
      cutOutRect.bottom + borderWidth / 2,
      cutOutRect.left + borderRadius,
      cutOutRect.bottom + borderWidth / 2,
    );
    path.lineTo(
      cutOutRect.left + borderLength,
      cutOutRect.bottom + borderWidth / 2,
    );

    // Bottom right
    path.moveTo(
      cutOutRect.right + borderWidth / 2,
      cutOutRect.bottom - borderLength,
    );
    path.lineTo(
      cutOutRect.right + borderWidth / 2,
      cutOutRect.bottom - borderRadius,
    );
    path.quadraticBezierTo(
      cutOutRect.right + borderWidth / 2,
      cutOutRect.bottom + borderWidth / 2,
      cutOutRect.right - borderRadius,
      cutOutRect.bottom + borderWidth / 2,
    );
    path.lineTo(
      cutOutRect.right - borderLength,
      cutOutRect.bottom + borderWidth / 2,
    );

    canvas.drawPath(
      path,
      Paint()
        ..color = borderColor
        ..strokeWidth = borderWidth
        ..style = PaintingStyle.stroke,
    );
  }

  @override
  ShapeBorder scale(double t) {
    return QrScannerOverlayShape(
      borderColor: borderColor,
      borderWidth: borderWidth,
      overlayColor: overlayColor,
    );
  }
}
