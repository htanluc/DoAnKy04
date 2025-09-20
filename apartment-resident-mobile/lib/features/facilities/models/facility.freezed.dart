// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'facility.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Facility _$FacilityFromJson(Map<String, dynamic> json) {
  return _Facility.fromJson(json);
}

/// @nodoc
mixin _$Facility {
  int get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get location => throw _privateConstructorUsedError;
  int get capacity => throw _privateConstructorUsedError;
  String get otherDetails => throw _privateConstructorUsedError;
  double get usageFee => throw _privateConstructorUsedError;
  String? get openingHours => throw _privateConstructorUsedError;
  bool get isVisible => throw _privateConstructorUsedError;

  /// Serializes this Facility to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Facility
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FacilityCopyWith<Facility> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FacilityCopyWith<$Res> {
  factory $FacilityCopyWith(Facility value, $Res Function(Facility) then) =
      _$FacilityCopyWithImpl<$Res, Facility>;
  @useResult
  $Res call({
    int id,
    String name,
    String description,
    String location,
    int capacity,
    String otherDetails,
    double usageFee,
    String? openingHours,
    bool isVisible,
  });
}

/// @nodoc
class _$FacilityCopyWithImpl<$Res, $Val extends Facility>
    implements $FacilityCopyWith<$Res> {
  _$FacilityCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Facility
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? location = null,
    Object? capacity = null,
    Object? otherDetails = null,
    Object? usageFee = null,
    Object? openingHours = freezed,
    Object? isVisible = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            location: null == location
                ? _value.location
                : location // ignore: cast_nullable_to_non_nullable
                      as String,
            capacity: null == capacity
                ? _value.capacity
                : capacity // ignore: cast_nullable_to_non_nullable
                      as int,
            otherDetails: null == otherDetails
                ? _value.otherDetails
                : otherDetails // ignore: cast_nullable_to_non_nullable
                      as String,
            usageFee: null == usageFee
                ? _value.usageFee
                : usageFee // ignore: cast_nullable_to_non_nullable
                      as double,
            openingHours: freezed == openingHours
                ? _value.openingHours
                : openingHours // ignore: cast_nullable_to_non_nullable
                      as String?,
            isVisible: null == isVisible
                ? _value.isVisible
                : isVisible // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FacilityImplCopyWith<$Res>
    implements $FacilityCopyWith<$Res> {
  factory _$$FacilityImplCopyWith(
    _$FacilityImpl value,
    $Res Function(_$FacilityImpl) then,
  ) = __$$FacilityImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String name,
    String description,
    String location,
    int capacity,
    String otherDetails,
    double usageFee,
    String? openingHours,
    bool isVisible,
  });
}

/// @nodoc
class __$$FacilityImplCopyWithImpl<$Res>
    extends _$FacilityCopyWithImpl<$Res, _$FacilityImpl>
    implements _$$FacilityImplCopyWith<$Res> {
  __$$FacilityImplCopyWithImpl(
    _$FacilityImpl _value,
    $Res Function(_$FacilityImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Facility
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? location = null,
    Object? capacity = null,
    Object? otherDetails = null,
    Object? usageFee = null,
    Object? openingHours = freezed,
    Object? isVisible = null,
  }) {
    return _then(
      _$FacilityImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        location: null == location
            ? _value.location
            : location // ignore: cast_nullable_to_non_nullable
                  as String,
        capacity: null == capacity
            ? _value.capacity
            : capacity // ignore: cast_nullable_to_non_nullable
                  as int,
        otherDetails: null == otherDetails
            ? _value.otherDetails
            : otherDetails // ignore: cast_nullable_to_non_nullable
                  as String,
        usageFee: null == usageFee
            ? _value.usageFee
            : usageFee // ignore: cast_nullable_to_non_nullable
                  as double,
        openingHours: freezed == openingHours
            ? _value.openingHours
            : openingHours // ignore: cast_nullable_to_non_nullable
                  as String?,
        isVisible: null == isVisible
            ? _value.isVisible
            : isVisible // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FacilityImpl implements _Facility {
  const _$FacilityImpl({
    required this.id,
    required this.name,
    required this.description,
    required this.location,
    required this.capacity,
    required this.otherDetails,
    required this.usageFee,
    this.openingHours,
    this.isVisible = true,
  });

  factory _$FacilityImpl.fromJson(Map<String, dynamic> json) =>
      _$$FacilityImplFromJson(json);

  @override
  final int id;
  @override
  final String name;
  @override
  final String description;
  @override
  final String location;
  @override
  final int capacity;
  @override
  final String otherDetails;
  @override
  final double usageFee;
  @override
  final String? openingHours;
  @override
  @JsonKey()
  final bool isVisible;

  @override
  String toString() {
    return 'Facility(id: $id, name: $name, description: $description, location: $location, capacity: $capacity, otherDetails: $otherDetails, usageFee: $usageFee, openingHours: $openingHours, isVisible: $isVisible)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FacilityImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.capacity, capacity) ||
                other.capacity == capacity) &&
            (identical(other.otherDetails, otherDetails) ||
                other.otherDetails == otherDetails) &&
            (identical(other.usageFee, usageFee) ||
                other.usageFee == usageFee) &&
            (identical(other.openingHours, openingHours) ||
                other.openingHours == openingHours) &&
            (identical(other.isVisible, isVisible) ||
                other.isVisible == isVisible));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    description,
    location,
    capacity,
    otherDetails,
    usageFee,
    openingHours,
    isVisible,
  );

  /// Create a copy of Facility
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FacilityImplCopyWith<_$FacilityImpl> get copyWith =>
      __$$FacilityImplCopyWithImpl<_$FacilityImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FacilityImplToJson(this);
  }
}

abstract class _Facility implements Facility {
  const factory _Facility({
    required final int id,
    required final String name,
    required final String description,
    required final String location,
    required final int capacity,
    required final String otherDetails,
    required final double usageFee,
    final String? openingHours,
    final bool isVisible,
  }) = _$FacilityImpl;

  factory _Facility.fromJson(Map<String, dynamic> json) =
      _$FacilityImpl.fromJson;

  @override
  int get id;
  @override
  String get name;
  @override
  String get description;
  @override
  String get location;
  @override
  int get capacity;
  @override
  String get otherDetails;
  @override
  double get usageFee;
  @override
  String? get openingHours;
  @override
  bool get isVisible;

  /// Create a copy of Facility
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FacilityImplCopyWith<_$FacilityImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

FacilityCreateRequest _$FacilityCreateRequestFromJson(
  Map<String, dynamic> json,
) {
  return _FacilityCreateRequest.fromJson(json);
}

/// @nodoc
mixin _$FacilityCreateRequest {
  String get name => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get location => throw _privateConstructorUsedError;
  int get capacity => throw _privateConstructorUsedError;
  String get otherDetails => throw _privateConstructorUsedError;
  double get usageFee => throw _privateConstructorUsedError;
  String? get openingHours => throw _privateConstructorUsedError;
  bool get isVisible => throw _privateConstructorUsedError;

  /// Serializes this FacilityCreateRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FacilityCreateRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FacilityCreateRequestCopyWith<FacilityCreateRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FacilityCreateRequestCopyWith<$Res> {
  factory $FacilityCreateRequestCopyWith(
    FacilityCreateRequest value,
    $Res Function(FacilityCreateRequest) then,
  ) = _$FacilityCreateRequestCopyWithImpl<$Res, FacilityCreateRequest>;
  @useResult
  $Res call({
    String name,
    String description,
    String location,
    int capacity,
    String otherDetails,
    double usageFee,
    String? openingHours,
    bool isVisible,
  });
}

/// @nodoc
class _$FacilityCreateRequestCopyWithImpl<
  $Res,
  $Val extends FacilityCreateRequest
>
    implements $FacilityCreateRequestCopyWith<$Res> {
  _$FacilityCreateRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FacilityCreateRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? description = null,
    Object? location = null,
    Object? capacity = null,
    Object? otherDetails = null,
    Object? usageFee = null,
    Object? openingHours = freezed,
    Object? isVisible = null,
  }) {
    return _then(
      _value.copyWith(
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            location: null == location
                ? _value.location
                : location // ignore: cast_nullable_to_non_nullable
                      as String,
            capacity: null == capacity
                ? _value.capacity
                : capacity // ignore: cast_nullable_to_non_nullable
                      as int,
            otherDetails: null == otherDetails
                ? _value.otherDetails
                : otherDetails // ignore: cast_nullable_to_non_nullable
                      as String,
            usageFee: null == usageFee
                ? _value.usageFee
                : usageFee // ignore: cast_nullable_to_non_nullable
                      as double,
            openingHours: freezed == openingHours
                ? _value.openingHours
                : openingHours // ignore: cast_nullable_to_non_nullable
                      as String?,
            isVisible: null == isVisible
                ? _value.isVisible
                : isVisible // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FacilityCreateRequestImplCopyWith<$Res>
    implements $FacilityCreateRequestCopyWith<$Res> {
  factory _$$FacilityCreateRequestImplCopyWith(
    _$FacilityCreateRequestImpl value,
    $Res Function(_$FacilityCreateRequestImpl) then,
  ) = __$$FacilityCreateRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String name,
    String description,
    String location,
    int capacity,
    String otherDetails,
    double usageFee,
    String? openingHours,
    bool isVisible,
  });
}

/// @nodoc
class __$$FacilityCreateRequestImplCopyWithImpl<$Res>
    extends
        _$FacilityCreateRequestCopyWithImpl<$Res, _$FacilityCreateRequestImpl>
    implements _$$FacilityCreateRequestImplCopyWith<$Res> {
  __$$FacilityCreateRequestImplCopyWithImpl(
    _$FacilityCreateRequestImpl _value,
    $Res Function(_$FacilityCreateRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FacilityCreateRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? description = null,
    Object? location = null,
    Object? capacity = null,
    Object? otherDetails = null,
    Object? usageFee = null,
    Object? openingHours = freezed,
    Object? isVisible = null,
  }) {
    return _then(
      _$FacilityCreateRequestImpl(
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        location: null == location
            ? _value.location
            : location // ignore: cast_nullable_to_non_nullable
                  as String,
        capacity: null == capacity
            ? _value.capacity
            : capacity // ignore: cast_nullable_to_non_nullable
                  as int,
        otherDetails: null == otherDetails
            ? _value.otherDetails
            : otherDetails // ignore: cast_nullable_to_non_nullable
                  as String,
        usageFee: null == usageFee
            ? _value.usageFee
            : usageFee // ignore: cast_nullable_to_non_nullable
                  as double,
        openingHours: freezed == openingHours
            ? _value.openingHours
            : openingHours // ignore: cast_nullable_to_non_nullable
                  as String?,
        isVisible: null == isVisible
            ? _value.isVisible
            : isVisible // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FacilityCreateRequestImpl implements _FacilityCreateRequest {
  const _$FacilityCreateRequestImpl({
    required this.name,
    required this.description,
    required this.location,
    required this.capacity,
    required this.otherDetails,
    required this.usageFee,
    this.openingHours,
    this.isVisible = true,
  });

  factory _$FacilityCreateRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$FacilityCreateRequestImplFromJson(json);

  @override
  final String name;
  @override
  final String description;
  @override
  final String location;
  @override
  final int capacity;
  @override
  final String otherDetails;
  @override
  final double usageFee;
  @override
  final String? openingHours;
  @override
  @JsonKey()
  final bool isVisible;

  @override
  String toString() {
    return 'FacilityCreateRequest(name: $name, description: $description, location: $location, capacity: $capacity, otherDetails: $otherDetails, usageFee: $usageFee, openingHours: $openingHours, isVisible: $isVisible)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FacilityCreateRequestImpl &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.capacity, capacity) ||
                other.capacity == capacity) &&
            (identical(other.otherDetails, otherDetails) ||
                other.otherDetails == otherDetails) &&
            (identical(other.usageFee, usageFee) ||
                other.usageFee == usageFee) &&
            (identical(other.openingHours, openingHours) ||
                other.openingHours == openingHours) &&
            (identical(other.isVisible, isVisible) ||
                other.isVisible == isVisible));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    name,
    description,
    location,
    capacity,
    otherDetails,
    usageFee,
    openingHours,
    isVisible,
  );

  /// Create a copy of FacilityCreateRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FacilityCreateRequestImplCopyWith<_$FacilityCreateRequestImpl>
  get copyWith =>
      __$$FacilityCreateRequestImplCopyWithImpl<_$FacilityCreateRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$FacilityCreateRequestImplToJson(this);
  }
}

abstract class _FacilityCreateRequest implements FacilityCreateRequest {
  const factory _FacilityCreateRequest({
    required final String name,
    required final String description,
    required final String location,
    required final int capacity,
    required final String otherDetails,
    required final double usageFee,
    final String? openingHours,
    final bool isVisible,
  }) = _$FacilityCreateRequestImpl;

  factory _FacilityCreateRequest.fromJson(Map<String, dynamic> json) =
      _$FacilityCreateRequestImpl.fromJson;

  @override
  String get name;
  @override
  String get description;
  @override
  String get location;
  @override
  int get capacity;
  @override
  String get otherDetails;
  @override
  double get usageFee;
  @override
  String? get openingHours;
  @override
  bool get isVisible;

  /// Create a copy of FacilityCreateRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FacilityCreateRequestImplCopyWith<_$FacilityCreateRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}

FacilityUpdateRequest _$FacilityUpdateRequestFromJson(
  Map<String, dynamic> json,
) {
  return _FacilityUpdateRequest.fromJson(json);
}

/// @nodoc
mixin _$FacilityUpdateRequest {
  String? get name => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  String? get location => throw _privateConstructorUsedError;
  int? get capacity => throw _privateConstructorUsedError;
  String? get otherDetails => throw _privateConstructorUsedError;
  double? get usageFee => throw _privateConstructorUsedError;
  String? get openingHours => throw _privateConstructorUsedError;
  bool? get isVisible => throw _privateConstructorUsedError;

  /// Serializes this FacilityUpdateRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FacilityUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FacilityUpdateRequestCopyWith<FacilityUpdateRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FacilityUpdateRequestCopyWith<$Res> {
  factory $FacilityUpdateRequestCopyWith(
    FacilityUpdateRequest value,
    $Res Function(FacilityUpdateRequest) then,
  ) = _$FacilityUpdateRequestCopyWithImpl<$Res, FacilityUpdateRequest>;
  @useResult
  $Res call({
    String? name,
    String? description,
    String? location,
    int? capacity,
    String? otherDetails,
    double? usageFee,
    String? openingHours,
    bool? isVisible,
  });
}

/// @nodoc
class _$FacilityUpdateRequestCopyWithImpl<
  $Res,
  $Val extends FacilityUpdateRequest
>
    implements $FacilityUpdateRequestCopyWith<$Res> {
  _$FacilityUpdateRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FacilityUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = freezed,
    Object? description = freezed,
    Object? location = freezed,
    Object? capacity = freezed,
    Object? otherDetails = freezed,
    Object? usageFee = freezed,
    Object? openingHours = freezed,
    Object? isVisible = freezed,
  }) {
    return _then(
      _value.copyWith(
            name: freezed == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String?,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            location: freezed == location
                ? _value.location
                : location // ignore: cast_nullable_to_non_nullable
                      as String?,
            capacity: freezed == capacity
                ? _value.capacity
                : capacity // ignore: cast_nullable_to_non_nullable
                      as int?,
            otherDetails: freezed == otherDetails
                ? _value.otherDetails
                : otherDetails // ignore: cast_nullable_to_non_nullable
                      as String?,
            usageFee: freezed == usageFee
                ? _value.usageFee
                : usageFee // ignore: cast_nullable_to_non_nullable
                      as double?,
            openingHours: freezed == openingHours
                ? _value.openingHours
                : openingHours // ignore: cast_nullable_to_non_nullable
                      as String?,
            isVisible: freezed == isVisible
                ? _value.isVisible
                : isVisible // ignore: cast_nullable_to_non_nullable
                      as bool?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FacilityUpdateRequestImplCopyWith<$Res>
    implements $FacilityUpdateRequestCopyWith<$Res> {
  factory _$$FacilityUpdateRequestImplCopyWith(
    _$FacilityUpdateRequestImpl value,
    $Res Function(_$FacilityUpdateRequestImpl) then,
  ) = __$$FacilityUpdateRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String? name,
    String? description,
    String? location,
    int? capacity,
    String? otherDetails,
    double? usageFee,
    String? openingHours,
    bool? isVisible,
  });
}

/// @nodoc
class __$$FacilityUpdateRequestImplCopyWithImpl<$Res>
    extends
        _$FacilityUpdateRequestCopyWithImpl<$Res, _$FacilityUpdateRequestImpl>
    implements _$$FacilityUpdateRequestImplCopyWith<$Res> {
  __$$FacilityUpdateRequestImplCopyWithImpl(
    _$FacilityUpdateRequestImpl _value,
    $Res Function(_$FacilityUpdateRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FacilityUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = freezed,
    Object? description = freezed,
    Object? location = freezed,
    Object? capacity = freezed,
    Object? otherDetails = freezed,
    Object? usageFee = freezed,
    Object? openingHours = freezed,
    Object? isVisible = freezed,
  }) {
    return _then(
      _$FacilityUpdateRequestImpl(
        name: freezed == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String?,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        location: freezed == location
            ? _value.location
            : location // ignore: cast_nullable_to_non_nullable
                  as String?,
        capacity: freezed == capacity
            ? _value.capacity
            : capacity // ignore: cast_nullable_to_non_nullable
                  as int?,
        otherDetails: freezed == otherDetails
            ? _value.otherDetails
            : otherDetails // ignore: cast_nullable_to_non_nullable
                  as String?,
        usageFee: freezed == usageFee
            ? _value.usageFee
            : usageFee // ignore: cast_nullable_to_non_nullable
                  as double?,
        openingHours: freezed == openingHours
            ? _value.openingHours
            : openingHours // ignore: cast_nullable_to_non_nullable
                  as String?,
        isVisible: freezed == isVisible
            ? _value.isVisible
            : isVisible // ignore: cast_nullable_to_non_nullable
                  as bool?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FacilityUpdateRequestImpl implements _FacilityUpdateRequest {
  const _$FacilityUpdateRequestImpl({
    this.name,
    this.description,
    this.location,
    this.capacity,
    this.otherDetails,
    this.usageFee,
    this.openingHours,
    this.isVisible,
  });

  factory _$FacilityUpdateRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$FacilityUpdateRequestImplFromJson(json);

  @override
  final String? name;
  @override
  final String? description;
  @override
  final String? location;
  @override
  final int? capacity;
  @override
  final String? otherDetails;
  @override
  final double? usageFee;
  @override
  final String? openingHours;
  @override
  final bool? isVisible;

  @override
  String toString() {
    return 'FacilityUpdateRequest(name: $name, description: $description, location: $location, capacity: $capacity, otherDetails: $otherDetails, usageFee: $usageFee, openingHours: $openingHours, isVisible: $isVisible)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FacilityUpdateRequestImpl &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.capacity, capacity) ||
                other.capacity == capacity) &&
            (identical(other.otherDetails, otherDetails) ||
                other.otherDetails == otherDetails) &&
            (identical(other.usageFee, usageFee) ||
                other.usageFee == usageFee) &&
            (identical(other.openingHours, openingHours) ||
                other.openingHours == openingHours) &&
            (identical(other.isVisible, isVisible) ||
                other.isVisible == isVisible));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    name,
    description,
    location,
    capacity,
    otherDetails,
    usageFee,
    openingHours,
    isVisible,
  );

  /// Create a copy of FacilityUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FacilityUpdateRequestImplCopyWith<_$FacilityUpdateRequestImpl>
  get copyWith =>
      __$$FacilityUpdateRequestImplCopyWithImpl<_$FacilityUpdateRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$FacilityUpdateRequestImplToJson(this);
  }
}

abstract class _FacilityUpdateRequest implements FacilityUpdateRequest {
  const factory _FacilityUpdateRequest({
    final String? name,
    final String? description,
    final String? location,
    final int? capacity,
    final String? otherDetails,
    final double? usageFee,
    final String? openingHours,
    final bool? isVisible,
  }) = _$FacilityUpdateRequestImpl;

  factory _FacilityUpdateRequest.fromJson(Map<String, dynamic> json) =
      _$FacilityUpdateRequestImpl.fromJson;

  @override
  String? get name;
  @override
  String? get description;
  @override
  String? get location;
  @override
  int? get capacity;
  @override
  String? get otherDetails;
  @override
  double? get usageFee;
  @override
  String? get openingHours;
  @override
  bool? get isVisible;

  /// Create a copy of FacilityUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FacilityUpdateRequestImplCopyWith<_$FacilityUpdateRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}
