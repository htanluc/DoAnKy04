import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../facilities/ui/facilities_screen.dart';
import '../facilities/providers/bookings_providers.dart';
import '../facilities/data/bookings_api.dart';
import '../facilities/models/booking.dart';
import '../facilities/ui/widgets/booking_card.dart';

class FacilityBookingsPage extends ConsumerStatefulWidget {
  const FacilityBookingsPage({super.key});

  @override
  ConsumerState<FacilityBookingsPage> createState() =>
      _FacilityBookingsPageState();
}

class _FacilityBookingsPageState extends ConsumerState<FacilityBookingsPage> {
  String _selectedFilter = 'Tất cả'; // Default filter

  @override
  void initState() {
    super.initState();
    // Auto-refresh khi vào trang để lấy dữ liệu mới nhất
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.invalidate(myBookingsProvider);
    });
  }

  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(myBookingsProvider);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Đặt chỗ của tôi',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1976D2), // FPT Blue
        elevation: 0,
        actions: [
          // Filter dropdown
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list, color: Colors.white),
            onSelected: (String value) {
              setState(() {
                _selectedFilter = value;
              });
            },
            itemBuilder: (BuildContext context) => [
              const PopupMenuItem(value: 'Tất cả', child: Text('Tất cả')),
              const PopupMenuItem(
                value: 'Chờ thanh toán',
                child: Text('Chờ thanh toán'),
              ),
              const PopupMenuItem(
                value: 'Đã xác nhận',
                child: Text('Đã xác nhận'),
              ),
              const PopupMenuItem(value: 'Đã hủy', child: Text('Đã hủy')),
              const PopupMenuItem(value: 'Từ chối', child: Text('Từ chối')),
            ],
          ),
          IconButton(
            onPressed: () => ref.invalidate(myBookingsProvider),
            icon: const Icon(Icons.refresh, color: Colors.white),
          ),
        ],
      ),
      body: bookingsAsync.when(
        loading: () => _buildLoadingState(),
        error: (error, stackTrace) =>
            _buildErrorState(context, ref, error.toString()),
        data: (bookings) => _buildBookingsList(context, ref, bookings),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _navigateToFacilities(context),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF1976D2),
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF1976D2)),
          ),
          SizedBox(height: 16),
          Text(
            'Đang tải danh sách đặt chỗ...',
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, WidgetRef ref, String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Lỗi tải dữ liệu',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                ref.invalidate(myBookingsProvider);
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Thử lại'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1976D2),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingsList(
    BuildContext context,
    WidgetRef ref,
    List<FacilityBooking> bookings,
  ) {
    // Áp dụng filter
    List<FacilityBooking> filteredBookings = _filterBookings(bookings);

    if (filteredBookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.calendar_today_outlined,
              size: 64,
              color: Colors.grey,
            ),
            const SizedBox(height: 16),
            Text(
              _selectedFilter == 'Tất cả'
                  ? 'Chưa có đặt chỗ nào'
                  : 'Không có đặt chỗ ${_selectedFilter.toLowerCase()}',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              _selectedFilter == 'Tất cả'
                  ? 'Hãy đặt tiện ích đầu tiên của bạn'
                  : 'Hãy thử chọn bộ lọc khác',
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => _navigateToFacilities(context),
              icon: const Icon(Icons.add),
              label: const Text('Đặt tiện ích'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1976D2),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myBookingsProvider);
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: filteredBookings.length,
        itemBuilder: (context, index) {
          final booking = filteredBookings[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: BookingCard(
              booking: booking,
              onTap: () => _showBookingDetails(context, ref, booking),
              onCancel: () => _cancelBooking(context, ref, booking),
              onPayNow: () => _payBooking(context, ref, booking),
            ),
          );
        },
      ),
    );
  }

  /// Filter bookings theo trạng thái được chọn
  List<FacilityBooking> _filterBookings(List<FacilityBooking> bookings) {
    if (_selectedFilter == 'Tất cả') {
      return bookings;
    }

    return bookings.where((booking) {
      switch (_selectedFilter) {
        case 'Chờ thanh toán':
          return booking.status.toUpperCase() == 'PENDING';
        case 'Đã xác nhận':
          return booking.status.toUpperCase() == 'CONFIRMED' ||
              booking.status.toUpperCase() == 'APPROVED';
        case 'Đã hủy':
          return booking.status.toUpperCase() == 'CANCELLED';
        case 'Từ chối':
          return booking.status.toUpperCase() == 'REJECTED';
        default:
          return true;
      }
    }).toList();
  }

  void _navigateToFacilities(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const FacilitiesScreen()),
    );
  }

  void _showBookingDetails(
    BuildContext context,
    WidgetRef ref,
    FacilityBooking booking,
  ) {
    if (booking.status.toUpperCase() == 'CONFIRMED' && booking.qrCode != null) {
      // Hiển thị QR code cho booking đã thanh toán
      _showQRCode(context, booking);
    } else {
      // Hiển thị chi tiết booking thông thường
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(booking.facilityName),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Ngày: ${_formatDate(booking.startTime)}'),
              Text(
                'Thời gian: ${_formatTime(booking.startTime, booking.endTime)}',
              ),
              Text('Số người: ${booking.numberOfPeople}'),
              Text('Mục đích: ${booking.purpose ?? 'Không có mục đích'}'),
              Text('Trạng thái: ${_getStatusText(booking.status)}'),
              if (booking.totalCost != null)
                Text('Chi phí: ${booking.totalCost!.toStringAsFixed(0)} VND'),
            ],
          ),
          actions: [
            if (booking.status.toUpperCase() == 'PENDING')
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _payBooking(context, ref, booking);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                child: const Text('💳 Thanh toán'),
              ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng'),
            ),
          ],
        ),
      );
    }
  }

  void _showQRCode(BuildContext context, FacilityBooking booking) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Mã QR - ${booking.facilityName}'),
        content: Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.6,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // QR Code
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: SizedBox(
                    width: 200,
                    height: 200,
                    child: booking.qrCode != null
                        ? QrImageView(
                            data: booking.qrCode!,
                            version: QrVersions.auto,
                            size: 200.0,
                          )
                        : const Icon(
                            Icons.qr_code,
                            size: 200,
                            color: Colors.grey,
                          ),
                  ),
                ),
                const SizedBox(height: 16),
                // Booking info
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    children: [
                      Text('Ngày: ${_formatDate(booking.startTime)}'),
                      Text(
                        'Thời gian: ${_formatTime(booking.startTime, booking.endTime)}',
                      ),
                      Text('Số người: ${booking.numberOfPeople}'),
                      if (booking.qrExpiresAt != null)
                        Text(
                          'Hết hạn: ${_formatDateTime(booking.qrExpiresAt!)}',
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              _shareQRCode(context, booking);
            },
            icon: const Icon(Icons.share),
            label: const Text('Chia sẻ'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _shareQRCode(BuildContext context, FacilityBooking booking) {
    final shareText =
        '''
Mã QR check-in tiện ích:

🏢 Tiện ích: ${booking.facilityName}
📅 Ngày: ${_formatDate(booking.startTime)}
⏰ Thời gian: ${_formatTime(booking.startTime, booking.endTime)}
👥 Số người: ${booking.numberOfPeople}
🆔 Mã đặt chỗ: ${booking.id}

Quét mã QR để check-in sử dụng tiện ích.
    ''';
    Share.share(shareText);
  }

  String _formatDateTime(String dateTimeString) {
    try {
      final dateTime = DateTime.parse(dateTimeString);
      return '${dateTime.day}/${dateTime.month}/${dateTime.year} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateTimeString;
    }
  }

  void _payBooking(
    BuildContext context,
    WidgetRef ref,
    FacilityBooking booking,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Thanh toán đặt chỗ'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tiện ích: ${booking.facilityName}'),
            Text('Ngày: ${_formatDate(booking.startTime)}'),
            Text(
              'Thời gian: ${_formatTime(booking.startTime, booking.endTime)}',
            ),
            Text('Số người: ${booking.numberOfPeople}'),
            const Divider(),
            Text(
              'Tổng chi phí: ${booking.totalCost?.toStringAsFixed(0) ?? '0'} VND',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: Colors.red,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              _processPayment(context, ref, booking);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('💳 Thanh toán'),
          ),
        ],
      ),
    );
  }

  void _processPayment(
    BuildContext context,
    WidgetRef ref,
    FacilityBooking booking,
  ) {
    // Hiển thị dialog thanh toán giả lập
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('🎉 Thanh toán thành công!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: 16),
            Text(
              'Số tiền: ${booking.totalCost?.toStringAsFixed(0) ?? '0'} VND',
            ),
            const SizedBox(height: 8),
            const Text(
              'Thanh toán giả lập thành công!\nMã QR check-in đã được tạo.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.green),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                // Gọi API để cập nhật payment status
                await _updatePaymentStatus(ref, booking);

                // Refresh bookings list
                ref.invalidate(myBookingsProvider);

                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Thanh toán thành công! Mã QR đã được tạo.',
                      ),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Lỗi cập nhật thanh toán: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('Xem mã QR'),
          ),
        ],
      ),
    );
  }

  Future<void> _updatePaymentStatus(
    WidgetRef ref,
    FacilityBooking booking,
  ) async {
    try {
      print('DEBUG: Updating payment for booking ID: ${booking.id}');
      print(
        'DEBUG: Booking details: ${booking.facilityName}, ${booking.startTime}',
      );

      // Gọi API để cập nhật payment status
      await BookingsApi.updatePaymentStatus(
        bookingId: booking.id,
        paymentStatus: 'PAID',
        paymentMethod: 'MOMO', // Thanh toán giả lập
        totalCost: booking.totalCost,
        transactionId: 'TXN_${DateTime.now().millisecondsSinceEpoch}',
      );

      // Refresh bookings list
      ref.invalidate(myBookingsProvider);
    } catch (e) {
      print('Error updating payment status: $e');
      rethrow;
    }
  }

  void _cancelBooking(
    BuildContext context,
    WidgetRef ref,
    FacilityBooking booking,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hủy đặt chỗ'),
        content: const Text('Bạn có chắc chắn muốn hủy đặt chỗ này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Không'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ref
                    .read(bookingsNotifierProvider.notifier)
                    .cancelBooking(booking.id);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Đã hủy đặt chỗ thành công'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Lỗi hủy đặt chỗ: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Có'),
          ),
        ],
      ),
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
      return '$startTimeString - $endTimeString';
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
}
