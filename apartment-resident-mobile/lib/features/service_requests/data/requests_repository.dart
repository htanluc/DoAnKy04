import 'dart:io';
import '../models/request.dart';
import 'requests_api.dart';
import 'upload_api.dart';

class ServiceRequestsRepository {
  final ServiceRequestsApi _api;
  final UploadApi _uploadApi;

  ServiceRequestsRepository({
    required ServiceRequestsApi api,
    required UploadApi uploadApi,
  }) : _api = api,
       _uploadApi = uploadApi;

  void setToken(String? token) {
    _api.setToken(token);
    _uploadApi.setToken(token);
  }

  // Get all service requests for current user
  Future<List<ServiceRequest>> getMyRequests() async {
    try {
      return await _api.getMyRequests();
    } catch (e) {
      throw Exception('Lỗi khi lấy danh sách yêu cầu: $e');
    }
  }

  // Get service request by ID
  Future<ServiceRequest> getRequestById(String id) async {
    try {
      return await _api.getRequestById(id);
    } catch (e) {
      throw Exception('Lỗi khi lấy chi tiết yêu cầu: $e');
    }
  }

  // Create new service request
  Future<ServiceRequest> createRequest(CreateServiceRequest request) async {
    try {
      return await _api.createRequest(request);
    } catch (e) {
      throw Exception('Lỗi khi tạo yêu cầu: $e');
    }
  }

  // Cancel service request
  Future<void> cancelRequest(String id) async {
    try {
      await _api.cancelRequest(id);
    } catch (e) {
      throw Exception('Lỗi khi hủy yêu cầu: $e');
    }
  }

  // Get service categories
  Future<List<ServiceCategory>> getServiceCategories() async {
    try {
      return await _api.getServiceCategories();
    } catch (e) {
      throw Exception('Lỗi khi lấy danh mục dịch vụ: $e');
    }
  }

  // Upload images for service request
  Future<List<String>> uploadImages(List<File> files) async {
    try {
      // Validate files before upload
      for (final file in files) {
        if (!UploadApi.validateFile(file)) {
          throw Exception(
            'File ${file.path} không hợp lệ hoặc quá lớn (tối đa 5MB)',
          );
        }
      }

      return await _uploadApi.uploadServiceRequestImages(files);
    } catch (e) {
      throw Exception('Lỗi khi upload hình ảnh: $e');
    }
  }

  // Get image URL with token
  String getImageUrl(String rawUrl) {
    return _uploadApi.getImageUrl(rawUrl);
  }

  // Filter requests by status
  List<ServiceRequest> filterByStatus(
    List<ServiceRequest> requests,
    String status,
  ) {
    if (status == 'all') return requests;
    return requests.where((request) => request.status == status).toList();
  }

  // Filter requests by category
  List<ServiceRequest> filterByCategory(
    List<ServiceRequest> requests,
    String category,
  ) {
    if (category == 'all') return requests;
    return requests.where((request) => request.category == category).toList();
  }

  // Search requests by title or description
  List<ServiceRequest> searchRequests(
    List<ServiceRequest> requests,
    String searchTerm,
  ) {
    if (searchTerm.isEmpty) return requests;

    final term = searchTerm.toLowerCase();
    return requests.where((request) {
      return request.title.toLowerCase().contains(term) ||
          request.description.toLowerCase().contains(term);
    }).toList();
  }

  // Get request statistics
  Map<String, int> getRequestStatistics(List<ServiceRequest> requests) {
    return {
      'total': requests.length,
      'pending': requests.where((r) => r.status == 'PENDING').length,
      'inProgress': requests.where((r) => r.status == 'IN_PROGRESS').length,
      'completed': requests.where((r) => r.status == 'COMPLETED').length,
      'cancelled': requests.where((r) => r.status == 'CANCELLED').length,
    };
  }

  // Sort requests by date (newest first)
  List<ServiceRequest> sortByDate(List<ServiceRequest> requests) {
    final sorted = List<ServiceRequest>.from(requests);
    sorted.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return sorted;
  }

  // Sort requests by priority
  List<ServiceRequest> sortByPriority(List<ServiceRequest> requests) {
    final priorityOrder = {'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1};

    final sorted = List<ServiceRequest>.from(requests);
    sorted.sort((a, b) {
      final aPriority = priorityOrder[a.priority] ?? 0;
      final bPriority = priorityOrder[b.priority] ?? 0;
      return bPriority.compareTo(aPriority);
    });
    return sorted;
  }
}
