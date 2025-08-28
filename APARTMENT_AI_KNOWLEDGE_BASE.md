## Kiến thức nền cho Trợ lý AI - Hệ thống Chung cư

Phiên bản: 1.0
Phạm vi: Tổng quan nghiệp vụ, quy trình, thực thể dữ liệu và API quan trọng để ChatGPT trả lời câu hỏi của cư dân/nhân sự.

### Mục tiêu sử dụng
- Trợ lý AI dùng file này như context nền: giải thích quy trình, hướng dẫn thao tác, trả lời câu hỏi thường gặp của cư dân/nhân viên.
- Không lộ thông tin nhạy cảm: mật khẩu, khóa API, bí mật thanh toán.

### 1) Vai trò người dùng (Roles)
- Cư dân (Resident): xem hóa đơn, thanh toán, đặt tiện ích, đăng ký sự kiện, gửi yêu cầu hỗ trợ, cập nhật hồ sơ.
- Nhân viên (Staff): duyệt yêu cầu, quản lý tiện ích/sự kiện/hỗ trợ.
- Quản trị (Admin): quản trị toàn hệ thống, theo dõi dashboard, cấu hình phí, thông báo, báo cáo.

### 2) Thực thể chính (Entities)
- Người dùng/User: thông tin tài khoản, liên kết Resident; xác thực bằng JWT.
- Căn hộ/Apartment: tòa nhà, số căn, diện tích, tầng.
- Hóa đơn/Invoice: các khoản phí (dịch vụ, gửi xe, nước, điện...), trạng thái (chưa thanh toán/đã thanh toán/quá hạn).
- Thanh toán/Payment: VNPay, MoMo, ZaloPay, Stripe (Visa/Mastercard); kết quả và lịch sử thanh toán.
- Tiện ích/Facility & Booking: bể bơi, sân bóng, phòng sinh hoạt; đặt chỗ, hủy, lịch sử.
- Sự kiện/Event & Registration: thông báo sự kiện, đăng ký/hủy.
- Phương tiện/Vehicle & Đăng ký xe: quản lý xe cư dân, hạn mức bãi xe.
- Yêu cầu hỗ trợ/Support Request: gửi, theo dõi, phản hồi.
- Thông báo/Announcement: bản tin tới cư dân; đánh dấu đã đọc.
- AI Q&A: lịch sử hỏi đáp AI, phản hồi đánh giá.

### 3) Quy trình chính (Workflows)
- Đăng nhập/Đăng ký: qua số điện thoại/email và mật khẩu; xác thực email/OTP (nếu bật). FE lưu `token` (JWT) trong localStorage.
- Xem hóa đơn: cư dân xem danh sách và chi tiết hóa đơn của mình; có thể tải/tra cứu nhanh.
- Thanh toán: chọn cổng (VNPay/MoMo/ZaloPay/Stripe) → hệ thống tạo giao dịch → chuyển hướng cổng thanh toán → nhận kết quả → cập nhật hóa đơn.
- Đặt tiện ích: chọn tiện ích, ngày/giờ → kiểm tra slot trống → xác nhận đặt → theo dõi lịch sử, hủy nếu cần.
- Đăng ký sự kiện: xem sự kiện → đăng ký/hủy; có thể giới hạn chỗ.
- Gửi yêu cầu hỗ trợ: chọn loại, mô tả, ảnh kèm → theo dõi trạng thái.
- Quản lý xe: đăng ký phương tiện, chờ duyệt; hệ thống kiểm soát hạn mức bãi xe.
- AI Chat: cư dân hỏi tự nhiên → BE gọi OpenAI → trả lời ngắn gọn, rõ ràng tiếng Việt.

### 4) Hành vi trợ lý AI (Guidelines)
- Ngắn gọn, rõ ràng, lịch sự, tiếng Việt.
- Khi cần bảo mật hoặc xác thực, nhắc người dùng đăng nhập.
- Không suy đoán thông tin thanh toán/cước phí nếu không chắc; hướng dẫn thao tác trong app.
- Với lỗi hệ thống: xin lỗi, hướng dẫn thử lại hoặc liên hệ hỗ trợ.

### 5) Câu hỏi thường gặp (FAQ mẫu)
- "Cách xem hóa đơn của tôi?" → Hướng dẫn vào Trang tổng quan > Hóa đơn, chọn hóa đơn để xem chi tiết.
- "Thanh toán thế nào?" → Chọn hóa đơn > nút Thanh toán > chọn cổng (VNPay/MoMo/ZaloPay/Stripe) và làm theo hướng dẫn.
- "Đặt tiện ích ra sao?" → Vào Tiện ích > chọn tiện ích & thời gian > Xác nhận đặt. Kiểm tra quy định hủy.
- "Đăng ký sự kiện ở đâu?" → Vào Sự kiện > chọn sự kiện > Đăng ký.
- "Gửi yêu cầu hỗ trợ thế nào?" → Vào Hỗ trợ > Gửi yêu cầu mới, mô tả chi tiết và đính kèm ảnh nếu cần.
- "Quên mật khẩu?" → Dùng chức năng quên mật khẩu hoặc liên hệ ban quản lý.

### 6) API quan trọng (Backend)
- Auth: `POST /api/auth/login`, `GET /api/auth/me`
- Invoices: `GET /api/invoices/my`, `GET /api/invoices/{id}`
- Payments:
  - VNPay: `POST /api/payments/vnpay`
  - MoMo: `POST /api/payments/momo`
  - ZaloPay: `POST /api/payments/zalopay`
  - Stripe: `POST /api/payments/stripe`
- Facilities: `GET /api/facilities`, `POST /api/facility-bookings`, `GET /api/facility-bookings/my`, `DELETE /api/facility-bookings/{id}`
- Events: `GET /api/events`, `POST /api/event-registrations/register`, hủy đăng ký theo API hiện hữu
- Support: `POST /api/support-requests`, `GET /api/support-requests/my`
- Announcements: `GET /api/announcements`, `PUT /api/announcements/{id}/read`
- Vehicles: các API đăng ký/duyệt phương tiện (theo module hiện có)
- AI Q&A: `POST /api/ai/qa` (yêu cầu JWT)

Ghi chú: Nhiều API yêu cầu header `Authorization: Bearer <JWT>`.

### 7) Dữ liệu đầu vào/đầu ra (ví dụ)
- `POST /api/ai/qa` body ví dụ:
```json
{ "question": "Phí gửi xe ô tô là bao nhiêu mỗi tháng?", "context": "" }
```
- Kết quả: `{ "answer": "...", "source": "general|database", "responseTime": 1234, "confidence": "high|low" }`

### 8) Chính sách & quy định (tổng quát)
- Quy định đặt tiện ích: giới hạn số slot/giờ; có thể có phí; quy định hủy trước hạn.
- Trễ hạn hóa đơn: có thể tính phí phạt theo quy định nội bộ (nếu có cấu hình).
- Bảo mật: không chia sẻ thông tin căn hộ/hóa đơn của người khác; yêu cầu đăng nhập mới xem được dữ liệu cá nhân.

### 9) Tích hợp thanh toán (tổng quan)
- VNPay/MoMo/ZaloPay: chuyển hướng tới cổng thanh toán; kết quả trả về qua endpoint BE → cập nhật trạng thái hóa đơn.
- Stripe: có thể tạo PaymentIntent/Checkout Session (tùy cấu hình), kiểm tra webhook để xác nhận thanh toán.

### 10) Cấu hình AI (BE)
- Khóa OpenAI trong Spring: `openai.api.key=<SECRET>`; model: `openai.model=gpt-4o-mini`.
- Endpoint AI: `POST /api/ai/qa` (có JWT), service gọi `https://api.openai.com/v1/chat/completions` với model cấu hình.
- Trợ lý nên trả lời ngắn gọn, dùng tiếng Việt, tập trung quy trình thực tế trong app.

### 11) Khuyến nghị cho ChatGPT
- Nếu câu hỏi liên quan dữ liệu cá nhân (hóa đơn, đặt chỗ,...): nhắc người dùng đăng nhập.
- Nếu câu hỏi ngoài phạm vi hệ thống (quy định tòa nhà cụ thể): trả lời tổng quát và hướng dẫn liên hệ BQL để xác thực.
- Luôn ưu tiên hướng dẫn thao tác trên các trang: Hóa đơn, Tiện ích, Sự kiện, Hỗ trợ, Thông báo, Hồ sơ.

### 12) Từ vựng chuẩn hoá
- Hóa đơn: Invoice
- Thanh toán: Payment
- Tiện ích: Facility
- Đặt chỗ: Booking
- Sự kiện: Event
- Phương tiện: Vehicle
- Yêu cầu hỗ trợ: Support Request
- Thông báo: Announcement
- Cư dân: Resident
- Ban quản lý: BQL

---
Tài liệu này là context nền. Khi triển khai thực tế, cập nhật chi tiết phí, quy định, và chính sách theo toà nhà của bạn.


