import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/facility.dart';
import '../../models/availability.dart';
import '../../models/booking.dart';
import '../../providers/bookings_providers.dart';

class BookingForm extends ConsumerStatefulWidget {
  final Facility facility;
  final String selectedDate;
  final List<TimeSlot> selectedTimeSlots;
  final Function(FacilityBooking) onBookingCreated;

  const BookingForm({
    super.key,
    required this.facility,
    required this.selectedDate,
    required this.selectedTimeSlots,
    required this.onBookingCreated,
  });

  @override
  ConsumerState<BookingForm> createState() => _BookingFormState();
}

class _BookingFormState extends ConsumerState<BookingForm> {
  final _formKey = GlobalKey<FormState>();
  final _purposeController = TextEditingController();
  final _numberOfPeopleController = TextEditingController(text: '1');

  int _numberOfPeople = 1;
  String _purpose = '';

  @override
  void dispose() {
    _purposeController.dispose();
    _numberOfPeopleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(bookingFormNotifierProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text(
                  'Đặt tiện ích',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Form content
          Expanded(
            child: Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Facility info
                    _buildInfoCard(),

                    const SizedBox(height: 24),

                    // Time info
                    _buildTimeInfoCard(),

                    const SizedBox(height: 24),

                    // Number of people
                    _buildNumberOfPeopleField(),

                    const SizedBox(height: 16),

                    // Purpose
                    _buildPurposeField(),

                    const SizedBox(height: 24),

                    // Error message
                    if (formState.error != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red[200]!),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.error_outline,
                              color: Colors.red[700],
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                formState.error!,
                                style: TextStyle(color: Colors.red[700]),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // Submit buttons
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Main booking button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: formState.isLoading ? null : _submitBooking,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1976D2),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: formState.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : const Text(
                            'Xác nhận đặt chỗ',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),

                const SizedBox(height: 12),

                // Quick payment button (for testing)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: formState.isLoading ? null : _quickPayment,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      '🎭 Thanh toán nhanh (Test)',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Safe area padding
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Thông tin tiện ích',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.location_on, color: Colors.grey[600], size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.facility.name,
                    style: const TextStyle(fontSize: 16),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.people, color: Colors.grey[600], size: 20),
                const SizedBox(width: 8),
                Text(
                  'Sức chứa: ${widget.facility.capacity} người',
                  style: const TextStyle(fontSize: 14),
                ),
              ],
            ),
            if (widget.facility.usageFee > 0) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.attach_money, color: Colors.grey[600], size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Phí sử dụng: ${widget.facility.usageFee.toStringAsFixed(0)} VNĐ',
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTimeInfoCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Thời gian đặt chỗ',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.calendar_today, color: Colors.grey[600], size: 20),
                const SizedBox(width: 8),
                Text(
                  _formatDate(widget.selectedDate),
                  style: const TextStyle(fontSize: 16),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.schedule, color: Colors.grey[600], size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: widget.selectedTimeSlots.isNotEmpty
                      ? Text(
                          '${_formatTime(widget.selectedTimeSlots.first.startTime)} - ${_formatTime(widget.selectedTimeSlots.last.endTime)}',
                          style: const TextStyle(fontSize: 16),
                        )
                      : const Text(
                          'Chưa chọn khung giờ',
                          style: TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                ),
              ],
            ),
            if (widget.selectedTimeSlots.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.timer, color: Colors.grey[600], size: 20),
                  const SizedBox(width: 8),
                  Text(
                    '${widget.selectedTimeSlots.length} khung giờ (${widget.selectedTimeSlots.length} giờ)',
                    style: const TextStyle(fontSize: 14, color: Colors.blue),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.attach_money, color: Colors.grey[600], size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Tổng chi phí: ${(widget.selectedTimeSlots.length * widget.facility.usageFee).toStringAsFixed(0)} VND',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildNumberOfPeopleField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Số người *',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _numberOfPeopleController,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            hintText: 'Nhập số người',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            prefixIcon: const Icon(Icons.people),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Vui lòng nhập số người';
            }
            final number = int.tryParse(value);
            if (number == null || number <= 0) {
              return 'Số người phải lớn hơn 0';
            }
            if (number > widget.facility.capacity) {
              return 'Số người không được vượt quá sức chứa (${widget.facility.capacity})';
            }
            return null;
          },
          onChanged: (value) {
            setState(() {
              _numberOfPeople = int.tryParse(value) ?? 1;
            });
          },
        ),
      ],
    );
  }

  Widget _buildPurposeField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Mục đích sử dụng *',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _purposeController,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Mô tả mục đích sử dụng tiện ích...',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            prefixIcon: const Icon(Icons.description),
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return 'Vui lòng nhập mục đích sử dụng';
            }
            return null;
          },
          onChanged: (value) {
            setState(() {
              _purpose = value.trim();
            });
          },
        ),
      ],
    );
  }

  Future<void> _submitBooking() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (widget.selectedTimeSlots.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chọn ít nhất một khung giờ'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Tính toán thông tin booking
    final totalCost =
        widget.selectedTimeSlots.length * widget.facility.usageFee;

    // Hiển thị thông tin booking và redirect đến payment
    _showBookingConfirmation(totalCost);
  }

  void _showBookingConfirmation(double totalCost) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận đặt chỗ'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tiện ích: ${widget.facility.name}'),
            Text('Ngày: ${_formatDate(widget.selectedDate)}'),
            Text(
              'Thời gian: ${_formatTime(widget.selectedTimeSlots.first.startTime)} - ${_formatTime(widget.selectedTimeSlots.last.endTime)}',
            ),
            Text('Số khung giờ: ${widget.selectedTimeSlots.length}'),
            Text('Số người: ${_numberOfPeople}'),
            Text('Mục đích: ${_purpose}'),
            const Divider(),
            Text(
              'Tổng chi phí: ${totalCost.toStringAsFixed(0)} VND',
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
            onPressed: () {
              Navigator.pop(context);
              _proceedToPayment(totalCost.toDouble());
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('Thanh toán'),
          ),
        ],
      ),
    );
  }

  void _quickPayment() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (widget.selectedTimeSlots.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chọn ít nhất một khung giờ'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Tính toán thông tin booking
    final totalCost =
        widget.selectedTimeSlots.length * widget.facility.usageFee;

    // Thanh toán nhanh - bỏ qua payment dialog
    _showMockPaymentSuccess(totalCost, 'MOCK');
  }

  void _proceedToPayment(double totalCost) {
    // Hiển thị payment options dialog
    _showPaymentOptions(totalCost);
  }

  void _showPaymentOptions(double totalCost) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Chọn phương thức thanh toán'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Tổng số tiền: ${totalCost.toStringAsFixed(0)} VND',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 20),
            const Text('Chọn phương thức thanh toán:'),
            const SizedBox(height: 16),
            // Payment method buttons
            _buildPaymentMethodButton(
              context,
              '💳 Thẻ ATM/Visa/Mastercard',
              'VISA',
              Colors.blue,
              () => _processPayment(totalCost, 'VISA'),
            ),
            const SizedBox(height: 12),
            _buildPaymentMethodButton(
              context,
              '🏦 Chuyển khoản ngân hàng',
              'BANK_TRANSFER',
              Colors.green,
              () => _processPayment(totalCost, 'BANK_TRANSFER'),
            ),
            const SizedBox(height: 12),
            _buildPaymentMethodButton(
              context,
              '💰 Ví điện tử (Momo, ZaloPay)',
              'MOMO',
              Colors.orange,
              () => _processPayment(totalCost, 'MOMO'),
            ),
            const SizedBox(height: 12),
            _buildPaymentMethodButton(
              context,
              '🎭 Thanh toán giả lập (Test)',
              'MOMO',
              Colors.purple,
              () => _processPayment(totalCost, 'MOMO'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodButton(
    BuildContext context,
    String title,
    String method,
    Color color,
    VoidCallback onPressed,
  ) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: Text(title, style: const TextStyle(fontSize: 14)),
      ),
    );
  }

  void _processPayment(double totalCost, String method) {
    Navigator.pop(context); // Close payment options dialog

    if (method == 'MOCK') {
      // Thanh toán giả lập - thành công ngay lập tức
      _showMockPaymentSuccess(totalCost, method);
    } else {
      // Các phương thức thanh toán thực tế - hiển thị loading
      _showRealPaymentProcessing(totalCost, method);
    }
  }

  void _showRealPaymentProcessing(double totalCost, String method) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Đang xử lý thanh toán'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text('Đang xử lý thanh toán ${_getPaymentMethodName(method)}...'),
            const SizedBox(height: 8),
            Text('Số tiền: ${totalCost.toStringAsFixed(0)} VND'),
          ],
        ),
      ),
    );

    // Simulate payment processing time
    Future.delayed(const Duration(seconds: 3), () {
      Navigator.pop(context); // Close processing dialog
      _showPaymentResult(totalCost, method, true); // Assume success
    });
  }

  void _showMockPaymentSuccess(double totalCost, String method) {
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
            Text('Phương thức: ${_getPaymentMethodName(method)}'),
            Text('Số tiền: ${totalCost.toStringAsFixed(0)} VND'),
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
            onPressed: () {
              Navigator.pop(context);
              _createBookingAfterPayment();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('Tạo mã QR check-in'),
          ),
        ],
      ),
    );
  }

  void _showPaymentResult(double totalCost, String method, bool success) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text(
          success ? '✅ Thanh toán thành công!' : '❌ Thanh toán thất bại!',
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              success ? Icons.check_circle : Icons.error,
              color: success ? Colors.green : Colors.red,
              size: 48,
            ),
            const SizedBox(height: 16),
            Text('Phương thức: ${_getPaymentMethodName(method)}'),
            Text('Số tiền: ${totalCost.toStringAsFixed(0)} VND'),
            const SizedBox(height: 8),
            Text(
              success
                  ? 'Thanh toán thành công!\nĐang chuyển về trang đặt chỗ...'
                  : 'Thanh toán thất bại!\nVui lòng thử lại.',
              textAlign: TextAlign.center,
              style: TextStyle(color: success ? Colors.green : Colors.red),
            ),
          ],
        ),
        actions: [
          if (success)
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _createBookingAfterPayment();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
              ),
              child: const Text('Xem đặt chỗ của tôi'),
            )
          else
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: const Text('Thử lại'),
            ),
        ],
      ),
    );
  }

  String _getPaymentMethodName(String method) {
    switch (method) {
      case 'VISA':
        return 'Thẻ ATM/Visa/Mastercard';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      case 'MOMO':
        return 'Ví điện tử';
      case 'MOCK':
        return 'Thanh toán giả lập';
      default:
        return 'Phương thức khác';
    }
  }

  Future<void> _createBookingAfterPayment() async {
    try {
      final startTime = widget.selectedTimeSlots.first.startTime;
      final totalDuration = widget.selectedTimeSlots.length * 60;

      final request = FacilityBookingCreateRequest(
        facilityId: widget.facility.id,
        userId: 1, // TODO: Get from auth context
        bookingTime: startTime,
        duration: totalDuration,
        numberOfPeople: _numberOfPeople,
        purpose: _purpose,
        paymentStatus: 'PAID', // Đánh dấu đã thanh toán
        paymentMethod: 'MOMO', // Thanh toán giả lập
        totalCost: widget.selectedTimeSlots.length * widget.facility.usageFee,
      );

      // Reset form state
      ref.read(bookingFormNotifierProvider.notifier).reset();

      // Update form with request data
      ref.read(bookingFormNotifierProvider.notifier).updateRequest(request);

      // Create booking
      final booking = await ref
          .read(bookingFormNotifierProvider.notifier)
          .createBooking();

      if (booking != null) {
        // Refresh bookings list để hiển thị trạng thái mới
        ref.invalidate(bookingsNotifierProvider);

        // Show success message
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đặt chỗ thành công! Mã QR đã được tạo.'),
              backgroundColor: Colors.green,
            ),
          );

          // Sau khi thanh toán thành công, trở về trang bookings
          Navigator.popUntil(context, (route) => route.isFirst);
          Navigator.pushNamed(context, '/facility-bookings');
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lỗi tạo booking: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
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
      return dateString;
    }
  }

  String _formatTime(String timeString) {
    try {
      final time = DateTime.parse(timeString);
      return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return timeString;
    }
  }
}
