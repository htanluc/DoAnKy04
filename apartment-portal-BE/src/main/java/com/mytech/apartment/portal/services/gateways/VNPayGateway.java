package com.mytech.apartment.portal.services.gateways;

import com.mytech.apartment.portal.services.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.TreeMap;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

@Service
@Slf4j
public class VNPayGateway implements PaymentGateway {

    @Value("${payment.vnpay.endpoint}")
    private String endpoint;

    @Value("${payment.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${payment.vnpay.hash-secret}")
    private String hashSecret;

    @Value("${payment.return.url}")
    private String returnUrl;

    @Override
    public Map<String, Object> createPayment(String orderId, Long amount, String orderInfo) {
        return createPayment(orderId, amount, orderInfo, null);
    }
    
    public Map<String, Object> createPayment(String orderId, Long amount, String orderInfo, String customReturnUrl) {
        try {
            log.info("Bắt đầu tạo thanh toán VNPay - orderId: {}, amount: {}, orderInfo: {}, customReturnUrl: {}", 
                    orderId, amount, orderInfo, customReturnUrl);
            
            // Validate configuration
            if (endpoint == null || endpoint.trim().isEmpty()) {
                throw new RuntimeException("VNPay endpoint chưa được cấu hình");
            }
            if (tmnCode == null || tmnCode.trim().isEmpty()) {
                throw new RuntimeException("VNPay tmnCode chưa được cấu hình");
            }
            if (hashSecret == null || hashSecret.trim().isEmpty()) {
                throw new RuntimeException("VNPay hashSecret chưa được cấu hình");
            }
            
            log.info("Cấu hình VNPay - endpoint: {}, tmnCode: {}, returnUrl: {}", endpoint, tmnCode, returnUrl);
            
            // Tạo transactionRef unique (chỉ ký tự số để tương thích tối đa)
            String vnp_TxnRef = String.valueOf(System.currentTimeMillis());
            
            // Các tham số cơ bản theo chuẩn VNPay
            String vnp_Version = "2.1.1";
            String vnp_Command = "pay";
            String vnp_TmnCode = tmnCode;
            String vnp_Amount = String.valueOf(amount * 100); // VNPay tính bằng xu
            String vnp_CurrCode = "VND";
            String vnp_Locale = "vn";
            String vnp_OrderType = "topup";
            
            // Loại bỏ dấu tiếng Việt theo yêu cầu VNPay
            String vnp_OrderInfo = removeVietnameseAccents(orderInfo);
            log.info("OrderInfo gốc: {}, OrderInfo sau khi loại bỏ dấu: {}", orderInfo, vnp_OrderInfo);
            
            // Sử dụng custom return URL nếu có, nếu không thì dùng default
            String vnp_ReturnUrl = (customReturnUrl != null && !customReturnUrl.trim().isEmpty()) 
                ? customReturnUrl 
                : returnUrl + "/vnpay-result";
            
            // Xử lý IP Address - sử dụng IP thực tế hoặc 0.0.0.0
            String vnp_IpAddr = getClientIpAddress();
            if (vnp_IpAddr == null || vnp_IpAddr.isBlank()) {
                vnp_IpAddr = "127.0.0.1";
            }
            
            // Tạo thời gian theo chuẩn VNPay (yyyyMMddHHmmss) - đúng múi giờ Việt Nam
            // LƯU Ý: IANA 'Etc/GMT+7' là UTC-7 (ngược dấu). Phải dùng 'Asia/Ho_Chi_Minh' hoặc 'GMT+7'.
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            String vnp_CreateDate = formatter.format(cld.getTime());
            
            // Thời gian hết hạn (15 phút sau theo khuyến nghị VNPay)
            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());

            log.info("Thời gian VNPay - vnp_CreateDate: {}, vnp_ExpireDate: {}", vnp_CreateDate, vnp_ExpireDate);

            // Tạo Map chứa tất cả tham số và sắp xếp theo thứ tự alphabet
            // VNPay yêu cầu thứ tự: vnp_Amount, vnp_Command, vnp_CreateDate, vnp_CurrCode, 
            // vnp_ExpireDate, vnp_IpAddr, vnp_Locale, vnp_OrderInfo, vnp_OrderType, 
            // vnp_ReturnUrl, vnp_TmnCode, vnp_TxnRef, vnp_Version
            Map<String, String> vnp_Params = new TreeMap<>();
            vnp_Params.put("vnp_Amount", vnp_Amount);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
            vnp_Params.put("vnp_Locale", vnp_Locale);
            vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
            vnp_Params.put("vnp_OrderType", vnp_OrderType);
            vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_Version", vnp_Version);

            log.info("Thứ tự tham số VNPay (đã sắp xếp theo alphabet): {}", vnp_Params.keySet());

            // Tạo chuỗi hash data và query theo chuẩn VNPay: dùng giá trị đã URL-encode (Java URLEncoder)
            // Lưu ý: URLEncoder encode space thành '+', VNPay chấp nhận. Nếu cần có thể thay '+' -> '%20'.
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            
            for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();
                
                // Chỉ thêm vào hash data nếu value không null và không rỗng
                if (value != null && value.length() > 0) {
                    // Encode value theo URLEncoder để đồng bộ với chuẩn VNPay
                    String encodedValue = URLEncoder.encode(value, StandardCharsets.UTF_8);
                    // Hash data: key=encodedValue&...
                    if (hashData.length() > 0) {
                        hashData.append("&");
                    }
                    hashData.append(key).append("=").append(encodedValue);
                    // Query string sử dụng cùng encodedValue
                    if (query.length() > 0) {
                        query.append("&");
                    }
                    query.append(key).append("=").append(encodedValue);
                }
            }

            String hashDataString = hashData.toString();
            log.info("Hash data string (theo chuẩn VNPay): {}", hashDataString);

            // Tạo secure hash sử dụng HMAC-SHA512 trên chuỗi hashData (không encode)
            String vnp_SecureHash = generateHmacSHA512(hashSecret, hashDataString);
            log.info("Secure hash đã được tạo: {}", vnp_SecureHash);

            // Tạo URL thanh toán
            String paymentUrl = endpoint + "?" + query.toString() +
                    "&vnp_SecureHashType=HmacSHA512&vnp_SecureHash=" + vnp_SecureHash;
            log.info("URL thanh toán VNPay đã được tạo: {}", paymentUrl);

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("payUrl", paymentUrl);
            response.put("orderId", orderId);
            response.put("amount", amount);
            response.put("status", "success");
            response.put("gateway", "vnpay");
            response.put("transactionRef", vnp_TxnRef);
            response.put("hashData", hashDataString);
            response.put("secureHash", vnp_SecureHash);

            log.info("Đã tạo thanh toán VNPay thành công: {}", response);
            return response;
        } catch (Exception e) {
            log.error("Lỗi khi tạo thanh toán VNPay - orderId: {}, amount: {}, orderInfo: {}", orderId, amount, orderInfo, e);
            throw new RuntimeException("Không thể tạo thanh toán VNPay: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_Amount = params.get("vnp_Amount");
            String vnp_OrderInfo = params.get("vnp_OrderInfo");
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");
            String vnp_TransactionStatus = params.get("vnp_TransactionStatus");
            String vnp_TxnTime = params.get("vnp_TxnTime");

            // Kiểm tra các tham số bắt buộc
            if (vnp_SecureHash == null || vnp_TxnRef == null || vnp_Amount == null) {
                log.error("Thiếu tham số bắt buộc trong callback VNPay");
                return false;
            }

            // Loại bỏ vnp_SecureHash và vnp_SecureHashType khỏi params để tạo hash
            Map<String, String> paramsForHash = new HashMap<>(params);
            paramsForHash.remove("vnp_SecureHash");
            paramsForHash.remove("vnp_SecureHashType");

            // Sắp xếp các tham số theo thứ tự alphabet
            java.util.List<String> fieldNames = new java.util.ArrayList<>(paramsForHash.keySet());
            java.util.Collections.sort(fieldNames);

            // 1) Hash theo giá trị RAW (không encode)
            StringBuilder hashDataRaw = new StringBuilder();
            for (String key : fieldNames) {
                String value = paramsForHash.get(key);
                if (value != null && !value.isEmpty()) {
                    if (hashDataRaw.length() > 0) hashDataRaw.append("&");
                    hashDataRaw.append(key).append("=").append(value);
                }
            }
            String expectedRaw = generateHmacSHA512(hashSecret, hashDataRaw.toString());

            // 2) Hash theo giá trị ENCODED (URLEncoder) để phòng khác biệt '+' và space
            StringBuilder hashDataEncoded = new StringBuilder();
            for (String key : fieldNames) {
                String value = paramsForHash.get(key);
                if (value != null && !value.isEmpty()) {
                    if (hashDataEncoded.length() > 0) hashDataEncoded.append("&");
                    String enc = URLEncoder.encode(value, StandardCharsets.UTF_8);
                    hashDataEncoded.append(key).append("=").append(enc);
                }
            }
            String expectedEncoded = generateHmacSHA512(hashSecret, hashDataEncoded.toString());

            boolean ok = vnp_SecureHash != null && (vnp_SecureHash.equals(expectedRaw) || vnp_SecureHash.equals(expectedEncoded));
            if (!ok) {
                log.error("Hash không khớp. ExpectedRaw: {}, ExpectedEncoded: {}, Actual: {}", expectedRaw, expectedEncoded, vnp_SecureHash);
                return false;
            }

            // Kiểm tra mã phản hồi
            if (!"00".equals(vnp_ResponseCode)) {
                log.error("Mã phản hồi VNPay không thành công: {}", vnp_ResponseCode);
                return false;
            }

            // Kiểm tra trạng thái giao dịch
            if (!"00".equals(vnp_TransactionStatus)) {
                log.error("Trạng thái giao dịch VNPay không thành công: {}", vnp_TransactionStatus);
                return false;
            }

            log.info("Xác thực callback VNPay thành công cho giao dịch: {}", vnp_TxnRef);
            return true;

        } catch (Exception e) {
            log.error("Lỗi xác thực callback VNPay", e);
            return false;
        }
    }

    @Override
    public Map<String, Object> checkPaymentStatus(String orderId) {
        try {
            // Trong thực tế, bạn sẽ gọi API VNPay để kiểm tra trạng thái
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("status", "pending");
            response.put("gateway", "vnpay");
            return response;
        } catch (Exception e) {
            log.error("Error checking VNPay payment status", e);
            throw new RuntimeException("Không thể kiểm tra trạng thái thanh toán VNPay");
        }
    }

    @Override
    public String getGatewayName() {
        return "VNPay";
    }

    /**
     * Tạo HMAC-SHA512 hash theo chuẩn VNPay
     */
    public static String generateHmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException("Key hoặc data không được null");
            }
            
            javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Lỗi tạo HMAC-SHA512 hash: " + ex.getMessage(), ex);
        }
    }
    
    /**
     * Loại bỏ dấu tiếng Việt theo yêu cầu VNPay
     * VNPay yêu cầu: "Tiếng Việt, không dấu"
     */
    private String removeVietnameseAccents(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        // Thay thế các ký tự có dấu thành không dấu
        return text
            .replace("à", "a").replace("á", "a").replace("ả", "a").replace("ã", "a").replace("ạ", "a")
            .replace("ă", "a").replace("ằ", "a").replace("ắ", "a").replace("ẳ", "a").replace("ẵ", "a").replace("ặ", "a")
            .replace("â", "a").replace("ầ", "a").replace("ấ", "a").replace("ẩ", "a").replace("ẫ", "a").replace("ậ", "a")
            .replace("è", "e").replace("é", "e").replace("ẻ", "e").replace("ẽ", "e").replace("ẹ", "e")
            .replace("ê", "e").replace("ề", "e").replace("ế", "e").replace("ể", "e").replace("ễ", "e").replace("ệ", "e")
            .replace("ì", "i").replace("í", "i").replace("ỉ", "i").replace("ĩ", "i").replace("ị", "i")
            .replace("ò", "o").replace("ó", "o").replace("ỏ", "o").replace("õ", "o").replace("ọ", "o")
            .replace("ô", "o").replace("ồ", "o").replace("ố", "o").replace("ổ", "o").replace("ỗ", "o").replace("ộ", "o")
            .replace("ơ", "o").replace("ờ", "o").replace("ớ", "o").replace("ở", "o").replace("ỡ", "o").replace("ợ", "o")
            .replace("ù", "u").replace("ú", "u").replace("ủ", "u").replace("ũ", "u").replace("ụ", "u")
            .replace("ư", "u").replace("ừ", "u").replace("ứ", "u").replace("ử", "u").replace("ữ", "u").replace("ự", "u")
            .replace("ỳ", "y").replace("ý", "y").replace("ỷ", "y").replace("ỹ", "y").replace("ỵ", "y")
            .replace("đ", "d")
            .replace("À", "A").replace("Á", "A").replace("Ả", "A").replace("Ã", "A").replace("Ạ", "A")
            .replace("Ă", "A").replace("Ằ", "A").replace("Ắ", "A").replace("Ẳ", "A").replace("Ẵ", "A").replace("Ặ", "A")
            .replace("Â", "A").replace("Ầ", "A").replace("Ấ", "A").replace("Ẩ", "A").replace("Ẫ", "A").replace("Ậ", "A")
            .replace("È", "E").replace("É", "E").replace("Ẻ", "E").replace("Ẽ", "E").replace("Ẹ", "E")
            .replace("Ê", "E").replace("Ề", "E").replace("Ế", "E").replace("Ể", "E").replace("Ễ", "E").replace("Ệ", "E")
            .replace("Ì", "I").replace("Í", "I").replace("Ỉ", "I").replace("Ĩ", "I").replace("Ị", "I")
            .replace("Ò", "O").replace("Ó", "O").replace("Ỏ", "O").replace("Õ", "O").replace("Ọ", "O")
            .replace("Ô", "O").replace("Ồ", "O").replace("Ố", "O").replace("Ổ", "O").replace("Ỗ", "O").replace("Ộ", "O")
            .replace("Ơ", "O").replace("Ờ", "O").replace("Ớ", "O").replace("Ở", "O").replace("Ỡ", "O").replace("Ợ", "O")
            .replace("Ù", "U").replace("Ú", "U").replace("Ủ", "U").replace("Ũ", "U").replace("Ụ", "U")
            .replace("Ư", "U").replace("Ừ", "U").replace("Ứ", "U").replace("Ử", "U").replace("Ữ", "U").replace("Ự", "U")
            .replace("Ỳ", "Y").replace("Ý", "Y").replace("Ỷ", "Y").replace("Ỹ", "Y").replace("Ỵ", "Y")
            .replace("Đ", "D");
    }
    
    /**
     * Lấy IP address thực tế của client
     * Trong môi trường production, bạn nên inject HttpServletRequest để lấy IP thực
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip != null && !ip.isBlank()) {
                    // Lấy IP đầu tiên nếu có chuỗi danh sách
                    int commaIndex = ip.indexOf(',');
                    return commaIndex > 0 ? ip.substring(0, commaIndex).trim() : ip.trim();
                }
                ip = request.getHeader("X-Real-IP");
                if (ip != null && !ip.isBlank()) return normalizeIp(ip.trim());
                ip = request.getRemoteAddr();
                if (ip != null && !ip.isBlank()) return normalizeIp(ip.trim());
            }
            return "127.0.0.1";
        } catch (Exception e) {
            log.warn("Không thể lấy IP address, sử dụng 127.0.0.1", e);
            return "127.0.0.1";
        }
    }

    private String normalizeIp(String ip) {
        if (ip == null) return "127.0.0.1";
        String trimmed = ip.trim();
        if ("0:0:0:0:0:0:0:1".equals(trimmed) || "::1".equals(trimmed)) {
            return "127.0.0.1";
        }
        return trimmed;
    }
} 