import 'dart:convert';
import '../../../../core/api/api_helper.dart';
import '../models/facility.dart';

class FacilitiesApi {
  static const String _basePath = '/api/facilities';

  /// Lấy danh sách tất cả tiện ích
  static Future<List<Facility>> getAll() async {
    try {
      print('Fetching facilities from: $_basePath');
      final response = await ApiHelper.get(_basePath);
      print('Facilities API response status: ${response.statusCode}');
      print('Facilities API response body: ${response.body}');

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch facilities: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      print('Facilities API parsed data: $data');

      final facilitiesList = ApiHelper.extractList(data);
      print('Extracted facilities list: $facilitiesList');

      if (facilitiesList.isEmpty) {
        print('No facilities found in response');
        return [];
      }

      final facilities = facilitiesList
          .map((json) => Facility.fromJson(json as Map<String, dynamic>))
          .toList();

      print('Parsed ${facilities.length} facilities successfully');
      return facilities;
    } catch (e) {
      print('Error fetching facilities: $e');
      throw Exception('Error fetching facilities: $e');
    }
  }

  /// Lấy thông tin tiện ích theo ID
  static Future<Facility> getById(int id) async {
    try {
      final response = await ApiHelper.get('$_basePath/$id');
      if (response.statusCode != 200) {
        throw Exception('Failed to fetch facility: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      final facilityData = ApiHelper.extractMap(data);

      return Facility.fromJson(facilityData);
    } catch (e) {
      throw Exception('Error fetching facility: $e');
    }
  }

  /// Tạo tiện ích mới (admin only)
  static Future<Facility> create(FacilityCreateRequest request) async {
    try {
      final response = await ApiHelper.post(_basePath, data: request.toJson());

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Failed to create facility: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      final facilityData = ApiHelper.extractMap(data);

      return Facility.fromJson(facilityData);
    } catch (e) {
      throw Exception('Error creating facility: $e');
    }
  }

  /// Cập nhật tiện ích (admin only)
  static Future<Facility> update(int id, FacilityUpdateRequest request) async {
    try {
      final response = await ApiHelper.put(
        '$_basePath/$id',
        data: request.toJson(),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update facility: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      final facilityData = ApiHelper.extractMap(data);

      return Facility.fromJson(facilityData);
    } catch (e) {
      throw Exception('Error updating facility: $e');
    }
  }

  /// Toggle visibility của tiện ích (admin only)
  static Future<Facility> toggleVisibility(int id) async {
    try {
      final response = await ApiHelper.put('$_basePath/$id/toggle-visibility');

      if (response.statusCode != 200) {
        throw Exception(
          'Failed to toggle facility visibility: ${response.statusCode}',
        );
      }

      final data = jsonDecode(response.body);
      final facilityData = ApiHelper.extractMap(data);

      return Facility.fromJson(facilityData);
    } catch (e) {
      throw Exception('Error toggling facility visibility: $e');
    }
  }

  /// Xóa tiện ích (admin only)
  static Future<void> delete(int id) async {
    try {
      final response = await ApiHelper.delete('$_basePath/$id');

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Failed to delete facility: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error deleting facility: $e');
    }
  }
}
