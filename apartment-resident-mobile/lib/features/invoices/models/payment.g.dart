// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PaymentModelImpl _$$PaymentModelImplFromJson(Map<String, dynamic> json) =>
    _$PaymentModelImpl(
      id: (json['id'] as num).toInt(),
      invoiceId: (json['invoiceId'] as num).toInt(),
      method: $enumDecode(_$PaymentMethodEnumMap, json['method']),
      status: $enumDecode(_$PaymentStatusEnumMap, json['status']),
      amount: (json['amount'] as num).toInt(),
      orderInfo: json['orderInfo'] as String,
      transactionId: json['transactionId'] as String?,
      paymentUrl: json['paymentUrl'] as String?,
      qrCode: json['qrCode'] as String?,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
      completedAt: json['completedAt'] as String?,
    );

Map<String, dynamic> _$$PaymentModelImplToJson(_$PaymentModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'invoiceId': instance.invoiceId,
      'method': _$PaymentMethodEnumMap[instance.method]!,
      'status': _$PaymentStatusEnumMap[instance.status]!,
      'amount': instance.amount,
      'orderInfo': instance.orderInfo,
      'transactionId': instance.transactionId,
      'paymentUrl': instance.paymentUrl,
      'qrCode': instance.qrCode,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
      'completedAt': instance.completedAt,
    };

const _$PaymentMethodEnumMap = {
  PaymentMethod.cash: 'CASH',
  PaymentMethod.bankTransfer: 'BANK_TRANSFER',
  PaymentMethod.momo: 'MOMO',
  PaymentMethod.vnpay: 'VNPAY',
  PaymentMethod.zalopay: 'ZALOPAY',
  PaymentMethod.visa: 'VISA',
};

const _$PaymentStatusEnumMap = {
  PaymentStatus.pending: 'PENDING',
  PaymentStatus.success: 'SUCCESS',
  PaymentStatus.failed: 'FAILED',
  PaymentStatus.cancelled: 'CANCELLED',
};
