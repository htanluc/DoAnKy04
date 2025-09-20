import '../models/invoice.dart';
import '../models/payment.dart';
import 'invoices_api.dart';
import 'payments_api.dart';

class InvoicesRepository {
  InvoicesRepository(this._invoicesApi, this._paymentsApi);

  final InvoicesApiClient _invoicesApi;
  final PaymentsApiClient _paymentsApi;

  Future<List<InvoiceModel>> getMyInvoices() => _invoicesApi.getMyInvoices();

  Future<InvoiceModel> getInvoiceDetail(int invoiceId) =>
      _invoicesApi.getInvoiceDetail(invoiceId);

  Future<List<PaymentModel>> getInvoicePayments(int invoiceId) =>
      _paymentsApi.getInvoicePayments(invoiceId);

  Future<Map<String, dynamic>> createPayment({
    required PaymentMethod method,
    required int invoiceId,
    required int amount,
    required String orderInfo,
  }) async {
    switch (method) {
      case PaymentMethod.momo:
        return _paymentsApi.createMomoPayment(
          invoiceId: invoiceId,
          amount: amount,
          orderInfo: orderInfo,
        );
      case PaymentMethod.vnpay:
        return _paymentsApi.createVNPayPayment(
          invoiceId: invoiceId,
          amount: amount,
          orderInfo: orderInfo,
        );
      case PaymentMethod.zalopay:
        return _paymentsApi.createZaloPayPayment(
          invoiceId: invoiceId,
          amount: amount,
          orderInfo: orderInfo,
        );
      case PaymentMethod.visa:
        return _paymentsApi.createVisaPayment(
          invoiceId: invoiceId,
          amount: amount,
          orderInfo: orderInfo,
        );
      default:
        throw Exception('Phương thức thanh toán không được hỗ trợ');
    }
  }

  // Auto-payment methods
  Future<Map<String, dynamic>> setupAutoPayment({
    required int invoiceId,
    required PaymentMethod method,
    required String bankAccount,
  }) => _paymentsApi.setupAutoPayment(
    invoiceId: invoiceId,
    method: method,
    bankAccount: bankAccount,
  );

  Future<void> cancelAutoPayment(int invoiceId) =>
      _paymentsApi.cancelAutoPayment(invoiceId);

  Future<Map<String, dynamic>?> getAutoPaymentSettings(int invoiceId) =>
      _paymentsApi.getAutoPaymentSettings(invoiceId);

  // Utility methods
  List<InvoiceModel> filterInvoicesByStatus(
    List<InvoiceModel> invoices,
    InvoiceStatus? status,
  ) {
    if (status == null) return invoices;
    return invoices.where((invoice) => invoice.status == status).toList();
  }

  List<InvoiceModel> sortInvoicesByDate(
    List<InvoiceModel> invoices, {
    bool ascending = false,
  }) {
    final sorted = List<InvoiceModel>.from(invoices);
    sorted.sort((a, b) {
      final dateA = DateTime.tryParse(a.issueDate) ?? DateTime(1970);
      final dateB = DateTime.tryParse(b.issueDate) ?? DateTime(1970);
      return ascending ? dateA.compareTo(dateB) : dateB.compareTo(dateA);
    });
    return sorted;
  }

  bool isInvoiceOverdue(InvoiceModel invoice) {
    final dueDate = DateTime.tryParse(invoice.dueDate);
    if (dueDate == null) return false;
    return DateTime.now().isAfter(dueDate) &&
        invoice.status == InvoiceStatus.unpaid;
  }

  String getInvoiceStatusDisplayName(InvoiceModel invoice) {
    if (isInvoiceOverdue(invoice)) return 'Quá hạn';
    switch (invoice.status) {
      case InvoiceStatus.unpaid:
        return 'Chưa thanh toán';
      case InvoiceStatus.paid:
        return 'Đã thanh toán';
      case InvoiceStatus.overdue:
        return 'Quá hạn';
    }
  }
}
