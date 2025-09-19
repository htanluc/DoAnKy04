import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../models/vehicle.dart';
import '../models/vehicle_type.dart';
import 'vehicles_api.dart';

class VehiclesRepository {
  VehiclesRepository(this._apiClient);

  final VehiclesApiClient _apiClient;

  Future<List<VehicleTypeModel>> getVehicleTypes() =>
      _apiClient.getVehicleTypes();

  Future<List<Map<String, dynamic>>> getMyApartments() =>
      _apiClient.getMyApartmentsRaw();

  Future<List<VehicleModel>> getMyVehicles() => _apiClient.getMyVehicles();

  Future<List<VehicleModel>> getBuildingVehiclesSorted(
    List<Map<String, dynamic>> myApartments,
  ) async {
    // Option A: BE returns all vehicles. Option B: loop per apartment like web.
    // Here we call /vehicles and locally sort PENDING.
    final all = await _apiClient.getBuildingVehicles();
    final pending = all
        .where((v) => v.status == VehicleStatus.PENDING)
        .toList();

    // Enrich apartment info if available
    final aptById = {for (final a in myApartments) a['id'] as int: a};
    final enriched = pending.map((v) {
      final apt = aptById[v.apartmentId];
      return v.copyWith(
        apartmentUnitNumber: apt != null
            ? (apt['unitNumber']?.toString() ?? v.apartmentUnitNumber)
            : v.apartmentUnitNumber,
        buildingId: apt != null ? (apt['buildingId'] as int?) : v.buildingId,
      );
    }).toList();

    enriched.sort((a, b) {
      final buildingA = a.buildingId ?? 0;
      final buildingB = b.buildingId ?? 0;
      if (buildingA != buildingB) return buildingA - buildingB;

      int parseApt(String? s) {
        if (s == null) return 0;
        final digits = RegExp(
          r'\d+',
        ).allMatches(s).map((m) => m.group(0)!).join();
        return int.tryParse(digits) ?? 0;
      }

      final aptA = parseApt(a.apartmentUnitNumber);
      final aptB = parseApt(b.apartmentUnitNumber);
      if (aptA != aptB) return aptA - aptB;

      return DateTime.parse(a.createdAt).compareTo(DateTime.parse(b.createdAt));
    });

    return enriched;
  }

  Future<VehicleModel> createVehicle({
    required String licensePlate,
    required String vehicleType,
    required int apartmentId,
    String? brand,
    String? model,
    String? color,
    List<String>? imageUrls,
  }) => _apiClient.createVehicle(
    licensePlate: licensePlate,
    vehicleType: vehicleType,
    apartmentId: apartmentId,
    brand: brand,
    model: model,
    color: color,
    imageUrls: imageUrls,
  );

  Future<List<String>> uploadImagesFromPicker(List<XFile> files) async {
    final multipart = <MultipartFile>[];
    for (final f in files) {
      multipart.add(
        await MultipartFile.fromFile(
          f.path,
          filename: f.name,
          contentType: DioMediaType('image', 'jpeg'),
        ),
      );
    }
    return _apiClient.uploadImages(multipart);
  }
}
