import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../../models/booking.dart';

class BookingQRDialog extends StatelessWidget {
  final FacilityBooking booking;

  const BookingQRDialog({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(24),
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.8,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Success icon
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: Colors.green,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 32),
              ),

              const SizedBox(height: 16),

              // Success message
              const Text(
                'Đặt chỗ thành công!',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 8),

              Text(
                'Mã QR của bạn đã được tạo',
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              ),

              const SizedBox(height: 24),

              // Booking info
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  children: [
                    _buildInfoRow('Tiện ích:', booking.facilityName),
                    _buildInfoRow('Ngày:', _formatDate(booking.startTime)),
                    _buildInfoRow(
                      'Giờ:',
                      _formatTime(booking.startTime, booking.endTime),
                    ),
                    _buildInfoRow(
                      'Số người:',
                      '${booking.numberOfPeople} người',
                    ),
                    _buildInfoRow(
                      'Trạng thái:',
                      _getStatusText(booking.status),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // QR Code
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: SizedBox(
                  width: 200,
                  height: 200,
                  child: QrImageView(
                    data: _generateQRData(),
                    version: QrVersions.auto,
                    size: 200.0,
                    backgroundColor: Colors.white,
                  ),
                ),
              ),

              const SizedBox(height: 16),

              Text(
                'Quét mã QR này khi sử dụng tiện ích',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 24),

              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _copyBookingId(context),
                      icon: const Icon(Icons.copy, size: 18),
                      label: const Text('Copy ID'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _shareBooking(context),
                      icon: const Icon(Icons.share, size: 18),
                      label: const Text('Chia sẻ'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1976D2),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Close button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[200],
                    foregroundColor: Colors.grey[800],
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Đóng'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
          ),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 14))),
        ],
      ),
    );
  }

  String _generateQRData() {
    return 'FACILITY_BOOKING:${booking.id}:${booking.facilityId}:${booking.startTime}';
  }

  String _formatDate(String dateTimeString) {
    try {
      final date = DateTime.parse(dateTimeString);
      final weekdays = [
        'Chủ nhật',
        'Thứ hai',
        'Thứ ba',
        'Thứ tư',
        'Thứ năm',
        'Thứ sáu',
        'Thứ bảy',
      ];
      final months = [
        '',
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
      ];

      return '${weekdays[date.weekday % 7]}, ${date.day} ${months[date.month]} ${date.year}';
    } catch (e) {
      return dateTimeString;
    }
  }

  String _formatTime(String startTimeString, String endTimeString) {
    try {
      final start = DateTime.parse(startTimeString);
      final end = DateTime.parse(endTimeString);

      final startTime =
          '${start.hour.toString().padLeft(2, '0')}:${start.minute.toString().padLeft(2, '0')}';
      final endTime =
          '${end.hour.toString().padLeft(2, '0')}:${end.minute.toString().padLeft(2, '0')}';

      return '$startTime - $endTime';
    } catch (e) {
      return startTimeString;
    }
  }

  String _getStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'APPROVED':
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'REJECTED':
        return 'Từ chối';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  void _copyBookingId(BuildContext context) {
    Clipboard.setData(ClipboardData(text: booking.id.toString()));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã copy mã đặt chỗ'),
        duration: Duration(seconds: 2),
        backgroundColor: Color(0xFF1976D2),
      ),
    );
  }

  void _shareBooking(BuildContext context) {
    final shareText =
        '''
Đặt chỗ tiện ích thành công!

🏢 Tiện ích: ${booking.facilityName}
📅 Ngày: ${_formatDate(booking.startTime)}
⏰ Giờ: ${_formatTime(booking.startTime, booking.endTime)}
👥 Số người: ${booking.numberOfPeople}
📋 Mục đích: ${booking.purpose}
🆔 Mã đặt chỗ: ${booking.id}

Quét mã QR để xác nhận sử dụng tiện ích.
    ''';

    Share.share(shareText);
  }
}
