import 'package:flutter/material.dart';
import '../models/facility.dart';
import '../data/facilities_api.dart';

class FacilityBookingDialog extends StatefulWidget {
  final Facility facility;
  final VoidCallback onBookingSuccess;

  const FacilityBookingDialog({
    Key? key,
    required this.facility,
    required this.onBookingSuccess,
  }) : super(key: key);

  @override
  State<FacilityBookingDialog> createState() => _FacilityBookingDialogState();
}

class _FacilityBookingDialogState extends State<FacilityBookingDialog> {
  final _formKey = GlobalKey<FormState>();
  final _purposeController = TextEditingController();

  DateTime? _startTime;
  DateTime? _endTime;
  bool _isLoading = false;
  String? _errorMessage;
  String? _selectedPaymentMethod;

  @override
  void initState() {
    super.initState();
    _selectedPaymentMethod = 'VNPAY';
  }

  @override
  void dispose() {
    _purposeController.dispose();
    super.dispose();
  }

  double get _totalCost {
    if (_startTime == null || _endTime == null) return 0;
    final duration = _endTime!.difference(_startTime!);
    final hours = duration.inMinutes / 60.0;
    return widget.facility.usageFee * hours;
  }

  Future<void> _selectDateTime(bool isStartTime) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );

    if (date != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );

      if (time != null) {
        final dateTime = DateTime(
          date.year,
          date.month,
          date.day,
          time.hour,
          time.minute,
        );

        setState(() {
          if (isStartTime) {
            _startTime = dateTime;
            // Reset end time if it's before start time
            if (_endTime != null && _endTime!.isBefore(_startTime!)) {
              _endTime = null;
            }
          } else {
            _endTime = dateTime;
          }
        });
      }
    }
  }

  Future<void> _submitBooking() async {
    if (!_formKey.currentState!.validate()) return;
    if (_startTime == null || _endTime == null) {
      setState(() {
        _errorMessage = 'Vui lòng chọn thời gian bắt đầu và kết thúc';
      });
      return;
    }

    if (_endTime!.isBefore(_startTime!)) {
      setState(() {
        _errorMessage = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (_totalCost > 0) {
        // Có phí - tạo booking với trạng thái PENDING trước
        final bookingData = {
          'facilityId': widget.facility.id,
          'userId': 1, // TODO: Get from auth context
          'bookingTime': _startTime!.toIso8601String(),
          'duration': _endTime!.difference(_startTime!).inMinutes,
          'numberOfPeople': 1,
          'purpose': _purposeController.text.trim(),
          'paymentStatus': 'PENDING',
          'totalCost': _totalCost,
        };

        final booking = await FacilityBookingsApi.create(bookingData);

        // Tạo thanh toán
        final paymentResponse = await FacilityBookingsApi.createPayment(
          booking['id'],
          _selectedPaymentMethod!,
        );

        if (paymentResponse['paymentUrl'] != null) {
          // Mở URL thanh toán
          // TODO: Implement URL launcher
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Đang chuyển hướng đến trang thanh toán...'),
              backgroundColor: Colors.blue,
            ),
          );

          // Đóng dialog
          Navigator.of(context).pop();
          widget.onBookingSuccess();
          return;
        }
      } else {
        // Miễn phí - đặt trực tiếp
        final bookingData = {
          'facilityId': widget.facility.id,
          'userId': 1, // TODO: Get from auth context
          'bookingTime': _startTime!.toIso8601String(),
          'duration': _endTime!.difference(_startTime!).inMinutes,
          'numberOfPeople': 1,
          'purpose': _purposeController.text.trim(),
          'paymentStatus': 'PAID',
          'paymentMethod': 'FREE',
          'totalCost': 0,
        };

        await FacilityBookingsApi.create(bookingData);
      }

      // Thành công
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _totalCost > 0
                ? 'Đã tạo booking, vui lòng thanh toán'
                : 'Đặt tiện ích thành công',
          ),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.of(context).pop();
      widget.onBookingSuccess();
    } catch (e) {
      setState(() {
        _errorMessage = 'Lỗi: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        width: double.maxFinite,
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Đặt tiện ích: ${widget.facility.name}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),

              // Thời gian bắt đầu
              TextFormField(
                readOnly: true,
                decoration: InputDecoration(
                  labelText: 'Thời gian bắt đầu *',
                  suffixIcon: const Icon(Icons.calendar_today),
                  border: const OutlineInputBorder(),
                ),
                onTap: () => _selectDateTime(true),
                controller: TextEditingController(
                  text: _startTime != null
                      ? '${_startTime!.day}/${_startTime!.month}/${_startTime!.year} ${_startTime!.hour}:${_startTime!.minute.toString().padLeft(2, '0')}'
                      : '',
                ),
              ),
              const SizedBox(height: 16),

              // Thời gian kết thúc
              TextFormField(
                readOnly: true,
                decoration: InputDecoration(
                  labelText: 'Thời gian kết thúc *',
                  suffixIcon: const Icon(Icons.calendar_today),
                  border: const OutlineInputBorder(),
                ),
                onTap: () => _selectDateTime(false),
                controller: TextEditingController(
                  text: _endTime != null
                      ? '${_endTime!.day}/${_endTime!.month}/${_endTime!.year} ${_endTime!.hour}:${_endTime!.minute.toString().padLeft(2, '0')}'
                      : '',
                ),
              ),
              const SizedBox(height: 16),

              // Mục đích sử dụng
              TextFormField(
                controller: _purposeController,
                decoration: const InputDecoration(
                  labelText: 'Mục đích sử dụng *',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Vui lòng nhập mục đích sử dụng';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Thông tin phí
              if (_startTime != null && _endTime != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Thông tin thanh toán',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text('Phí sử dụng: ${_totalCost.toStringAsFixed(0)} VNĐ'),
                      Text(
                        'Thời gian: ${_endTime!.difference(_startTime!).inMinutes} phút',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Phương thức thanh toán (nếu có phí)
              if (_totalCost > 0) ...[
                const Text(
                  'Phương thức thanh toán',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedPaymentMethod,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'VNPAY', child: Text('VNPay')),
                    DropdownMenuItem(value: 'VISA', child: Text('Thẻ Visa')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedPaymentMethod = value;
                    });
                  },
                ),
                const SizedBox(height: 16),
              ],

              // Error message
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: Colors.red[200]!),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: TextStyle(color: Colors.red[700]),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Buttons
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: _isLoading
                          ? null
                          : () => Navigator.of(context).pop(),
                      child: const Text('Hủy'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _submitBooking,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1976D2),
                        foregroundColor: Colors.white,
                      ),
                      child: _isLoading
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
                          : Text(_totalCost > 0 ? 'Thanh toán' : 'Đặt chỗ'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
