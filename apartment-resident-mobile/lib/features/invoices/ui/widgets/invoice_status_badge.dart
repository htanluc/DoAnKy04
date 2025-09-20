import 'package:flutter/material.dart';
import '../../models/invoice.dart';
import '../../data/invoices_repository.dart';
import '../../data/invoices_api.dart';
import '../../data/payments_api.dart';

class InvoiceStatusBadge extends StatelessWidget {
  const InvoiceStatusBadge({super.key, required this.invoice, this.repository});

  final InvoiceModel invoice;
  final InvoicesRepository? repository;

  @override
  Widget build(BuildContext context) {
    final repo =
        repository ??
        InvoicesRepository(InvoicesApiClient(), PaymentsApiClient());
    final isOverdue = repo.isInvoiceOverdue(invoice);
    final statusText = repo.getInvoiceStatusDisplayName(invoice);

    Color backgroundColor;
    Color textColor;

    if (isOverdue || invoice.status == InvoiceStatus.overdue) {
      backgroundColor = const Color(0xFFEF4444); // Red
      textColor = Colors.white;
    } else if (invoice.status == InvoiceStatus.paid) {
      backgroundColor = const Color(0xFF10B981); // Green
      textColor = Colors.white;
    } else {
      backgroundColor = const Color(0xFFF59E0B); // Amber
      textColor = Colors.white;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        statusText,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
