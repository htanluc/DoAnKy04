import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../../../core/app_config.dart';

class UploadApi {
  static String get baseUrl => '${AppConfig.apiBaseUrl}/api';
  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  Map<String, String> get _headers {
    final headers = <String, String>{};
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  // POST /upload/service-request (multipart)
  Future<List<String>> uploadServiceRequestImages(List<File> files) async {
    try {
      print('UploadApi: Starting upload of ${files.length} files');
      print('UploadApi: Upload URL: $baseUrl/upload/service-request');
      print('UploadApi: Headers: $_headers');

      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/upload/service-request'),
      );

      // Add headers
      request.headers.addAll(_headers);

      // Add files
      for (int i = 0; i < files.length; i++) {
        final file = files[i];
        print('UploadApi: Adding file $i: ${file.path}');
        request.files.add(
          await http.MultipartFile.fromPath('files', file.path),
        );
      }

      print('UploadApi: Sending request...');
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      print('UploadApi: Response status: ${response.statusCode}');
      print('UploadApi: Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> urls = data['data'];
          print('UploadApi: Upload successful, got ${urls.length} URLs: $urls');
          return urls.cast<String>();
        } else {
          print(
            'UploadApi: Upload failed - success: ${data['success']}, data: ${data['data']}',
          );
          throw Exception('Upload file thất bại');
        }
      } else {
        final errorData = json.decode(response.body);
        throw Exception(
          errorData['message'] ?? 'Lỗi khi upload file: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Lỗi upload: $e');
    }
  }

  // Generic upload method for other file types
  Future<List<String>> uploadFiles(List<File> files, String endpoint) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl$endpoint'),
      );

      // Add headers
      request.headers.addAll(_headers);

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
        final errorData = json.decode(response.body);
        throw Exception(
          errorData['message'] ?? 'Lỗi khi upload file: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Lỗi upload: $e');
    }
  }

  // Helper method to get image URL with token
  String getImageUrl(String rawUrl) {
    if (rawUrl.startsWith('http')) {
      // Replace localhost with the correct IP for mobile
      String correctedUrl = rawUrl.replaceAll('localhost', '10.0.3.2');
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

  // Validate file before upload
  static bool validateFile(File file, {int maxSizeInMB = 5}) {
    final fileSize = file.lengthSync();
    final maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (fileSize > maxSizeInBytes) {
      return false;
    }

    // Check file extension
    final extension = file.path.split('.').last.toLowerCase();
    final allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    return allowedExtensions.contains(extension);
  }

  // Get file size in MB
  static double getFileSizeInMB(File file) {
    return file.lengthSync() / (1024 * 1024);
  }

  // Get file extension
  static String getFileExtension(File file) {
    return file.path.split('.').last.toLowerCase();
  }
}
