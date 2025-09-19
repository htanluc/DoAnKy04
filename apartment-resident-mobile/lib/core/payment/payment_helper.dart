import '../app_config.dart';

class PaymentHelper {
  PaymentHelper._();

  /// Lấy return URL phù hợp cho mobile app
  static String getReturnUrl(String paymentType) {
    final baseUrl = AppConfig.apiBaseUrl;

    switch (paymentType) {
      case 'invoice':
        return '$baseUrl/api/payments/vnpay/return';
      case 'facility_booking':
        return '$baseUrl/api/facility-bookings/payment-callback';
      default:
        return '$baseUrl/api/payments/vnpay/return';
    }
  }

  /// Lấy return URL cho các payment gateway khác
  static String getGatewayReturnUrl(String gateway, String paymentType) {
    final baseUrl = AppConfig.apiBaseUrl;

    switch (gateway) {
      case 'vnpay':
        return getReturnUrl(paymentType);
      case 'momo':
        return '$baseUrl/api/payments/momo/callback';
      case 'zalopay':
        return '$baseUrl/api/payments/zalopay/callback';
      case 'visa':
        return '$baseUrl/api/payments/stripe/success';
      default:
        return getReturnUrl(paymentType);
    }
  }
}
