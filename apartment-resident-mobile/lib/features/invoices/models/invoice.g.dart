// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invoice.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$InvoiceModelImpl _$$InvoiceModelImplFromJson(Map<String, dynamic> json) =>
    _$InvoiceModelImpl(
      id: (json['id'] as num).toInt(),
      apartmentId: (json['apartmentId'] as num).toInt(),
      billingPeriod: json['billingPeriod'] as String,
      issueDate: json['issueDate'] as String,
      dueDate: json['dueDate'] as String,
      totalAmount: (json['totalAmount'] as num).toInt(),
      status: $enumDecode(_$InvoiceStatusEnumMap, json['status']),
      remarks: json['remarks'] as String?,
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => InvoiceItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );

Map<String, dynamic> _$$InvoiceModelImplToJson(_$InvoiceModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'apartmentId': instance.apartmentId,
      'billingPeriod': instance.billingPeriod,
      'issueDate': instance.issueDate,
      'dueDate': instance.dueDate,
      'totalAmount': instance.totalAmount,
      'status': _$InvoiceStatusEnumMap[instance.status]!,
      'remarks': instance.remarks,
      'items': instance.items,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

const _$InvoiceStatusEnumMap = {
  InvoiceStatus.unpaid: 'UNPAID',
  InvoiceStatus.paid: 'PAID',
  InvoiceStatus.overdue: 'OVERDUE',
};
