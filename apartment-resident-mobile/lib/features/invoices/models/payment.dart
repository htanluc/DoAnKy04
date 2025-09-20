import 'package:freezed_annotation/freezed_annotation.dart';

part 'payment.freezed.dart';
part 'payment.g.dart';

enum PaymentMethod {
  @JsonValue('CASH')
  cash,
  @JsonValue('BANK_TRANSFER')
  bankTransfer,
  @JsonValue('MOMO')
  momo,
  @JsonValue('VNPAY')
  vnpay,
  @JsonValue('ZALOPAY')
  zalopay,
  @JsonValue('VISA')
  visa,
}

enum PaymentStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('SUCCESS')
  success,
  @JsonValue('FAILED')
  failed,
  @JsonValue('CANCELLED')
  cancelled,
}

@freezed
class PaymentModel with _$PaymentModel {
  const factory PaymentModel({
    required int id,
    required int invoiceId,
    required PaymentMethod method,
    required PaymentStatus status,
    required int amount,
    required String orderInfo,
    String? transactionId,
    String? paymentUrl,
    String? qrCode,
    String? createdAt,
    String? updatedAt,
    String? completedAt,
  }) = _PaymentModel;

  factory PaymentModel.fromJson(Map<String, dynamic> json) =>
      _$PaymentModelFromJson(json);
}
