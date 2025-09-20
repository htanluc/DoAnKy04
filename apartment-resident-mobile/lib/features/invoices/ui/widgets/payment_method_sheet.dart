import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/payment.dart';

class PaymentMethodSheet extends StatelessWidget {
  const PaymentMethodSheet({
    super.key,
    required this.invoiceId,
    required this.amount,
    required this.onPaymentMethodSelected,
  });

  final int invoiceId;
  final int amount;
  final Function(PaymentMethod) onPaymentMethodSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Title
          const Text(
            'Chọn phương thức thanh toán',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 8),

          Text(
            'Số tiền: ${_formatCurrency(amount)}',
            style: const TextStyle(fontSize: 16, color: Color(0xFF6B7280)),
          ),
          const SizedBox(height: 24),

          // Payment methods
          ..._buildPaymentMethods(context),

          const SizedBox(height: 24),

          // Cancel button
          SizedBox(
            width: double.infinity,
            child: TextButton(
              onPressed: () => Navigator.of(context).pop(),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: const BorderSide(color: Color(0xFFD1D5DB)),
                ),
              ),
              child: const Text(
                'Hủy',
                style: TextStyle(fontSize: 16, color: Color(0xFF6B7280)),
              ),
            ),
          ),

          // Safe area padding
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }

  List<Widget> _buildPaymentMethods(BuildContext context) {
    final methods = [
      _PaymentMethodData(
        method: PaymentMethod.momo,
        name: 'MoMo',
        description: 'Thanh toán qua ví MoMo',
        icon: Icons.account_balance_wallet,
        color: const Color(0xFFE91E63),
      ),
      _PaymentMethodData(
        method: PaymentMethod.vnpay,
        name: 'VNPay',
        description: 'Thanh toán qua VNPay',
        icon: Icons.payment,
        color: const Color(0xFF0066CC),
      ),
      _PaymentMethodData(
        method: PaymentMethod.zalopay,
        name: 'ZaloPay',
        description: 'Thanh toán qua ZaloPay',
        icon: Icons.mobile_friendly,
        color: const Color(0xFF0068FF),
      ),
      _PaymentMethodData(
        method: PaymentMethod.visa,
        name: 'Visa/Mastercard',
        description: 'Thanh toán qua thẻ quốc tế',
        icon: Icons.credit_card,
        color: const Color(0xFF1A1F71),
      ),
    ];

    return methods
        .map((methodData) => _buildPaymentMethodCard(context, methodData))
        .toList();
  }

  Widget _buildPaymentMethodCard(
    BuildContext context,
    _PaymentMethodData methodData,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.of(context).pop();
          onPaymentMethodSelected(methodData.method);
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFE5E7EB)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: methodData.color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(methodData.icon, color: methodData.color, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      methodData.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      methodData.description,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: Color(0xFF9CA3AF),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatCurrency(int amount) {
    return NumberFormat.currency(locale: 'vi_VN', symbol: 'đ').format(amount);
  }
}

class _PaymentMethodData {
  const _PaymentMethodData({
    required this.method,
    required this.name,
    required this.description,
    required this.icon,
    required this.color,
  });

  final PaymentMethod method;
  final String name;
  final String description;
  final IconData icon;
  final Color color;
}
