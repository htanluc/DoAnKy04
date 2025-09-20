// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'booking.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

User _$UserFromJson(Map<String, dynamic> json) {
  return _User.fromJson(json);
}

/// @nodoc
mixin _$User {
  int get id => throw _privateConstructorUsedError;
  String get username => throw _privateConstructorUsedError;
  String get email => throw _privateConstructorUsedError;
  String? get phoneNumber => throw _privateConstructorUsedError;
  String? get fullName => throw _privateConstructorUsedError;
  String? get firstName => throw _privateConstructorUsedError;
  String? get lastName => throw _privateConstructorUsedError;
  String? get status => throw _privateConstructorUsedError;
  String? get lockReason => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;
  String? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this User to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of User
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UserCopyWith<User> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserCopyWith<$Res> {
  factory $UserCopyWith(User value, $Res Function(User) then) =
      _$UserCopyWithImpl<$Res, User>;
  @useResult
  $Res call({
    int id,
    String username,
    String email,
    String? phoneNumber,
    String? fullName,
    String? firstName,
    String? lastName,
    String? status,
    String? lockReason,
    String? createdAt,
    String? updatedAt,
  });
}

/// @nodoc
class _$UserCopyWithImpl<$Res, $Val extends User>
    implements $UserCopyWith<$Res> {
  _$UserCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of User
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? username = null,
    Object? email = null,
    Object? phoneNumber = freezed,
    Object? fullName = freezed,
    Object? firstName = freezed,
    Object? lastName = freezed,
    Object? status = freezed,
    Object? lockReason = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            username: null == username
                ? _value.username
                : username // ignore: cast_nullable_to_non_nullable
                      as String,
            email: null == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                      as String,
            phoneNumber: freezed == phoneNumber
                ? _value.phoneNumber
                : phoneNumber // ignore: cast_nullable_to_non_nullable
                      as String?,
            fullName: freezed == fullName
                ? _value.fullName
                : fullName // ignore: cast_nullable_to_non_nullable
                      as String?,
            firstName: freezed == firstName
                ? _value.firstName
                : firstName // ignore: cast_nullable_to_non_nullable
                      as String?,
            lastName: freezed == lastName
                ? _value.lastName
                : lastName // ignore: cast_nullable_to_non_nullable
                      as String?,
            status: freezed == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String?,
            lockReason: freezed == lockReason
                ? _value.lockReason
                : lockReason // ignore: cast_nullable_to_non_nullable
                      as String?,
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
abstract class _$$UserImplCopyWith<$Res> implements $UserCopyWith<$Res> {
  factory _$$UserImplCopyWith(
    _$UserImpl value,
    $Res Function(_$UserImpl) then,
  ) = __$$UserImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String username,
    String email,
    String? phoneNumber,
    String? fullName,
    String? firstName,
    String? lastName,
    String? status,
    String? lockReason,
    String? createdAt,
    String? updatedAt,
  });
}

/// @nodoc
class __$$UserImplCopyWithImpl<$Res>
    extends _$UserCopyWithImpl<$Res, _$UserImpl>
    implements _$$UserImplCopyWith<$Res> {
  __$$UserImplCopyWithImpl(_$UserImpl _value, $Res Function(_$UserImpl) _then)
    : super(_value, _then);

  /// Create a copy of User
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? username = null,
    Object? email = null,
    Object? phoneNumber = freezed,
    Object? fullName = freezed,
    Object? firstName = freezed,
    Object? lastName = freezed,
    Object? status = freezed,
    Object? lockReason = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _$UserImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        username: null == username
            ? _value.username
            : username // ignore: cast_nullable_to_non_nullable
                  as String,
        email: null == email
            ? _value.email
            : email // ignore: cast_nullable_to_non_nullable
                  as String,
        phoneNumber: freezed == phoneNumber
            ? _value.phoneNumber
            : phoneNumber // ignore: cast_nullable_to_non_nullable
                  as String?,
        fullName: freezed == fullName
            ? _value.fullName
            : fullName // ignore: cast_nullable_to_non_nullable
                  as String?,
        firstName: freezed == firstName
            ? _value.firstName
            : firstName // ignore: cast_nullable_to_non_nullable
                  as String?,
        lastName: freezed == lastName
            ? _value.lastName
            : lastName // ignore: cast_nullable_to_non_nullable
                  as String?,
        status: freezed == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String?,
        lockReason: freezed == lockReason
            ? _value.lockReason
            : lockReason // ignore: cast_nullable_to_non_nullable
                  as String?,
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
class _$UserImpl implements _User {
  const _$UserImpl({
    required this.id,
    required this.username,
    required this.email,
    this.phoneNumber,
    this.fullName,
    this.firstName,
    this.lastName,
    this.status,
    this.lockReason,
    this.createdAt,
    this.updatedAt,
  });

  factory _$UserImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserImplFromJson(json);

  @override
  final int id;
  @override
  final String username;
  @override
  final String email;
  @override
  final String? phoneNumber;
  @override
  final String? fullName;
  @override
  final String? firstName;
  @override
  final String? lastName;
  @override
  final String? status;
  @override
  final String? lockReason;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;

  @override
  String toString() {
    return 'User(id: $id, username: $username, email: $email, phoneNumber: $phoneNumber, fullName: $fullName, firstName: $firstName, lastName: $lastName, status: $status, lockReason: $lockReason, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.phoneNumber, phoneNumber) ||
                other.phoneNumber == phoneNumber) &&
            (identical(other.fullName, fullName) ||
                other.fullName == fullName) &&
            (identical(other.firstName, firstName) ||
                other.firstName == firstName) &&
            (identical(other.lastName, lastName) ||
                other.lastName == lastName) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.lockReason, lockReason) ||
                other.lockReason == lockReason) &&
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
    username,
    email,
    phoneNumber,
    fullName,
    firstName,
    lastName,
    status,
    lockReason,
    createdAt,
    updatedAt,
  );

  /// Create a copy of User
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserImplCopyWith<_$UserImpl> get copyWith =>
      __$$UserImplCopyWithImpl<_$UserImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UserImplToJson(this);
  }
}

abstract class _User implements User {
  const factory _User({
    required final int id,
    required final String username,
    required final String email,
    final String? phoneNumber,
    final String? fullName,
    final String? firstName,
    final String? lastName,
    final String? status,
    final String? lockReason,
    final String? createdAt,
    final String? updatedAt,
  }) = _$UserImpl;

  factory _User.fromJson(Map<String, dynamic> json) = _$UserImpl.fromJson;

  @override
  int get id;
  @override
  String get username;
  @override
  String get email;
  @override
  String? get phoneNumber;
  @override
  String? get fullName;
  @override
  String? get firstName;
  @override
  String? get lastName;
  @override
  String? get status;
  @override
  String? get lockReason;
  @override
  String? get createdAt;
  @override
  String? get updatedAt;

  /// Create a copy of User
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserImplCopyWith<_$UserImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

FacilityBooking _$FacilityBookingFromJson(Map<String, dynamic> json) {
  return _FacilityBooking.fromJson(json);
}

/// @nodoc
mixin _$FacilityBooking {
  int get id => throw _privateConstructorUsedError;
  int get facilityId => throw _privateConstructorUsedError;
  String get facilityName => throw _privateConstructorUsedError;
  int get userId => throw _privateConstructorUsedError;
  String get userName => throw _privateConstructorUsedError;
  String get startTime => throw _privateConstructorUsedError;
  String get endTime => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  int get numberOfPeople => throw _privateConstructorUsedError;
  String? get purpose => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;
  String? get approvedAt => throw _privateConstructorUsedError;
  String? get rejectionReason => throw _privateConstructorUsedError;
  String? get qrCode => throw _privateConstructorUsedError;
  String? get qrExpiresAt => throw _privateConstructorUsedError;
  int? get checkedInCount => throw _privateConstructorUsedError;
  int? get maxCheckins => throw _privateConstructorUsedError;
  double? get totalCost => throw _privateConstructorUsedError;
  String? get paymentStatus => throw _privateConstructorUsedError;
  String? get paymentMethod => throw _privateConstructorUsedError;
  String? get paymentDate => throw _privateConstructorUsedError;
  String? get transactionId => throw _privateConstructorUsedError;

  /// Serializes this FacilityBooking to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FacilityBooking
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FacilityBookingCopyWith<FacilityBooking> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FacilityBookingCopyWith<$Res> {
  factory $FacilityBookingCopyWith(
    FacilityBooking value,
    $Res Function(FacilityBooking) then,
  ) = _$FacilityBookingCopyWithImpl<$Res, FacilityBooking>;
  @useResult
  $Res call({
    int id,
    int facilityId,
    String facilityName,
    int userId,
    String userName,
    String startTime,
    String endTime,
    String status,
    int numberOfPeople,
    String? purpose,
    String? createdAt,
    String? approvedAt,
    String? rejectionReason,
    String? qrCode,
    String? qrExpiresAt,
    int? checkedInCount,
    int? maxCheckins,
    double? totalCost,
    String? paymentStatus,
    String? paymentMethod,
    String? paymentDate,
    String? transactionId,
  });
}

/// @nodoc
class _$FacilityBookingCopyWithImpl<$Res, $Val extends FacilityBooking>
    implements $FacilityBookingCopyWith<$Res> {
  _$FacilityBookingCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FacilityBooking
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? facilityId = null,
    Object? facilityName = null,
    Object? userId = null,
    Object? userName = null,
    Object? startTime = null,
    Object? endTime = null,
    Object? status = null,
    Object? numberOfPeople = null,
    Object? purpose = freezed,
    Object? createdAt = freezed,
    Object? approvedAt = freezed,
    Object? rejectionReason = freezed,
    Object? qrCode = freezed,
    Object? qrExpiresAt = freezed,
    Object? checkedInCount = freezed,
    Object? maxCheckins = freezed,
    Object? totalCost = freezed,
    Object? paymentStatus = freezed,
    Object? paymentMethod = freezed,
    Object? paymentDate = freezed,
    Object? transactionId = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            facilityId: null == facilityId
                ? _value.facilityId
                : facilityId // ignore: cast_nullable_to_non_nullable
                      as int,
            facilityName: null == facilityName
                ? _value.facilityName
                : facilityName // ignore: cast_nullable_to_non_nullable
                      as String,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as int,
            userName: null == userName
                ? _value.userName
                : userName // ignore: cast_nullable_to_non_nullable
                      as String,
            startTime: null == startTime
                ? _value.startTime
                : startTime // ignore: cast_nullable_to_non_nullable
                      as String,
            endTime: null == endTime
                ? _value.endTime
                : endTime // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            numberOfPeople: null == numberOfPeople
                ? _value.numberOfPeople
                : numberOfPeople // ignore: cast_nullable_to_non_nullable
                      as int,
            purpose: freezed == purpose
                ? _value.purpose
                : purpose // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            approvedAt: freezed == approvedAt
                ? _value.approvedAt
                : approvedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            rejectionReason: freezed == rejectionReason
                ? _value.rejectionReason
                : rejectionReason // ignore: cast_nullable_to_non_nullable
                      as String?,
            qrCode: freezed == qrCode
                ? _value.qrCode
                : qrCode // ignore: cast_nullable_to_non_nullable
                      as String?,
            qrExpiresAt: freezed == qrExpiresAt
                ? _value.qrExpiresAt
                : qrExpiresAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            checkedInCount: freezed == checkedInCount
                ? _value.checkedInCount
                : checkedInCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            maxCheckins: freezed == maxCheckins
                ? _value.maxCheckins
                : maxCheckins // ignore: cast_nullable_to_non_nullable
                      as int?,
            totalCost: freezed == totalCost
                ? _value.totalCost
                : totalCost // ignore: cast_nullable_to_non_nullable
                      as double?,
            paymentStatus: freezed == paymentStatus
                ? _value.paymentStatus
                : paymentStatus // ignore: cast_nullable_to_non_nullable
                      as String?,
            paymentMethod: freezed == paymentMethod
                ? _value.paymentMethod
                : paymentMethod // ignore: cast_nullable_to_non_nullable
                      as String?,
            paymentDate: freezed == paymentDate
                ? _value.paymentDate
                : paymentDate // ignore: cast_nullable_to_non_nullable
                      as String?,
            transactionId: freezed == transactionId
                ? _value.transactionId
                : transactionId // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FacilityBookingImplCopyWith<$Res>
    implements $FacilityBookingCopyWith<$Res> {
  factory _$$FacilityBookingImplCopyWith(
    _$FacilityBookingImpl value,
    $Res Function(_$FacilityBookingImpl) then,
  ) = __$$FacilityBookingImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int facilityId,
    String facilityName,
    int userId,
    String userName,
    String startTime,
    String endTime,
    String status,
    int numberOfPeople,
    String? purpose,
    String? createdAt,
    String? approvedAt,
    String? rejectionReason,
    String? qrCode,
    String? qrExpiresAt,
    int? checkedInCount,
    int? maxCheckins,
    double? totalCost,
    String? paymentStatus,
    String? paymentMethod,
    String? paymentDate,
    String? transactionId,
  });
}

/// @nodoc
class __$$FacilityBookingImplCopyWithImpl<$Res>
    extends _$FacilityBookingCopyWithImpl<$Res, _$FacilityBookingImpl>
    implements _$$FacilityBookingImplCopyWith<$Res> {
  __$$FacilityBookingImplCopyWithImpl(
    _$FacilityBookingImpl _value,
    $Res Function(_$FacilityBookingImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FacilityBooking
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? facilityId = null,
    Object? facilityName = null,
    Object? userId = null,
    Object? userName = null,
    Object? startTime = null,
    Object? endTime = null,
    Object? status = null,
    Object? numberOfPeople = null,
    Object? purpose = freezed,
    Object? createdAt = freezed,
    Object? approvedAt = freezed,
    Object? rejectionReason = freezed,
    Object? qrCode = freezed,
    Object? qrExpiresAt = freezed,
    Object? checkedInCount = freezed,
    Object? maxCheckins = freezed,
    Object? totalCost = freezed,
    Object? paymentStatus = freezed,
    Object? paymentMethod = freezed,
    Object? paymentDate = freezed,
    Object? transactionId = freezed,
  }) {
    return _then(
      _$FacilityBookingImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        facilityId: null == facilityId
            ? _value.facilityId
            : facilityId // ignore: cast_nullable_to_non_nullable
                  as int,
        facilityName: null == facilityName
            ? _value.facilityName
            : facilityName // ignore: cast_nullable_to_non_nullable
                  as String,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as int,
        userName: null == userName
            ? _value.userName
            : userName // ignore: cast_nullable_to_non_nullable
                  as String,
        startTime: null == startTime
            ? _value.startTime
            : startTime // ignore: cast_nullable_to_non_nullable
                  as String,
        endTime: null == endTime
            ? _value.endTime
            : endTime // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        numberOfPeople: null == numberOfPeople
            ? _value.numberOfPeople
            : numberOfPeople // ignore: cast_nullable_to_non_nullable
                  as int,
        purpose: freezed == purpose
            ? _value.purpose
            : purpose // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        approvedAt: freezed == approvedAt
            ? _value.approvedAt
            : approvedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        rejectionReason: freezed == rejectionReason
            ? _value.rejectionReason
            : rejectionReason // ignore: cast_nullable_to_non_nullable
                  as String?,
        qrCode: freezed == qrCode
            ? _value.qrCode
            : qrCode // ignore: cast_nullable_to_non_nullable
                  as String?,
        qrExpiresAt: freezed == qrExpiresAt
            ? _value.qrExpiresAt
            : qrExpiresAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        checkedInCount: freezed == checkedInCount
            ? _value.checkedInCount
            : checkedInCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        maxCheckins: freezed == maxCheckins
            ? _value.maxCheckins
            : maxCheckins // ignore: cast_nullable_to_non_nullable
                  as int?,
        totalCost: freezed == totalCost
            ? _value.totalCost
            : totalCost // ignore: cast_nullable_to_non_nullable
                  as double?,
        paymentStatus: freezed == paymentStatus
            ? _value.paymentStatus
            : paymentStatus // ignore: cast_nullable_to_non_nullable
                  as String?,
        paymentMethod: freezed == paymentMethod
            ? _value.paymentMethod
            : paymentMethod // ignore: cast_nullable_to_non_nullable
                  as String?,
        paymentDate: freezed == paymentDate
            ? _value.paymentDate
            : paymentDate // ignore: cast_nullable_to_non_nullable
                  as String?,
        transactionId: freezed == transactionId
            ? _value.transactionId
            : transactionId // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FacilityBookingImpl implements _FacilityBooking {
  const _$FacilityBookingImpl({
    required this.id,
    required this.facilityId,
    required this.facilityName,
    required this.userId,
    required this.userName,
    required this.startTime,
    required this.endTime,
    required this.status,
    required this.numberOfPeople,
    this.purpose,
    this.createdAt,
    this.approvedAt,
    this.rejectionReason,
    this.qrCode,
    this.qrExpiresAt,
    this.checkedInCount,
    this.maxCheckins,
    this.totalCost,
    this.paymentStatus,
    this.paymentMethod,
    this.paymentDate,
    this.transactionId,
  });

  factory _$FacilityBookingImpl.fromJson(Map<String, dynamic> json) =>
      _$$FacilityBookingImplFromJson(json);

  @override
  final int id;
  @override
  final int facilityId;
  @override
  final String facilityName;
  @override
  final int userId;
  @override
  final String userName;
  @override
  final String startTime;
  @override
  final String endTime;
  @override
  final String status;
  @override
  final int numberOfPeople;
  @override
  final String? purpose;
  @override
  final String? createdAt;
  @override
  final String? approvedAt;
  @override
  final String? rejectionReason;
  @override
  final String? qrCode;
  @override
  final String? qrExpiresAt;
  @override
  final int? checkedInCount;
  @override
  final int? maxCheckins;
  @override
  final double? totalCost;
  @override
  final String? paymentStatus;
  @override
  final String? paymentMethod;
  @override
  final String? paymentDate;
  @override
  final String? transactionId;

  @override
  String toString() {
    return 'FacilityBooking(id: $id, facilityId: $facilityId, facilityName: $facilityName, userId: $userId, userName: $userName, startTime: $startTime, endTime: $endTime, status: $status, numberOfPeople: $numberOfPeople, purpose: $purpose, createdAt: $createdAt, approvedAt: $approvedAt, rejectionReason: $rejectionReason, qrCode: $qrCode, qrExpiresAt: $qrExpiresAt, checkedInCount: $checkedInCount, maxCheckins: $maxCheckins, totalCost: $totalCost, paymentStatus: $paymentStatus, paymentMethod: $paymentMethod, paymentDate: $paymentDate, transactionId: $transactionId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FacilityBookingImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.facilityId, facilityId) ||
                other.facilityId == facilityId) &&
            (identical(other.facilityName, facilityName) ||
                other.facilityName == facilityName) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.userName, userName) ||
                other.userName == userName) &&
            (identical(other.startTime, startTime) ||
                other.startTime == startTime) &&
            (identical(other.endTime, endTime) || other.endTime == endTime) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.numberOfPeople, numberOfPeople) ||
                other.numberOfPeople == numberOfPeople) &&
            (identical(other.purpose, purpose) || other.purpose == purpose) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.approvedAt, approvedAt) ||
                other.approvedAt == approvedAt) &&
            (identical(other.rejectionReason, rejectionReason) ||
                other.rejectionReason == rejectionReason) &&
            (identical(other.qrCode, qrCode) || other.qrCode == qrCode) &&
            (identical(other.qrExpiresAt, qrExpiresAt) ||
                other.qrExpiresAt == qrExpiresAt) &&
            (identical(other.checkedInCount, checkedInCount) ||
                other.checkedInCount == checkedInCount) &&
            (identical(other.maxCheckins, maxCheckins) ||
                other.maxCheckins == maxCheckins) &&
            (identical(other.totalCost, totalCost) ||
                other.totalCost == totalCost) &&
            (identical(other.paymentStatus, paymentStatus) ||
                other.paymentStatus == paymentStatus) &&
            (identical(other.paymentMethod, paymentMethod) ||
                other.paymentMethod == paymentMethod) &&
            (identical(other.paymentDate, paymentDate) ||
                other.paymentDate == paymentDate) &&
            (identical(other.transactionId, transactionId) ||
                other.transactionId == transactionId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    facilityId,
    facilityName,
    userId,
    userName,
    startTime,
    endTime,
    status,
    numberOfPeople,
    purpose,
    createdAt,
    approvedAt,
    rejectionReason,
    qrCode,
    qrExpiresAt,
    checkedInCount,
    maxCheckins,
    totalCost,
    paymentStatus,
    paymentMethod,
    paymentDate,
    transactionId,
  ]);

  /// Create a copy of FacilityBooking
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FacilityBookingImplCopyWith<_$FacilityBookingImpl> get copyWith =>
      __$$FacilityBookingImplCopyWithImpl<_$FacilityBookingImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$FacilityBookingImplToJson(this);
  }
}

abstract class _FacilityBooking implements FacilityBooking {
  const factory _FacilityBooking({
    required final int id,
    required final int facilityId,
    required final String facilityName,
    required final int userId,
    required final String userName,
    required final String startTime,
    required final String endTime,
    required final String status,
    required final int numberOfPeople,
    final String? purpose,
    final String? createdAt,
    final String? approvedAt,
    final String? rejectionReason,
    final String? qrCode,
    final String? qrExpiresAt,
    final int? checkedInCount,
    final int? maxCheckins,
    final double? totalCost,
    final String? paymentStatus,
    final String? paymentMethod,
    final String? paymentDate,
    final String? transactionId,
  }) = _$FacilityBookingImpl;

  factory _FacilityBooking.fromJson(Map<String, dynamic> json) =
      _$FacilityBookingImpl.fromJson;

  @override
  int get id;
  @override
  int get facilityId;
  @override
  String get facilityName;
  @override
  int get userId;
  @override
  String get userName;
  @override
  String get startTime;
  @override
  String get endTime;
  @override
  String get status;
  @override
  int get numberOfPeople;
  @override
  String? get purpose;
  @override
  String? get createdAt;
  @override
  String? get approvedAt;
  @override
  String? get rejectionReason;
  @override
  String? get qrCode;
  @override
  String? get qrExpiresAt;
  @override
  int? get checkedInCount;
  @override
  int? get maxCheckins;
  @override
  double? get totalCost;
  @override
  String? get paymentStatus;
  @override
  String? get paymentMethod;
  @override
  String? get paymentDate;
  @override
  String? get transactionId;

  /// Create a copy of FacilityBooking
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FacilityBookingImplCopyWith<_$FacilityBookingImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

FacilityBookingCreateRequest _$FacilityBookingCreateRequestFromJson(
  Map<String, dynamic> json,
) {
  return _FacilityBookingCreateRequest.fromJson(json);
}

/// @nodoc
mixin _$FacilityBookingCreateRequest {
  int get facilityId => throw _privateConstructorUsedError;
  int get userId => throw _privateConstructorUsedError;
  String get bookingTime => throw _privateConstructorUsedError;
  int get duration => throw _privateConstructorUsedError;
  int get numberOfPeople => throw _privateConstructorUsedError;
  String get purpose => throw _privateConstructorUsedError;
  String? get paymentStatus => throw _privateConstructorUsedError;
  String? get paymentMethod => throw _privateConstructorUsedError;
  double? get totalCost => throw _privateConstructorUsedError;
  String? get transactionId => throw _privateConstructorUsedError;

  /// Serializes this FacilityBookingCreateRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FacilityBookingCreateRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FacilityBookingCreateRequestCopyWith<FacilityBookingCreateRequest>
  get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FacilityBookingCreateRequestCopyWith<$Res> {
  factory $FacilityBookingCreateRequestCopyWith(
    FacilityBookingCreateRequest value,
    $Res Function(FacilityBookingCreateRequest) then,
  ) =
      _$FacilityBookingCreateRequestCopyWithImpl<
        $Res,
        FacilityBookingCreateRequest
      >;
  @useResult
  $Res call({
    int facilityId,
    int userId,
    String bookingTime,
    int duration,
    int numberOfPeople,
    String purpose,
    String? paymentStatus,
    String? paymentMethod,
    double? totalCost,
    String? transactionId,
  });
}

/// @nodoc
class _$FacilityBookingCreateRequestCopyWithImpl<
  $Res,
  $Val extends FacilityBookingCreateRequest
>
    implements $FacilityBookingCreateRequestCopyWith<$Res> {
  _$FacilityBookingCreateRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FacilityBookingCreateRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? facilityId = null,
    Object? userId = null,
    Object? bookingTime = null,
    Object? duration = null,
    Object? numberOfPeople = null,
    Object? purpose = null,
    Object? paymentStatus = freezed,
    Object? paymentMethod = freezed,
    Object? totalCost = freezed,
    Object? transactionId = freezed,
  }) {
    return _then(
      _value.copyWith(
            facilityId: null == facilityId
                ? _value.facilityId
                : facilityId // ignore: cast_nullable_to_non_nullable
                      as int,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as int,
            bookingTime: null == bookingTime
                ? _value.bookingTime
                : bookingTime // ignore: cast_nullable_to_non_nullable
                      as String,
            duration: null == duration
                ? _value.duration
                : duration // ignore: cast_nullable_to_non_nullable
                      as int,
            numberOfPeople: null == numberOfPeople
                ? _value.numberOfPeople
                : numberOfPeople // ignore: cast_nullable_to_non_nullable
                      as int,
            purpose: null == purpose
                ? _value.purpose
                : purpose // ignore: cast_nullable_to_non_nullable
                      as String,
            paymentStatus: freezed == paymentStatus
                ? _value.paymentStatus
                : paymentStatus // ignore: cast_nullable_to_non_nullable
                      as String?,
            paymentMethod: freezed == paymentMethod
                ? _value.paymentMethod
                : paymentMethod // ignore: cast_nullable_to_non_nullable
                      as String?,
            totalCost: freezed == totalCost
                ? _value.totalCost
                : totalCost // ignore: cast_nullable_to_non_nullable
                      as double?,
            transactionId: freezed == transactionId
                ? _value.transactionId
                : transactionId // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FacilityBookingCreateRequestImplCopyWith<$Res>
    implements $FacilityBookingCreateRequestCopyWith<$Res> {
  factory _$$FacilityBookingCreateRequestImplCopyWith(
    _$FacilityBookingCreateRequestImpl value,
    $Res Function(_$FacilityBookingCreateRequestImpl) then,
  ) = __$$FacilityBookingCreateRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int facilityId,
    int userId,
    String bookingTime,
    int duration,
    int numberOfPeople,
    String purpose,
    String? paymentStatus,
    String? paymentMethod,
    double? totalCost,
    String? transactionId,
  });
}

/// @nodoc
class __$$FacilityBookingCreateRequestImplCopyWithImpl<$Res>
    extends
        _$FacilityBookingCreateRequestCopyWithImpl<
          $Res,
          _$FacilityBookingCreateRequestImpl
        >
    implements _$$FacilityBookingCreateRequestImplCopyWith<$Res> {
  __$$FacilityBookingCreateRequestImplCopyWithImpl(
    _$FacilityBookingCreateRequestImpl _value,
    $Res Function(_$FacilityBookingCreateRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FacilityBookingCreateRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? facilityId = null,
    Object? userId = null,
    Object? bookingTime = null,
    Object? duration = null,
    Object? numberOfPeople = null,
    Object? purpose = null,
    Object? paymentStatus = freezed,
    Object? paymentMethod = freezed,
    Object? totalCost = freezed,
    Object? transactionId = freezed,
  }) {
    return _then(
      _$FacilityBookingCreateRequestImpl(
        facilityId: null == facilityId
            ? _value.facilityId
            : facilityId // ignore: cast_nullable_to_non_nullable
                  as int,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as int,
        bookingTime: null == bookingTime
            ? _value.bookingTime
            : bookingTime // ignore: cast_nullable_to_non_nullable
                  as String,
        duration: null == duration
            ? _value.duration
            : duration // ignore: cast_nullable_to_non_nullable
                  as int,
        numberOfPeople: null == numberOfPeople
            ? _value.numberOfPeople
            : numberOfPeople // ignore: cast_nullable_to_non_nullable
                  as int,
        purpose: null == purpose
            ? _value.purpose
            : purpose // ignore: cast_nullable_to_non_nullable
                  as String,
        paymentStatus: freezed == paymentStatus
            ? _value.paymentStatus
            : paymentStatus // ignore: cast_nullable_to_non_nullable
                  as String?,
        paymentMethod: freezed == paymentMethod
            ? _value.paymentMethod
            : paymentMethod // ignore: cast_nullable_to_non_nullable
                  as String?,
        totalCost: freezed == totalCost
            ? _value.totalCost
            : totalCost // ignore: cast_nullable_to_non_nullable
                  as double?,
        transactionId: freezed == transactionId
            ? _value.transactionId
            : transactionId // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FacilityBookingCreateRequestImpl
    implements _FacilityBookingCreateRequest {
  const _$FacilityBookingCreateRequestImpl({
    required this.facilityId,
    required this.userId,
    required this.bookingTime,
    required this.duration,
    required this.numberOfPeople,
    required this.purpose,
    this.paymentStatus,
    this.paymentMethod,
    this.totalCost,
    this.transactionId,
  });

  factory _$FacilityBookingCreateRequestImpl.fromJson(
    Map<String, dynamic> json,
  ) => _$$FacilityBookingCreateRequestImplFromJson(json);

  @override
  final int facilityId;
  @override
  final int userId;
  @override
  final String bookingTime;
  @override
  final int duration;
  @override
  final int numberOfPeople;
  @override
  final String purpose;
  @override
  final String? paymentStatus;
  @override
  final String? paymentMethod;
  @override
  final double? totalCost;
  @override
  final String? transactionId;

  @override
  String toString() {
    return 'FacilityBookingCreateRequest(facilityId: $facilityId, userId: $userId, bookingTime: $bookingTime, duration: $duration, numberOfPeople: $numberOfPeople, purpose: $purpose, paymentStatus: $paymentStatus, paymentMethod: $paymentMethod, totalCost: $totalCost, transactionId: $transactionId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FacilityBookingCreateRequestImpl &&
            (identical(other.facilityId, facilityId) ||
                other.facilityId == facilityId) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.bookingTime, bookingTime) ||
                other.bookingTime == bookingTime) &&
            (identical(other.duration, duration) ||
                other.duration == duration) &&
            (identical(other.numberOfPeople, numberOfPeople) ||
                other.numberOfPeople == numberOfPeople) &&
            (identical(other.purpose, purpose) || other.purpose == purpose) &&
            (identical(other.paymentStatus, paymentStatus) ||
                other.paymentStatus == paymentStatus) &&
            (identical(other.paymentMethod, paymentMethod) ||
                other.paymentMethod == paymentMethod) &&
            (identical(other.totalCost, totalCost) ||
                other.totalCost == totalCost) &&
            (identical(other.transactionId, transactionId) ||
                other.transactionId == transactionId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    facilityId,
    userId,
    bookingTime,
    duration,
    numberOfPeople,
    purpose,
    paymentStatus,
    paymentMethod,
    totalCost,
    transactionId,
  );

  /// Create a copy of FacilityBookingCreateRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FacilityBookingCreateRequestImplCopyWith<
    _$FacilityBookingCreateRequestImpl
  >
  get copyWith =>
      __$$FacilityBookingCreateRequestImplCopyWithImpl<
        _$FacilityBookingCreateRequestImpl
      >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FacilityBookingCreateRequestImplToJson(this);
  }
}

abstract class _FacilityBookingCreateRequest
    implements FacilityBookingCreateRequest {
  const factory _FacilityBookingCreateRequest({
    required final int facilityId,
    required final int userId,
    required final String bookingTime,
    required final int duration,
    required final int numberOfPeople,
    required final String purpose,
    final String? paymentStatus,
    final String? paymentMethod,
    final double? totalCost,
    final String? transactionId,
  }) = _$FacilityBookingCreateRequestImpl;

  factory _FacilityBookingCreateRequest.fromJson(Map<String, dynamic> json) =
      _$FacilityBookingCreateRequestImpl.fromJson;

  @override
  int get facilityId;
  @override
  int get userId;
  @override
  String get bookingTime;
  @override
  int get duration;
  @override
  int get numberOfPeople;
  @override
  String get purpose;
  @override
  String? get paymentStatus;
  @override
  String? get paymentMethod;
  @override
  double? get totalCost;
  @override
  String? get transactionId;

  /// Create a copy of FacilityBookingCreateRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FacilityBookingCreateRequestImplCopyWith<
    _$FacilityBookingCreateRequestImpl
  >
  get copyWith => throw _privateConstructorUsedError;
}

FacilityBookingUpdateRequest _$FacilityBookingUpdateRequestFromJson(
  Map<String, dynamic> json,
) {
  return _FacilityBookingUpdateRequest.fromJson(json);
}

/// @nodoc
mixin _$FacilityBookingUpdateRequest {
  String? get bookingTime => throw _privateConstructorUsedError;
  int? get duration => throw _privateConstructorUsedError;
  int? get numberOfPeople => throw _privateConstructorUsedError;
  String? get purpose => throw _privateConstructorUsedError;

  /// Serializes this FacilityBookingUpdateRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FacilityBookingUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FacilityBookingUpdateRequestCopyWith<FacilityBookingUpdateRequest>
  get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FacilityBookingUpdateRequestCopyWith<$Res> {
  factory $FacilityBookingUpdateRequestCopyWith(
    FacilityBookingUpdateRequest value,
    $Res Function(FacilityBookingUpdateRequest) then,
  ) =
      _$FacilityBookingUpdateRequestCopyWithImpl<
        $Res,
        FacilityBookingUpdateRequest
      >;
  @useResult
  $Res call({
    String? bookingTime,
    int? duration,
    int? numberOfPeople,
    String? purpose,
  });
}

/// @nodoc
class _$FacilityBookingUpdateRequestCopyWithImpl<
  $Res,
  $Val extends FacilityBookingUpdateRequest
>
    implements $FacilityBookingUpdateRequestCopyWith<$Res> {
  _$FacilityBookingUpdateRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FacilityBookingUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? bookingTime = freezed,
    Object? duration = freezed,
    Object? numberOfPeople = freezed,
    Object? purpose = freezed,
  }) {
    return _then(
      _value.copyWith(
            bookingTime: freezed == bookingTime
                ? _value.bookingTime
                : bookingTime // ignore: cast_nullable_to_non_nullable
                      as String?,
            duration: freezed == duration
                ? _value.duration
                : duration // ignore: cast_nullable_to_non_nullable
                      as int?,
            numberOfPeople: freezed == numberOfPeople
                ? _value.numberOfPeople
                : numberOfPeople // ignore: cast_nullable_to_non_nullable
                      as int?,
            purpose: freezed == purpose
                ? _value.purpose
                : purpose // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FacilityBookingUpdateRequestImplCopyWith<$Res>
    implements $FacilityBookingUpdateRequestCopyWith<$Res> {
  factory _$$FacilityBookingUpdateRequestImplCopyWith(
    _$FacilityBookingUpdateRequestImpl value,
    $Res Function(_$FacilityBookingUpdateRequestImpl) then,
  ) = __$$FacilityBookingUpdateRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String? bookingTime,
    int? duration,
    int? numberOfPeople,
    String? purpose,
  });
}

/// @nodoc
class __$$FacilityBookingUpdateRequestImplCopyWithImpl<$Res>
    extends
        _$FacilityBookingUpdateRequestCopyWithImpl<
          $Res,
          _$FacilityBookingUpdateRequestImpl
        >
    implements _$$FacilityBookingUpdateRequestImplCopyWith<$Res> {
  __$$FacilityBookingUpdateRequestImplCopyWithImpl(
    _$FacilityBookingUpdateRequestImpl _value,
    $Res Function(_$FacilityBookingUpdateRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FacilityBookingUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? bookingTime = freezed,
    Object? duration = freezed,
    Object? numberOfPeople = freezed,
    Object? purpose = freezed,
  }) {
    return _then(
      _$FacilityBookingUpdateRequestImpl(
        bookingTime: freezed == bookingTime
            ? _value.bookingTime
            : bookingTime // ignore: cast_nullable_to_non_nullable
                  as String?,
        duration: freezed == duration
            ? _value.duration
            : duration // ignore: cast_nullable_to_non_nullable
                  as int?,
        numberOfPeople: freezed == numberOfPeople
            ? _value.numberOfPeople
            : numberOfPeople // ignore: cast_nullable_to_non_nullable
                  as int?,
        purpose: freezed == purpose
            ? _value.purpose
            : purpose // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FacilityBookingUpdateRequestImpl
    implements _FacilityBookingUpdateRequest {
  const _$FacilityBookingUpdateRequestImpl({
    this.bookingTime,
    this.duration,
    this.numberOfPeople,
    this.purpose,
  });

  factory _$FacilityBookingUpdateRequestImpl.fromJson(
    Map<String, dynamic> json,
  ) => _$$FacilityBookingUpdateRequestImplFromJson(json);

  @override
  final String? bookingTime;
  @override
  final int? duration;
  @override
  final int? numberOfPeople;
  @override
  final String? purpose;

  @override
  String toString() {
    return 'FacilityBookingUpdateRequest(bookingTime: $bookingTime, duration: $duration, numberOfPeople: $numberOfPeople, purpose: $purpose)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FacilityBookingUpdateRequestImpl &&
            (identical(other.bookingTime, bookingTime) ||
                other.bookingTime == bookingTime) &&
            (identical(other.duration, duration) ||
                other.duration == duration) &&
            (identical(other.numberOfPeople, numberOfPeople) ||
                other.numberOfPeople == numberOfPeople) &&
            (identical(other.purpose, purpose) || other.purpose == purpose));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, bookingTime, duration, numberOfPeople, purpose);

  /// Create a copy of FacilityBookingUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FacilityBookingUpdateRequestImplCopyWith<
    _$FacilityBookingUpdateRequestImpl
  >
  get copyWith =>
      __$$FacilityBookingUpdateRequestImplCopyWithImpl<
        _$FacilityBookingUpdateRequestImpl
      >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FacilityBookingUpdateRequestImplToJson(this);
  }
}

abstract class _FacilityBookingUpdateRequest
    implements FacilityBookingUpdateRequest {
  const factory _FacilityBookingUpdateRequest({
    final String? bookingTime,
    final int? duration,
    final int? numberOfPeople,
    final String? purpose,
  }) = _$FacilityBookingUpdateRequestImpl;

  factory _FacilityBookingUpdateRequest.fromJson(Map<String, dynamic> json) =
      _$FacilityBookingUpdateRequestImpl.fromJson;

  @override
  String? get bookingTime;
  @override
  int? get duration;
  @override
  int? get numberOfPeople;
  @override
  String? get purpose;

  /// Create a copy of FacilityBookingUpdateRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FacilityBookingUpdateRequestImplCopyWith<
    _$FacilityBookingUpdateRequestImpl
  >
  get copyWith => throw _privateConstructorUsedError;
}
