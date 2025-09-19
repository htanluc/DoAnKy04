import 'package:freezed_annotation/freezed_annotation.dart';

part 'vehicle.freezed.dart';
part 'vehicle.g.dart';

enum VehicleStatus { PENDING, APPROVED, REJECTED, ACTIVE, INACTIVE, EXPIRED }

@freezed
class VehicleModel with _$VehicleModel {
  const factory VehicleModel({
    required int id,
    required String licensePlate,
    required String vehicleType,
    String? vehicleTypeDisplayName,
    String? brand,
    String? model,
    String? color,
    @Default(<String>[]) List<String> imageUrls,
    required VehicleStatus status,
    String? statusDisplayName,
    @Default(0) num monthlyFee,
    required int apartmentId,
    String? apartmentUnitNumber,
    required String createdAt,
    // For building pending list
    String? userFullName,
    int? buildingId,
  }) = _VehicleModel;

  factory VehicleModel.fromJson(Map<String, dynamic> json) =>
      _$VehicleModelFromJson(json);
}
