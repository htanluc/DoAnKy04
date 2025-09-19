// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$VehicleModelImpl _$$VehicleModelImplFromJson(Map<String, dynamic> json) =>
    _$VehicleModelImpl(
      id: (json['id'] as num).toInt(),
      licensePlate: json['licensePlate'] as String,
      vehicleType: json['vehicleType'] as String,
      vehicleTypeDisplayName: json['vehicleTypeDisplayName'] as String?,
      brand: json['brand'] as String?,
      model: json['model'] as String?,
      color: json['color'] as String?,
      imageUrls:
          (json['imageUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const <String>[],
      status: $enumDecode(_$VehicleStatusEnumMap, json['status']),
      statusDisplayName: json['statusDisplayName'] as String?,
      monthlyFee: json['monthlyFee'] as num? ?? 0,
      apartmentId: (json['apartmentId'] as num).toInt(),
      apartmentUnitNumber: json['apartmentUnitNumber'] as String?,
      createdAt: json['createdAt'] as String,
      userFullName: json['userFullName'] as String?,
      buildingId: (json['buildingId'] as num?)?.toInt(),
    );

Map<String, dynamic> _$$VehicleModelImplToJson(_$VehicleModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'licensePlate': instance.licensePlate,
      'vehicleType': instance.vehicleType,
      'vehicleTypeDisplayName': instance.vehicleTypeDisplayName,
      'brand': instance.brand,
      'model': instance.model,
      'color': instance.color,
      'imageUrls': instance.imageUrls,
      'status': _$VehicleStatusEnumMap[instance.status]!,
      'statusDisplayName': instance.statusDisplayName,
      'monthlyFee': instance.monthlyFee,
      'apartmentId': instance.apartmentId,
      'apartmentUnitNumber': instance.apartmentUnitNumber,
      'createdAt': instance.createdAt,
      'userFullName': instance.userFullName,
      'buildingId': instance.buildingId,
    };

const _$VehicleStatusEnumMap = {
  VehicleStatus.PENDING: 'PENDING',
  VehicleStatus.APPROVED: 'APPROVED',
  VehicleStatus.REJECTED: 'REJECTED',
  VehicleStatus.ACTIVE: 'ACTIVE',
  VehicleStatus.INACTIVE: 'INACTIVE',
  VehicleStatus.EXPIRED: 'EXPIRED',
};
