// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'availability.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

TimeSlot _$TimeSlotFromJson(Map<String, dynamic> json) {
  return _TimeSlot.fromJson(json);
}

/// @nodoc
mixin _$TimeSlot {
  String get startTime => throw _privateConstructorUsedError;
  String get endTime => throw _privateConstructorUsedError;
  bool get isAvailable => throw _privateConstructorUsedError;
  bool get isBooked => throw _privateConstructorUsedError;
  String? get bookingId => throw _privateConstructorUsedError;

  /// Serializes this TimeSlot to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TimeSlot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TimeSlotCopyWith<TimeSlot> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TimeSlotCopyWith<$Res> {
  factory $TimeSlotCopyWith(TimeSlot value, $Res Function(TimeSlot) then) =
      _$TimeSlotCopyWithImpl<$Res, TimeSlot>;
  @useResult
  $Res call({
    String startTime,
    String endTime,
    bool isAvailable,
    bool isBooked,
    String? bookingId,
  });
}

/// @nodoc
class _$TimeSlotCopyWithImpl<$Res, $Val extends TimeSlot>
    implements $TimeSlotCopyWith<$Res> {
  _$TimeSlotCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TimeSlot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? startTime = null,
    Object? endTime = null,
    Object? isAvailable = null,
    Object? isBooked = null,
    Object? bookingId = freezed,
  }) {
    return _then(
      _value.copyWith(
            startTime: null == startTime
                ? _value.startTime
                : startTime // ignore: cast_nullable_to_non_nullable
                      as String,
            endTime: null == endTime
                ? _value.endTime
                : endTime // ignore: cast_nullable_to_non_nullable
                      as String,
            isAvailable: null == isAvailable
                ? _value.isAvailable
                : isAvailable // ignore: cast_nullable_to_non_nullable
                      as bool,
            isBooked: null == isBooked
                ? _value.isBooked
                : isBooked // ignore: cast_nullable_to_non_nullable
                      as bool,
            bookingId: freezed == bookingId
                ? _value.bookingId
                : bookingId // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$TimeSlotImplCopyWith<$Res>
    implements $TimeSlotCopyWith<$Res> {
  factory _$$TimeSlotImplCopyWith(
    _$TimeSlotImpl value,
    $Res Function(_$TimeSlotImpl) then,
  ) = __$$TimeSlotImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String startTime,
    String endTime,
    bool isAvailable,
    bool isBooked,
    String? bookingId,
  });
}

/// @nodoc
class __$$TimeSlotImplCopyWithImpl<$Res>
    extends _$TimeSlotCopyWithImpl<$Res, _$TimeSlotImpl>
    implements _$$TimeSlotImplCopyWith<$Res> {
  __$$TimeSlotImplCopyWithImpl(
    _$TimeSlotImpl _value,
    $Res Function(_$TimeSlotImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of TimeSlot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? startTime = null,
    Object? endTime = null,
    Object? isAvailable = null,
    Object? isBooked = null,
    Object? bookingId = freezed,
  }) {
    return _then(
      _$TimeSlotImpl(
        startTime: null == startTime
            ? _value.startTime
            : startTime // ignore: cast_nullable_to_non_nullable
                  as String,
        endTime: null == endTime
            ? _value.endTime
            : endTime // ignore: cast_nullable_to_non_nullable
                  as String,
        isAvailable: null == isAvailable
            ? _value.isAvailable
            : isAvailable // ignore: cast_nullable_to_non_nullable
                  as bool,
        isBooked: null == isBooked
            ? _value.isBooked
            : isBooked // ignore: cast_nullable_to_non_nullable
                  as bool,
        bookingId: freezed == bookingId
            ? _value.bookingId
            : bookingId // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$TimeSlotImpl implements _TimeSlot {
  const _$TimeSlotImpl({
    required this.startTime,
    required this.endTime,
    required this.isAvailable,
    this.isBooked = false,
    this.bookingId,
  });

  factory _$TimeSlotImpl.fromJson(Map<String, dynamic> json) =>
      _$$TimeSlotImplFromJson(json);

  @override
  final String startTime;
  @override
  final String endTime;
  @override
  final bool isAvailable;
  @override
  @JsonKey()
  final bool isBooked;
  @override
  final String? bookingId;

  @override
  String toString() {
    return 'TimeSlot(startTime: $startTime, endTime: $endTime, isAvailable: $isAvailable, isBooked: $isBooked, bookingId: $bookingId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TimeSlotImpl &&
            (identical(other.startTime, startTime) ||
                other.startTime == startTime) &&
            (identical(other.endTime, endTime) || other.endTime == endTime) &&
            (identical(other.isAvailable, isAvailable) ||
                other.isAvailable == isAvailable) &&
            (identical(other.isBooked, isBooked) ||
                other.isBooked == isBooked) &&
            (identical(other.bookingId, bookingId) ||
                other.bookingId == bookingId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    startTime,
    endTime,
    isAvailable,
    isBooked,
    bookingId,
  );

  /// Create a copy of TimeSlot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TimeSlotImplCopyWith<_$TimeSlotImpl> get copyWith =>
      __$$TimeSlotImplCopyWithImpl<_$TimeSlotImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TimeSlotImplToJson(this);
  }
}

abstract class _TimeSlot implements TimeSlot {
  const factory _TimeSlot({
    required final String startTime,
    required final String endTime,
    required final bool isAvailable,
    final bool isBooked,
    final String? bookingId,
  }) = _$TimeSlotImpl;

  factory _TimeSlot.fromJson(Map<String, dynamic> json) =
      _$TimeSlotImpl.fromJson;

  @override
  String get startTime;
  @override
  String get endTime;
  @override
  bool get isAvailable;
  @override
  bool get isBooked;
  @override
  String? get bookingId;

  /// Create a copy of TimeSlot
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TimeSlotImplCopyWith<_$TimeSlotImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

FacilityAvailability _$FacilityAvailabilityFromJson(Map<String, dynamic> json) {
  return _FacilityAvailability.fromJson(json);
}

/// @nodoc
mixin _$FacilityAvailability {
  int get facilityId => throw _privateConstructorUsedError;
  String get date => throw _privateConstructorUsedError;
  List<TimeSlot> get timeSlots => throw _privateConstructorUsedError;
  int get totalSlots => throw _privateConstructorUsedError;
  int get availableSlots => throw _privateConstructorUsedError;
  int get bookedSlots => throw _privateConstructorUsedError;

  /// Serializes this FacilityAvailability to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FacilityAvailability
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FacilityAvailabilityCopyWith<FacilityAvailability> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FacilityAvailabilityCopyWith<$Res> {
  factory $FacilityAvailabilityCopyWith(
    FacilityAvailability value,
    $Res Function(FacilityAvailability) then,
  ) = _$FacilityAvailabilityCopyWithImpl<$Res, FacilityAvailability>;
  @useResult
  $Res call({
    int facilityId,
    String date,
    List<TimeSlot> timeSlots,
    int totalSlots,
    int availableSlots,
    int bookedSlots,
  });
}

/// @nodoc
class _$FacilityAvailabilityCopyWithImpl<
  $Res,
  $Val extends FacilityAvailability
>
    implements $FacilityAvailabilityCopyWith<$Res> {
  _$FacilityAvailabilityCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FacilityAvailability
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? facilityId = null,
    Object? date = null,
    Object? timeSlots = null,
    Object? totalSlots = null,
    Object? availableSlots = null,
    Object? bookedSlots = null,
  }) {
    return _then(
      _value.copyWith(
            facilityId: null == facilityId
                ? _value.facilityId
                : facilityId // ignore: cast_nullable_to_non_nullable
                      as int,
            date: null == date
                ? _value.date
                : date // ignore: cast_nullable_to_non_nullable
                      as String,
            timeSlots: null == timeSlots
                ? _value.timeSlots
                : timeSlots // ignore: cast_nullable_to_non_nullable
                      as List<TimeSlot>,
            totalSlots: null == totalSlots
                ? _value.totalSlots
                : totalSlots // ignore: cast_nullable_to_non_nullable
                      as int,
            availableSlots: null == availableSlots
                ? _value.availableSlots
                : availableSlots // ignore: cast_nullable_to_non_nullable
                      as int,
            bookedSlots: null == bookedSlots
                ? _value.bookedSlots
                : bookedSlots // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FacilityAvailabilityImplCopyWith<$Res>
    implements $FacilityAvailabilityCopyWith<$Res> {
  factory _$$FacilityAvailabilityImplCopyWith(
    _$FacilityAvailabilityImpl value,
    $Res Function(_$FacilityAvailabilityImpl) then,
  ) = __$$FacilityAvailabilityImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int facilityId,
    String date,
    List<TimeSlot> timeSlots,
    int totalSlots,
    int availableSlots,
    int bookedSlots,
  });
}

/// @nodoc
class __$$FacilityAvailabilityImplCopyWithImpl<$Res>
    extends _$FacilityAvailabilityCopyWithImpl<$Res, _$FacilityAvailabilityImpl>
    implements _$$FacilityAvailabilityImplCopyWith<$Res> {
  __$$FacilityAvailabilityImplCopyWithImpl(
    _$FacilityAvailabilityImpl _value,
    $Res Function(_$FacilityAvailabilityImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FacilityAvailability
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? facilityId = null,
    Object? date = null,
    Object? timeSlots = null,
    Object? totalSlots = null,
    Object? availableSlots = null,
    Object? bookedSlots = null,
  }) {
    return _then(
      _$FacilityAvailabilityImpl(
        facilityId: null == facilityId
            ? _value.facilityId
            : facilityId // ignore: cast_nullable_to_non_nullable
                  as int,
        date: null == date
            ? _value.date
            : date // ignore: cast_nullable_to_non_nullable
                  as String,
        timeSlots: null == timeSlots
            ? _value._timeSlots
            : timeSlots // ignore: cast_nullable_to_non_nullable
                  as List<TimeSlot>,
        totalSlots: null == totalSlots
            ? _value.totalSlots
            : totalSlots // ignore: cast_nullable_to_non_nullable
                  as int,
        availableSlots: null == availableSlots
            ? _value.availableSlots
            : availableSlots // ignore: cast_nullable_to_non_nullable
                  as int,
        bookedSlots: null == bookedSlots
            ? _value.bookedSlots
            : bookedSlots // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FacilityAvailabilityImpl implements _FacilityAvailability {
  const _$FacilityAvailabilityImpl({
    required this.facilityId,
    required this.date,
    required final List<TimeSlot> timeSlots,
    this.totalSlots = 0,
    this.availableSlots = 0,
    this.bookedSlots = 0,
  }) : _timeSlots = timeSlots;

  factory _$FacilityAvailabilityImpl.fromJson(Map<String, dynamic> json) =>
      _$$FacilityAvailabilityImplFromJson(json);

  @override
  final int facilityId;
  @override
  final String date;
  final List<TimeSlot> _timeSlots;
  @override
  List<TimeSlot> get timeSlots {
    if (_timeSlots is EqualUnmodifiableListView) return _timeSlots;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_timeSlots);
  }

  @override
  @JsonKey()
  final int totalSlots;
  @override
  @JsonKey()
  final int availableSlots;
  @override
  @JsonKey()
  final int bookedSlots;

  @override
  String toString() {
    return 'FacilityAvailability(facilityId: $facilityId, date: $date, timeSlots: $timeSlots, totalSlots: $totalSlots, availableSlots: $availableSlots, bookedSlots: $bookedSlots)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FacilityAvailabilityImpl &&
            (identical(other.facilityId, facilityId) ||
                other.facilityId == facilityId) &&
            (identical(other.date, date) || other.date == date) &&
            const DeepCollectionEquality().equals(
              other._timeSlots,
              _timeSlots,
            ) &&
            (identical(other.totalSlots, totalSlots) ||
                other.totalSlots == totalSlots) &&
            (identical(other.availableSlots, availableSlots) ||
                other.availableSlots == availableSlots) &&
            (identical(other.bookedSlots, bookedSlots) ||
                other.bookedSlots == bookedSlots));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    facilityId,
    date,
    const DeepCollectionEquality().hash(_timeSlots),
    totalSlots,
    availableSlots,
    bookedSlots,
  );

  /// Create a copy of FacilityAvailability
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FacilityAvailabilityImplCopyWith<_$FacilityAvailabilityImpl>
  get copyWith =>
      __$$FacilityAvailabilityImplCopyWithImpl<_$FacilityAvailabilityImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$FacilityAvailabilityImplToJson(this);
  }
}

abstract class _FacilityAvailability implements FacilityAvailability {
  const factory _FacilityAvailability({
    required final int facilityId,
    required final String date,
    required final List<TimeSlot> timeSlots,
    final int totalSlots,
    final int availableSlots,
    final int bookedSlots,
  }) = _$FacilityAvailabilityImpl;

  factory _FacilityAvailability.fromJson(Map<String, dynamic> json) =
      _$FacilityAvailabilityImpl.fromJson;

  @override
  int get facilityId;
  @override
  String get date;
  @override
  List<TimeSlot> get timeSlots;
  @override
  int get totalSlots;
  @override
  int get availableSlots;
  @override
  int get bookedSlots;

  /// Create a copy of FacilityAvailability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FacilityAvailabilityImplCopyWith<_$FacilityAvailabilityImpl>
  get copyWith => throw _privateConstructorUsedError;
}

AvailabilityRequest _$AvailabilityRequestFromJson(Map<String, dynamic> json) {
  return _AvailabilityRequest.fromJson(json);
}

/// @nodoc
mixin _$AvailabilityRequest {
  int get facilityId => throw _privateConstructorUsedError;
  String get date => throw _privateConstructorUsedError;
  int get slotDurationMinutes => throw _privateConstructorUsedError;

  /// Serializes this AvailabilityRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AvailabilityRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AvailabilityRequestCopyWith<AvailabilityRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AvailabilityRequestCopyWith<$Res> {
  factory $AvailabilityRequestCopyWith(
    AvailabilityRequest value,
    $Res Function(AvailabilityRequest) then,
  ) = _$AvailabilityRequestCopyWithImpl<$Res, AvailabilityRequest>;
  @useResult
  $Res call({int facilityId, String date, int slotDurationMinutes});
}

/// @nodoc
class _$AvailabilityRequestCopyWithImpl<$Res, $Val extends AvailabilityRequest>
    implements $AvailabilityRequestCopyWith<$Res> {
  _$AvailabilityRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AvailabilityRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? facilityId = null,
    Object? date = null,
    Object? slotDurationMinutes = null,
  }) {
    return _then(
      _value.copyWith(
            facilityId: null == facilityId
                ? _value.facilityId
                : facilityId // ignore: cast_nullable_to_non_nullable
                      as int,
            date: null == date
                ? _value.date
                : date // ignore: cast_nullable_to_non_nullable
                      as String,
            slotDurationMinutes: null == slotDurationMinutes
                ? _value.slotDurationMinutes
                : slotDurationMinutes // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AvailabilityRequestImplCopyWith<$Res>
    implements $AvailabilityRequestCopyWith<$Res> {
  factory _$$AvailabilityRequestImplCopyWith(
    _$AvailabilityRequestImpl value,
    $Res Function(_$AvailabilityRequestImpl) then,
  ) = __$$AvailabilityRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int facilityId, String date, int slotDurationMinutes});
}

/// @nodoc
class __$$AvailabilityRequestImplCopyWithImpl<$Res>
    extends _$AvailabilityRequestCopyWithImpl<$Res, _$AvailabilityRequestImpl>
    implements _$$AvailabilityRequestImplCopyWith<$Res> {
  __$$AvailabilityRequestImplCopyWithImpl(
    _$AvailabilityRequestImpl _value,
    $Res Function(_$AvailabilityRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AvailabilityRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? facilityId = null,
    Object? date = null,
    Object? slotDurationMinutes = null,
  }) {
    return _then(
      _$AvailabilityRequestImpl(
        facilityId: null == facilityId
            ? _value.facilityId
            : facilityId // ignore: cast_nullable_to_non_nullable
                  as int,
        date: null == date
            ? _value.date
            : date // ignore: cast_nullable_to_non_nullable
                  as String,
        slotDurationMinutes: null == slotDurationMinutes
            ? _value.slotDurationMinutes
            : slotDurationMinutes // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AvailabilityRequestImpl implements _AvailabilityRequest {
  const _$AvailabilityRequestImpl({
    required this.facilityId,
    required this.date,
    this.slotDurationMinutes = 30,
  });

  factory _$AvailabilityRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$AvailabilityRequestImplFromJson(json);

  @override
  final int facilityId;
  @override
  final String date;
  @override
  @JsonKey()
  final int slotDurationMinutes;

  @override
  String toString() {
    return 'AvailabilityRequest(facilityId: $facilityId, date: $date, slotDurationMinutes: $slotDurationMinutes)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AvailabilityRequestImpl &&
            (identical(other.facilityId, facilityId) ||
                other.facilityId == facilityId) &&
            (identical(other.date, date) || other.date == date) &&
            (identical(other.slotDurationMinutes, slotDurationMinutes) ||
                other.slotDurationMinutes == slotDurationMinutes));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, facilityId, date, slotDurationMinutes);

  /// Create a copy of AvailabilityRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AvailabilityRequestImplCopyWith<_$AvailabilityRequestImpl> get copyWith =>
      __$$AvailabilityRequestImplCopyWithImpl<_$AvailabilityRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$AvailabilityRequestImplToJson(this);
  }
}

abstract class _AvailabilityRequest implements AvailabilityRequest {
  const factory _AvailabilityRequest({
    required final int facilityId,
    required final String date,
    final int slotDurationMinutes,
  }) = _$AvailabilityRequestImpl;

  factory _AvailabilityRequest.fromJson(Map<String, dynamic> json) =
      _$AvailabilityRequestImpl.fromJson;

  @override
  int get facilityId;
  @override
  String get date;
  @override
  int get slotDurationMinutes;

  /// Create a copy of AvailabilityRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AvailabilityRequestImplCopyWith<_$AvailabilityRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
