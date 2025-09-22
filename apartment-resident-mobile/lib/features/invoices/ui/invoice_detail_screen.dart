import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/invoice.dart';
import '../models/invoice_item.dart';
import '../models/payment.dart';
import '../providers/invoices_providers.dart';
import 'widgets/payment_method_sheet.dart';
import 'payment_webview_screen.dart';
import '../../dashboard/ui/widgets/main_scaffold.dart';

class InvoiceDetailScreen extends ConsumerStatefulWidget {
  const InvoiceDetailScreen({super.key, required this.invoiceId});

  final int invoiceId;

  @override
  ConsumerState<InvoiceDetailScreen> createState() =>
      _InvoiceDetailScreenState();
}

class _InvoiceDetailScreenState extends ConsumerState<InvoiceDetailScreen> {
  bool _isProcessingPayment = false;

  @override
  Widget build(BuildContext context) {
    final invoiceAsync = ref.watch(invoiceDetailProvider(widget.invoiceId));
    final paymentsAsync = ref.watch(invoicePaymentsProvider(widget.invoiceId));
    final autoPaymentAsync = ref.watch(
      autoPaymentSettingsProvider(widget.invoiceId),
    );

    return MainScaffold(
      title: 'Hóa đơn #${widget.invoiceId}',
      currentBottomNavIndex: 1,
      body: invoiceAsync.when(
        data: (invoice) =>
            _buildInvoiceDetail(invoice, paymentsAsync, autoPaymentAsync),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _buildErrorState(error),
      ),
    );
  }

  Widget _buildInvoiceDetail(
    InvoiceModel invoice,
    AsyncValue<List<PaymentModel>> paymentsAsync,
    AsyncValue<Map<String, dynamic>?> autoPaymentAsync,
  ) {
    final repository = ref.read(invoicesRepositoryProvider);
    final isOverdue = repository.isInvoiceOverdue(invoice);
    final statusText = repository.getInvoiceStatusDisplayName(invoice);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _getStatusColor(
                        invoice.status,
                        isOverdue,
                      ).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      _getStatusIcon(invoice.status, isOverdue),
                      color: _getStatusColor(invoice.status, isOverdue),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          statusText,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Kỳ ${invoice.billingPeriod}',
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF6B7280),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    _formatCurrency(invoice.totalAmount),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0066CC),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Invoice details
          _buildSectionCard(
            title: 'Thông tin hóa đơn',
            children: [
              _buildDetailRow('Mã hóa đơn', '#${invoice.id}'),
              _buildDetailRow('Căn hộ', '#${invoice.apartmentId}'),
              _buildDetailRow('Ngày phát hành', _formatDate(invoice.issueDate)),
              _buildDetailRow('Hạn thanh toán', _formatDate(invoice.dueDate)),
              if (invoice.remarks?.isNotEmpty == true)
                _buildDetailRow('Ghi chú', invoice.remarks!),
            ],
          ),

          const SizedBox(height: 16),

          // Invoice items
          _buildSectionCard(
            title: 'Chi tiết hóa đơn',
            children: [
              ...(invoice.items ?? []).map((item) => _buildInvoiceItem(item)),
              const Divider(),
              _buildDetailRow(
                'Tổng cộng',
                _formatCurrency(invoice.totalAmount),
                isTotal: true,
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Payment history
          _buildPaymentHistory(paymentsAsync),

          const SizedBox(height: 16),

          // Auto payment settings
          _buildAutoPaymentSettings(autoPaymentAsync),

          const SizedBox(height: 16),

          // Payment button
          if (invoice.status == InvoiceStatus.unpaid || isOverdue)
            _buildPaymentButton(invoice),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required List<Widget> children,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: const Color(0xFF6B7280),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: const Color(0xFF1F2937),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInvoiceItem(InvoiceItemModel item) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.description,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  item.feeType,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
          Text(
            _formatCurrency(item.amount),
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1F2937),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentHistory(AsyncValue<List<PaymentModel>> paymentsAsync) {
    return _buildSectionCard(
      title: 'Lịch sử thanh toán',
      children: [
        paymentsAsync.when(
          data: (payments) {
            if (payments.isEmpty) {
              return const Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'Chưa có giao dịch thanh toán nào',
                  style: TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
                  textAlign: TextAlign.center,
                ),
              );
            }
            return Column(
              children: payments
                  .map((payment) => _buildPaymentItem(payment))
                  .toList(),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Text('Lỗi: $error'),
        ),
      ],
    );
  }

  Widget _buildPaymentItem(PaymentModel payment) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: _getPaymentStatusColor(
                payment.status,
              ).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(
              _getPaymentMethodIcon(payment.method),
              color: _getPaymentStatusColor(payment.status),
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getPaymentMethodName(payment.method),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _formatDate(payment.createdAt ?? ''),
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _formatCurrency(payment.amount),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: _getPaymentStatusColor(payment.status),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _getPaymentStatusText(payment.status),
                  style: const TextStyle(
                    fontSize: 10,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAutoPaymentSettings(
    AsyncValue<Map<String, dynamic>?> autoPaymentAsync,
  ) {
    return _buildSectionCard(
      title: 'Thanh toán tự động',
      children: [
        autoPaymentAsync.when(
          data: (settings) {
            if (settings == null) {
              return const Text(
                'Chưa thiết lập thanh toán tự động',
                style: TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
              );
            }
            return Column(
              children: [
                _buildDetailRow('Phương thức', settings['method'] ?? ''),
                _buildDetailRow('Tài khoản', settings['bankAccount'] ?? ''),
                _buildDetailRow('Trạng thái', settings['status'] ?? ''),
              ],
            );
          },
          loading: () => const CircularProgressIndicator(),
          error: (error, _) => Text('Lỗi: $error'),
        ),
      ],
    );
  }

  Widget _buildPaymentButton(InvoiceModel invoice) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _isProcessingPayment
            ? null
            : () => _showPaymentMethodSheet(invoice),
        icon: _isProcessingPayment
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.payment),
        label: Text(_isProcessingPayment ? 'Đang xử lý...' : 'Thanh toán'),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF0066CC),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _buildErrorState(Object error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Color(0xFFEF4444)),
            const SizedBox(height: 16),
            const Text(
              'Không thể tải hóa đơn',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Color(0xFFEF4444),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  void _showPaymentMethodSheet(InvoiceModel invoice) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PaymentMethodSheet(
        invoiceId: invoice.id,
        amount: invoice.totalAmount,
        onPaymentMethodSelected: (method) => _handlePayment(method, invoice),
      ),
    );
  }

  Future<void> _handlePayment(
    PaymentMethod method,
    InvoiceModel invoice,
  ) async {
    setState(() {
      _isProcessingPayment = true;
    });

    try {
      final repository = ref.read(invoicesRepositoryProvider);
      final orderInfo =
          'Thanh toan hoa don #${invoice.id} - Ky ${invoice.billingPeriod}';

      final result = await repository.createPayment(
        method: method,
        invoiceId: invoice.id,
        amount: invoice.totalAmount,
        orderInfo: orderInfo,
      );

      if (result['paymentUrl'] != null) {
        // TODO: Implement WebView payment flow
        _showPaymentWebView(result['paymentUrl']);
      } else {
        _showError('Không thể tạo liên kết thanh toán');
      }
    } catch (e) {
      _showError('Lỗi thanh toán: $e');
    } finally {
      setState(() {
        _isProcessingPayment = false;
      });
    }
  }

  void _showPaymentWebView(String paymentUrl) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => PaymentWebViewScreen(
          paymentUrl: paymentUrl,
          onPaymentComplete: () => _handlePaymentSuccess(),
          onPaymentCancel: () => _handlePaymentCancel(),
          invoiceId: widget.invoiceId,
        ),
      ),
    );
  }

  void _handlePaymentSuccess() async {
    // Check if widget is still mounted
    if (!mounted) return;

    // Show success message first
    _showSuccess('Thanh toán thành công!');

    // Wait a bit for backend to process the payment
    await Future.delayed(const Duration(seconds: 2));

    // Check if widget is still mounted after delay
    if (!mounted) return;

    // Force refresh all invoice data
    try {
      ref.invalidate(invoiceDetailProvider(widget.invoiceId));
      ref.invalidate(invoicePaymentsProvider(widget.invoiceId));
      ref.invalidate(myInvoicesProvider);
      ref.invalidate(filteredInvoicesProvider);

      // Force rebuild the screen
      if (mounted) {
        setState(() {});
      }

      debugPrint('InvoiceDetail: Refreshed all data after payment success');
    } catch (e) {
      debugPrint('InvoiceDetail: Error refreshing data: $e');
    }
  }

  void _handlePaymentCancel() {
    _showError('Thanh toán đã bị hủy');
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color(0xFFEF4444),
      ),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color(0xFF10B981),
      ),
    );
  }

  Color _getStatusColor(InvoiceStatus status, bool isOverdue) {
    if (isOverdue || status == InvoiceStatus.overdue) {
      return const Color(0xFFEF4444);
    } else if (status == InvoiceStatus.paid) {
      return const Color(0xFF10B981);
    } else {
      return const Color(0xFFF59E0B);
    }
  }

  IconData _getStatusIcon(InvoiceStatus status, bool isOverdue) {
    if (isOverdue || status == InvoiceStatus.overdue) {
      return Icons.warning;
    } else if (status == InvoiceStatus.paid) {
      return Icons.check_circle;
    } else {
      return Icons.pending;
    }
  }

  Color _getPaymentStatusColor(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.success:
        return const Color(0xFF10B981);
      case PaymentStatus.failed:
        return const Color(0xFFEF4444);
      case PaymentStatus.pending:
        return const Color(0xFFF59E0B);
      case PaymentStatus.cancelled:
        return const Color(0xFF6B7280);
    }
  }

  IconData _getPaymentMethodIcon(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.momo:
        return Icons.account_balance_wallet;
      case PaymentMethod.vnpay:
        return Icons.payment;
      case PaymentMethod.zalopay:
        return Icons.mobile_friendly;
      case PaymentMethod.visa:
        return Icons.credit_card;
      default:
        return Icons.payment;
    }
  }

  String _getPaymentMethodName(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.momo:
        return 'MoMo';
      case PaymentMethod.vnpay:
        return 'VNPay';
      case PaymentMethod.zalopay:
        return 'ZaloPay';
      case PaymentMethod.visa:
        return 'Visa/Mastercard';
      default:
        return method.name;
    }
  }

  String _getPaymentStatusText(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.success:
        return 'Thành công';
      case PaymentStatus.failed:
        return 'Thất bại';
      case PaymentStatus.pending:
        return 'Chờ xử lý';
      case PaymentStatus.cancelled:
        return 'Đã hủy';
    }
  }

  String _formatCurrency(int amount) {
    return NumberFormat.currency(locale: 'vi_VN', symbol: 'đ').format(amount);
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('dd/MM/yyyy HH:mm').format(date);
    } catch (e) {
      return dateString;
    }
  }
}
