// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'request_status.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

RequestStatus _$RequestStatusFromJson(Map<String, dynamic> json) {
  return _RequestStatus.fromJson(json);
}

/// @nodoc
mixin _$RequestStatus {
  String get status => throw _privateConstructorUsedError;
  String get displayName => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  int get step => throw _privateConstructorUsedError;
  bool get isCompleted => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;
  bool get isCancelled => throw _privateConstructorUsedError;

  /// Serializes this RequestStatus to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RequestStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RequestStatusCopyWith<RequestStatus> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RequestStatusCopyWith<$Res> {
  factory $RequestStatusCopyWith(
    RequestStatus value,
    $Res Function(RequestStatus) then,
  ) = _$RequestStatusCopyWithImpl<$Res, RequestStatus>;
  @useResult
  $Res call({
    String status,
    String displayName,
    String description,
    int step,
    bool isCompleted,
    bool isActive,
    bool isCancelled,
  });
}

/// @nodoc
class _$RequestStatusCopyWithImpl<$Res, $Val extends RequestStatus>
    implements $RequestStatusCopyWith<$Res> {
  _$RequestStatusCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RequestStatus
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? status = null,
    Object? displayName = null,
    Object? description = null,
    Object? step = null,
    Object? isCompleted = null,
    Object? isActive = null,
    Object? isCancelled = null,
  }) {
    return _then(
      _value.copyWith(
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            displayName: null == displayName
                ? _value.displayName
                : displayName // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            step: null == step
                ? _value.step
                : step // ignore: cast_nullable_to_non_nullable
                      as int,
            isCompleted: null == isCompleted
                ? _value.isCompleted
                : isCompleted // ignore: cast_nullable_to_non_nullable
                      as bool,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
            isCancelled: null == isCancelled
                ? _value.isCancelled
                : isCancelled // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RequestStatusImplCopyWith<$Res>
    implements $RequestStatusCopyWith<$Res> {
  factory _$$RequestStatusImplCopyWith(
    _$RequestStatusImpl value,
    $Res Function(_$RequestStatusImpl) then,
  ) = __$$RequestStatusImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String status,
    String displayName,
    String description,
    int step,
    bool isCompleted,
    bool isActive,
    bool isCancelled,
  });
}

/// @nodoc
class __$$RequestStatusImplCopyWithImpl<$Res>
    extends _$RequestStatusCopyWithImpl<$Res, _$RequestStatusImpl>
    implements _$$RequestStatusImplCopyWith<$Res> {
  __$$RequestStatusImplCopyWithImpl(
    _$RequestStatusImpl _value,
    $Res Function(_$RequestStatusImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RequestStatus
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? status = null,
    Object? displayName = null,
    Object? description = null,
    Object? step = null,
    Object? isCompleted = null,
    Object? isActive = null,
    Object? isCancelled = null,
  }) {
    return _then(
      _$RequestStatusImpl(
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        displayName: null == displayName
            ? _value.displayName
            : displayName // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        step: null == step
            ? _value.step
            : step // ignore: cast_nullable_to_non_nullable
                  as int,
        isCompleted: null == isCompleted
            ? _value.isCompleted
            : isCompleted // ignore: cast_nullable_to_non_nullable
                  as bool,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
        isCancelled: null == isCancelled
            ? _value.isCancelled
            : isCancelled // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$RequestStatusImpl implements _RequestStatus {
  const _$RequestStatusImpl({
    required this.status,
    required this.displayName,
    required this.description,
    required this.step,
    required this.isCompleted,
    required this.isActive,
    required this.isCancelled,
  });

  factory _$RequestStatusImpl.fromJson(Map<String, dynamic> json) =>
      _$$RequestStatusImplFromJson(json);

  @override
  final String status;
  @override
  final String displayName;
  @override
  final String description;
  @override
  final int step;
  @override
  final bool isCompleted;
  @override
  final bool isActive;
  @override
  final bool isCancelled;

  @override
  String toString() {
    return 'RequestStatus(status: $status, displayName: $displayName, description: $description, step: $step, isCompleted: $isCompleted, isActive: $isActive, isCancelled: $isCancelled)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RequestStatusImpl &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.step, step) || other.step == step) &&
            (identical(other.isCompleted, isCompleted) ||
                other.isCompleted == isCompleted) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.isCancelled, isCancelled) ||
                other.isCancelled == isCancelled));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    status,
    displayName,
    description,
    step,
    isCompleted,
    isActive,
    isCancelled,
  );

  /// Create a copy of RequestStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RequestStatusImplCopyWith<_$RequestStatusImpl> get copyWith =>
      __$$RequestStatusImplCopyWithImpl<_$RequestStatusImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RequestStatusImplToJson(this);
  }
}

abstract class _RequestStatus implements RequestStatus {
  const factory _RequestStatus({
    required final String status,
    required final String displayName,
    required final String description,
    required final int step,
    required final bool isCompleted,
    required final bool isActive,
    required final bool isCancelled,
  }) = _$RequestStatusImpl;

  factory _RequestStatus.fromJson(Map<String, dynamic> json) =
      _$RequestStatusImpl.fromJson;

  @override
  String get status;
  @override
  String get displayName;
  @override
  String get description;
  @override
  int get step;
  @override
  bool get isCompleted;
  @override
  bool get isActive;
  @override
  bool get isCancelled;

  /// Create a copy of RequestStatus
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RequestStatusImplCopyWith<_$RequestStatusImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
