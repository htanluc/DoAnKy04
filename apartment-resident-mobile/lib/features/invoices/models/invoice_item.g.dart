// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invoice_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$InvoiceItemModelImpl _$$InvoiceItemModelImplFromJson(
  Map<String, dynamic> json,
) => _$InvoiceItemModelImpl(
  id: (json['id'] as num).toInt(),
  feeType: json['feeType'] as String,
  description: json['description'] as String,
  amount: (json['amount'] as num).toInt(),
);

Map<String, dynamic> _$$InvoiceItemModelImplToJson(
  _$InvoiceItemModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'feeType': instance.feeType,
  'description': instance.description,
  'amount': instance.amount,
};
