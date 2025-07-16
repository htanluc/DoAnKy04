-- =====================================================
-- SAMPLE DATA FOR APARTMENT MANAGEMENT SYSTEM
-- Database: ApartmentDB
-- =====================================================

-- Clear existing data (if any)
SET FOREIGN_KEY_CHECKS = 0;

-- Clear tables in reverse order of dependencies
DELETE FROM ai_qa_history;
DELETE FROM activity_log;
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM service_requests;
DELETE FROM feedback;
DELETE FROM facility_bookings;
DELETE FROM event_registrations;
DELETE FROM events;
DELETE FROM announcements;
DELETE FROM apartment_residents;
DELETE FROM residents;
DELETE FROM apartments;
DELETE FROM buildings;
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM roles;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. ROLES (Vai trò người dùng)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO roles (id, role_name, description) VALUES
-- (1, 'ADMIN', 'Quản trị viên hệ thống - Toàn quyền truy cập'),
-- (2, 'STAFF', 'Nhân viên quản lý - Quản lý căn hộ và dịch vụ'),
-- (3, 'RESIDENT', 'Cư dân - Sử dụng dịch vụ và thanh toán'),
-- (4, 'TECHNICIAN', 'Kỹ thuật viên - Xử lý sự cố kỹ thuật'),
-- (5, 'CLEANER', 'Nhân viên vệ sinh - Dọn dẹp và bảo trì'),
-- (6, 'SECURITY', 'Bảo vệ - An ninh và tuần tra');

-- =====================================================
-- 2. USERS (Tài khoản người dùng)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO users (id, username, email, password_hash, phone_number, status, created_at, updated_at) VALUES
-- -- Admin accounts
-- (1, 'admin', 'admin@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234567', 'ACTIVE', NOW(), NOW()),
-- (2, 'manager', 'manager@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234568', 'ACTIVE', NOW(), NOW()),

-- -- Staff accounts
-- (3, 'staff1', 'staff1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234569', 'ACTIVE', NOW(), NOW()),
-- (4, 'staff2', 'staff2@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234570', 'ACTIVE', NOW(), NOW()),

-- -- Resident accounts
-- (5, 'resident1', 'nguyenvanA@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234571', 'ACTIVE', NOW(), NOW()),
-- (6, 'resident2', 'tranthiB@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234572', 'ACTIVE', NOW(), NOW()),
-- (7, 'resident3', 'levanC@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234573', 'ACTIVE', NOW(), NOW()),
-- (8, 'resident4', 'phamthiD@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234574', 'ACTIVE', NOW(), NOW()),
-- (9, 'resident5', 'hoangvanE@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234575', 'ACTIVE', NOW(), NOW()),
-- (10, 'resident6', 'dangthiF@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234576', 'ACTIVE', NOW(), NOW()),

-- -- Service staff accounts
-- (11, 'technician1', 'technician1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234577', 'ACTIVE', NOW(), NOW()),
-- (12, 'cleaner1', 'cleaner1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234578', 'ACTIVE', NOW(), NOW()),
-- (13, 'security1', 'security1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234579', 'ACTIVE', NOW(), NOW());

-- =====================================================
-- 3. USER_ROLES (Liên kết User - Roles)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO user_roles (user_id, role_id) VALUES
-- -- Admin roles
-- (1, 1), -- admin -> ADMIN
-- (2, 1), -- manager -> ADMIN

-- -- Staff roles
-- (3, 2), -- staff1 -> STAFF
-- (4, 2), -- staff2 -> STAFF

-- -- Resident roles
-- (5, 3), -- resident1 -> RESIDENT
-- (6, 3), -- resident2 -> RESIDENT
-- (7, 3), -- resident3 -> RESIDENT
-- (8, 3), -- resident4 -> RESIDENT
-- (9, 3), -- resident5 -> RESIDENT
-- (10, 3), -- resident6 -> RESIDENT

-- -- Service staff roles
-- (11, 4), -- technician1 -> TECHNICIAN
-- (12, 5), -- cleaner1 -> CLEANER
-- (13, 6); -- security1 -> SECURITY

-- =====================================================
-- 4. BUILDINGS (Tòa nhà)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO buildings (id, building_name, address, floors, description) VALUES
-- (1, 'Tòa A', '123 Đường ABC, Quận 1, TP.HCM', 20, 'Tòa nhà cao cấp với đầy đủ tiện ích'),
-- (2, 'Tòa B', '456 Đường XYZ, Quận 2, TP.HCM', 15, 'Tòa nhà trung cấp phù hợp gia đình'),
-- (3, 'Tòa C', '789 Đường DEF, Quận 3, TP.HCM', 25, 'Tòa nhà cao cấp view đẹp');

-- =====================================================
-- 5. APARTMENTS (Căn hộ)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO apartments (id, building_id, floor_number, unit_number, area, status) VALUES
-- -- Tòa A (20 tầng)
-- (1, 1, 1, 'A1-01', 85.5, 'OCCUPIED'),
-- (2, 1, 1, 'A1-02', 75.0, 'OCCUPIED'),
-- (3, 1, 2, 'A2-01', 95.0, 'OCCUPIED'),
-- (4, 1, 2, 'A2-02', 85.5, 'OCCUPIED'),
-- (5, 1, 3, 'A3-01', 120.0, 'OCCUPIED'),
-- (6, 1, 3, 'A3-02', 110.0, 'VACANT'),
-- (7, 1, 4, 'A4-01', 85.5, 'OCCUPIED'),
-- (8, 1, 4, 'A4-02', 75.0, 'VACANT'),
-- (9, 1, 5, 'A5-01', 95.0, 'OCCUPIED'),
-- (10, 1, 5, 'A5-02', 85.5, 'OCCUPIED'),

-- -- Tòa B (15 tầng)
-- (11, 2, 1, 'B1-01', 70.0, 'OCCUPIED'),
-- (12, 2, 1, 'B1-02', 65.0, 'OCCUPIED'),
-- (13, 2, 2, 'B2-01', 80.0, 'OCCUPIED'),
-- (14, 2, 2, 'B2-02', 75.0, 'VACANT'),
-- (15, 2, 3, 'B3-01', 90.0, 'OCCUPIED'),
-- (16, 2, 3, 'B3-02', 85.0, 'OCCUPIED'),
-- (17, 2, 4, 'B4-01', 70.0, 'VACANT'),
-- (18, 2, 4, 'B4-02', 65.0, 'OCCUPIED'),
-- (19, 2, 5, 'B5-01', 80.0, 'OCCUPIED'),
-- (20, 2, 5, 'B5-02', 75.0, 'VACANT'),

-- -- Tòa C (25 tầng)
-- (21, 3, 1, 'C1-01', 100.0, 'OCCUPIED'),
-- (22, 3, 1, 'C1-02', 90.0, 'OCCUPIED'),
-- (23, 3, 2, 'C2-01', 110.0, 'OCCUPIED'),
-- (24, 3, 2, 'C2-02', 100.0, 'VACANT'),
-- (25, 3, 3, 'C3-01', 120.0, 'OCCUPIED'),
-- (26, 3, 3, 'C3-02', 110.0, 'OCCUPIED'),
-- (27, 3, 4, 'C4-01', 100.0, 'VACANT'),
-- (28, 3, 4, 'C4-02', 90.0, 'OCCUPIED'),
-- (29, 3, 5, 'C5-01', 110.0, 'OCCUPIED'),
-- (30, 3, 5, 'C5-02', 100.0, 'VACANT');

-- =====================================================
-- 6. RESIDENTS (Cư dân)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO residents (id, user_id, full_name, date_of_birth, id_card_number, family_relation, status, created_at, updated_at) VALUES
-- (1, 5, 'Nguyễn Văn A', '1985-03-15', '123456789012', 'Chủ hộ', 'ACTIVE', NOW(), NOW()),
-- (2, 6, 'Trần Thị B', '1990-07-22', '123456789013', 'Chủ hộ', 'ACTIVE', NOW(), NOW()),
-- (3, 7, 'Lê Văn C', '1988-11-08', '123456789014', 'Chủ hộ', 'ACTIVE', NOW(), NOW()),
-- (4, 8, 'Phạm Thị D', '1992-04-30', '123456789015', 'Chủ hộ', 'ACTIVE', NOW(), NOW()),
-- (5, 9, 'Hoàng Văn E', '1987-09-12', '123456789016', 'Chủ hộ', 'ACTIVE', NOW(), NOW()),
-- (6, 10, 'Đặng Thị F', '1991-12-25', '123456789017', 'Chủ hộ', 'ACTIVE', NOW(), NOW()),

-- -- Thành viên gia đình
-- (7, NULL, 'Nguyễn Thị G', '1990-05-18', '123456789018', 'Vợ', 'ACTIVE', NOW(), NOW()),
-- (8, NULL, 'Nguyễn Văn H', '2015-08-10', '123456789019', 'Con', 'ACTIVE', NOW(), NOW()),
-- (9, NULL, 'Trần Văn I', '1988-12-03', '123456789020', 'Chồng', 'ACTIVE', NOW(), NOW()),
-- (10, NULL, 'Lê Thị K', '1993-06-20', '123456789021', 'Vợ', 'ACTIVE', NOW(), NOW());

-- =====================================================
-- 7. APARTMENT_RESIDENTS (Liên kết Cư dân - Căn hộ)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO apartment_residents (apartment_id, resident_id, relation_type, move_in_date, move_out_date) VALUES
-- (1, 1, 'Chủ sở hữu', '2023-01-15', NULL),
-- (1, 7, 'Thành viên', '2023-01-15', NULL),
-- (1, 8, 'Thành viên', '2023-01-15', NULL),
-- (2, 2, 'Chủ sở hữu', '2023-02-20', NULL),
-- (3, 3, 'Chủ sở hữu', '2023-03-10', NULL),
-- (3, 9, 'Thành viên', '2023-03-10', NULL),
-- (4, 4, 'Chủ sở hữu', '2023-04-05', NULL),
-- (5, 5, 'Chủ sở hữu', '2023-05-12', NULL),
-- (5, 10, 'Thành viên', '2023-05-12', NULL),
-- (6, 6, 'Chủ sở hữu', '2023-06-08', NULL);

-- =====================================================
-- 8. FACILITIES (Tiện ích)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO facilities (id, name, description, capacity, other_details, usage_fee) VALUES
-- (1, 'Phòng Gym', 'Phòng tập thể dục với đầy đủ thiết bị hiện đại', 20, 'Mở cửa 6:00-22:00, có huấn luyện viên', 50000),
-- (2, 'Hồ bơi', 'Hồ bơi ngoài trời với view đẹp', 50, 'Mở cửa 6:00-21:00, có cứu hộ', 100000),
-- (3, 'Phòng họp', 'Phòng họp đa năng cho cư dân', 30, 'Có thể đặt trước, có máy chiếu', 30000),
-- (4, 'Sân tennis', 'Sân tennis ngoài trời chất lượng cao', 8, 'Có đèn chiếu sáng, có thể chơi ban đêm', 80000),
-- (5, 'Khu BBQ', 'Khu vực nướng BBQ ngoài trời', 40, 'Có bàn ghế, lò nướng', 50000),
-- (6, 'Phòng sinh hoạt cộng đồng', 'Phòng đa năng cho các hoạt động cộng đồng', 100, 'Có sân khấu, âm thanh ánh sáng', 20000),
-- (7, 'Bãi đỗ xe', 'Bãi đỗ xe có mái che', 200, 'Miễn phí cho cư dân', 10000),
-- (8, 'Khu vui chơi trẻ em', 'Sân chơi an toàn cho trẻ em', 30, 'Có đồ chơi, có ghế ngồi cho phụ huynh', 30000);

-- =====================================================
-- 9. SERVICE_CATEGORIES (Loại dịch vụ)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO service_categories (category_code, category_name, assigned_role, description) VALUES
-- ('ELECTRICITY', 'Điện', 4, 'Sửa chữa điện, thay bóng đèn, ổ cắm'),
-- ('PLUMBING', 'Nước', 4, 'Sửa ống nước, vòi nước, bồn cầu'),
-- ('CLEANING', 'Vệ sinh', 5, 'Dọn dẹp, lau chùi, vệ sinh chung'),
-- ('SECURITY', 'An ninh', 6, 'Tuần tra, kiểm tra an ninh, xử lý sự cố'),
-- ('HVAC', 'Điều hòa', 4, 'Bảo trì, sửa chữa điều hòa'),
-- ('ELEVATOR', 'Thang máy', 4, 'Bảo trì, sửa chữa thang máy'),
-- ('GARDENING', 'Cây xanh', 5, 'Chăm sóc cây xanh, cắt tỉa'),
-- ('GENERAL', 'Khác', 2, 'Các yêu cầu khác');

-- =====================================================
-- 10. ANNOUNCEMENTS (Thông báo)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO announcements (id, title, content, type, target_audience, created_by, is_active, created_at) VALUES
-- (1, 'Thông báo bảo trì thang máy', 'Thang máy tòa A sẽ được bảo trì từ 8:00-12:00 ngày 15/12/2024. Vui lòng sử dụng thang máy khác.', 'REGULAR', 'ALL', 1, TRUE, NOW()),
-- (2, 'Thông báo khẩn: Mất điện', 'Sẽ có kế hoạch cắt điện bảo trì từ 22:00-06:00 ngày 20/12/2024. Vui lòng chuẩn bị đèn pin.', 'URGENT', 'ALL', 1, TRUE, NOW()),
-- (3, 'Sự kiện Tết 2025', 'Chương trình đón Tết 2025 sẽ diễn ra tại sảnh chính từ 18:00-22:00 ngày 30/12/2024. Mời tất cả cư dân tham gia.', 'EVENT', 'ALL', 1, TRUE, NOW()),
-- (4, 'Thông báo về phí dịch vụ', 'Phí dịch vụ tháng 12/2024 sẽ tăng 5% do chi phí điện nước tăng. Vui lòng thanh toán đúng hạn.', 'REGULAR', 'ALL', 1, TRUE, NOW()),
-- (5, 'Bảo trì hệ thống nước', 'Hệ thống nước sẽ được bảo trì từ 14:00-18:00 ngày 25/12/2024. Vui lòng dự trữ nước.', 'REGULAR', 'ALL', 1, TRUE, NOW());

-- =====================================================
-- 11. EVENTS (Sự kiện)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO events (id, title, description, event_date, start_time, end_time, location, max_participants, current_participants, status, created_by, created_at) VALUES
-- (1, 'Tiệc Giáng sinh 2024', 'Tiệc Giáng sinh cho cư dân với nhiều hoạt động vui nhộn', '2024-12-24', '18:00:00', '22:00:00', 'Sảnh chính tòa A', 100, 45, 'ACTIVE', 1, NOW()),
-- (2, 'Họp cư dân tháng 12', 'Họp cư dân định kỳ để thảo luận các vấn đề chung', '2024-12-15', '19:00:00', '21:00:00', 'Phòng sinh hoạt cộng đồng', 50, 25, 'ACTIVE', 1, NOW()),
-- (3, 'Lớp yoga miễn phí', 'Lớp yoga miễn phí cho cư dân mỗi sáng Chủ nhật', '2024-12-22', '07:00:00', '08:30:00', 'Phòng gym', 20, 15, 'ACTIVE', 1, NOW()),
-- (4, 'Workshop nấu ăn', 'Workshop nấu ăn truyền thống Việt Nam', '2024-12-28', '14:00:00', '17:00:00', 'Khu BBQ', 30, 18, 'ACTIVE', 1, NOW()),
-- (5, 'Giải tennis cư dân', 'Giải đấu tennis thường niên cho cư dân', '2024-12-29', '08:00:00', '18:00:00', 'Sân tennis', 32, 24, 'ACTIVE', 1, NOW());

-- =====================================================
-- 12. EVENT_REGISTRATIONS (Đăng ký sự kiện)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO event_registrations (id, event_id, resident_id, registration_date, status) VALUES
-- (1, 1, 5, NOW(), 'CONFIRMED'),
-- (2, 1, 6, NOW(), 'CONFIRMED'),
-- (3, 1, 7, NOW(), 'CONFIRMED'),
-- (4, 1, 8, NOW(), 'CONFIRMED'),
-- (5, 1, 9, NOW(), 'CONFIRMED'),
-- (6, 2, 5, NOW(), 'CONFIRMED'),
-- (7, 2, 6, NOW(), 'CONFIRMED'),
-- (8, 2, 7, NOW(), 'CONFIRMED'),
-- (9, 3, 5, NOW(), 'CONFIRMED'),
-- (10, 3, 6, NOW(), 'CONFIRMED'),
-- (11, 3, 7, NOW(), 'CONFIRMED'),
-- (12, 3, 8, NOW(), 'CONFIRMED'),
-- (13, 3, 9, NOW(), 'CONFIRMED'),
-- (14, 4, 5, NOW(), 'CONFIRMED'),
-- (15, 4, 6, NOW(), 'CONFIRMED'),
-- (16, 4, 7, NOW(), 'CONFIRMED'),
-- (17, 5, 5, NOW(), 'CONFIRMED'),
-- (18, 5, 6, NOW(), 'CONFIRMED'),
-- (19, 5, 7, NOW(), 'CONFIRMED'),
-- (20, 5, 8, NOW(), 'CONFIRMED');

-- =====================================================
-- 13. FACILITY_BOOKINGS (Đặt tiện ích)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO facility_bookings (id, facility_id, user_id, booking_time, duration, status, approved_by, approved_at, created_at) VALUES
-- (1, 1, 5, '2024-12-20 07:00:00', 60, 'CONFIRMED', 1, NOW(), NOW()),
-- (2, 2, 6, '2024-12-20 08:00:00', 90, 'CONFIRMED', 1, NOW(), NOW()),
-- (3, 3, 7, '2024-12-21 14:00:00', 120, 'CONFIRMED', 1, NOW(), NOW()),
-- (4, 4, 8, '2024-12-21 16:00:00', 120, 'CONFIRMED', 1, NOW(), NOW()),
-- (5, 5, 9, '2024-12-22 18:00:00', 180, 'CONFIRMED', 1, NOW(), NOW()),
-- (6, 1, 10, '2024-12-22 19:00:00', 60, 'PENDING', NULL, NULL, NOW()),
-- (7, 2, 5, '2024-12-23 09:00:00', 90, 'CONFIRMED', 1, NOW(), NOW()),
-- (8, 3, 6, '2024-12-23 15:00:00', 120, 'PENDING', NULL, NULL, NOW());

-- =====================================================
-- 14. INVOICES (Hóa đơn)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO invoices (id, apartment_id, billing_period, issue_date, due_date, total_amount, status, created_at, updated_at) VALUES
-- (1, 1, '2024-12', '2024-12-01', '2024-12-15', 2500000, 'PAID', NOW(), NOW()),
-- (2, 2, '2024-12', '2024-12-01', '2024-12-15', 2200000, 'PAID', NOW(), NOW()),
-- (3, 3, '2024-12', '2024-12-01', '2024-12-15', 2800000, 'UNPAID', NOW(), NOW()),
-- (4, 4, '2024-12', '2024-12-01', '2024-12-15', 2500000, 'UNPAID', NOW(), NOW()),
-- (5, 5, '2024-12', '2024-12-01', '2024-12-15', 3200000, 'UNPAID', NOW(), NOW()),
-- (6, 6, '2024-12', '2024-12-01', '2024-12-15', 2500000, 'OVERDUE', NOW(), NOW()),
-- (7, 7, '2024-12', '2024-12-01', '2024-12-15', 2500000, 'UNPAID', NOW(), NOW()),
-- (8, 8, '2024-12', '2024-12-01', '2024-12-15', 2200000, 'UNPAID', NOW(), NOW()),
-- (9, 9, '2024-12', '2024-12-01', '2024-12-15', 2800000, 'UNPAID', NOW(), NOW()),
-- (10, 10, '2024-12', '2024-12-01', '2024-12-15', 2500000, 'UNPAID', NOW(), NOW());

-- =====================================================
-- 15. INVOICE_ITEMS (Chi tiết hóa đơn)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO invoice_items (id, invoice_id, fee_type, description, amount) VALUES
-- -- Hóa đơn 1
-- (1, 1, 'MAINTENANCE', 'Phí quản lý căn hộ', 1500000),
-- (2, 1, 'WATER', 'Tiền nước tháng 12/2024', 500000),
-- (3, 1, 'ELECTRICITY', 'Tiền điện tháng 12/2024', 300000),
-- (4, 1, 'PARKING', 'Phí gửi xe', 200000),

-- -- Hóa đơn 2
-- (5, 2, 'MAINTENANCE', 'Phí quản lý căn hộ', 1500000),
-- (6, 2, 'WATER', 'Tiền nước tháng 12/2024', 400000),
-- (7, 2, 'ELECTRICITY', 'Tiền điện tháng 12/2024', 300000),

-- -- Hóa đơn 3
-- (8, 3, 'MAINTENANCE', 'Phí quản lý căn hộ', 1500000),
-- (9, 3, 'WATER', 'Tiền nước tháng 12/2024', 600000),
-- (10, 3, 'ELECTRICITY', 'Tiền điện tháng 12/2024', 400000),
-- (11, 3, 'PARKING', 'Phí gửi xe', 200000),
-- (12, 3, 'INTERNET', 'Phí internet', 200000),

-- -- Hóa đơn 4
-- (13, 4, 'MAINTENANCE', 'Phí quản lý căn hộ', 1500000),
-- (14, 4, 'WATER', 'Tiền nước tháng 12/2024', 500000),
-- (15, 4, 'ELECTRICITY', 'Tiền điện tháng 12/2024', 300000),
-- (16, 4, 'PARKING', 'Phí gửi xe', 200000),

-- -- Hóa đơn 5
-- (17, 5, 'MAINTENANCE', 'Phí quản lý căn hộ', 1500000),
-- (18, 5, 'WATER', 'Tiền nước tháng 12/2024', 700000),
-- (19, 5, 'ELECTRICITY', 'Tiền điện tháng 12/2024', 500000),
-- (20, 5, 'PARKING', 'Phí gửi xe', 200000),
-- (21, 5, 'INTERNET', 'Phí internet', 300000);

-- =====================================================
-- 16. PAYMENTS (Thanh toán)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO payments (id, invoice_id, paid_by_user_id, payment_date, amount, method, status, reference_code) VALUES
-- (1, 1, 5, NOW(), 2500000, 'BANK_TRANSFER', 'SUCCESS', 'TXN001'),
-- (2, 2, 6, NOW(), 2200000, 'CASH', 'SUCCESS', 'CASH001');

-- =====================================================
-- 17. SERVICE_REQUESTS (Yêu cầu dịch vụ)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO service_requests (id, user_id, category, description, image_attachment, submitted_at, assigned_to, assigned_at, status, priority, resolution_notes, completed_at, rating) VALUES
-- (1, 5, 'ELECTRICITY', 'Bóng đèn phòng khách bị cháy, cần thay mới', NULL, NOW(), 11, NOW(), 'COMPLETED', 3, 'Đã thay bóng đèn LED mới', NOW(), 5),
-- (2, 6, 'PLUMBING', 'Vòi nước bếp bị rò rỉ, cần sửa gấp', NULL, NOW(), 11, NOW(), 'IN_PROGRESS', 2, 'Đang kiểm tra và sửa chữa', NULL, NULL),
-- (3, 7, 'CLEANING', 'Cần dọn dẹp sảnh chung tầng 5', NULL, NOW(), 12, NOW(), 'COMPLETED', 4, 'Đã dọn dẹp sạch sẽ', NOW(), 4),
-- (4, 8, 'SECURITY', 'Có người lạ đi lại nhiều lần, cần kiểm tra', NULL, NOW(), 13, NOW(), 'OPEN', 1, NULL, NULL, NULL),
-- (5, 9, 'HVAC', 'Điều hòa phòng ngủ không mát', NULL, NOW(), 11, NOW(), 'IN_PROGRESS', 2, 'Đang kiểm tra gas và làm sạch', NULL, NULL),
-- (6, 10, 'GENERAL', 'Cần lắp thêm ổ cắm điện trong phòng làm việc', NULL, NOW(), 11, NOW(), 'OPEN', 3, NULL, NULL, NULL);

-- =====================================================
-- 18. FEEDBACK (Phản hồi)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO feedback (id, user_id, category, content, image_attachment, submitted_at, status, response, responded_at) VALUES
-- (1, 5, 'SUGGESTION', 'Đề xuất lắp thêm camera an ninh ở khu vực bãi xe', NULL, NOW(), 'RESOLVED', 'Cảm ơn ý kiến đóng góp. Chúng tôi sẽ xem xét và triển khai trong tháng tới.', NOW()),
-- (2, 6, 'COMPLAINT', 'Tiếng ồn từ căn hộ bên cạnh quá lớn vào ban đêm', NULL, NOW(), 'IN_PROGRESS', 'Chúng tôi đã liên hệ với cư dân và nhắc nhở về quy định giữ yên tĩnh.', NULL),
-- (3, 7, 'TECH_SUPPORT', 'Không thể truy cập wifi ở sảnh chung', NULL, NOW(), 'NEW', NULL, NULL),
-- (4, 8, 'SUGGESTION', 'Đề xuất tổ chức thêm các hoạt động thể thao cho trẻ em', NULL, NOW(), 'RESOLVED', 'Ý tưởng rất hay! Chúng tôi sẽ tổ chức lớp bóng đá thiếu nhi vào cuối tuần.', NOW()),
-- (5, 9, 'COMPLAINT', 'Thang máy thường xuyên bị lỗi, cần bảo trì', NULL, NOW(), 'IN_PROGRESS', 'Chúng tôi đã lên lịch bảo trì định kỳ và sẽ thay thế một số linh kiện.', NULL);

-- =====================================================
-- 19. ACTIVITY_LOG (Nhật ký hoạt động)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO activity_log (id, user_id, action_type, description, timestamp) VALUES
-- (1, 5, 'LOGIN', 'Đăng nhập vào hệ thống', NOW()),
-- (2, 5, 'PAYMENT', 'Thanh toán hóa đơn tháng 12/2024', NOW()),
-- (3, 6, 'LOGIN', 'Đăng nhập vào hệ thống', NOW()),
-- (4, 6, 'PAYMENT', 'Thanh toán hóa đơn tháng 12/2024', NOW()),
-- (5, 7, 'LOGIN', 'Đăng nhập vào hệ thống', NOW()),
-- (6, 7, 'SERVICE_REQUEST', 'Tạo yêu cầu dịch vụ: Dọn dẹp sảnh chung', NOW()),
-- (7, 8, 'LOGIN', 'Đăng nhập vào hệ thống', NOW()),
-- (8, 8, 'FEEDBACK', 'Gửi phản hồi về tiếng ồn', NOW()),
-- (9, 9, 'LOGIN', 'Đăng nhập vào hệ thống', NOW()),
-- (10, 9, 'SERVICE_REQUEST', 'Tạo yêu cầu dịch vụ: Sửa điều hòa', NOW()),
-- (11, 10, 'LOGIN', 'Đăng nhập vào hệ thống', NOW()),
-- (12, 10, 'SERVICE_REQUEST', 'Tạo yêu cầu dịch vụ: Lắp ổ cắm điện', NOW());

-- =====================================================
-- 20. AI_QA_HISTORY (Lịch sử hỏi đáp AI)
-- =====================================================
-- TOÀN BỘ DƯỚI ĐÂY CHỈ ĐỂ THAM KHẢO, KHÔNG ĐƯỢC CHẠY KHI DÙNG JAVA SEED (DataInitializer)
-- (Comment hoặc xóa toàn bộ các lệnh INSERT)
-- INSERT INTO ai_qa_history (id, user_id, question, ai_answer, asked_at, response_time, feedback) VALUES
-- (1, 5, 'Làm thế nào để đặt phòng gym?', 'Bạn có thể đặt phòng gym thông qua ứng dụng hoặc liên hệ ban quản lý. Phòng gym mở cửa từ 6:00-22:00 hàng ngày.', NOW(), 1500, 'HELPFUL'),
-- (2, 6, 'Phí dịch vụ tháng này bao nhiêu?', 'Phí dịch vụ tháng 12/2024 là 2,200,000 VND. Bạn có thể xem chi tiết trong phần hóa đơn.', NOW(), 1200, 'HELPFUL'),
-- (3, 7, 'Có thể nuôi thú cưng không?', 'Có thể nuôi thú cưng nhưng cần đăng ký với ban quản lý và tuân thủ quy định về vệ sinh, tiếng ồn.', NOW(), 1800, 'HELPFUL'),
-- (4, 8, 'Làm sao để báo sự cố?', 'Bạn có thể báo sự cố qua ứng dụng trong phần "Yêu cầu dịch vụ" hoặc gọi hotline 24/7.', NOW(), 1000, 'HELPFUL'),
-- (5, 9, 'Giờ mở cửa hồ bơi?', 'Hồ bơi mở cửa từ 6:00-21:00 hàng ngày. Có cứu hộ trực trong giờ mở cửa.', NOW(), 800, 'HELPFUL');

-- =====================================================
-- COMPLETED: Sample data has been inserted successfully
-- ===================================================== 