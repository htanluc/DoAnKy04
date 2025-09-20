# 🚨 Các vấn đề Payment cần khắc phục sau này

## ❌ Vấn đề chính hiện tại:

### 1. **Payment Status không cập nhật sau thanh toán thành công**
- **Mô tả**: User thanh toán thành công trên Stripe nhưng trạng thái hóa đơn vẫn là UNPAID/OVERDUE
- **Nguyên nhân**: 
  - Backend callback URL `http://10.0.2.2:8080/api/payments/stripe/success` không accessible từ mobile app
  - Mobile app không thể load callback URL → `net::ERR_CONNECTION_REFUSED`
  - Stripe không thể gọi callback → Backend không xử lý payment completion
- **Ảnh hưởng**: User phải thanh toán lại hoặc liên hệ admin để update thủ công

### 2. **WebView Callback Detection không hoạt động đúng**
- **Mô tả**: WebView không thể detect khi Stripe redirect về callback URL
- **Nguyên nhân**: 
  - Android emulator không thể truy cập `10.0.2.2:8080` từ WebView
  - Network security configuration chưa đúng
  - Callback URL pattern matching chưa chính xác

### 3. **Fallback Mechanism chưa hoàn hảo**
- **Mô tả**: App assume payment success sau 3-10 giây nhưng không verify thực tế
- **Nguyên nhân**: 
  - Backend API `/api/payments/invoice/{id}` trả về danh sách rỗng `[]`
  - Không có cách nào verify payment status thực tế từ backend

## 🔧 Giải pháp cần implement:

### 1. **Sửa Callback URL Configuration**
```properties
# Cần dynamic callback URLs based on environment
payment.stripe.success-url=${STRIPE_SUCCESS_URL:http://localhost:8080/api/payments/stripe/success}
# Hoặc sử dụng environment variables để detect mobile vs web
```

### 2. **Implement Webhook thay vì Callback**
```java
// Thay vì dựa vào callback URL, sử dụng Stripe webhook
@PostMapping("/stripe/webhook")
public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
    // Verify webhook signature
    // Process payment completion
    // Update invoice status
}
```

### 3. **Cải thiện Mobile Payment Flow**
```dart
// Option 1: Deep linking
// Option 2: Background polling
// Option 3: Push notifications
// Option 4: Manual refresh button
```

### 4. **Backend API Enhancement**
```java
// Cần implement các endpoints:
GET /api/payments/invoice/{id} - Get payments for specific invoice
POST /api/payments/verify/{sessionId} - Verify payment status from Stripe
PUT /api/invoices/{id}/status - Manual status update endpoint
```

## 📋 Checklist khắc phục:

### Backend:
- [ ] Implement Stripe webhook endpoint
- [ ] Fix callback URL configuration for mobile
- [ ] Add manual payment verification endpoint
- [ ] Improve payment status polling API
- [ ] Add payment history endpoint for invoices

### Mobile App:
- [ ] Fix WebView callback detection
- [ ] Implement deep linking for payment completion
- [ ] Add manual refresh button in invoice detail
- [ ] Improve error handling and user feedback
- [ ] Add payment status polling with retry logic

### Testing:
- [ ] Test payment flow on real device (not emulator)
- [ ] Test with different payment methods (MoMo, VNPay, ZaloPay)
- [ ] Test network connectivity issues
- [ ] Test payment timeout scenarios

## 🎯 Priority Order:

1. **HIGH**: Fix callback URL accessibility from mobile
2. **HIGH**: Implement webhook-based payment verification
3. **MEDIUM**: Add manual payment status refresh
4. **MEDIUM**: Improve error handling and user feedback
5. **LOW**: Add payment history and detailed status tracking

## 📝 Notes:

- **Current Status**: Payment creation works, but completion verification fails
- **Workaround**: Users can manually refresh or contact admin
- **Next Steps**: Focus on webhook implementation and mobile callback fix
- **Timeline**: Should be fixed before production deployment

## 🔗 Related Files:

- `lib/features/invoices/ui/payment_webview_screen.dart` - WebView implementation
- `lib/features/invoices/data/payments_api.dart` - API client
- `apartment-portal-BE/src/main/java/.../PaymentController.java` - Backend controller
- `apartment-portal-BE/src/main/resources/application.properties` - Configuration

---

**Created**: $(date)  
**Status**: 🔴 CRITICAL - Needs immediate attention  
**Assignee**: Development Team  
**Estimated Fix Time**: 2-3 days
