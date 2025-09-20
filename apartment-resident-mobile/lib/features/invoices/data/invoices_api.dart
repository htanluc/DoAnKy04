import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../models/invoice.dart';
import '../../../core/api/api_service.dart';
import '../../../core/storage/secure_storage.dart';

class InvoicesApiClient {
  InvoicesApiClient({Dio? dio}) : _dio = dio ?? Dio() {
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
            print(
              '[InvoicesApi] Error: ${e.response?.statusCode} ${e.message}',
            );
          }
          handler.next(e);
        },
      ),
    );
  }

  final Dio _dio;

  static String _resolveBaseUrl() {
    final base = ApiService.baseUrl;
    return '$base/api';
  }

  Future<List<InvoiceModel>> getMyInvoices() async {
    try {
      final res = await _dio
          .get('/invoices/my')
          .timeout(const Duration(seconds: 15));
      final data = res.data as List<dynamic>;
      return data
          .map((e) => InvoiceModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        print('[InvoicesApi] getMyInvoices error: $e');
      }
      rethrow;
    }
  }

  Future<InvoiceModel> getInvoiceDetail(int invoiceId) async {
    try {
      // Backend không có endpoint /invoices/{id} cho user thường
      // Sử dụng dữ liệu từ /invoices/my và filter theo ID
      final invoices = await getMyInvoices();
      final invoice = invoices.firstWhere(
        (invoice) => invoice.id == invoiceId,
        orElse: () =>
            throw Exception('Không tìm thấy hóa đơn với ID: $invoiceId'),
      );
      return invoice;
    } catch (e) {
      if (kDebugMode) {
        print('[InvoicesApi] getInvoiceDetail error: $e');
      }
      rethrow;
    }
  }
}
