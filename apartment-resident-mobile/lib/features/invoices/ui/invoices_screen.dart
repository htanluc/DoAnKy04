import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/invoice.dart';
import '../providers/invoices_providers.dart';
import 'widgets/invoice_card.dart';
import 'invoice_detail_screen.dart';
import '../../dashboard/ui/widgets/main_scaffold.dart';

class InvoicesScreen extends ConsumerStatefulWidget {
  const InvoicesScreen({super.key});

  @override
  ConsumerState<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends ConsumerState<InvoicesScreen> {
  @override
  void initState() {
    super.initState();
    // Refresh data when screen loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.invalidate(myInvoicesProvider);
      ref.invalidate(filteredInvoicesProvider);
    });
  }

  @override
  Widget build(BuildContext context) {
    final filteredInvoices = ref.watch(filteredInvoicesProvider);
    final statusFilter = ref.watch(invoiceStatusFilterProvider);

    return MainScaffold(
      title: 'Hóa đơn',
      currentBottomNavIndex: 1, // Invoices tab
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myInvoicesProvider);
          ref.invalidate(filteredInvoicesProvider);
          // Wait for refresh to complete
          await ref.read(myInvoicesProvider.future);
        },
        child: Column(
          children: [
            // Filter chips
            Container(
              padding: const EdgeInsets.all(16),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _FilterChip(
                      label: 'Tất cả',
                      isSelected: statusFilter == null,
                      onTap: () =>
                          ref.read(invoiceStatusFilterProvider.notifier).state =
                              null,
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Chưa thanh toán',
                      isSelected: statusFilter == InvoiceStatus.unpaid,
                      onTap: () =>
                          ref.read(invoiceStatusFilterProvider.notifier).state =
                              InvoiceStatus.unpaid,
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Đã thanh toán',
                      isSelected: statusFilter == InvoiceStatus.paid,
                      onTap: () =>
                          ref.read(invoiceStatusFilterProvider.notifier).state =
                              InvoiceStatus.paid,
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Quá hạn',
                      isSelected: statusFilter == InvoiceStatus.overdue,
                      onTap: () =>
                          ref.read(invoiceStatusFilterProvider.notifier).state =
                              InvoiceStatus.overdue,
                    ),
                  ],
                ),
              ),
            ),

            // Invoices list
            Expanded(
              child: ref
                  .watch(myInvoicesProvider)
                  .when(
                    data: (invoices) {
                      if (filteredInvoices.isEmpty) {
                        return _buildEmptyState();
                      }
                      return RefreshIndicator(
                        onRefresh: () async {
                          ref.invalidate(myInvoicesProvider);
                          await ref.read(myInvoicesProvider.future);
                        },
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: filteredInvoices.length,
                          itemBuilder: (context, index) {
                            final invoice = filteredInvoices[index];
                            return InvoiceCard(
                              invoice: invoice,
                              onTap: () =>
                                  _navigateToDetail(context, invoice.id),
                            );
                          },
                        ),
                      );
                    },
                    loading: () =>
                        const Center(child: CircularProgressIndicator()),
                    error: (error, _) => _buildErrorState(context, ref, error),
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.receipt_long, size: 64, color: Color(0xFF9CA3AF)),
            const SizedBox(height: 16),
            const Text(
              'Không có hóa đơn nào',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Color(0xFF6B7280),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Chưa có hóa đơn nào được tìm thấy',
              style: TextStyle(fontSize: 14, color: Color(0xFF9CA3AF)),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, WidgetRef ref, Object error) {
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
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                ref.invalidate(myInvoicesProvider);
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Thử lại'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0066CC),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToDetail(BuildContext context, int invoiceId) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => InvoiceDetailScreen(invoiceId: invoiceId),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0066CC) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF0066CC)
                : const Color(0xFFD1D5DB),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : const Color(0xFF6B7280),
          ),
        ),
      ),
    );
  }
}
