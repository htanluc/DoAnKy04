import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/vehicles_api.dart';
import '../data/vehicles_repository.dart';
import '../models/vehicle.dart';
import '../models/vehicle_type.dart';

final vehiclesApiProvider = Provider<VehiclesApiClient>((ref) {
  return VehiclesApiClient();
});

final vehiclesRepositoryProvider = Provider<VehiclesRepository>((ref) {
  return VehiclesRepository(ref.watch(vehiclesApiProvider));
});

final vehicleTypesProvider = FutureProvider<List<VehicleTypeModel>>((
  ref,
) async {
  final repo = ref.watch(vehiclesRepositoryProvider);
  return repo.getVehicleTypes();
});

final myApartmentsProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  final repo = ref.watch(vehiclesRepositoryProvider);
  return repo.getMyApartments();
});

final myVehiclesProvider = FutureProvider<List<VehicleModel>>((ref) async {
  final repo = ref.watch(vehiclesRepositoryProvider);
  return repo.getMyVehicles();
});

final buildingVehiclesProvider = FutureProvider<List<VehicleModel>>((
  ref,
) async {
  final repo = ref.watch(vehiclesRepositoryProvider);
  final apartments = await ref.watch(myApartmentsProvider.future);
  return repo.getBuildingVehiclesSorted(apartments);
});
