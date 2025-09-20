import '../models/facility.dart';
import 'facilities_api.dart';

class FacilitiesRepository {
  static final FacilitiesRepository _instance =
      FacilitiesRepository._internal();
  factory FacilitiesRepository() => _instance;
  FacilitiesRepository._internal();

  /// Lấy danh sách tất cả tiện ích
  Future<List<Facility>> getAllFacilities() async {
    try {
      return await FacilitiesApi.getAll();
    } catch (e) {
      throw Exception('Không thể tải danh sách tiện ích: $e');
    }
  }

  /// Lấy thông tin tiện ích theo ID
  Future<Facility> getFacilityById(int id) async {
    try {
      return await FacilitiesApi.getById(id);
    } catch (e) {
      throw Exception('Không thể tải thông tin tiện ích: $e');
    }
  }

  /// Tạo tiện ích mới (admin only)
  Future<Facility> createFacility(FacilityCreateRequest request) async {
    try {
      return await FacilitiesApi.create(request);
    } catch (e) {
      throw Exception('Không thể tạo tiện ích: $e');
    }
  }

  /// Cập nhật tiện ích (admin only)
  Future<Facility> updateFacility(int id, FacilityUpdateRequest request) async {
    try {
      return await FacilitiesApi.update(id, request);
    } catch (e) {
      throw Exception('Không thể cập nhật tiện ích: $e');
    }
  }

  /// Toggle visibility của tiện ích (admin only)
  Future<Facility> toggleFacilityVisibility(int id) async {
    try {
      return await FacilitiesApi.toggleVisibility(id);
    } catch (e) {
      throw Exception('Không thể thay đổi trạng thái tiện ích: $e');
    }
  }

  /// Xóa tiện ích (admin only)
  Future<void> deleteFacility(int id) async {
    try {
      await FacilitiesApi.delete(id);
    } catch (e) {
      throw Exception('Không thể xóa tiện ích: $e');
    }
  }

  /// Lọc tiện ích theo tên hoặc mô tả
  Future<List<Facility>> searchFacilities(String query) async {
    try {
      final facilities = await FacilitiesApi.getAll();
      if (query.isEmpty) return facilities;

      final lowercaseQuery = query.toLowerCase();
      return facilities.where((facility) {
        return facility.name.toLowerCase().contains(lowercaseQuery) ||
            facility.description.toLowerCase().contains(lowercaseQuery) ||
            facility.location.toLowerCase().contains(lowercaseQuery);
      }).toList();
    } catch (e) {
      throw Exception('Không thể tìm kiếm tiện ích: $e');
    }
  }

  /// Lấy danh sách tiện ích hiển thị (isVisible = true)
  Future<List<Facility>> getVisibleFacilities() async {
    try {
      final facilities = await FacilitiesApi.getAll();
      return facilities.where((facility) => facility.isVisible).toList();
    } catch (e) {
      throw Exception('Không thể tải danh sách tiện ích hiển thị: $e');
    }
  }

  /// Lấy danh sách tiện ích theo sức chứa
  Future<List<Facility>> getFacilitiesByCapacity(int minCapacity) async {
    try {
      final facilities = await FacilitiesApi.getAll();
      return facilities
          .where((facility) => facility.capacity >= minCapacity)
          .toList();
    } catch (e) {
      throw Exception('Không thể lọc tiện ích theo sức chứa: $e');
    }
  }
}
