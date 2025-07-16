package com.mytech.apartment.portal.services.gateways;

import com.mytech.apartment.portal.services.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class PayPalGateway implements PaymentGateway {

    @Value("${payment.paypal.client-id}")
    private String clientId;

    @Value("${payment.paypal.client-secret}")
    private String clientSecret;

    @Value("${payment.paypal.mode}")
    private String mode;

    @Value("${payment.paypal.return-url}")
    private String returnUrl;

    @Value("${payment.paypal.cancel-url}")
    private String cancelUrl;

    @Value("${payment.return.url}")
    private String baseReturnUrl;

    @Override
    public Map<String, Object> createPayment(String orderId, Long amount, String orderInfo) {
        try {
            // Trong thực tế, bạn sẽ tích hợp với PayPal SDK
            // Đây là mock implementation cho demo
            
            String paypalUrl = "https://www.sandbox.paypal.com/cgi-bin/webscr?" +
                    "cmd=_xclick" +
                    "&business=your-paypal-email@example.com" +
                    "&item_name=" + orderInfo +
                    "&item_number=" + orderId +
                    "&amount=" + (amount / 23000.0) + // Convert VND to USD (approximate)
                    "&currency_code=USD" +
                    "&return=" + returnUrl + "?orderId=" + orderId +
                    "&cancel_return=" + cancelUrl + "?orderId=" + orderId +
                    "&notify_url=" + baseReturnUrl + "/paypal/callback";

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("payUrl", paypalUrl);
            response.put("amount", amount);
            response.put("amountUSD", amount / 23000.0);
            response.put("status", "success");
            response.put("gateway", "paypal");

            return response;
        } catch (Exception e) {
            log.error("Error creating PayPal payment", e);
            throw new RuntimeException("Không thể tạo thanh toán PayPal: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        try {
            // Trong thực tế, bạn sẽ verify với PayPal IPN (Instant Payment Notification)
            String paymentStatus = params.get("payment_status");
            String txnId = params.get("txn_id");
            String receiverEmail = params.get("receiver_email");
            String mcGross = params.get("mc_gross");
            String mcCurrency = params.get("mc_currency");

            // Verify các thông tin cần thiết
            return "Completed".equals(paymentStatus) && 
                   txnId != null && 
                   receiverEmail != null &&
                   mcGross != null &&
                   "USD".equals(mcCurrency);
        } catch (Exception e) {
            log.error("Error verifying PayPal callback", e);
            return false;
        }
    }

    @Override
    public Map<String, Object> checkPaymentStatus(String orderId) {
        try {
            // Trong thực tế, bạn sẽ gọi PayPal API để kiểm tra trạng thái
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("status", "pending");
            response.put("gateway", "paypal");
            return response;
        } catch (Exception e) {
            log.error("Error checking PayPal payment status", e);
            throw new RuntimeException("Không thể kiểm tra trạng thái thanh toán PayPal");
        }
    }

    @Override
    public String getGatewayName() {
        return "PayPal";
    }
} 