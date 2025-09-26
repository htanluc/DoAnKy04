import 'package:flutter/material.dart';
import '../../models/booking.dart';

class BookingCard extends StatelessWidget {
  final FacilityBooking booking;
  final VoidCallback? onTap;
  final VoidCallback? onCancel;
  final VoidCallback? onPayNow;

  const BookingCard({
    super.key,
    required this.booking,
    this.onTap,
    this.onCancel,
    this.onPayNow,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header với tên tiện ích và status badge
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          booking.facilityName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          booking.purpose ?? 'Không có mục đích',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildStatusBadge(booking.status),
                ],
              ),

              const SizedBox(height: 12),

              // Thông tin chi tiết
              Row(
                children: [
                  _buildInfoItem(
                    icon: Icons.calendar_today,
                    text: _formatDate(booking.startTime),
                    color: Colors.blue,
                  ),
                  const SizedBox(width: 16),
                  _buildInfoItem(
                    icon: Icons.schedule,
                    text: _formatTime(booking.startTime, booking.endTime),
                    color: Colors.green,
                  ),
                ],
              ),

              const SizedBox(height: 8),

              Row(
                children: [
                  _buildInfoItem(
                    icon: Icons.people,
                    text: '${booking.numberOfPeople} người',
                    color: Colors.orange,
                  ),
                  const SizedBox(width: 16),
                  _buildInfoItem(
                    icon: Icons.access_time,
                    text: _formatDuration(
                      _calculateDuration(booking.startTime, booking.endTime),
                    ),
                    color: Colors.blue,
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Action buttons
              _buildActionButtons(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String text,
    required Color color,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            text,
            style: TextStyle(fontSize: 14, color: Colors.grey[700]),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
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

      return '${weekdays[date.weekday % 7]}, ${date.day} ${months[date.month]}';
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
      return '$startTimeString - $endTimeString';
    }
  }

  int _calculateDuration(String startTime, String endTime) {
    try {
      final start = DateTime.parse(startTime);
      final end = DateTime.parse(endTime);
      return end.difference(start).inMinutes;
    } catch (e) {
      return 0;
    }
  }

  String _formatDuration(int durationMinutes) {
    if (durationMinutes < 60) {
      return '${durationMinutes} phút';
    } else {
      final hours = durationMinutes ~/ 60;
      final minutes = durationMinutes % 60;
      if (minutes == 0) {
        return '${hours} giờ';
      } else {
        return '${hours}h ${minutes}p';
      }
    }
  }

  Widget _buildActionButtons() {
    if (booking.status.toUpperCase() == 'PENDING') {
      // Booking đang chờ thanh toán - ẩn nút "Thanh toán ngay" theo yêu cầu
      return Row(
        children: [
          if (onCancel != null) ...[
            Expanded(
              child: OutlinedButton.icon(
                onPressed: onCancel,
                icon: const Icon(Icons.cancel, size: 18),
                label: const Text('Hủy'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Expanded(
            child: OutlinedButton.icon(
              onPressed: onTap,
              icon: const Icon(Icons.visibility, size: 18),
              label: const Text('Chi tiết'),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF1976D2),
                side: const BorderSide(color: Color(0xFF1976D2)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
        ],
      );
    } else if (booking.status.toUpperCase() == 'CONFIRMED') {
      // Booking đã thanh toán - hiển thị nút xem QR
      return Column(
        children: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onTap,
              icon: const Icon(Icons.qr_code, size: 18),
              label: const Text('📱 Xem mã QR check-in'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
          if (onCancel != null) ...[
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onCancel,
                icon: const Icon(Icons.cancel, size: 18),
                label: const Text('Hủy đặt chỗ'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
          ],
        ],
      );
    } else {
      // Các trạng thái khác - hiển thị nút xem chi tiết và hủy
      return Row(
        children: [
          if (booking.status.toUpperCase() == 'PENDING' &&
              onCancel != null) ...[
            Expanded(
              child: OutlinedButton.icon(
                onPressed: onCancel,
                icon: const Icon(Icons.cancel, size: 18),
                label: const Text('Hủy đặt chỗ'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: ElevatedButton.icon(
              onPressed: onTap,
              icon: const Icon(Icons.visibility, size: 18),
              label: const Text('Xem chi tiết'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1976D2),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
        ],
      );
    }
  }

  Widget _buildStatusBadge(String status) {
    String statusText;
    Color backgroundColor;
    Color textColor;
    IconData icon;

    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        statusText = 'Đã xác nhận';
        backgroundColor = Colors.green.shade100;
        textColor = Colors.green.shade700;
        icon = Icons.check_circle;
        break;
      case 'PENDING':
        statusText = 'Chờ thanh toán';
        backgroundColor = Colors.orange.shade100;
        textColor = Colors.orange.shade700;
        icon = Icons.payment;
        break;
      case 'APPROVED':
        statusText = 'Đã xác nhận';
        backgroundColor = Colors.blue.shade100;
        textColor = Colors.blue.shade700;
        icon = Icons.verified;
        break;
      case 'REJECTED':
        statusText = 'Từ chối';
        backgroundColor = Colors.red.shade100;
        textColor = Colors.red.shade700;
        icon = Icons.cancel;
        break;
      case 'CANCELLED':
        statusText = 'Đã hủy';
        backgroundColor = Colors.grey.shade100;
        textColor = Colors.grey.shade700;
        icon = Icons.block;
        break;
      default:
        statusText = 'Không xác định';
        backgroundColor = Colors.grey.shade100;
        textColor = Colors.grey.shade700;
        icon = Icons.help;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: textColor.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: textColor),
          const SizedBox(width: 4),
          Text(
            statusText,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
