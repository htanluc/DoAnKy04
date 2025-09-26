// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Event _$EventFromJson(Map<String, dynamic> json) {
  return _Event.fromJson(json);
}

/// @nodoc
mixin _$Event {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  DateTime get startTime => throw _privateConstructorUsedError;
  DateTime get endTime => throw _privateConstructorUsedError;
  String get location => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  int get participantCount => throw _privateConstructorUsedError;
  bool get registered => throw _privateConstructorUsedError;
  String? get qrCode =>
      throw _privateConstructorUsedError; // QR code for check-in
  DateTime? get qrCodeExpiresAt =>
      throw _privateConstructorUsedError; // QR code expiration time
  bool? get checkedIn => throw _privateConstructorUsedError; // Check-in status
  DateTime? get checkedInAt =>
      throw _privateConstructorUsedError; // Check-in timestamp
  DateTime? get registrationDeadline =>
      throw _privateConstructorUsedError; // Registration deadline
  bool get canRegister => throw _privateConstructorUsedError;

  /// Serializes this Event to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Event
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $EventCopyWith<Event> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $EventCopyWith<$Res> {
  factory $EventCopyWith(Event value, $Res Function(Event) then) =
      _$EventCopyWithImpl<$Res, Event>;
  @useResult
  $Res call({
    String id,
    String title,
    String description,
    DateTime startTime,
    DateTime endTime,
    String location,
    DateTime createdAt,
    int participantCount,
    bool registered,
    String? qrCode,
    DateTime? qrCodeExpiresAt,
    bool? checkedIn,
    DateTime? checkedInAt,
    DateTime? registrationDeadline,
    bool canRegister,
  });
}

/// @nodoc
class _$EventCopyWithImpl<$Res, $Val extends Event>
    implements $EventCopyWith<$Res> {
  _$EventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Event
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? description = null,
    Object? startTime = null,
    Object? endTime = null,
    Object? location = null,
    Object? createdAt = null,
    Object? participantCount = null,
    Object? registered = null,
    Object? qrCode = freezed,
    Object? qrCodeExpiresAt = freezed,
    Object? checkedIn = freezed,
    Object? checkedInAt = freezed,
    Object? registrationDeadline = freezed,
    Object? canRegister = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            startTime: null == startTime
                ? _value.startTime
                : startTime // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            endTime: null == endTime
                ? _value.endTime
                : endTime // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            location: null == location
                ? _value.location
                : location // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            participantCount: null == participantCount
                ? _value.participantCount
                : participantCount // ignore: cast_nullable_to_non_nullable
                      as int,
            registered: null == registered
                ? _value.registered
                : registered // ignore: cast_nullable_to_non_nullable
                      as bool,
            qrCode: freezed == qrCode
                ? _value.qrCode
                : qrCode // ignore: cast_nullable_to_non_nullable
                      as String?,
            qrCodeExpiresAt: freezed == qrCodeExpiresAt
                ? _value.qrCodeExpiresAt
                : qrCodeExpiresAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            checkedIn: freezed == checkedIn
                ? _value.checkedIn
                : checkedIn // ignore: cast_nullable_to_non_nullable
                      as bool?,
            checkedInAt: freezed == checkedInAt
                ? _value.checkedInAt
                : checkedInAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            registrationDeadline: freezed == registrationDeadline
                ? _value.registrationDeadline
                : registrationDeadline // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            canRegister: null == canRegister
                ? _value.canRegister
                : canRegister // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$EventImplCopyWith<$Res> implements $EventCopyWith<$Res> {
  factory _$$EventImplCopyWith(
    _$EventImpl value,
    $Res Function(_$EventImpl) then,
  ) = __$$EventImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String title,
    String description,
    DateTime startTime,
    DateTime endTime,
    String location,
    DateTime createdAt,
    int participantCount,
    bool registered,
    String? qrCode,
    DateTime? qrCodeExpiresAt,
    bool? checkedIn,
    DateTime? checkedInAt,
    DateTime? registrationDeadline,
    bool canRegister,
  });
}

/// @nodoc
class __$$EventImplCopyWithImpl<$Res>
    extends _$EventCopyWithImpl<$Res, _$EventImpl>
    implements _$$EventImplCopyWith<$Res> {
  __$$EventImplCopyWithImpl(
    _$EventImpl _value,
    $Res Function(_$EventImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Event
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? description = null,
    Object? startTime = null,
    Object? endTime = null,
    Object? location = null,
    Object? createdAt = null,
    Object? participantCount = null,
    Object? registered = null,
    Object? qrCode = freezed,
    Object? qrCodeExpiresAt = freezed,
    Object? checkedIn = freezed,
    Object? checkedInAt = freezed,
    Object? registrationDeadline = freezed,
    Object? canRegister = null,
  }) {
    return _then(
      _$EventImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        startTime: null == startTime
            ? _value.startTime
            : startTime // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        endTime: null == endTime
            ? _value.endTime
            : endTime // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        location: null == location
            ? _value.location
            : location // ignore: cast_nullable_to_non_nullable
                  as String,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        participantCount: null == participantCount
            ? _value.participantCount
            : participantCount // ignore: cast_nullable_to_non_nullable
                  as int,
        registered: null == registered
            ? _value.registered
            : registered // ignore: cast_nullable_to_non_nullable
                  as bool,
        qrCode: freezed == qrCode
            ? _value.qrCode
            : qrCode // ignore: cast_nullable_to_non_nullable
                  as String?,
        qrCodeExpiresAt: freezed == qrCodeExpiresAt
            ? _value.qrCodeExpiresAt
            : qrCodeExpiresAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        checkedIn: freezed == checkedIn
            ? _value.checkedIn
            : checkedIn // ignore: cast_nullable_to_non_nullable
                  as bool?,
        checkedInAt: freezed == checkedInAt
            ? _value.checkedInAt
            : checkedInAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        registrationDeadline: freezed == registrationDeadline
            ? _value.registrationDeadline
            : registrationDeadline // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        canRegister: null == canRegister
            ? _value.canRegister
            : canRegister // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$EventImpl implements _Event {
  const _$EventImpl({
    required this.id,
    required this.title,
    required this.description,
    required this.startTime,
    required this.endTime,
    required this.location,
    required this.createdAt,
    required this.participantCount,
    required this.registered,
    this.qrCode,
    this.qrCodeExpiresAt,
    this.checkedIn,
    this.checkedInAt,
    this.registrationDeadline,
    this.canRegister = true,
  });

  factory _$EventImpl.fromJson(Map<String, dynamic> json) =>
      _$$EventImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final String description;
  @override
  final DateTime startTime;
  @override
  final DateTime endTime;
  @override
  final String location;
  @override
  final DateTime createdAt;
  @override
  final int participantCount;
  @override
  final bool registered;
  @override
  final String? qrCode;
  // QR code for check-in
  @override
  final DateTime? qrCodeExpiresAt;
  // QR code expiration time
  @override
  final bool? checkedIn;
  // Check-in status
  @override
  final DateTime? checkedInAt;
  // Check-in timestamp
  @override
  final DateTime? registrationDeadline;
  // Registration deadline
  @override
  @JsonKey()
  final bool canRegister;

  @override
  String toString() {
    return 'Event(id: $id, title: $title, description: $description, startTime: $startTime, endTime: $endTime, location: $location, createdAt: $createdAt, participantCount: $participantCount, registered: $registered, qrCode: $qrCode, qrCodeExpiresAt: $qrCodeExpiresAt, checkedIn: $checkedIn, checkedInAt: $checkedInAt, registrationDeadline: $registrationDeadline, canRegister: $canRegister)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$EventImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.startTime, startTime) ||
                other.startTime == startTime) &&
            (identical(other.endTime, endTime) || other.endTime == endTime) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.participantCount, participantCount) ||
                other.participantCount == participantCount) &&
            (identical(other.registered, registered) ||
                other.registered == registered) &&
            (identical(other.qrCode, qrCode) || other.qrCode == qrCode) &&
            (identical(other.qrCodeExpiresAt, qrCodeExpiresAt) ||
                other.qrCodeExpiresAt == qrCodeExpiresAt) &&
            (identical(other.checkedIn, checkedIn) ||
                other.checkedIn == checkedIn) &&
            (identical(other.checkedInAt, checkedInAt) ||
                other.checkedInAt == checkedInAt) &&
            (identical(other.registrationDeadline, registrationDeadline) ||
                other.registrationDeadline == registrationDeadline) &&
            (identical(other.canRegister, canRegister) ||
                other.canRegister == canRegister));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    title,
    description,
    startTime,
    endTime,
    location,
    createdAt,
    participantCount,
    registered,
    qrCode,
    qrCodeExpiresAt,
    checkedIn,
    checkedInAt,
    registrationDeadline,
    canRegister,
  );

  /// Create a copy of Event
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$EventImplCopyWith<_$EventImpl> get copyWith =>
      __$$EventImplCopyWithImpl<_$EventImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$EventImplToJson(this);
  }
}

abstract class _Event implements Event {
  const factory _Event({
    required final String id,
    required final String title,
    required final String description,
    required final DateTime startTime,
    required final DateTime endTime,
    required final String location,
    required final DateTime createdAt,
    required final int participantCount,
    required final bool registered,
    final String? qrCode,
    final DateTime? qrCodeExpiresAt,
    final bool? checkedIn,
    final DateTime? checkedInAt,
    final DateTime? registrationDeadline,
    final bool canRegister,
  }) = _$EventImpl;

  factory _Event.fromJson(Map<String, dynamic> json) = _$EventImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  String get description;
  @override
  DateTime get startTime;
  @override
  DateTime get endTime;
  @override
  String get location;
  @override
  DateTime get createdAt;
  @override
  int get participantCount;
  @override
  bool get registered;
  @override
  String? get qrCode; // QR code for check-in
  @override
  DateTime? get qrCodeExpiresAt; // QR code expiration time
  @override
  bool? get checkedIn; // Check-in status
  @override
  DateTime? get checkedInAt; // Check-in timestamp
  @override
  DateTime? get registrationDeadline; // Registration deadline
  @override
  bool get canRegister;

  /// Create a copy of Event
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$EventImplCopyWith<_$EventImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
