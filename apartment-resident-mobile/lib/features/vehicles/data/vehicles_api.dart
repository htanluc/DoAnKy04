import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../models/vehicle.dart';
import '../models/vehicle_type.dart';
import '../../../core/api/api_service.dart';
import '../../../core/storage/secure_storage.dart';

class VehiclesApiClient {
  VehiclesApiClient({Dio? dio}) : _dio = dio ?? Dio() {
    _dio.options
      ..baseUrl = _resolveBaseUrl()
      ..connectTimeout = const Duration(seconds: 20)
      ..receiveTimeout = const Duration(seconds: 20)
      ..headers = {'Content-Type': 'application/json'};

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await TokenStorage.instance.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (e, handler) {
          if (kDebugMode) {
            // ignore: avoid_print
            print(
              '[VehiclesApi] Error: ${e.response?.statusCode} ${e.message}',
            );
          }
          handler.next(e);
        },
      ),
    );
  }

  final Dio _dio;

  static String _resolveBaseUrl() {
    // Use the same base URL config as the rest of the app
    // ApiService.baseUrl does NOT include '/api'
    final base = ApiService.baseUrl;
    return '$base/api';
  }

  Future<List<VehicleTypeModel>> getVehicleTypes() async {
    try {
      final res = await _dio.get('/vehicles/types');
      final data = res.data as List<dynamic>;
      return data
          .map((e) => VehicleTypeModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        print('Lỗi tải loại xe: $e');
      }
      // Không dùng dữ liệu mẫu
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> getMyApartmentsRaw() async {
    try {
      final res = await _dio.get('/apartments/my');
      final data = res.data as List<dynamic>;
      return data.map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (e) {
      if (kDebugMode) {
        print('Lỗi tải căn hộ: $e');
      }
      // Không dùng dữ liệu mẫu
      return [];
    }
  }

  Future<List<VehicleModel>> getMyVehicles() async {
    try {
      final res = await _dio
          .get('/vehicles/my')
          .timeout(const Duration(seconds: 15));
      final data = res.data as List<dynamic>;
      return data
          .map((e) => VehicleModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        print('[VehiclesApi] getMyVehicles error: $e');
      }
      // Trả về danh sách rỗng thay vì rethrow để tránh crash
      return [];
    }
  }

  Future<List<VehicleModel>> getBuildingVehicles() async {
    try {
      // Lấy danh sách căn hộ của cư dân với timeout
      final apartmentsResponse = await _dio
          .get('/apartments/my')
          .timeout(const Duration(seconds: 10));
      final List<dynamic> apartments = apartmentsResponse.data;

      if (apartments.isEmpty) {
        return [];
      }

      // Lấy xe từ tất cả căn hộ của cư dân
      final List<VehicleModel> allVehicles = [];
      for (final apartment in apartments) {
        final apartmentId = apartment['id'];
        if (apartmentId != null) {
          try {
            final response = await _dio
                .get('/vehicles/apartment/$apartmentId')
                .timeout(const Duration(seconds: 8));
            final List<dynamic> data = response.data;
            final vehicles = data
                .map(
                  (json) =>
                      VehicleModel.fromJson(Map<String, dynamic>.from(json)),
                )
                .toList();
            allVehicles.addAll(vehicles);
          } catch (e) {
            // Bỏ qua lỗi của từng căn hộ
            if (kDebugMode) {
              print('[VehiclesApi] Lỗi tải xe căn hộ $apartmentId: $e');
            }
          }
        }
      }

      return allVehicles;
    } on DioException catch (e) {
      if (kDebugMode) {
        print('[VehiclesApi] Lỗi tải xe tòa nhà: $e');
      }
      // Trả về danh sách rỗng thay vì rethrow để tránh crash
      return [];
    } catch (e) {
      if (kDebugMode) {
        print('[VehiclesApi] getBuildingVehicles error: $e');
      }
      // Trả về danh sách rỗng thay vì rethrow để tránh crash
      return [];
    }
  }

  Future<VehicleModel> createVehicle({
    required String licensePlate,
    required String vehicleType,
    required int apartmentId,
    String? brand,
    String? model,
    String? color,
    List<String>? imageUrls,
  }) async {
    final res = await _dio.post(
      '/vehicles',
      data: {
        'licensePlate': licensePlate,
        'vehicleType': vehicleType,
        'apartmentId': apartmentId,
        if (brand != null && brand.isNotEmpty) 'brand': brand,
        if (model != null && model.isNotEmpty) 'model': model,
        if (color != null && color.isNotEmpty) 'color': color,
        if (imageUrls != null && imageUrls.isNotEmpty) 'imageUrls': imageUrls,
      },
    );
    return VehicleModel.fromJson(Map<String, dynamic>.from(res.data));
  }

  Future<List<String>> uploadImages(List<MultipartFile> files) async {
    final formData = FormData();
    for (final file in files) {
      formData.files.add(MapEntry('files', file));
    }
    final res = await _dio.post('/vehicles/upload-images', data: formData);
    final body = res.data;
    if (body is Map && body['success'] == true && body['data'] != null) {
      final d = body['data'];
      return d is List ? d.map((e) => e.toString()).toList() : [d.toString()];
    }
    if (body is List) {
      return body.map((e) => e.toString()).toList();
    }
    throw Exception('Response format không hợp lệ');
  }

  // Bỏ dữ liệu mẫu để tránh hiển thị sai sự thật
}
