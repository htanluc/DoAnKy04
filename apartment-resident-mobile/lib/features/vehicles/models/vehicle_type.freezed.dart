// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'vehicle_type.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

VehicleTypeModel _$VehicleTypeModelFromJson(Map<String, dynamic> json) {
  return _VehicleTypeModel.fromJson(json);
}

/// @nodoc
mixin _$VehicleTypeModel {
  String get value => throw _privateConstructorUsedError;
  String get displayName => throw _privateConstructorUsedError;
  num get monthlyFee => throw _privateConstructorUsedError;

  /// Serializes this VehicleTypeModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of VehicleTypeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $VehicleTypeModelCopyWith<VehicleTypeModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $VehicleTypeModelCopyWith<$Res> {
  factory $VehicleTypeModelCopyWith(
    VehicleTypeModel value,
    $Res Function(VehicleTypeModel) then,
  ) = _$VehicleTypeModelCopyWithImpl<$Res, VehicleTypeModel>;
  @useResult
  $Res call({String value, String displayName, num monthlyFee});
}

/// @nodoc
class _$VehicleTypeModelCopyWithImpl<$Res, $Val extends VehicleTypeModel>
    implements $VehicleTypeModelCopyWith<$Res> {
  _$VehicleTypeModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of VehicleTypeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? value = null,
    Object? displayName = null,
    Object? monthlyFee = null,
  }) {
    return _then(
      _value.copyWith(
            value: null == value
                ? _value.value
                : value // ignore: cast_nullable_to_non_nullable
                      as String,
            displayName: null == displayName
                ? _value.displayName
                : displayName // ignore: cast_nullable_to_non_nullable
                      as String,
            monthlyFee: null == monthlyFee
                ? _value.monthlyFee
                : monthlyFee // ignore: cast_nullable_to_non_nullable
                      as num,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$VehicleTypeModelImplCopyWith<$Res>
    implements $VehicleTypeModelCopyWith<$Res> {
  factory _$$VehicleTypeModelImplCopyWith(
    _$VehicleTypeModelImpl value,
    $Res Function(_$VehicleTypeModelImpl) then,
  ) = __$$VehicleTypeModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String value, String displayName, num monthlyFee});
}

/// @nodoc
class __$$VehicleTypeModelImplCopyWithImpl<$Res>
    extends _$VehicleTypeModelCopyWithImpl<$Res, _$VehicleTypeModelImpl>
    implements _$$VehicleTypeModelImplCopyWith<$Res> {
  __$$VehicleTypeModelImplCopyWithImpl(
    _$VehicleTypeModelImpl _value,
    $Res Function(_$VehicleTypeModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of VehicleTypeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? value = null,
    Object? displayName = null,
    Object? monthlyFee = null,
  }) {
    return _then(
      _$VehicleTypeModelImpl(
        value: null == value
            ? _value.value
            : value // ignore: cast_nullable_to_non_nullable
                  as String,
        displayName: null == displayName
            ? _value.displayName
            : displayName // ignore: cast_nullable_to_non_nullable
                  as String,
        monthlyFee: null == monthlyFee
            ? _value.monthlyFee
            : monthlyFee // ignore: cast_nullable_to_non_nullable
                  as num,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$VehicleTypeModelImpl implements _VehicleTypeModel {
  const _$VehicleTypeModelImpl({
    required this.value,
    required this.displayName,
    required this.monthlyFee,
  });

  factory _$VehicleTypeModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$VehicleTypeModelImplFromJson(json);

  @override
  final String value;
  @override
  final String displayName;
  @override
  final num monthlyFee;

  @override
  String toString() {
    return 'VehicleTypeModel(value: $value, displayName: $displayName, monthlyFee: $monthlyFee)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$VehicleTypeModelImpl &&
            (identical(other.value, value) || other.value == value) &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.monthlyFee, monthlyFee) ||
                other.monthlyFee == monthlyFee));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, value, displayName, monthlyFee);

  /// Create a copy of VehicleTypeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$VehicleTypeModelImplCopyWith<_$VehicleTypeModelImpl> get copyWith =>
      __$$VehicleTypeModelImplCopyWithImpl<_$VehicleTypeModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$VehicleTypeModelImplToJson(this);
  }
}

abstract class _VehicleTypeModel implements VehicleTypeModel {
  const factory _VehicleTypeModel({
    required final String value,
    required final String displayName,
    required final num monthlyFee,
  }) = _$VehicleTypeModelImpl;

  factory _VehicleTypeModel.fromJson(Map<String, dynamic> json) =
      _$VehicleTypeModelImpl.fromJson;

  @override
  String get value;
  @override
  String get displayName;
  @override
  num get monthlyFee;

  /// Create a copy of VehicleTypeModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$VehicleTypeModelImplCopyWith<_$VehicleTypeModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
