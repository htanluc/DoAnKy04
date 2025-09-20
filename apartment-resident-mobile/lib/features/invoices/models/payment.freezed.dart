// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'payment.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

PaymentModel _$PaymentModelFromJson(Map<String, dynamic> json) {
  return _PaymentModel.fromJson(json);
}

/// @nodoc
mixin _$PaymentModel {
  int get id => throw _privateConstructorUsedError;
  int get invoiceId => throw _privateConstructorUsedError;
  PaymentMethod get method => throw _privateConstructorUsedError;
  PaymentStatus get status => throw _privateConstructorUsedError;
  int get amount => throw _privateConstructorUsedError;
  String get orderInfo => throw _privateConstructorUsedError;
  String? get transactionId => throw _privateConstructorUsedError;
  String? get paymentUrl => throw _privateConstructorUsedError;
  String? get qrCode => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;
  String? get updatedAt => throw _privateConstructorUsedError;
  String? get completedAt => throw _privateConstructorUsedError;

  /// Serializes this PaymentModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PaymentModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PaymentModelCopyWith<PaymentModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PaymentModelCopyWith<$Res> {
  factory $PaymentModelCopyWith(
    PaymentModel value,
    $Res Function(PaymentModel) then,
  ) = _$PaymentModelCopyWithImpl<$Res, PaymentModel>;
  @useResult
  $Res call({
    int id,
    int invoiceId,
    PaymentMethod method,
    PaymentStatus status,
    int amount,
    String orderInfo,
    String? transactionId,
    String? paymentUrl,
    String? qrCode,
    String? createdAt,
    String? updatedAt,
    String? completedAt,
  });
}

/// @nodoc
class _$PaymentModelCopyWithImpl<$Res, $Val extends PaymentModel>
    implements $PaymentModelCopyWith<$Res> {
  _$PaymentModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PaymentModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? invoiceId = null,
    Object? method = null,
    Object? status = null,
    Object? amount = null,
    Object? orderInfo = null,
    Object? transactionId = freezed,
    Object? paymentUrl = freezed,
    Object? qrCode = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? completedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            invoiceId: null == invoiceId
                ? _value.invoiceId
                : invoiceId // ignore: cast_nullable_to_non_nullable
                      as int,
            method: null == method
                ? _value.method
                : method // ignore: cast_nullable_to_non_nullable
                      as PaymentMethod,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as PaymentStatus,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as int,
            orderInfo: null == orderInfo
                ? _value.orderInfo
                : orderInfo // ignore: cast_nullable_to_non_nullable
                      as String,
            transactionId: freezed == transactionId
                ? _value.transactionId
                : transactionId // ignore: cast_nullable_to_non_nullable
                      as String?,
            paymentUrl: freezed == paymentUrl
                ? _value.paymentUrl
                : paymentUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            qrCode: freezed == qrCode
                ? _value.qrCode
                : qrCode // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            completedAt: freezed == completedAt
                ? _value.completedAt
                : completedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PaymentModelImplCopyWith<$Res>
    implements $PaymentModelCopyWith<$Res> {
  factory _$$PaymentModelImplCopyWith(
    _$PaymentModelImpl value,
    $Res Function(_$PaymentModelImpl) then,
  ) = __$$PaymentModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int invoiceId,
    PaymentMethod method,
    PaymentStatus status,
    int amount,
    String orderInfo,
    String? transactionId,
    String? paymentUrl,
    String? qrCode,
    String? createdAt,
    String? updatedAt,
    String? completedAt,
  });
}

/// @nodoc
class __$$PaymentModelImplCopyWithImpl<$Res>
    extends _$PaymentModelCopyWithImpl<$Res, _$PaymentModelImpl>
    implements _$$PaymentModelImplCopyWith<$Res> {
  __$$PaymentModelImplCopyWithImpl(
    _$PaymentModelImpl _value,
    $Res Function(_$PaymentModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PaymentModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? invoiceId = null,
    Object? method = null,
    Object? status = null,
    Object? amount = null,
    Object? orderInfo = null,
    Object? transactionId = freezed,
    Object? paymentUrl = freezed,
    Object? qrCode = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? completedAt = freezed,
  }) {
    return _then(
      _$PaymentModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        invoiceId: null == invoiceId
            ? _value.invoiceId
            : invoiceId // ignore: cast_nullable_to_non_nullable
                  as int,
        method: null == method
            ? _value.method
            : method // ignore: cast_nullable_to_non_nullable
                  as PaymentMethod,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as PaymentStatus,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as int,
        orderInfo: null == orderInfo
            ? _value.orderInfo
            : orderInfo // ignore: cast_nullable_to_non_nullable
                  as String,
        transactionId: freezed == transactionId
            ? _value.transactionId
            : transactionId // ignore: cast_nullable_to_non_nullable
                  as String?,
        paymentUrl: freezed == paymentUrl
            ? _value.paymentUrl
            : paymentUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        qrCode: freezed == qrCode
            ? _value.qrCode
            : qrCode // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        completedAt: freezed == completedAt
            ? _value.completedAt
            : completedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$PaymentModelImpl implements _PaymentModel {
  const _$PaymentModelImpl({
    required this.id,
    required this.invoiceId,
    required this.method,
    required this.status,
    required this.amount,
    required this.orderInfo,
    this.transactionId,
    this.paymentUrl,
    this.qrCode,
    this.createdAt,
    this.updatedAt,
    this.completedAt,
  });

  factory _$PaymentModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$PaymentModelImplFromJson(json);

  @override
  final int id;
  @override
  final int invoiceId;
  @override
  final PaymentMethod method;
  @override
  final PaymentStatus status;
  @override
  final int amount;
  @override
  final String orderInfo;
  @override
  final String? transactionId;
  @override
  final String? paymentUrl;
  @override
  final String? qrCode;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;
  @override
  final String? completedAt;

  @override
  String toString() {
    return 'PaymentModel(id: $id, invoiceId: $invoiceId, method: $method, status: $status, amount: $amount, orderInfo: $orderInfo, transactionId: $transactionId, paymentUrl: $paymentUrl, qrCode: $qrCode, createdAt: $createdAt, updatedAt: $updatedAt, completedAt: $completedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PaymentModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.invoiceId, invoiceId) ||
                other.invoiceId == invoiceId) &&
            (identical(other.method, method) || other.method == method) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.orderInfo, orderInfo) ||
                other.orderInfo == orderInfo) &&
            (identical(other.transactionId, transactionId) ||
                other.transactionId == transactionId) &&
            (identical(other.paymentUrl, paymentUrl) ||
                other.paymentUrl == paymentUrl) &&
            (identical(other.qrCode, qrCode) || other.qrCode == qrCode) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.completedAt, completedAt) ||
                other.completedAt == completedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    invoiceId,
    method,
    status,
    amount,
    orderInfo,
    transactionId,
    paymentUrl,
    qrCode,
    createdAt,
    updatedAt,
    completedAt,
  );

  /// Create a copy of PaymentModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PaymentModelImplCopyWith<_$PaymentModelImpl> get copyWith =>
      __$$PaymentModelImplCopyWithImpl<_$PaymentModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PaymentModelImplToJson(this);
  }
}

abstract class _PaymentModel implements PaymentModel {
  const factory _PaymentModel({
    required final int id,
    required final int invoiceId,
    required final PaymentMethod method,
    required final PaymentStatus status,
    required final int amount,
    required final String orderInfo,
    final String? transactionId,
    final String? paymentUrl,
    final String? qrCode,
    final String? createdAt,
    final String? updatedAt,
    final String? completedAt,
  }) = _$PaymentModelImpl;

  factory _PaymentModel.fromJson(Map<String, dynamic> json) =
      _$PaymentModelImpl.fromJson;

  @override
  int get id;
  @override
  int get invoiceId;
  @override
  PaymentMethod get method;
  @override
  PaymentStatus get status;
  @override
  int get amount;
  @override
  String get orderInfo;
  @override
  String? get transactionId;
  @override
  String? get paymentUrl;
  @override
  String? get qrCode;
  @override
  String? get createdAt;
  @override
  String? get updatedAt;
  @override
  String? get completedAt;

  /// Create a copy of PaymentModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PaymentModelImplCopyWith<_$PaymentModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
