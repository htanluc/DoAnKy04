import 'package:freezed_annotation/freezed_annotation.dart';
import 'invoice_item.dart';

part 'invoice.freezed.dart';
part 'invoice.g.dart';

enum InvoiceStatus {
  @JsonValue('UNPAID')
  unpaid,
  @JsonValue('PAID')
  paid,
  @JsonValue('OVERDUE')
  overdue,
}

@freezed
class InvoiceModel with _$InvoiceModel {
  const factory InvoiceModel({
    required int id,
    required int apartmentId,
    required String billingPeriod,
    required String issueDate,
    required String dueDate,
    required int totalAmount,
    required InvoiceStatus status,
    String? remarks,
    List<InvoiceItemModel>? items,
    String? createdAt,
    String? updatedAt,
  }) = _InvoiceModel;

  factory InvoiceModel.fromJson(Map<String, dynamic> json) =>
      _$InvoiceModelFromJson(json);
}
