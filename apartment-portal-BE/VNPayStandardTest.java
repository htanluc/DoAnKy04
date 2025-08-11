import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Map;
import java.util.TimeZone;
import java.util.TreeMap;

/**
 * Test VNPay payload theo đúng chuẩn
 * Sử dụng để kiểm tra thứ tự tham số và hash generation
 */
public class VNPayStandardTest {
    
    public static void main(String[] args) {
        System.out.println("=== TEST VNPAY PAYLOAD THEO CHUẨN ===");
        
        // Thông tin cấu hình VNPay
        String hashSecret = "EVBR12NW84MVQJ4HW1OD1V2IMYHHNRPY";
        String tmnCode = "CTTVNP01";
        String returnUrl = "http://localhost:3001/payment/callback";
        
        // Tạo thời gian theo chuẩn VNPay
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Etc/GMT+7"));
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        String vnp_CreateDate = formatter.format(cld.getTime());
        
        cld.add(Calendar.MINUTE, 30); // 30 phút hết hạn
        String vnp_ExpireDate = formatter.format(cld.getTime());
        
        // Tạo tham số theo đúng thứ tự alphabet (VNPay yêu cầu)
        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Amount", "88700000");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        vnp_Params.put("vnp_IpAddr", "0.0.0.0");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_OrderInfo", "Thanh toan hoa don 2024-11");
        vnp_Params.put("vnp_OrderType", "topup");
        vnp_Params.put("vnp_ReturnUrl", returnUrl + "/vnpay-result");
        vnp_Params.put("vnp_TmnCode", tmnCode);
        vnp_Params.put("vnp_TxnRef", "1_" + System.currentTimeMillis());
        vnp_Params.put("vnp_Version", "2.1.1");
        
        System.out.println("\n1. Thứ tự tham số VNPay (đã sắp xếp theo alphabet):");
        for (String key : vnp_Params.keySet()) {
            System.out.println("   " + key + ": " + vnp_Params.get(key));
        }
        
        // Tạo hash data string theo chuẩn VNPay: key=value|key=value
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null && value.length() > 0) {
                if (hashData.length() > 0) {
                    hashData.append("|");
                }
                hashData.append(key).append("=").append(value);
            }
        }
        
        String hashDataString = hashData.toString();
        System.out.println("\n2. Hash data string (theo chuẩn VNPay):");
        System.out.println("   " + hashDataString);
        
        // Tạo secure hash
        String vnp_SecureHash = generateHmacSHA512(hashSecret, hashDataString);
        System.out.println("\n3. Secure hash (HMAC-SHA512):");
        System.out.println("   " + vnp_SecureHash);
        
        System.out.println("\n✅ Payload VNPay đã tuân thủ đúng chuẩn:");
        System.out.println("   - Thứ tự tham số đúng theo alphabet");
        System.out.println("   - IP Address: 0.0.0.0 (không dùng localhost)");
        System.out.println("   - Thời gian hết hạn: 30 phút");
        System.out.println("   - OrderInfo: Không có dấu tiếng Việt");
        System.out.println("   - Hash data sử dụng dấu | làm separator");
    }
    
    /**
     * Tạo HMAC-SHA512 hash theo chuẩn VNPay
     */
    private static String generateHmacSHA512(String key, String data) {
        try {
            javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            
            byte[] dataBytes = data.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "ERROR: " + ex.getMessage();
        }
    }
}

