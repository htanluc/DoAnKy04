-- =====================================================
-- SCHEMA HOÀN CHỈNH CHO HỆ THỐNG QUẢN LÝ CHUNG CƯ
-- TỐI ƯU HÓA HỆ THỐNG THANH TOÁN
-- =====================================================

-- 1. ROLES (Vai trò người dùng)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 2. USERS (Người dùng)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    lock_reason VARCHAR(255),
    avatar_url VARCHAR(500),
    full_name VARCHAR(100),
    date_of_birth DATE,
    id_card_number VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. USER_ROLES (Phân quyền người dùng)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 4. BUILDINGS (Tòa nhà)
CREATE TABLE IF NOT EXISTS buildings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_name VARCHAR(100) NOT NULL,
    address TEXT,
    floors INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.1. VEHICLE_CAPACITY_CONFIG (Cấu hình giới hạn xe cho từng tòa nhà)
CREATE TABLE IF NOT EXISTS vehicle_capacity_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT NOT NULL,
    max_cars INT NOT NULL DEFAULT 0 COMMENT 'Số lượng ô tô tối đa cho phép',
    max_motorcycles INT NOT NULL DEFAULT 0 COMMENT 'Số lượng xe máy tối đa cho phép',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái kích hoạt cấu hình',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY uk_building_vehicle_capacity (building_id)
);

-- 5. APARTMENTS (Căn hộ)
CREATE TABLE IF NOT EXISTS apartments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT NOT NULL,
    floor_number INT,
    unit_number VARCHAR(20) NOT NULL,
    area DOUBLE,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
);

-- 6. APARTMENT_RESIDENTS (Liên kết căn hộ - người dùng)
CREATE TABLE IF NOT EXISTS apartment_residents (
    apartment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    relation_type ENUM('OWNER', 'TENANT', 'FAMILY_MEMBER', 'GUEST', 'MANAGER', 'CO_OWNER') NOT NULL,
    move_in_date DATE,
    move_out_date DATE,
    is_primary_resident BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (apartment_id, user_id),
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. FACILITIES (Tiện ích)
CREATE TABLE IF NOT EXISTS facilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    capacity INT,
    other_details TEXT,
    usage_fee DOUBLE,
    opening_hours VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. SERVICE_CATEGORIES (Danh mục dịch vụ)
CREATE TABLE IF NOT EXISTS service_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    assigned_role VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. ANNOUNCEMENTS (Thông báo)
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    target_audience VARCHAR(50),
    created_by BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 10. EVENTS (Sự kiện)
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    max_participants INT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 11. EVENT_REGISTRATIONS (Đăng ký sự kiện)
CREATE TABLE IF NOT EXISTS event_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. FACILITY_BOOKINGS (Đặt tiện ích)
CREATE TABLE IF NOT EXISTS facility_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    facility_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    duration INT,
    number_of_people INT DEFAULT 1,
    purpose TEXT,
    qr_code VARCHAR(255),
    qr_expires_at TIMESTAMP,
    checked_in_count INT DEFAULT 0,
    max_checkins INT DEFAULT 1,
    checkin_window_minutes INT DEFAULT 30,
    total_cost DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_method VARCHAR(20),
    payment_date TIMESTAMP,
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. INVOICES (Hóa đơn) - TỐI ƯU HÓA
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    billing_period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PARTIAL, PAID, OVERDUE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_apartment_billing_period (apartment_id, billing_period)
);

-- 14. INVOICE_ITEMS (Chi tiết hóa đơn) - TỐI ƯU HÓA
CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    unit_price DECIMAL(15,2),
    quantity DECIMAL(10,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 15. PAYMENT_METHODS (Phương thức thanh toán) - BẢNG MỚI
CREATE TABLE IF NOT EXISTS payment_methods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    method_code VARCHAR(50) NOT NULL UNIQUE,
    method_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    gateway_config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. PAYMENTS (Thanh toán) - TỐI ƯU HÓA
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    paid_by_user_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method_id BIGINT NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reference_code VARCHAR(100) UNIQUE,
    transaction_id VARCHAR(100),
    gateway_response JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

-- 17. PAYMENT_HISTORY (Lịch sử thanh toán) - BẢNG MỚI
CREATE TABLE IF NOT EXISTS payment_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATED, UPDATED, CANCELLED, REFUNDED
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    amount_changed DECIMAL(15,2),
    notes TEXT,
    performed_by BIGINT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- 18. PAYMENT_TRANSACTIONS (Giao dịch thanh toán) - BẢNG MỚI
CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_ref VARCHAR(255) NOT NULL UNIQUE,
    invoice_id BIGINT,
    amount BIGINT NOT NULL,
    gateway VARCHAR(50) NOT NULL,
    order_info TEXT,
    status VARCHAR(50) NOT NULL,
    gateway_response TEXT,
    gateway_transaction_id VARCHAR(255),
    bank_code VARCHAR(50),
    response_code VARCHAR(50),
    transaction_time VARCHAR(50),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    completed_at DATETIME,
    
    INDEX idx_transaction_ref (transaction_ref),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_status (status),
    INDEX idx_gateway (gateway),
    INDEX idx_created_at (created_at)
);

-- 19. SERVICE_REQUESTS (Yêu cầu dịch vụ)
CREATE TABLE IF NOT EXISTS service_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255),
    category BIGINT NOT NULL,
    description TEXT,
    image_attachment VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_to BIGINT,
    assigned_at TIMESTAMP,
    status INT,
    priority INT,
    resolution_notes TEXT,
    completed_at TIMESTAMP,
    rating INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES service_categories(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- 19. FEEDBACKS (Phản hồi)
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category BIGINT NOT NULL,
    content TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INT NOT NULL,
    response TEXT,
    responded_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES feedback_categories(id)
);

-- 20. ACTIVITY_LOGS (Nhật ký hoạt động)
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    resource_type VARCHAR(100),
    resource_id BIGINT,
    additional_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 21. AI_QA_HISTORY (Lịch sử hỏi đáp AI)
CREATE TABLE IF NOT EXISTS ai_qa_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    ai_answer TEXT NOT NULL,
    asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time INT,
    feedback VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 22. EMAIL_VERIFICATION_TOKENS (Token xác thực email)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 23. REFRESH_TOKENS (Token làm mới)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 24. APARTMENT_INVITATIONS (Lời mời căn hộ)
CREATE TABLE IF NOT EXISTS apartment_invitations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    invited_user_id BIGINT NOT NULL,
    invited_by BIGINT NOT NULL,
    invitation_code VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- 25. FEEDBACK_CATEGORIES (Danh mục phản hồi)
CREATE TABLE IF NOT EXISTS feedback_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 26. SERVICE_FEE_CONFIG (Cấu hình phí dịch vụ) - BẢNG MỚI
CREATE TABLE IF NOT EXISTS service_fee_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fee_type VARCHAR(100) NOT NULL UNIQUE,
    fee_name VARCHAR(100) NOT NULL,
    base_amount DECIMAL(15,2) NOT NULL,
    unit_price DECIMAL(15,2),
    calculation_method VARCHAR(50) NOT NULL, -- FIXED, PER_UNIT, PER_AREA, PER_PERSON
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 27. WATER_METER_READINGS (Chỉ số đồng hồ nước)
CREATE TABLE IF NOT EXISTS water_meter_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    reading_date DATE NOT NULL,
    meter_reading DECIMAL(10,2) NOT NULL,
    consumption DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(15,2),
    recorded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- 28. ANNOUNCEMENT_READS (Đã đọc thông báo)
CREATE TABLE announcement_reads (
    announcement_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (announcement_id, user_id),
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 29. EMERGENCY_CONTACTS (Liên hệ khẩn cấp)
CREATE TABLE emergency_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 30. VEHICLES (Phương tiện)
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    image_urls TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    monthly_fee DECIMAL(10,2),
    user_id BIGINT NOT NULL,
    apartment_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
);

-- =====================================================
-- INSERT DỮ LIỆU MẪU
-- =====================================================

-- -- Insert roles
-- INSERT IGNORE INTO roles (id, name, description) VALUES
-- (1, 'ADMIN', 'Quản trị viên hệ thống'),
-- (2, 'STAFF', 'Nhân viên quản lý'),
-- (3, 'RESIDENT', 'Cư dân');

-- -- Insert payment methods
-- INSERT IGNORE INTO payment_methods (method_code, method_name, description, gateway_config) VALUES
-- ('VISA', 'Thẻ Visa/Mastercard', 'Thanh toán qua thẻ quốc tế', '{"gateway": "stripe", "currency": "VND"}'),
-- ('MASTERCARD', 'Thẻ Mastercard', 'Thanh toán qua thẻ Mastercard', '{"gateway": "stripe", "currency": "VND"}'),
-- ('MOMO', 'Ví MoMo', 'Thanh toán qua ví MoMo', '{"gateway": "momo", "currency": "VND"}'),
-- ('VNPAY', 'VNPay', 'Thanh toán qua VNPay', '{"gateway": "vnpay", "currency": "VND"}'),
-- ('ZALOPAY', 'ZaloPay', 'Thanh toán qua ZaloPay', '{"gateway": "zalopay", "currency": "VND"}'),
-- ('PAYPAL', 'PayPal', 'Thanh toán qua PayPal', '{"gateway": "paypal", "currency": "USD"}'),
-- ('CASH', 'Tiền mặt', 'Thanh toán tiền mặt', '{"gateway": "manual", "currency": "VND"}'),
-- ('BANK_TRANSFER', 'Chuyển khoản ngân hàng', 'Chuyển khoản trực tiếp', '{"gateway": "bank", "currency": "VND"}');

-- -- Insert service fee config
-- INSERT IGNORE INTO service_fee_config (fee_type, fee_name, base_amount, unit_price, calculation_method, description) VALUES
-- ('WATER', 'Phí nước', 0.00, 15000.00, 'PER_UNIT', 'Phí nước theo m3'),
-- ('ELECTRICITY', 'Phí điện', 0.00, 3500.00, 'PER_UNIT', 'Phí điện theo kWh'),
-- ('MAINTENANCE', 'Phí bảo trì', 250000.00, 0.00, 'FIXED', 'Phí bảo trì cố định'),
-- ('PARKING', 'Phí giữ xe', 150000.00, 0.00, 'FIXED', 'Phí giữ xe cố định'),
-- ('INTERNET', 'Phí mạng', 100000.00, 0.00, 'FIXED', 'Phí internet cố định'),
-- ('CLEANING', 'Phí vệ sinh', 50000.00, 0.00, 'FIXED', 'Phí vệ sinh cố định'),
-- ('SECURITY', 'Phí bảo vệ', 100000.00, 0.00, 'FIXED', 'Phí bảo vệ cố định');

-- -- Insert feedback categories
-- INSERT IGNORE INTO feedback_categories (category_code, category_name, description) VALUES
-- ('SUGGESTION', 'Đề xuất', 'Đề xuất cải tiến dịch vụ'),
-- ('COMPLAINT', 'Khiếu nại', 'Khiếu nại về dịch vụ'),
-- ('COMPLIMENT', 'Khen ngợi', 'Khen ngợi dịch vụ');

-- -- Insert service categories
-- INSERT IGNORE INTO service_categories (category_code, category_name, assigned_role, description) VALUES
-- ('ELECTRICITY', 'Điện', 'TECHNICIAN', 'Sửa chữa điện, thay bóng đèn, ổ cắm'),
-- ('PLUMBING', 'Nước', 'TECHNICIAN', 'Sửa ống nước, vòi nước, bồn cầu'),
-- ('CLEANING', 'Vệ sinh', 'CLEANER', 'Dọn dẹp, lau chùi, vệ sinh chung'),
-- ('SECURITY', 'An ninh', 'SECURITY', 'Tuần tra, kiểm tra an ninh, xử lý sự cố'),
-- ('HVAC', 'Điều hòa', 'TECHNICIAN', 'Bảo trì, sửa chữa điều hòa'),
-- ('ELEVATOR', 'Thang máy', 'TECHNICIAN', 'Bảo trì, sửa chữa thang máy'),
-- ('GARDENING', 'Cây xanh', 'CLEANER', 'Chăm sóc cây xanh, cắt tỉa'),
-- ('GENERAL', 'Khác', 'STAFF', 'Các yêu cầu khác');

-- -- Insert sample facilities
-- INSERT IGNORE INTO facilities (name, description, location, capacity, other_details, usage_fee, opening_hours, status) VALUES
-- ('Phòng Gym', 'Phòng tập thể dục với đầy đủ thiết bị hiện đại', 'Tầng 1 - Tòa A', 20, 'Mở cửa 6:00-22:00, có huấn luyện viên', 50000.0, '06:00 - 22:00', 'ACTIVE'),
-- ('Hồ bơi', 'Hồ bơi ngoài trời với view đẹp', 'Khu vực ngoài trời - Tầng trệt', 50, 'Mở cửa 6:00-21:00, có cứu hộ', 100000.0, '06:00 - 21:00', 'ACTIVE'),
-- ('Phòng họp', 'Phòng họp đa năng cho cư dân', 'Tầng 2 - Tòa B', 30, 'Có thể đặt trước, có máy chiếu', 30000.0, '08:00 - 20:00', 'ACTIVE'),
-- ('Sân tennis', 'Sân tennis ngoài trời chất lượng cao', 'Khu vực ngoài trời - Tầng trệt', 8, 'Có đèn chiếu sáng, có thể chơi ban đêm', 80000.0, '06:00 - 22:00', 'ACTIVE'),
-- ('Khu BBQ', 'Khu vực nướng BBQ ngoài trời', 'Khu vực ngoài trời - Tầng trệt', 40, 'Có bàn ghế, lò nướng', 50000.0, '16:00 - 22:00', 'ACTIVE'),
-- ('Phòng sinh hoạt cộng đồng', 'Phòng đa năng cho các hoạt động cộng đồng', 'Tầng 1 - Tòa C', 100, 'Có sân khấu, âm thanh ánh sáng', 20000.0, '08:00 - 22:00', 'ACTIVE'),
-- ('Bãi đỗ xe', 'Bãi đỗ xe có mái che', 'Tầng hầm - Tòa A', 200, 'Miễn phí cho cư dân', 10000.0, '24/7', 'ACTIVE'),
-- ('Khu vui chơi trẻ em', 'Sân chơi an toàn cho trẻ em', 'Khu vực ngoài trời - Tầng trệt', 30, 'Có đồ chơi, có ghế ngồi cho phụ huynh', 30000.0, '06:00 - 20:00', 'ACTIVE');

-- -- =====================================================
-- -- INDEXES TỐI ƯU HÓA
-- -- =====================================================

-- -- User indexes
-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_users_username ON users(username);
-- CREATE INDEX idx_users_status ON users(status);
-- CREATE INDEX idx_users_phone_number ON users(phone_number);

-- -- Apartment indexes
-- CREATE INDEX idx_apartments_building_id ON apartments(building_id);
-- CREATE INDEX idx_apartments_status ON apartments(status);
-- CREATE INDEX idx_apartments_unit_number ON apartments(unit_number);

-- -- Announcement indexes
-- CREATE INDEX idx_announcements_type ON announcements(type);
-- CREATE INDEX idx_announcements_created_by ON announcements(created_by);
-- CREATE INDEX idx_announcements_is_active ON announcements(is_active);
-- CREATE INDEX idx_announcements_created_at ON announcements(created_at);

-- -- Event indexes
-- CREATE INDEX idx_events_start_time ON events(start_time);
-- CREATE INDEX idx_events_end_time ON events(end_time);
-- CREATE INDEX idx_events_created_by ON events(created_by);

-- -- Facility booking indexes
-- CREATE INDEX idx_facility_bookings_facility_id ON facility_bookings(facility_id);
-- CREATE INDEX idx_facility_bookings_user_id ON facility_bookings(user_id);
-- CREATE INDEX idx_facility_bookings_status ON facility_bookings(status);
-- CREATE INDEX idx_facility_bookings_start_time ON facility_bookings(start_time);

-- -- Invoice indexes - TỐI ƯU HÓA
-- CREATE INDEX idx_invoices_apartment_id ON invoices(apartment_id);
-- CREATE INDEX idx_invoices_billing_period ON invoices(billing_period);
-- CREATE INDEX idx_invoices_status ON invoices(status);
-- CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
-- CREATE INDEX idx_invoices_due_date ON invoices(due_date);
-- CREATE INDEX idx_invoices_created_at ON invoices(created_at);
-- CREATE INDEX idx_invoices_apartment_billing ON invoices(apartment_id, billing_period);

-- -- Invoice items indexes
-- CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
-- CREATE INDEX idx_invoice_items_fee_type ON invoice_items(fee_type);

-- -- Payment indexes - TỐI ƯU HÓA
-- CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
-- CREATE INDEX idx_payments_paid_by_user_id ON payments(paid_by_user_id);
-- CREATE INDEX idx_payments_payment_method_id ON payments(payment_method_id);
-- CREATE INDEX idx_payments_status ON payments(status);
-- CREATE INDEX idx_payments_payment_date ON payments(payment_date);
-- CREATE INDEX idx_payments_reference_code ON payments(reference_code);
-- CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
-- CREATE INDEX idx_payments_created_at ON payments(created_at);

-- -- Payment transactions indexes
-- CREATE INDEX idx_payment_transactions_transaction_ref ON payment_transactions(transaction_ref);
-- CREATE INDEX idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
-- CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
-- CREATE INDEX idx_payment_transactions_gateway ON payment_transactions(gateway);
-- CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);

-- -- Payment history indexes
-- CREATE INDEX idx_payment_history_payment_id ON payment_history(payment_id);
-- CREATE INDEX idx_payment_history_action ON payment_history(action);
-- CREATE INDEX idx_payment_history_performed_at ON payment_history(performed_at);

-- -- Service request indexes
-- CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
-- CREATE INDEX idx_service_requests_category ON service_requests(category);
-- CREATE INDEX idx_service_requests_status ON service_requests(status);
-- CREATE INDEX idx_service_requests_assigned_to ON service_requests(assigned_to);
-- CREATE INDEX idx_service_requests_submitted_at ON service_requests(submitted_at);

-- -- Activity log indexes
-- CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
-- CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
-- CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- -- Apartment residents indexes
-- CREATE INDEX idx_apartment_residents_apartment_id ON apartment_residents(apartment_id);
-- CREATE INDEX idx_apartment_residents_user_id ON apartment_residents(user_id);
-- CREATE INDEX idx_apartment_residents_primary ON apartment_residents(is_primary_resident);

-- -- Event registration indexes
-- CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
-- CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
-- CREATE INDEX idx_event_registrations_status ON event_registrations(status);

-- -- Water meter reading indexes
-- CREATE INDEX idx_water_meter_readings_apartment_id ON water_meter_readings(apartment_id);
-- CREATE INDEX idx_water_meter_readings_reading_date ON water_meter_readings(reading_date);
-- CREATE INDEX idx_water_meter_readings_recorded_by ON water_meter_readings(recorded_by);

-- -- Emergency contacts indexes
-- CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
-- CREATE INDEX idx_emergency_contacts_primary ON emergency_contacts(is_primary);

-- -- Vehicle indexes
-- CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
-- CREATE INDEX idx_vehicles_apartment_id ON vehicles(apartment_id);
-- CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
-- CREATE INDEX idx_vehicles_status ON vehicles(status);
-- CREATE INDEX idx_vehicles_vehicle_type ON vehicles(vehicle_type);

-- -- =====================================================
-- -- TRIGGERS TỐI ƯU HÓA
-- -- =====================================================

-- -- Trigger để tự động cập nhật remaining_amount và payment_status của invoice
-- DELIMITER //
-- CREATE TRIGGER update_invoice_payment_status
-- AFTER INSERT ON payments
-- FOR EACH ROW
-- BEGIN
--     DECLARE total_paid DECIMAL(15,2);
--     DECLARE invoice_total DECIMAL(15,2);
    
--     -- Tính tổng tiền đã thanh toán
--     SELECT COALESCE(SUM(amount), 0) INTO total_paid
--     FROM payments 
--     WHERE invoice_id = NEW.invoice_id AND status = 'SUCCESS';
    
--     -- Lấy tổng tiền hóa đơn
--     SELECT total_amount INTO invoice_total
--     FROM invoices 
--     WHERE id = NEW.invoice_id;
    
--     -- Cập nhật invoice
--     UPDATE invoices 
--     SET 
--         paid_amount = total_paid,
--         remaining_amount = invoice_total - total_paid,
--         payment_status = CASE 
--             WHEN total_paid >= invoice_total THEN 'PAID'
--             WHEN total_paid > 0 THEN 'PARTIAL'
--             ELSE 'PENDING'
--         END,
--         status = CASE 
--             WHEN total_paid >= invoice_total THEN 'PAID'
--             WHEN total_paid > 0 THEN 'PARTIAL'
--             ELSE 'UNPAID'
--         END,
--         updated_at = CURRENT_TIMESTAMP
--     WHERE id = NEW.invoice_id;
-- END//
-- DELIMITER ;

-- -- Trigger để ghi lịch sử thanh toán
-- DELIMITER //
-- CREATE TRIGGER log_payment_history
-- AFTER INSERT ON payments
-- FOR EACH ROW
-- BEGIN
--     INSERT INTO payment_history (payment_id, action, new_status, amount_changed, notes)
--     VALUES (NEW.id, 'CREATED', NEW.status, NEW.amount, 'Payment created');
-- END//
-- DELIMITER ;

-- -- Trigger để cập nhật lịch sử khi payment status thay đổi
-- DELIMITER //
-- CREATE TRIGGER update_payment_history
-- AFTER UPDATE ON payments
-- FOR EACH ROW
-- BEGIN
--     IF OLD.status != NEW.status THEN
--         INSERT INTO payment_history (payment_id, action, old_status, new_status, amount_changed, notes)
--         VALUES (NEW.id, 'UPDATED', OLD.status, NEW.status, NEW.amount - OLD.amount, 'Payment status updated');
--     END IF;
-- END//
-- DELIMITER ;

-- -- =====================================================
-- -- VIEWS TỐI ƯU HÓA
-- -- =====================================================

-- -- View tổng hợp thông tin hóa đơn và thanh toán
-- CREATE OR REPLACE VIEW invoice_payment_summary AS
-- SELECT 
--     i.id as invoice_id,
--     i.apartment_id,
--     i.billing_period,
--     i.issue_date,
--     i.due_date,
--     i.total_amount,
--     i.paid_amount,
--     i.remaining_amount,
--     i.status,
--     i.payment_status,
--     COUNT(p.id) as payment_count,
--     MAX(p.payment_date) as last_payment_date,
--     CASE 
--         WHEN i.payment_status = 'PAID' THEN 'Đã thanh toán'
--         WHEN i.payment_status = 'PARTIAL' THEN 'Thanh toán một phần'
--         WHEN i.payment_status = 'PENDING' THEN 'Chưa thanh toán'
--         ELSE 'Không xác định'
--     END as payment_status_text
-- FROM invoices i
-- LEFT JOIN payments p ON i.id = p.invoice_id AND p.status = 'SUCCESS'
-- GROUP BY i.id, i.apartment_id, i.billing_period, i.issue_date, i.due_date, 
--          i.total_amount, i.paid_amount, i.remaining_amount, i.status, i.payment_status;

-- -- View thống kê thanh toán theo phương thức
-- CREATE OR REPLACE VIEW payment_method_stats AS
-- SELECT 
--     pm.method_code,
--     pm.method_name,
--     COUNT(p.id) as total_payments,
--     SUM(p.amount) as total_amount,
--     AVG(p.amount) as avg_amount,
--     MIN(p.payment_date) as first_payment,
--     MAX(p.payment_date) as last_payment
-- FROM payment_methods pm
-- LEFT JOIN payments p ON pm.id = p.payment_method_id AND p.status = 'SUCCESS'
-- GROUP BY pm.id, pm.method_code, pm.method_name;

-- -- View thống kê hóa đơn theo trạng thái
-- CREATE OR REPLACE VIEW invoice_status_stats AS
-- SELECT 
--     payment_status,
--     COUNT(*) as invoice_count,
--     SUM(total_amount) as total_amount,
--     SUM(paid_amount) as total_paid,
--     SUM(remaining_amount) as total_remaining,
--     AVG(total_amount) as avg_amount
-- FROM invoices
-- GROUP BY payment_status;