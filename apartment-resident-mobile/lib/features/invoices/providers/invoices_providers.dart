import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/invoices_api.dart';
import '../data/payments_api.dart';
import '../data/invoices_repository.dart';
import '../models/invoice.dart';
import '../models/payment.dart';

final invoicesApiProvider = Provider<InvoicesApiClient>((ref) {
  return InvoicesApiClient();
});

final paymentsApiProvider = Provider<PaymentsApiClient>((ref) {
  return PaymentsApiClient();
});

final invoicesRepositoryProvider = Provider<InvoicesRepository>((ref) {
  return InvoicesRepository(
    ref.watch(invoicesApiProvider),
    ref.watch(paymentsApiProvider),
  );
});

final myInvoicesProvider = FutureProvider<List<InvoiceModel>>((ref) async {
  final repository = ref.watch(invoicesRepositoryProvider);
  return repository.getMyInvoices();
});

final invoiceDetailProvider = FutureProvider.family<InvoiceModel, int>((
  ref,
  invoiceId,
) async {
  final repository = ref.watch(invoicesRepositoryProvider);
  return repository.getInvoiceDetail(invoiceId);
});

final invoicePaymentsProvider = FutureProvider.family<List<PaymentModel>, int>((
  ref,
  invoiceId,
) async {
  final repository = ref.watch(invoicesRepositoryProvider);
  return repository.getInvoicePayments(invoiceId);
});

final autoPaymentSettingsProvider =
    FutureProvider.family<Map<String, dynamic>?, int>((ref, invoiceId) async {
      final repository = ref.watch(invoicesRepositoryProvider);
      return repository.getAutoPaymentSettings(invoiceId);
    });

// Filter providers
final invoiceStatusFilterProvider = StateProvider<InvoiceStatus?>(
  (ref) => null,
);

final filteredInvoicesProvider = Provider<List<InvoiceModel>>((ref) {
  final invoicesAsync = ref.watch(myInvoicesProvider);
  final statusFilter = ref.watch(invoiceStatusFilterProvider);

  return invoicesAsync.when(
    data: (invoices) {
      final repository = ref.watch(invoicesRepositoryProvider);
      final filtered = repository.filterInvoicesByStatus(
        invoices,
        statusFilter,
      );
      return repository.sortInvoicesByDate(filtered);
    },
    loading: () => [],
    error: (_, __) => [],
  );
});
