// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'vehicle.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

VehicleModel _$VehicleModelFromJson(Map<String, dynamic> json) {
  return _VehicleModel.fromJson(json);
}

/// @nodoc
mixin _$VehicleModel {
  int get id => throw _privateConstructorUsedError;
  String get licensePlate => throw _privateConstructorUsedError;
  String get vehicleType => throw _privateConstructorUsedError;
  String? get vehicleTypeDisplayName => throw _privateConstructorUsedError;
  String? get brand => throw _privateConstructorUsedError;
  String? get model => throw _privateConstructorUsedError;
  String? get color => throw _privateConstructorUsedError;
  List<String> get imageUrls => throw _privateConstructorUsedError;
  VehicleStatus get status => throw _privateConstructorUsedError;
  String? get statusDisplayName => throw _privateConstructorUsedError;
  num get monthlyFee => throw _privateConstructorUsedError;
  int get apartmentId => throw _privateConstructorUsedError;
  String? get apartmentUnitNumber => throw _privateConstructorUsedError;
  String get createdAt =>
      throw _privateConstructorUsedError; // For building pending list
  String? get userFullName => throw _privateConstructorUsedError;
  int? get buildingId => throw _privateConstructorUsedError;

  /// Serializes this VehicleModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of VehicleModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $VehicleModelCopyWith<VehicleModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $VehicleModelCopyWith<$Res> {
  factory $VehicleModelCopyWith(
    VehicleModel value,
    $Res Function(VehicleModel) then,
  ) = _$VehicleModelCopyWithImpl<$Res, VehicleModel>;
  @useResult
  $Res call({
    int id,
    String licensePlate,
    String vehicleType,
    String? vehicleTypeDisplayName,
    String? brand,
    String? model,
    String? color,
    List<String> imageUrls,
    VehicleStatus status,
    String? statusDisplayName,
    num monthlyFee,
    int apartmentId,
    String? apartmentUnitNumber,
    String createdAt,
    String? userFullName,
    int? buildingId,
  });
}

/// @nodoc
class _$VehicleModelCopyWithImpl<$Res, $Val extends VehicleModel>
    implements $VehicleModelCopyWith<$Res> {
  _$VehicleModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of VehicleModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? licensePlate = null,
    Object? vehicleType = null,
    Object? vehicleTypeDisplayName = freezed,
    Object? brand = freezed,
    Object? model = freezed,
    Object? color = freezed,
    Object? imageUrls = null,
    Object? status = null,
    Object? statusDisplayName = freezed,
    Object? monthlyFee = null,
    Object? apartmentId = null,
    Object? apartmentUnitNumber = freezed,
    Object? createdAt = null,
    Object? userFullName = freezed,
    Object? buildingId = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            licensePlate: null == licensePlate
                ? _value.licensePlate
                : licensePlate // ignore: cast_nullable_to_non_nullable
                      as String,
            vehicleType: null == vehicleType
                ? _value.vehicleType
                : vehicleType // ignore: cast_nullable_to_non_nullable
                      as String,
            vehicleTypeDisplayName: freezed == vehicleTypeDisplayName
                ? _value.vehicleTypeDisplayName
                : vehicleTypeDisplayName // ignore: cast_nullable_to_non_nullable
                      as String?,
            brand: freezed == brand
                ? _value.brand
                : brand // ignore: cast_nullable_to_non_nullable
                      as String?,
            model: freezed == model
                ? _value.model
                : model // ignore: cast_nullable_to_non_nullable
                      as String?,
            color: freezed == color
                ? _value.color
                : color // ignore: cast_nullable_to_non_nullable
                      as String?,
            imageUrls: null == imageUrls
                ? _value.imageUrls
                : imageUrls // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as VehicleStatus,
            statusDisplayName: freezed == statusDisplayName
                ? _value.statusDisplayName
                : statusDisplayName // ignore: cast_nullable_to_non_nullable
                      as String?,
            monthlyFee: null == monthlyFee
                ? _value.monthlyFee
                : monthlyFee // ignore: cast_nullable_to_non_nullable
                      as num,
            apartmentId: null == apartmentId
                ? _value.apartmentId
                : apartmentId // ignore: cast_nullable_to_non_nullable
                      as int,
            apartmentUnitNumber: freezed == apartmentUnitNumber
                ? _value.apartmentUnitNumber
                : apartmentUnitNumber // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as String,
            userFullName: freezed == userFullName
                ? _value.userFullName
                : userFullName // ignore: cast_nullable_to_non_nullable
                      as String?,
            buildingId: freezed == buildingId
                ? _value.buildingId
                : buildingId // ignore: cast_nullable_to_non_nullable
                      as int?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$VehicleModelImplCopyWith<$Res>
    implements $VehicleModelCopyWith<$Res> {
  factory _$$VehicleModelImplCopyWith(
    _$VehicleModelImpl value,
    $Res Function(_$VehicleModelImpl) then,
  ) = __$$VehicleModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String licensePlate,
    String vehicleType,
    String? vehicleTypeDisplayName,
    String? brand,
    String? model,
    String? color,
    List<String> imageUrls,
    VehicleStatus status,
    String? statusDisplayName,
    num monthlyFee,
    int apartmentId,
    String? apartmentUnitNumber,
    String createdAt,
    String? userFullName,
    int? buildingId,
  });
}

/// @nodoc
class __$$VehicleModelImplCopyWithImpl<$Res>
    extends _$VehicleModelCopyWithImpl<$Res, _$VehicleModelImpl>
    implements _$$VehicleModelImplCopyWith<$Res> {
  __$$VehicleModelImplCopyWithImpl(
    _$VehicleModelImpl _value,
    $Res Function(_$VehicleModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of VehicleModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? licensePlate = null,
    Object? vehicleType = null,
    Object? vehicleTypeDisplayName = freezed,
    Object? brand = freezed,
    Object? model = freezed,
    Object? color = freezed,
    Object? imageUrls = null,
    Object? status = null,
    Object? statusDisplayName = freezed,
    Object? monthlyFee = null,
    Object? apartmentId = null,
    Object? apartmentUnitNumber = freezed,
    Object? createdAt = null,
    Object? userFullName = freezed,
    Object? buildingId = freezed,
  }) {
    return _then(
      _$VehicleModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        licensePlate: null == licensePlate
            ? _value.licensePlate
            : licensePlate // ignore: cast_nullable_to_non_nullable
                  as String,
        vehicleType: null == vehicleType
            ? _value.vehicleType
            : vehicleType // ignore: cast_nullable_to_non_nullable
                  as String,
        vehicleTypeDisplayName: freezed == vehicleTypeDisplayName
            ? _value.vehicleTypeDisplayName
            : vehicleTypeDisplayName // ignore: cast_nullable_to_non_nullable
                  as String?,
        brand: freezed == brand
            ? _value.brand
            : brand // ignore: cast_nullable_to_non_nullable
                  as String?,
        model: freezed == model
            ? _value.model
            : model // ignore: cast_nullable_to_non_nullable
                  as String?,
        color: freezed == color
            ? _value.color
            : color // ignore: cast_nullable_to_non_nullable
                  as String?,
        imageUrls: null == imageUrls
            ? _value._imageUrls
            : imageUrls // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as VehicleStatus,
        statusDisplayName: freezed == statusDisplayName
            ? _value.statusDisplayName
            : statusDisplayName // ignore: cast_nullable_to_non_nullable
                  as String?,
        monthlyFee: null == monthlyFee
            ? _value.monthlyFee
            : monthlyFee // ignore: cast_nullable_to_non_nullable
                  as num,
        apartmentId: null == apartmentId
            ? _value.apartmentId
            : apartmentId // ignore: cast_nullable_to_non_nullable
                  as int,
        apartmentUnitNumber: freezed == apartmentUnitNumber
            ? _value.apartmentUnitNumber
            : apartmentUnitNumber // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as String,
        userFullName: freezed == userFullName
            ? _value.userFullName
            : userFullName // ignore: cast_nullable_to_non_nullable
                  as String?,
        buildingId: freezed == buildingId
            ? _value.buildingId
            : buildingId // ignore: cast_nullable_to_non_nullable
                  as int?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$VehicleModelImpl implements _VehicleModel {
  const _$VehicleModelImpl({
    required this.id,
    required this.licensePlate,
    required this.vehicleType,
    this.vehicleTypeDisplayName,
    this.brand,
    this.model,
    this.color,
    final List<String> imageUrls = const <String>[],
    required this.status,
    this.statusDisplayName,
    this.monthlyFee = 0,
    required this.apartmentId,
    this.apartmentUnitNumber,
    required this.createdAt,
    this.userFullName,
    this.buildingId,
  }) : _imageUrls = imageUrls;

  factory _$VehicleModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$VehicleModelImplFromJson(json);

  @override
  final int id;
  @override
  final String licensePlate;
  @override
  final String vehicleType;
  @override
  final String? vehicleTypeDisplayName;
  @override
  final String? brand;
  @override
  final String? model;
  @override
  final String? color;
  final List<String> _imageUrls;
  @override
  @JsonKey()
  List<String> get imageUrls {
    if (_imageUrls is EqualUnmodifiableListView) return _imageUrls;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_imageUrls);
  }

  @override
  final VehicleStatus status;
  @override
  final String? statusDisplayName;
  @override
  @JsonKey()
  final num monthlyFee;
  @override
  final int apartmentId;
  @override
  final String? apartmentUnitNumber;
  @override
  final String createdAt;
  // For building pending list
  @override
  final String? userFullName;
  @override
  final int? buildingId;

  @override
  String toString() {
    return 'VehicleModel(id: $id, licensePlate: $licensePlate, vehicleType: $vehicleType, vehicleTypeDisplayName: $vehicleTypeDisplayName, brand: $brand, model: $model, color: $color, imageUrls: $imageUrls, status: $status, statusDisplayName: $statusDisplayName, monthlyFee: $monthlyFee, apartmentId: $apartmentId, apartmentUnitNumber: $apartmentUnitNumber, createdAt: $createdAt, userFullName: $userFullName, buildingId: $buildingId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$VehicleModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.licensePlate, licensePlate) ||
                other.licensePlate == licensePlate) &&
            (identical(other.vehicleType, vehicleType) ||
                other.vehicleType == vehicleType) &&
            (identical(other.vehicleTypeDisplayName, vehicleTypeDisplayName) ||
                other.vehicleTypeDisplayName == vehicleTypeDisplayName) &&
            (identical(other.brand, brand) || other.brand == brand) &&
            (identical(other.model, model) || other.model == model) &&
            (identical(other.color, color) || other.color == color) &&
            const DeepCollectionEquality().equals(
              other._imageUrls,
              _imageUrls,
            ) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.statusDisplayName, statusDisplayName) ||
                other.statusDisplayName == statusDisplayName) &&
            (identical(other.monthlyFee, monthlyFee) ||
                other.monthlyFee == monthlyFee) &&
            (identical(other.apartmentId, apartmentId) ||
                other.apartmentId == apartmentId) &&
            (identical(other.apartmentUnitNumber, apartmentUnitNumber) ||
                other.apartmentUnitNumber == apartmentUnitNumber) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.userFullName, userFullName) ||
                other.userFullName == userFullName) &&
            (identical(other.buildingId, buildingId) ||
                other.buildingId == buildingId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    licensePlate,
    vehicleType,
    vehicleTypeDisplayName,
    brand,
    model,
    color,
    const DeepCollectionEquality().hash(_imageUrls),
    status,
    statusDisplayName,
    monthlyFee,
    apartmentId,
    apartmentUnitNumber,
    createdAt,
    userFullName,
    buildingId,
  );

  /// Create a copy of VehicleModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$VehicleModelImplCopyWith<_$VehicleModelImpl> get copyWith =>
      __$$VehicleModelImplCopyWithImpl<_$VehicleModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$VehicleModelImplToJson(this);
  }
}

abstract class _VehicleModel implements VehicleModel {
  const factory _VehicleModel({
    required final int id,
    required final String licensePlate,
    required final String vehicleType,
    final String? vehicleTypeDisplayName,
    final String? brand,
    final String? model,
    final String? color,
    final List<String> imageUrls,
    required final VehicleStatus status,
    final String? statusDisplayName,
    final num monthlyFee,
    required final int apartmentId,
    final String? apartmentUnitNumber,
    required final String createdAt,
    final String? userFullName,
    final int? buildingId,
  }) = _$VehicleModelImpl;

  factory _VehicleModel.fromJson(Map<String, dynamic> json) =
      _$VehicleModelImpl.fromJson;

  @override
  int get id;
  @override
  String get licensePlate;
  @override
  String get vehicleType;
  @override
  String? get vehicleTypeDisplayName;
  @override
  String? get brand;
  @override
  String? get model;
  @override
  String? get color;
  @override
  List<String> get imageUrls;
  @override
  VehicleStatus get status;
  @override
  String? get statusDisplayName;
  @override
  num get monthlyFee;
  @override
  int get apartmentId;
  @override
  String? get apartmentUnitNumber;
  @override
  String get createdAt; // For building pending list
  @override
  String? get userFullName;
  @override
  int? get buildingId;

  /// Create a copy of VehicleModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$VehicleModelImplCopyWith<_$VehicleModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
