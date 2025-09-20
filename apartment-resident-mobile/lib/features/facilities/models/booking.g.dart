// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserImpl _$$UserImplFromJson(Map<String, dynamic> json) => _$UserImpl(
  id: (json['id'] as num).toInt(),
  username: json['username'] as String,
  email: json['email'] as String,
  phoneNumber: json['phoneNumber'] as String?,
  fullName: json['fullName'] as String?,
  firstName: json['firstName'] as String?,
  lastName: json['lastName'] as String?,
  status: json['status'] as String?,
  lockReason: json['lockReason'] as String?,
  createdAt: json['createdAt'] as String?,
  updatedAt: json['updatedAt'] as String?,
);

Map<String, dynamic> _$$UserImplToJson(_$UserImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'username': instance.username,
      'email': instance.email,
      'phoneNumber': instance.phoneNumber,
      'fullName': instance.fullName,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'status': instance.status,
      'lockReason': instance.lockReason,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

_$FacilityBookingImpl _$$FacilityBookingImplFromJson(
  Map<String, dynamic> json,
) => _$FacilityBookingImpl(
  id: (json['id'] as num).toInt(),
  facilityId: (json['facilityId'] as num).toInt(),
  facilityName: json['facilityName'] as String,
  userId: (json['userId'] as num).toInt(),
  userName: json['userName'] as String,
  startTime: json['startTime'] as String,
  endTime: json['endTime'] as String,
  status: json['status'] as String,
  numberOfPeople: (json['numberOfPeople'] as num).toInt(),
  purpose: json['purpose'] as String?,
  createdAt: json['createdAt'] as String?,
  approvedAt: json['approvedAt'] as String?,
  rejectionReason: json['rejectionReason'] as String?,
  qrCode: json['qrCode'] as String?,
  qrExpiresAt: json['qrExpiresAt'] as String?,
  checkedInCount: (json['checkedInCount'] as num?)?.toInt(),
  maxCheckins: (json['maxCheckins'] as num?)?.toInt(),
  totalCost: (json['totalCost'] as num?)?.toDouble(),
  paymentStatus: json['paymentStatus'] as String?,
  paymentMethod: json['paymentMethod'] as String?,
  paymentDate: json['paymentDate'] as String?,
  transactionId: json['transactionId'] as String?,
);

Map<String, dynamic> _$$FacilityBookingImplToJson(
  _$FacilityBookingImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'facilityId': instance.facilityId,
  'facilityName': instance.facilityName,
  'userId': instance.userId,
  'userName': instance.userName,
  'startTime': instance.startTime,
  'endTime': instance.endTime,
  'status': instance.status,
  'numberOfPeople': instance.numberOfPeople,
  'purpose': instance.purpose,
  'createdAt': instance.createdAt,
  'approvedAt': instance.approvedAt,
  'rejectionReason': instance.rejectionReason,
  'qrCode': instance.qrCode,
  'qrExpiresAt': instance.qrExpiresAt,
  'checkedInCount': instance.checkedInCount,
  'maxCheckins': instance.maxCheckins,
  'totalCost': instance.totalCost,
  'paymentStatus': instance.paymentStatus,
  'paymentMethod': instance.paymentMethod,
  'paymentDate': instance.paymentDate,
  'transactionId': instance.transactionId,
};

_$FacilityBookingCreateRequestImpl _$$FacilityBookingCreateRequestImplFromJson(
  Map<String, dynamic> json,
) => _$FacilityBookingCreateRequestImpl(
  facilityId: (json['facilityId'] as num).toInt(),
  userId: (json['userId'] as num).toInt(),
  bookingTime: json['bookingTime'] as String,
  duration: (json['duration'] as num).toInt(),
  numberOfPeople: (json['numberOfPeople'] as num).toInt(),
  purpose: json['purpose'] as String,
  paymentStatus: json['paymentStatus'] as String?,
  paymentMethod: json['paymentMethod'] as String?,
  totalCost: (json['totalCost'] as num?)?.toDouble(),
  transactionId: json['transactionId'] as String?,
);

Map<String, dynamic> _$$FacilityBookingCreateRequestImplToJson(
  _$FacilityBookingCreateRequestImpl instance,
) => <String, dynamic>{
  'facilityId': instance.facilityId,
  'userId': instance.userId,
  'bookingTime': instance.bookingTime,
  'duration': instance.duration,
  'numberOfPeople': instance.numberOfPeople,
  'purpose': instance.purpose,
  'paymentStatus': instance.paymentStatus,
  'paymentMethod': instance.paymentMethod,
  'totalCost': instance.totalCost,
  'transactionId': instance.transactionId,
};

_$FacilityBookingUpdateRequestImpl _$$FacilityBookingUpdateRequestImplFromJson(
  Map<String, dynamic> json,
) => _$FacilityBookingUpdateRequestImpl(
  bookingTime: json['bookingTime'] as String?,
  duration: (json['duration'] as num?)?.toInt(),
  numberOfPeople: (json['numberOfPeople'] as num?)?.toInt(),
  purpose: json['purpose'] as String?,
);

Map<String, dynamic> _$$FacilityBookingUpdateRequestImplToJson(
  _$FacilityBookingUpdateRequestImpl instance,
) => <String, dynamic>{
  'bookingTime': instance.bookingTime,
  'duration': instance.duration,
  'numberOfPeople': instance.numberOfPeople,
  'purpose': instance.purpose,
};
