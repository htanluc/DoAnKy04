import 'package:flutter/material.dart';
import 'dart:convert';
import '../../core/api/api_helper.dart';
import '../../core/payment/payment_helper.dart';
import 'package:url_launcher/url_launcher.dart';

class _Booking {
  _Booking({
    required this.id,
    required this.facilityName,
    required this.startTime,
    required this.endTime,
    required this.status,
    required this.totalCost,
  });
  final String id;
  final String facilityName;
  final String startTime;
  final String endTime;
  final String status;
  final num totalCost;
}

class FacilityBookingsPage extends StatelessWidget {
  const FacilityBookingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đặt tiện ích')),
      body: FutureBuilder<List<_Booking>>(
        future: _fetchMyBookings(),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Lỗi tải dữ liệu: ${snapshot.error}'));
          }
          final list = snapshot.data ?? const <_Booking>[];
          if (list.isEmpty) return const Center(child: Text('Chưa có đặt chỗ'));
          return SingleChildScrollView(
            child: Column(
              children: [
                for (int index = 0; index < list.length; index++) ...[
                  if (index > 0) const Divider(height: 1),
                  Builder(
                    builder: (context) {
                      final b = list[index];
                      final actions = <Widget>[
                        Text(
                          _formatCurrency(b.totalCost),
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 4),
                        if (b.status != 'REJECTED')
                          OutlinedButton(
                            onPressed: () => _choosePayment(context, b),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                              ),
                            ),
                            child: const Text('Thanh toán'),
                          ),
                      ];
                      return ListTile(
                        title: Text(b.facilityName),
                        subtitle: Text(
                          '${_fmtDateTime(b.startTime)} - ${_fmtDateTime(b.endTime)}\nTrạng thái: ${b.status}',
                        ),
                        isThreeLine: true,
                        trailing: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: actions,
                        ),
                      );
                    },
                  ),
                ],
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          await showDialog(
            context: context,
            builder: (_) => const _CreateBookingDialog(),
          );
          if (context.mounted) {
            Navigator.of(context).pushReplacementNamed('/facility-bookings');
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

Future<List<_Booking>> _fetchMyBookings() async {
  final resp = await ApiHelper.get('/api/facility-bookings/my');
  final raw = jsonDecode(resp.body);
  final list = ApiHelper.extractList(raw);
  return list.whereType<Object>().map((e) {
    if (e is! Map)
      return _Booking(
        id: '',
        facilityName: '',
        startTime: '',
        endTime: '',
        status: '',
        totalCost: 0,
      );
    final m = Map<String, dynamic>.from(e);
    return _Booking(
      id: (m['id'] ?? m['bookingId'] ?? '').toString(),
      facilityName: (m['facilityName'] ?? m['facility']?['name'] ?? '')
          .toString(),
      startTime: (m['startTime'] ?? m['start'] ?? '').toString(),
      endTime: (m['endTime'] ?? m['end'] ?? '').toString(),
      status: (m['status'] ?? m['state'] ?? '').toString(),
      totalCost: (m['totalCost'] ?? m['amount'] ?? 0) as num,
    );
  }).toList();
}

String _fmtDateTime(String s) {
  return s;
}

String _formatCurrency(num amount) => '${amount.toStringAsFixed(0)} đ';

class _CreateBookingDialog extends StatefulWidget {
  const _CreateBookingDialog();

  @override
  State<_CreateBookingDialog> createState() => _CreateBookingDialogState();
}

class _CreateBookingDialogState extends State<_CreateBookingDialog> {
  final _facilityId = TextEditingController();
  final _date = TextEditingController();
  final _start = TextEditingController();
  final _end = TextEditingController();
  final _people = TextEditingController(text: '1');
  final _purpose = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final bookingTime = '${_date.text}T${_start.text}:00';
      final sh = int.tryParse(_start.text.split(':').first) ?? 0;
      final sm = int.tryParse(_start.text.split(':').last) ?? 0;
      final eh = int.tryParse(_end.text.split(':').first) ?? 0;
      final em = int.tryParse(_end.text.split(':').last) ?? 0;
      int duration = (eh * 60 + em) - (sh * 60 + sm);
      if (duration <= 0) duration += 24 * 60;

      await ApiHelper.post(
        '/api/facility-bookings',
        data: {
          'facilityId': int.tryParse(_facilityId.text.trim()) ?? 1,
          'bookingTime': bookingTime,
          'duration': duration,
          'numberOfPeople': int.tryParse(_people.text) ?? 1,
          'purpose': _purpose.text.trim(),
        },
      );
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (e) {
      setState(() => _error = 'Tạo booking thất bại');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Tạo đặt tiện ích nhanh'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
            TextField(
              controller: _facilityId,
              decoration: const InputDecoration(labelText: 'Facility ID'),
            ),
            TextField(
              controller: _date,
              decoration: const InputDecoration(labelText: 'Ngày (yyyy-MM-dd)'),
            ),
            TextField(
              controller: _start,
              decoration: const InputDecoration(labelText: 'Bắt đầu (HH:mm)'),
            ),
            TextField(
              controller: _end,
              decoration: const InputDecoration(labelText: 'Kết thúc (HH:mm)'),
            ),
            TextField(
              controller: _people,
              decoration: const InputDecoration(labelText: 'Số người'),
              keyboardType: TextInputType.number,
            ),
            TextField(
              controller: _purpose,
              decoration: const InputDecoration(labelText: 'Mục đích'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _loading ? null : () => Navigator.of(context).pop(false),
          child: const Text('Hủy'),
        ),
        FilledButton(
          onPressed: _loading ? null : _submit,
          child: _loading
              ? const SizedBox(
                  height: 16,
                  width: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Tạo'),
        ),
      ],
    );
  }
}

Future<void> _choosePayment(BuildContext context, _Booking b) async {
  if (!context.mounted) return;
  await showModalBottomSheet(
    context: context,
    builder: (_) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const ListTile(title: Text('Chọn cổng thanh toán'), dense: true),
          const Divider(height: 1),
          ListTile(
            title: const Text('VNPay'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              Navigator.of(context).pop();
              _payVNPayForBooking(context, b);
            },
          ),
          const SizedBox(height: 8),
        ],
      ),
    ),
  );
}

Future<void> _payVNPayForBooking(BuildContext context, _Booking b) async {
  try {
    // Return URL cho mobile app - sử dụng backend callback
    final returnUrl = PaymentHelper.getReturnUrl('facility_booking');

    // Bước 1: initiate payment cho facility booking
    final init = await ApiHelper.post(
      '/api/facility-bookings/${b.id}/initiate-payment',
      query: {'paymentMethod': 'vnpay'},
    );
    final info = jsonDecode(init.body);
    final orderId = info['orderId'];
    final amount = info['amount'] ?? b.totalCost;
    final orderInfo = info['orderInfo'] ?? 'Thanh toán đặt tiện ích';

    // Bước 2: gọi VNPay tạo URL với return URL phù hợp cho mobile
    final create = await ApiHelper.post(
      '/api/payments/vnpay',
      data: {
        'orderId': orderId,
        'amount': amount,
        'orderInfo': orderInfo,
        'returnUrl': returnUrl,
      },
    );
    final data = jsonDecode(create.body);
    final payUrl =
        (data['payUrl'] ?? data['data']?['payUrl'] ?? data['data']?['payurl'])
            ?.toString();
    if (payUrl == null || payUrl.isEmpty) return;
    final uri = Uri.parse(payUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);

      // Hiển thị thông báo chờ thanh toán
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đang chuyển hướng đến cổng thanh toán...'),
            duration: Duration(seconds: 3),
          ),
        );
      }
    }
  } catch (e) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi thanh toán: ${e.toString()}')),
      );
    }
  }
}

// TODO: Facility Bookings UI
