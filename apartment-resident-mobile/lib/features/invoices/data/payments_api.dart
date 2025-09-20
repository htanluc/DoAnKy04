import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../models/payment.dart';
import '../../../core/api/api_service.dart';
import '../../../core/storage/secure_storage.dart';

class PaymentsApiClient {
  PaymentsApiClient({Dio? dio}) : _dio = dio ?? Dio() {
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
              '[PaymentsApi] Error: ${e.response?.statusCode} ${e.message}',
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

  Future<List<PaymentModel>> getInvoicePayments(int invoiceId) async {
    try {
      // Backend chưa có endpoint /invoices/{id}/payments
      // Trả về danh sách rỗng tạm thời
      if (kDebugMode) {
        print(
          '[PaymentsApi] getInvoicePayments: Backend chưa có endpoint, trả về danh sách rỗng',
        );
      }
      return [];
    } catch (e) {
      if (kDebugMode) {
        print('[PaymentsApi] getInvoicePayments error: $e');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createMomoPayment({
    required int invoiceId,
    required int amount,
    required String orderInfo,
  }) async {
    try {
      if (kDebugMode) {
        print(
          '[PaymentsApi] createMomoPayment: Gọi API thực tế /api/payments/momo',
        );
      }

      final response = await _dio.post(
        '/payments/momo',
        queryParameters: {
          'invoiceId': invoiceId,
          'amount': amount,
          'orderInfo': orderInfo,
        },
      );

      if (kDebugMode) {
        print('[PaymentsApi] createMomoPayment response: ${response.data}');
      }

      final data = response.data['data'];
      return {
        'paymentUrl': data['payUrl'],
        'message': response.data['message'] ?? 'Tạo thanh toán MoMo thành công',
      };
    } catch (e) {
      if (kDebugMode) {
        print('[PaymentsApi] createMomoPayment error: $e');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createVNPayPayment({
    required int invoiceId,
    required int amount,
    required String orderInfo,
  }) async {
    try {
      if (kDebugMode) {
        print(
          '[PaymentsApi] createVNPayPayment: Gọi API thực tế /api/payments/vnpay',
        );
      }

      final response = await _dio.post(
        '/payments/vnpay',
        data: {
          'orderId': 'APPT${DateTime.now().millisecondsSinceEpoch}',
          'amount': amount,
          'orderInfo': orderInfo,
        },
      );

      if (kDebugMode) {
        print('[PaymentsApi] createVNPayPayment response: ${response.data}');
      }

      // VNPay trả về trực tiếp payUrl
      return {
        'paymentUrl': response.data['payUrl'],
        'message': 'Tạo thanh toán VNPay thành công',
      };
    } catch (e) {
      if (kDebugMode) {
        print('[PaymentsApi] createVNPayPayment error: $e');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createZaloPayPayment({
    required int invoiceId,
    required int amount,
    required String orderInfo,
  }) async {
    try {
      if (kDebugMode) {
        print(
          '[PaymentsApi] createZaloPayPayment: Gọi API thực tế /api/payments/zalopay',
        );
      }

      final response = await _dio.post(
        '/payments/zalopay',
        queryParameters: {
          'invoiceId': invoiceId,
          'amount': amount,
          'orderInfo': orderInfo,
        },
      );

      if (kDebugMode) {
        print('[PaymentsApi] createZaloPayPayment response: ${response.data}');
      }

      final data = response.data['data'];
      return {
        'paymentUrl': data['payUrl'],
        'message':
            response.data['message'] ?? 'Tạo thanh toán ZaloPay thành công',
      };
    } catch (e) {
      if (kDebugMode) {
        print('[PaymentsApi] createZaloPayPayment error: $e');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createVisaPayment({
    required int invoiceId,
    required int amount,
    required String orderInfo,
  }) async {
    try {
      if (kDebugMode) {
        print(
          '[PaymentsApi] createVisaPayment: Gọi API thực tế /api/payments/stripe',
        );
      }

      final response = await _dio.post(
        '/payments/stripe',
        queryParameters: {
          'invoiceId': invoiceId,
          'amount': amount,
          'orderInfo': orderInfo,
        },
      );

      if (kDebugMode) {
        print('[PaymentsApi] createVisaPayment response: ${response.data}');
      }

      final data = response.data['data'];
      return {
        'paymentUrl': data['payUrl'],
        'message': response.data['message'] ?? 'Tạo thanh toán Visa thành công',
      };
    } catch (e) {
      if (kDebugMode) {
        print('[PaymentsApi] createVisaPayment error: $e');
      }
      rethrow;
    }
  }

  // Auto-payment methods (if available in backend)
  Future<Map<String, dynamic>> setupAutoPayment({
    required int invoiceId,
    required PaymentMethod method,
    required String bankAccount,
  }) async {
    try {
      // Backend chưa có endpoint /payments/auto-payment
      // Trả về mock response tạm thời
      if (kDebugMode) {
        print(
          '[PaymentsApi] setupAutoPayment: Backend chưa có endpoint, trả về mock response',
        );
      }
      return {
        'message': 'Mock auto-payment setup - Backend chưa implement',
        'status': 'success',
      };
    } catch (e) {
      if (kDebugMode) {
        print('[PaymentsApi] setupAutoPayment error: $e');
      }
      rethrow;
    }
  }

  Future<void> cancelAutoPayment(int invoiceId) async {
    try {
      // Backend chưa có endpoint /payments/auto-payment/{id}
      // Mock success
      if (kDebugMode) {
        print(
          '[PaymentsApi] cancelAutoPayment: Backend chưa có endpoint, mock success',
        );
      }
    } catch (e) {
      if (kDebugMode) {
        print('[PaymentsApi] cancelAutoPayment error: $e');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>?> getAutoPaymentSettings(int invoiceId) async {
    try {
      // Backend chưa có endpoint /payments/auto-payment/{id}
      // Trả về null tạm thời
      if (kDebugMode) {
        print(
          '[PaymentsApi] getAutoPaymentSettings: Backend chưa có endpoint, trả về null',
        );
      }
      return null;
    } catch (e) {
      if (kDebugMode) {
        print('[PaymentsApi] getAutoPaymentSettings error: $e');
      }
      return null;
    }
  }

  Future<Map<String, dynamic>> checkPaymentStatus(int invoiceId) async {
    try {
      if (kDebugMode) {
        print(
          '[PaymentsApi] checkPaymentStatus: Kiểm tra trạng thái thanh toán cho invoice $invoiceId',
        );
      }

      final response = await _dio.get('/payments/invoice/$invoiceId');

      if (kDebugMode) {
        print('[PaymentsApi] checkPaymentStatus response: ${response.data}');
      }

      // Check if there are any SUCCESS payments for this invoice
      final payments = response.data as List<dynamic>;
      final hasSuccessPayment = payments.any(
        (payment) =>
            payment['status'] == 'SUCCESS' || payment['status'] == 'PAID',
      );

      return {'hasSuccessPayment': hasSuccessPayment, 'payments': payments};
    } catch (e) {
      if (kDebugMode) {
        print('[PaymentsApi] checkPaymentStatus error: $e');
      }
      return {
        'hasSuccessPayment': false,
        'payments': [],
        'error': e.toString(),
      };
    }
  }
}
