import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api/api_helper.dart';
import '../../core/payment/payment_helper.dart';

class _Invoice {
  _Invoice({
    required this.id,
    required this.billingPeriod,
    required this.totalAmount,
    required this.status,
  });
  final int id;
  final String billingPeriod;
  final num totalAmount;
  final String status;
}

class InvoicesPage extends StatelessWidget {
  const InvoicesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hóa đơn')),
      body: FutureBuilder<List<_Invoice>>(
        future: _fetchInvoices(),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Lỗi tải dữ liệu: ${snapshot.error}'));
          }
          final items = snapshot.data ?? const <_Invoice>[];
          if (items.isEmpty) {
            return const Center(child: Text('Chưa có hóa đơn'));
          }
          return SingleChildScrollView(
            child: Column(
              children: [
                for (int index = 0; index < items.length; index++) ...[
                  if (index > 0) const Divider(height: 1),
                  Builder(
                    builder: (context) {
                      final iv = items[index];
                      final isPaid = iv.status == 'PAID';
                      return ListTile(
                        title: Text('Kỳ: ${iv.billingPeriod}'),
                        subtitle: Text(
                          'Trạng thái: ${_statusLabel(iv.status)}',
                        ),
                        trailing: Text(_formatCurrency(iv.totalAmount)),
                        onTap: () => _onInvoiceTap(context, iv),
                        tileColor: isPaid ? Colors.green.shade50 : null,
                      );
                    },
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

Future<List<_Invoice>> _fetchInvoices() async {
  final resp = await ApiHelper.get('/api/invoices/my');
  final raw = jsonDecode(resp.body);
  final list = ApiHelper.extractList(raw);
  return list.whereType<Object>().map((e) {
    if (e is! Map) {
      return _Invoice(id: 0, billingPeriod: '', totalAmount: 0, status: '');
    }
    final m = Map<String, dynamic>.from(e);
    return _Invoice(
      id: ((m['id'] ?? m['invoiceId'] ?? 0) as num).toInt(),
      billingPeriod: (m['billingPeriod'] ?? m['period'] ?? '').toString(),
      totalAmount: (m['totalAmount'] ?? m['amount'] ?? 0) as num,
      status: (m['status'] ?? m['state'] ?? '').toString(),
    );
  }).toList();
}

String _formatCurrency(num amount) {
  return '${amount.toStringAsFixed(0)} đ';
}

String _statusLabel(String s) {
  switch (s) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'OVERDUE':
      return 'Quá hạn';
    case 'UNPAID':
    default:
      return 'Chưa thanh toán';
  }
}

Future<void> _onInvoiceTap(BuildContext context, _Invoice iv) async {
  if (iv.status == 'PAID') {
    await _showInvoiceDetail(context, iv.id);
  } else {
    await _showPaymentMethods(context, iv);
  }
}

Future<void> _showInvoiceDetail(BuildContext context, int invoiceId) async {
  Map<String, dynamic>? full;
  List<dynamic> items = const [];
  try {
    final resp = await ApiHelper.get('/api/invoices/$invoiceId');
    full = jsonDecode(resp.body);
    items = (full?['items'] as List?) ?? const [];
  } catch (_) {}
  if (!context.mounted) return;
  await showDialog(
    context: context,
    builder: (_) => AlertDialog(
      title: Text('Hóa đơn #$invoiceId'),
      content: SizedBox(
        width: 320,
        child: items.isEmpty
            ? const Text('Không có chi tiết mục phí')
            : Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (final it in items)
                    ListTile(
                      dense: true,
                      title: Text(
                        (it['description'] ?? it['feeType'] ?? '').toString(),
                      ),
                      trailing: Text(
                        _formatCurrency((it['amount'] ?? 0) as num),
                      ),
                    ),
                ],
              ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Đóng'),
        ),
      ],
    ),
  );
}

Future<void> _showPaymentMethods(BuildContext context, _Invoice iv) async {
  if (!context.mounted) return;
  await showModalBottomSheet(
    context: context,
    builder: (_) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            title: const Text('Chọn phương thức thanh toán'),
            dense: true,
          ),
          const Divider(height: 1),
          _PayItem(title: 'VNPay', onTap: () => _pay(context, iv, 'vnpay')),
          _PayItem(title: 'MoMo', onTap: () => _pay(context, iv, 'momo')),
          _PayItem(title: 'ZaloPay', onTap: () => _pay(context, iv, 'zalopay')),
          _PayItem(
            title: 'Visa/Mastercard',
            onTap: () => _pay(context, iv, 'visa'),
          ),
          const SizedBox(height: 8),
        ],
      ),
    ),
  );
}

class _PayItem extends StatelessWidget {
  const _PayItem({required this.title, required this.onTap});
  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(title),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: () {
        Navigator.of(context).pop();
        onTap();
      },
    );
  }
}

Future<void> _pay(BuildContext context, _Invoice iv, String method) async {
  try {
    late final String endpoint;
    late final Map<String, dynamic> requestData;

    // Return URL cho mobile app - sử dụng backend callback
    final returnUrl = PaymentHelper.getReturnUrl('invoice');

    switch (method) {
      case 'vnpay':
        endpoint = '/api/payments/vnpay';
        requestData = {
          'orderId': iv.id.toString(),
          'amount': iv.totalAmount,
          'orderInfo': 'Thanh toán hóa đơn ${iv.billingPeriod}',
          'returnUrl': returnUrl,
        };
        break;
      case 'momo':
        endpoint = '/api/payments/momo';
        requestData = {
          'invoiceId': iv.id,
          'amount': iv.totalAmount,
          'orderInfo': 'Thanh toán hóa đơn ${iv.billingPeriod}',
          'returnUrl': returnUrl,
        };
        break;
      case 'zalopay':
        endpoint = '/api/payments/zalopay';
        requestData = {
          'invoiceId': iv.id,
          'amount': iv.totalAmount,
          'orderInfo': 'Thanh toán hóa đơn ${iv.billingPeriod}',
          'returnUrl': returnUrl,
        };
        break;
      case 'visa':
        endpoint = '/api/payments/visa';
        requestData = {
          'invoiceId': iv.id,
          'amount': iv.totalAmount,
          'orderInfo': 'Thanh toán hóa đơn ${iv.billingPeriod}',
          'returnUrl': returnUrl,
        };
        break;
      default:
        return;
    }

    final resp = await ApiHelper.post(endpoint, data: requestData);
    final data = jsonDecode(resp.body);
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

// TODO: Invoices UI
