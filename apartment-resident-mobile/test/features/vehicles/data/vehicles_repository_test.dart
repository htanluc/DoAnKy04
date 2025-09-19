import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:apartment_resident_mobile/features/vehicles/data/vehicles_repository.dart';
import 'package:apartment_resident_mobile/features/vehicles/data/vehicles_api.dart';
import 'package:apartment_resident_mobile/features/vehicles/models/vehicle.dart';
import 'package:apartment_resident_mobile/features/vehicles/models/vehicle_type.dart';

import 'vehicles_repository_test.mocks.dart';

@GenerateMocks([VehiclesApiClient])
void main() {
  group('VehiclesRepository', () {
    late VehiclesRepository repository;
    late MockVehiclesApiClient mockApiClient;

    setUp(() {
      mockApiClient = MockVehiclesApiClient();
      repository = VehiclesRepository(mockApiClient);
    });

    group('getVehicleTypes', () {
      test('should return list of vehicle types', () async {
        // Arrange
        final expectedTypes = [
          VehicleTypeModel(
            value: 'MOTORCYCLE',
            displayName: 'Xe máy',
            monthlyFee: 50000,
          ),
          VehicleTypeModel(
            value: 'CAR',
            displayName: 'Ô tô',
            monthlyFee: 100000,
          ),
        ];
        when(
          mockApiClient.getVehicleTypes(),
        ).thenAnswer((_) async => expectedTypes);

        // Act
        final result = await repository.getVehicleTypes();

        // Assert
        expect(result, equals(expectedTypes));
        verify(mockApiClient.getVehicleTypes()).called(1);
      });
    });

    group('getMyVehicles', () {
      test('should return list of user vehicles', () async {
        // Arrange
        final expectedVehicles = [
          VehicleModel(
            id: 1,
            licensePlate: '30A-12345',
            vehicleType: 'MOTORCYCLE',
            vehicleTypeDisplayName: 'Xe máy',
            brand: 'Honda',
            model: 'Wave Alpha',
            color: 'Đen',
            imageUrls: ['url1', 'url2'],
            status: VehicleStatus.PENDING,
            statusDisplayName: 'Chờ duyệt',
            monthlyFee: 50000,
            apartmentId: 1,
            apartmentUnitNumber: 'A101',
            createdAt: '2024-01-01T00:00:00Z',
          ),
        ];
        when(
          mockApiClient.getMyVehicles(),
        ).thenAnswer((_) async => expectedVehicles);

        // Act
        final result = await repository.getMyVehicles();

        // Assert
        expect(result, equals(expectedVehicles));
        verify(mockApiClient.getMyVehicles()).called(1);
      });
    });

    group('createVehicle', () {
      test('should create vehicle successfully', () async {
        // Arrange
        final expectedVehicle = VehicleModel(
          id: 1,
          licensePlate: '30A-12345',
          vehicleType: 'MOTORCYCLE',
          vehicleTypeDisplayName: 'Xe máy',
          brand: 'Honda',
          model: 'Wave Alpha',
          color: 'Đen',
          imageUrls: ['url1', 'url2'],
          status: VehicleStatus.PENDING,
          statusDisplayName: 'Chờ duyệt',
          monthlyFee: 50000,
          apartmentId: 1,
          apartmentUnitNumber: 'A101',
          createdAt: '2024-01-01T00:00:00Z',
        );
        when(
          mockApiClient.createVehicle(
            licensePlate: anyNamed('licensePlate'),
            vehicleType: anyNamed('vehicleType'),
            apartmentId: anyNamed('apartmentId'),
            brand: anyNamed('brand'),
            model: anyNamed('model'),
            color: anyNamed('color'),
            imageUrls: anyNamed('imageUrls'),
          ),
        ).thenAnswer((_) async => expectedVehicle);

        // Act
        final result = await repository.createVehicle(
          licensePlate: '30A-12345',
          vehicleType: 'MOTORCYCLE',
          apartmentId: 1,
          brand: 'Honda',
          model: 'Wave Alpha',
          color: 'Đen',
          imageUrls: ['url1', 'url2'],
        );

        // Assert
        expect(result, equals(expectedVehicle));
        verify(
          mockApiClient.createVehicle(
            licensePlate: '30A-12345',
            vehicleType: 'MOTORCYCLE',
            apartmentId: 1,
            brand: 'Honda',
            model: 'Wave Alpha',
            color: 'Đen',
            imageUrls: ['url1', 'url2'],
          ),
        ).called(1);
      });
    });
  });
}
