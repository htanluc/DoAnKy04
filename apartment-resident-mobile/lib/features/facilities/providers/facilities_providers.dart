import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/facilities_repository.dart';
import '../models/facility.dart';

/// Provider cho FacilitiesRepository
final facilitiesRepositoryProvider = Provider<FacilitiesRepository>((ref) {
  return FacilitiesRepository();
});

/// Provider cho danh sách tất cả tiện ích
final facilitiesProvider = FutureProvider<List<Facility>>((ref) async {
  final repository = ref.read(facilitiesRepositoryProvider);
  return await repository.getAllFacilities();
});

/// Provider cho danh sách tiện ích hiển thị
final visibleFacilitiesProvider = FutureProvider<List<Facility>>((ref) async {
  final repository = ref.read(facilitiesRepositoryProvider);
  return await repository.getVisibleFacilities();
});

/// Provider cho thông tin tiện ích theo ID
final facilityProvider = FutureProvider.family<Facility, int>((ref, id) async {
  final repository = ref.read(facilitiesRepositoryProvider);
  return await repository.getFacilityById(id);
});

/// Provider cho tìm kiếm tiện ích
final facilitiesSearchProvider =
    StateNotifierProvider<FacilitiesSearchNotifier, AsyncValue<List<Facility>>>(
      (ref) {
        final repository = ref.read(facilitiesRepositoryProvider);
        return FacilitiesSearchNotifier(repository);
      },
    );

/// Provider cho filter tiện ích theo sức chứa
final facilitiesByCapacityProvider =
    StateNotifierProvider<
      FacilitiesByCapacityNotifier,
      AsyncValue<List<Facility>>
    >((ref) {
      final repository = ref.read(facilitiesRepositoryProvider);
      return FacilitiesByCapacityNotifier(repository);
    });

/// StateNotifier cho tìm kiếm tiện ích
class FacilitiesSearchNotifier
    extends StateNotifier<AsyncValue<List<Facility>>> {
  final FacilitiesRepository _repository;
  String _lastQuery = '';

  FacilitiesSearchNotifier(this._repository)
    : super(const AsyncValue.loading()) {
    loadFacilities();
  }

  /// Tải danh sách tiện ích ban đầu
  Future<void> loadFacilities() async {
    try {
      state = const AsyncValue.loading();
      final facilities = await _repository
          .getVisibleFacilities(); // Chỉ lấy facilities visible
      state = AsyncValue.data(facilities);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Tìm kiếm tiện ích
  Future<void> search(String query) async {
    if (query == _lastQuery) return;

    _lastQuery = query;

    try {
      state = const AsyncValue.loading();
      final facilities = await _repository.searchFacilities(query);
      state = AsyncValue.data(facilities);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Refresh danh sách
  Future<void> refresh() async {
    await loadFacilities();
  }
}

/// StateNotifier cho filter tiện ích theo sức chứa
class FacilitiesByCapacityNotifier
    extends StateNotifier<AsyncValue<List<Facility>>> {
  final FacilitiesRepository _repository;
  int _lastMinCapacity = 0;

  FacilitiesByCapacityNotifier(this._repository)
    : super(const AsyncValue.loading()) {
    loadFacilities();
  }

  /// Tải danh sách tiện ích ban đầu
  Future<void> loadFacilities() async {
    try {
      state = const AsyncValue.loading();
      final facilities = await _repository
          .getVisibleFacilities(); // Chỉ lấy facilities visible
      state = AsyncValue.data(facilities);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Filter theo sức chứa tối thiểu
  Future<void> filterByCapacity(int minCapacity) async {
    if (minCapacity == _lastMinCapacity) return;

    _lastMinCapacity = minCapacity;

    try {
      state = const AsyncValue.loading();
      final facilities = await _repository.getFacilitiesByCapacity(minCapacity);
      state = AsyncValue.data(facilities);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Refresh danh sách
  Future<void> refresh() async {
    await loadFacilities();
  }
}

/// Provider cho trạng thái loading của facilities
final facilitiesLoadingProvider = StateProvider<bool>((ref) => false);

/// Provider cho error message của facilities
final facilitiesErrorProvider = StateProvider<String?>((ref) => null);

/// Provider cho selected facility
final selectedFacilityProvider = StateProvider<Facility?>((ref) => null);

/// Provider cho search query
final facilitiesSearchQueryProvider = StateProvider<String>((ref) => '');

/// Provider cho min capacity filter
final minCapacityProvider = StateProvider<int>((ref) => 0);
