// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'invoice.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

InvoiceModel _$InvoiceModelFromJson(Map<String, dynamic> json) {
  return _InvoiceModel.fromJson(json);
}

/// @nodoc
mixin _$InvoiceModel {
  int get id => throw _privateConstructorUsedError;
  int get apartmentId => throw _privateConstructorUsedError;
  String get billingPeriod => throw _privateConstructorUsedError;
  String get issueDate => throw _privateConstructorUsedError;
  String get dueDate => throw _privateConstructorUsedError;
  int get totalAmount => throw _privateConstructorUsedError;
  InvoiceStatus get status => throw _privateConstructorUsedError;
  String? get remarks => throw _privateConstructorUsedError;
  List<InvoiceItemModel>? get items => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;
  String? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this InvoiceModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of InvoiceModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $InvoiceModelCopyWith<InvoiceModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $InvoiceModelCopyWith<$Res> {
  factory $InvoiceModelCopyWith(
    InvoiceModel value,
    $Res Function(InvoiceModel) then,
  ) = _$InvoiceModelCopyWithImpl<$Res, InvoiceModel>;
  @useResult
  $Res call({
    int id,
    int apartmentId,
    String billingPeriod,
    String issueDate,
    String dueDate,
    int totalAmount,
    InvoiceStatus status,
    String? remarks,
    List<InvoiceItemModel>? items,
    String? createdAt,
    String? updatedAt,
  });
}

/// @nodoc
class _$InvoiceModelCopyWithImpl<$Res, $Val extends InvoiceModel>
    implements $InvoiceModelCopyWith<$Res> {
  _$InvoiceModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of InvoiceModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? apartmentId = null,
    Object? billingPeriod = null,
    Object? issueDate = null,
    Object? dueDate = null,
    Object? totalAmount = null,
    Object? status = null,
    Object? remarks = freezed,
    Object? items = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            apartmentId: null == apartmentId
                ? _value.apartmentId
                : apartmentId // ignore: cast_nullable_to_non_nullable
                      as int,
            billingPeriod: null == billingPeriod
                ? _value.billingPeriod
                : billingPeriod // ignore: cast_nullable_to_non_nullable
                      as String,
            issueDate: null == issueDate
                ? _value.issueDate
                : issueDate // ignore: cast_nullable_to_non_nullable
                      as String,
            dueDate: null == dueDate
                ? _value.dueDate
                : dueDate // ignore: cast_nullable_to_non_nullable
                      as String,
            totalAmount: null == totalAmount
                ? _value.totalAmount
                : totalAmount // ignore: cast_nullable_to_non_nullable
                      as int,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as InvoiceStatus,
            remarks: freezed == remarks
                ? _value.remarks
                : remarks // ignore: cast_nullable_to_non_nullable
                      as String?,
            items: freezed == items
                ? _value.items
                : items // ignore: cast_nullable_to_non_nullable
                      as List<InvoiceItemModel>?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$InvoiceModelImplCopyWith<$Res>
    implements $InvoiceModelCopyWith<$Res> {
  factory _$$InvoiceModelImplCopyWith(
    _$InvoiceModelImpl value,
    $Res Function(_$InvoiceModelImpl) then,
  ) = __$$InvoiceModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int apartmentId,
    String billingPeriod,
    String issueDate,
    String dueDate,
    int totalAmount,
    InvoiceStatus status,
    String? remarks,
    List<InvoiceItemModel>? items,
    String? createdAt,
    String? updatedAt,
  });
}

/// @nodoc
class __$$InvoiceModelImplCopyWithImpl<$Res>
    extends _$InvoiceModelCopyWithImpl<$Res, _$InvoiceModelImpl>
    implements _$$InvoiceModelImplCopyWith<$Res> {
  __$$InvoiceModelImplCopyWithImpl(
    _$InvoiceModelImpl _value,
    $Res Function(_$InvoiceModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of InvoiceModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? apartmentId = null,
    Object? billingPeriod = null,
    Object? issueDate = null,
    Object? dueDate = null,
    Object? totalAmount = null,
    Object? status = null,
    Object? remarks = freezed,
    Object? items = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _$InvoiceModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        apartmentId: null == apartmentId
            ? _value.apartmentId
            : apartmentId // ignore: cast_nullable_to_non_nullable
                  as int,
        billingPeriod: null == billingPeriod
            ? _value.billingPeriod
            : billingPeriod // ignore: cast_nullable_to_non_nullable
                  as String,
        issueDate: null == issueDate
            ? _value.issueDate
            : issueDate // ignore: cast_nullable_to_non_nullable
                  as String,
        dueDate: null == dueDate
            ? _value.dueDate
            : dueDate // ignore: cast_nullable_to_non_nullable
                  as String,
        totalAmount: null == totalAmount
            ? _value.totalAmount
            : totalAmount // ignore: cast_nullable_to_non_nullable
                  as int,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as InvoiceStatus,
        remarks: freezed == remarks
            ? _value.remarks
            : remarks // ignore: cast_nullable_to_non_nullable
                  as String?,
        items: freezed == items
            ? _value._items
            : items // ignore: cast_nullable_to_non_nullable
                  as List<InvoiceItemModel>?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$InvoiceModelImpl implements _InvoiceModel {
  const _$InvoiceModelImpl({
    required this.id,
    required this.apartmentId,
    required this.billingPeriod,
    required this.issueDate,
    required this.dueDate,
    required this.totalAmount,
    required this.status,
    this.remarks,
    final List<InvoiceItemModel>? items,
    this.createdAt,
    this.updatedAt,
  }) : _items = items;

  factory _$InvoiceModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$InvoiceModelImplFromJson(json);

  @override
  final int id;
  @override
  final int apartmentId;
  @override
  final String billingPeriod;
  @override
  final String issueDate;
  @override
  final String dueDate;
  @override
  final int totalAmount;
  @override
  final InvoiceStatus status;
  @override
  final String? remarks;
  final List<InvoiceItemModel>? _items;
  @override
  List<InvoiceItemModel>? get items {
    final value = _items;
    if (value == null) return null;
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? createdAt;
  @override
  final String? updatedAt;

  @override
  String toString() {
    return 'InvoiceModel(id: $id, apartmentId: $apartmentId, billingPeriod: $billingPeriod, issueDate: $issueDate, dueDate: $dueDate, totalAmount: $totalAmount, status: $status, remarks: $remarks, items: $items, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$InvoiceModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.apartmentId, apartmentId) ||
                other.apartmentId == apartmentId) &&
            (identical(other.billingPeriod, billingPeriod) ||
                other.billingPeriod == billingPeriod) &&
            (identical(other.issueDate, issueDate) ||
                other.issueDate == issueDate) &&
            (identical(other.dueDate, dueDate) || other.dueDate == dueDate) &&
            (identical(other.totalAmount, totalAmount) ||
                other.totalAmount == totalAmount) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.remarks, remarks) || other.remarks == remarks) &&
            const DeepCollectionEquality().equals(other._items, _items) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    apartmentId,
    billingPeriod,
    issueDate,
    dueDate,
    totalAmount,
    status,
    remarks,
    const DeepCollectionEquality().hash(_items),
    createdAt,
    updatedAt,
  );

  /// Create a copy of InvoiceModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$InvoiceModelImplCopyWith<_$InvoiceModelImpl> get copyWith =>
      __$$InvoiceModelImplCopyWithImpl<_$InvoiceModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$InvoiceModelImplToJson(this);
  }
}

abstract class _InvoiceModel implements InvoiceModel {
  const factory _InvoiceModel({
    required final int id,
    required final int apartmentId,
    required final String billingPeriod,
    required final String issueDate,
    required final String dueDate,
    required final int totalAmount,
    required final InvoiceStatus status,
    final String? remarks,
    final List<InvoiceItemModel>? items,
    final String? createdAt,
    final String? updatedAt,
  }) = _$InvoiceModelImpl;

  factory _InvoiceModel.fromJson(Map<String, dynamic> json) =
      _$InvoiceModelImpl.fromJson;

  @override
  int get id;
  @override
  int get apartmentId;
  @override
  String get billingPeriod;
  @override
  String get issueDate;
  @override
  String get dueDate;
  @override
  int get totalAmount;
  @override
  InvoiceStatus get status;
  @override
  String? get remarks;
  @override
  List<InvoiceItemModel>? get items;
  @override
  String? get createdAt;
  @override
  String? get updatedAt;

  /// Create a copy of InvoiceModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$InvoiceModelImplCopyWith<_$InvoiceModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
