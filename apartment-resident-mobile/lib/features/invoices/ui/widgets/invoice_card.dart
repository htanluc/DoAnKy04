import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/invoice.dart';
import '../../data/invoices_repository.dart';
import '../../data/invoices_api.dart';
import '../../data/payments_api.dart';
import 'invoice_status_badge.dart';

class InvoiceCard extends StatelessWidget {
  const InvoiceCard({
    super.key,
    required this.invoice,
    this.repository,
    this.onTap,
  });

  final InvoiceModel invoice;
  final InvoicesRepository? repository;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final repo =
        repository ??
        InvoicesRepository(InvoicesApiClient(), PaymentsApiClient());
    final isOverdue = repo.isInvoiceOverdue(invoice);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isOverdue
            ? const BorderSide(color: Color(0xFFEF4444), width: 1)
            : BorderSide.none,
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hóa đơn #${invoice.id}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1F2937),
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
                  InvoiceStatusBadge(invoice: invoice, repository: repo),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _InfoItem(
                      icon: Icons.calendar_today,
                      label: 'Ngày phát hành',
                      value: _formatDate(invoice.issueDate),
                    ),
                  ),
                  Expanded(
                    child: _InfoItem(
                      icon: Icons.schedule,
                      label: 'Hạn thanh toán',
                      value: _formatDate(invoice.dueDate),
                      isOverdue: isOverdue,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _InfoItem(
                      icon: Icons.attach_money,
                      label: 'Tổng tiền',
                      value: _formatCurrency(invoice.totalAmount),
                      isAmount: true,
                    ),
                  ),
                  if (invoice.remarks?.isNotEmpty == true)
                    Expanded(
                      child: _InfoItem(
                        icon: Icons.note,
                        label: 'Ghi chú',
                        value: invoice.remarks!,
                        maxLines: 2,
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

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      return dateString;
    }
  }

  String _formatCurrency(int amount) {
    return NumberFormat.currency(locale: 'vi_VN', symbol: 'đ').format(amount);
  }
}

class _InfoItem extends StatelessWidget {
  const _InfoItem({
    required this.icon,
    required this.label,
    required this.value,
    this.isOverdue = false,
    this.isAmount = false,
    this.maxLines = 1,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool isOverdue;
  final bool isAmount;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              icon,
              size: 14,
              color: isOverdue
                  ? const Color(0xFFEF4444)
                  : const Color(0xFF6B7280),
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isOverdue
                    ? const Color(0xFFEF4444)
                    : const Color(0xFF6B7280),
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: isAmount ? 14 : 13,
            fontWeight: isAmount ? FontWeight.w600 : FontWeight.normal,
            color: isOverdue
                ? const Color(0xFFEF4444)
                : const Color(0xFF1F2937),
          ),
          maxLines: maxLines,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
