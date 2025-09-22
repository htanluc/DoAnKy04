import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../../../core/app_config.dart';
import '../models/request.dart';

class ServiceRequestsApi {
  static String get baseUrl => '${AppConfig.apiBaseUrl}/api';
  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  Map<String, String> get _headers {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Map<String, String> get _multipartHeaders {
    final headers = <String, String>{};
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  // GET /support-requests/my
  Future<List<ServiceRequest>> getMyRequests() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/support-requests/my'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => ServiceRequest.fromJsonSafe(json)).toList();
      } else {
        throw Exception(
          'Lỗi khi lấy danh sách yêu cầu: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }

  // GET /support-requests/{id}
  Future<ServiceRequest> getRequestById(String id) async {
    try {
      print('Fetching request details for ID: $id');
      print('API URL: $baseUrl/support-requests/$id');
      print('Headers: $_headers');

      final response = await http.get(
        Uri.parse('$baseUrl/support-requests/$id'),
        headers: _headers,
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return ServiceRequest.fromJsonSafe(data);
      } else if (response.statusCode == 404) {
        throw Exception('Không tìm thấy yêu cầu với ID: $id');
      } else if (response.statusCode == 500) {
        throw Exception('Lỗi server (500). Vui lòng thử lại sau.');
      } else {
        throw Exception('Lỗi khi lấy chi tiết yêu cầu: ${response.statusCode}');
      }
    } catch (e) {
      print('Error in getRequestById: $e');
      throw Exception('Lỗi kết nối: $e');
    }
  }

  // POST /support-requests
  Future<ServiceRequest> createRequest(CreateServiceRequest request) async {
    try {
      print('ServiceRequestsApi: Creating request with data:');
      print('ServiceRequestsApi: Title: ${request.title}');
      print('ServiceRequestsApi: Description: ${request.description}');
      print('ServiceRequestsApi: CategoryId: ${request.categoryId}');
      print('ServiceRequestsApi: Priority: ${request.priority}');
      print('ServiceRequestsApi: AttachmentUrls: ${request.attachmentUrls}');
      print('ServiceRequestsApi: ImageAttachment: ${request.imageAttachment}');
      print('ServiceRequestsApi: JSON: ${json.encode(request.toJson())}');

      final response = await http.post(
        Uri.parse('$baseUrl/support-requests'),
        headers: _headers,
        body: json.encode(request.toJson()),
      );

      print(
        'ServiceRequestsApi: Create request response status: ${response.statusCode}',
      );
      print(
        'ServiceRequestsApi: Create request response body: ${response.body}',
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        final serviceRequest = ServiceRequest.fromJsonSafe(data);
        print(
          'ServiceRequestsApi: Created request with ID: ${serviceRequest.id}',
        );
        print(
          'ServiceRequestsApi: Created request imageUrls: ${serviceRequest.imageUrls}',
        );
        print(
          'ServiceRequestsApi: Created request attachmentUrls: ${serviceRequest.attachmentUrls}',
        );
        return serviceRequest;
      } else {
        final errorData = json.decode(response.body);
        print('ServiceRequestsApi: Create request failed: ${errorData}');
        throw Exception(
          errorData['message'] ?? 'Lỗi khi tạo yêu cầu: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('ServiceRequestsApi: Create request error: $e');
      throw Exception('Lỗi kết nối: $e');
    }
  }

  // PUT /support-requests/{id}/cancel
  Future<void> cancelRequest(String id) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/support-requests/$id/cancel'),
        headers: _headers,
      );

      if (response.statusCode != 200) {
        throw Exception('Lỗi khi hủy yêu cầu: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }

  // GET /service-categories
  Future<List<ServiceCategory>> getServiceCategories() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/service-categories'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Handle different response formats
        List<dynamic> categories = [];
        if (data is List) {
          // Direct array response
          categories = data;
        } else if (data['success'] == true && data['data'] != null) {
          // Wrapped response with success field
          categories = data['data'];
        } else if (data['data'] != null) {
          // Response with data field but no success field
          categories = data['data'];
        } else {
          throw Exception('Dữ liệu danh mục không hợp lệ');
        }

        return categories
            .map((json) => ServiceCategory.fromJsonSafe(json))
            .toList();
      } else {
        throw Exception('Lỗi khi lấy danh mục dịch vụ: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }

  // POST /upload/service-request (multipart)
  Future<List<String>> uploadImages(List<File> files) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/upload/service-request'),
      );

      // Add headers
      request.headers.addAll(_multipartHeaders);

      // Add files
      for (final file in files) {
        request.files.add(
          await http.MultipartFile.fromPath('files', file.path),
        );
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> urls = data['data'];
          return urls.cast<String>();
        } else {
          throw Exception('Upload file thất bại');
        }
      } else {
        throw Exception('Lỗi khi upload file: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Lỗi upload: $e');
    }
  }

  // Helper method to get image URL with token
  String getImageUrl(String rawUrl) {
    if (rawUrl.startsWith('http')) {
      // Replace localhost with the correct IP for mobile
      String correctedUrl = rawUrl.replaceAll('localhost', '172.16.2.32');
      return correctedUrl;
    }

    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/image-proxy');
    final params = <String, String>{'url': rawUrl};

    if (_token != null) {
      params['token'] = _token!;
    }

    params['_'] = DateTime.now().millisecondsSinceEpoch.toString();

    return uri.replace(queryParameters: params).toString();
  }
}
