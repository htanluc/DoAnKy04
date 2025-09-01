# Hướng dẫn sử dụng Internationalization (i18n) trong Apartment Portal

## Tổng quan
Project này đã được cấu hình để hỗ trợ đa ngôn ngữ (tiếng Việt và tiếng Anh) sử dụng Spring Boot i18n.

## Cấu trúc file

### 1. File cấu hình
- `I18nConfig.java` - Cấu hình Spring i18n
- `MessageUtils.java` - Utility class để lấy messages

### 2. File messages
- `messages.properties` - Messages mặc định (tiếng Việt)
- `messages_vi.properties` - Messages tiếng Việt
- `messages_en.properties` - Messages tiếng Anh

### 3. Cấu hình trong application.properties
```properties
# Internationalization (i18n) Configuration
spring.messages.basename=messages
spring.messages.encoding=UTF-8
spring.messages.fallback-to-system-locale=false
spring.messages.use-code-as-default-message=true
```

## Cách sử dụng

### 1. Trong Service classes
```java
import com.mytech.apartment.portal.utils.MessageUtils;

// Lấy message đơn giản
String message = MessageUtils.getMessage("apartment.not.found");

// Lấy message với tham số
String message = MessageUtils.getMessage("validation.min.length", 5);

// Lấy message với default value
String message = MessageUtils.getMessage("key.not.found", "Default message");
```

### 2. Trong Controller classes
```java
@Autowired
private MessageSource messageSource;

@GetMapping("/test")
public String test(Locale locale) {
    return messageSource.getMessage("welcome.message", null, locale);
}
```

### 3. Thay đổi ngôn ngữ
```java
// Sử dụng LocaleContextHolder
Locale currentLocale = LocaleContextHolder.getLocale();

// Hoặc từ request
@GetMapping("/change-locale")
public String changeLocale(@RequestParam String lang, HttpServletRequest request) {
    LocaleResolver localeResolver = RequestContextUtils.getLocaleResolver(request);
    localeResolver.setLocale(request, response, new Locale(lang));
    return "redirect:/";
}
```

## Thêm messages mới

### 1. Thêm vào file messages_vi.properties
```properties
# Ví dụ
user.login.success=Đăng nhập thành công
user.logout.success=Đăng xuất thành công
```

### 2. Thêm vào file messages_en.properties
```properties
# Ví dụ
user.login.success=Login successful
user.logout.success=Logout successful
```

### 3. Sử dụng trong code
```java
String message = MessageUtils.getMessage("user.login.success");
```

## Best Practices

1. **Luôn sử dụng key có ý nghĩa**: `user.not.found` thay vì `error.1`
2. **Sử dụng MessageUtils**: Để code sạch và dễ maintain
3. **Tổ chức messages theo module**: `apartment.*`, `user.*`, `payment.*`
4. **Sử dụng tham số khi cần**: `validation.min.length={0}`
5. **Test với nhiều ngôn ngữ**: Đảm bảo tất cả messages đều có bản dịch

## Troubleshooting

### 1. Message không hiển thị
- Kiểm tra key có đúng không
- Kiểm tra file properties có được load không
- Kiểm tra encoding UTF-8

### 2. Ngôn ngữ không thay đổi
- Kiểm tra LocaleResolver configuration
- Kiểm tra session locale
- Kiểm tra Accept-Language header

### 3. Performance issues
- Sử dụng MessageSource caching
- Tránh gọi MessageUtils trong vòng lặp
- Sử dụng static methods của MessageUtils
