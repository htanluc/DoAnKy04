-- =====================================================
-- SCHEMA HOÀN CHỈNH CHO HỆ THỐNG QUẢN LÝ CHUNG CƯ
-- =====================================================

-- 1. ROLES (Vai trò người dùng)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. USERS (Người dùng)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL,
    lock_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 3. USER_ROLES (Phân quyền người dùng)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 4. BUILDINGS (Tòa nhà)
CREATE TABLE IF NOT EXISTS buildings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_name VARCHAR(100) NOT NULL,
    address TEXT,
    floors INT,
    description TEXT
);

-- 5. APARTMENTS (Căn hộ)
CREATE TABLE IF NOT EXISTS apartments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT NOT NULL,
    floor_number INT,
    unit_number VARCHAR(20) NOT NULL,
    area DOUBLE,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

-- 6. RESIDENTS (Thông tin cư dân)
CREATE TABLE IF NOT EXISTS residents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    full_name VARCHAR(100),
    date_of_birth DATE,
    id_card_number VARCHAR(20) UNIQUE,
    family_relation VARCHAR(50),
    status INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. APARTMENT_RESIDENTS (Liên kết căn hộ - cư dân)
CREATE TABLE IF NOT EXISTS apartment_residents (
    apartment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    relation_type VARCHAR(50) NOT NULL,
    move_in_date DATE,
    move_out_date DATE,
    PRIMARY KEY (apartment_id, user_id),
    FOREIGN KEY (apartment_id) REFERENCES apartments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. FACILITIES (Tiện ích)
CREATE TABLE IF NOT EXISTS facilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INT,
    other_details TEXT,
    usage_fee DOUBLE,
    opening_hours VARCHAR(50)
);

-- 9. SERVICE_CATEGORIES (Danh mục dịch vụ)
CREATE TABLE IF NOT EXISTS service_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    assigned_role VARCHAR(50),
    description TEXT
);

-- 10. ANNOUNCEMENTS (Thông báo)
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    target_audience VARCHAR(50),
    created_by BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 11. EVENTS (Sự kiện)
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. EVENT_REGISTRATIONS (Đăng ký sự kiện)
CREATE TABLE IF NOT EXISTS event_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    resident_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (resident_id) REFERENCES residents(id)
);

-- 13. FACILITY_BOOKINGS (Đặt tiện ích)
CREATE TABLE IF NOT EXISTS facility_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    facility_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    booking_time TIMESTAMP NOT NULL,
    duration INT,
    status VARCHAR(20) NOT NULL,
    number_of_people INT,
    purpose VARCHAR(255),
    approved_by BIGINT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 14. INVOICES (Hóa đơn)
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    billing_period VARCHAR(7) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DOUBLE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id)
);

-- 15. INVOICE_ITEMS (Chi tiết hóa đơn)
CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    description TEXT,
    amount DOUBLE NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- 16. PAYMENTS (Thanh toán)
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    paid_by_user_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    reference_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (paid_by_user_id) REFERENCES users(id)
);

-- 17. SERVICE_REQUESTS (Yêu cầu dịch vụ)
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
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category) REFERENCES service_categories(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- 18. FEEDBACKS (Phản hồi)
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category BIGINT NOT NULL,
    content TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INT NOT NULL,
    response TEXT,
    responded_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category) REFERENCES feedback_categories(id)
);

-- 19. ACTIVITY_LOGS (Nhật ký hoạt động)
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 20. AI_QA_HISTORY (Lịch sử hỏi đáp AI)
CREATE TABLE IF NOT EXISTS ai_qa_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    ai_answer TEXT NOT NULL,
    asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time INT,
    feedback VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 21. EMAIL_VERIFICATION_TOKENS (Token xác thực email)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 22. REFRESH_TOKENS (Token làm mới)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 23. APARTMENT_INVITATIONS (Lời mời căn hộ)
CREATE TABLE IF NOT EXISTS apartment_invitations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id)
);

-- 24. RECURRING_BOOKINGS (Đặt tiện ích định kỳ)
CREATE TABLE IF NOT EXISTS recurring_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    facility_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    day_of_week INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 25. FEEDBACK_CATEGORIES (Danh mục phản hồi)
CREATE TABLE IF NOT EXISTS feedback_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 26. PAYMENT_METHODS (Phương thức thanh toán)
CREATE TABLE IF NOT EXISTS payment_methods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- NEW: SERVICE_FEE_CONFIG (Cấu hình phí dịch vụ, nước, gửi xe)
CREATE TABLE IF NOT EXISTS service_fee_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    month INT NOT NULL,
    year INT NOT NULL,
    parking_fee DOUBLE NOT NULL,
    service_fee_per_m2 DOUBLE NOT NULL,
    water_fee_per_m3 DOUBLE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_service_fee_month_year (month, year)
);

-- NEW: WATER_METER_READINGS (Chỉ số nước)
CREATE TABLE IF NOT EXISTS water_meter_readings (
    reading_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id INT NOT NULL,
    reading_month VARCHAR(7) NOT NULL,
    previous_reading DECIMAL(12,2) NOT NULL,
    current_reading DECIMAL(12,2) NOT NULL,
    consumption DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    UNIQUE KEY uq_apartment_month (apartment_id, reading_month),
    FOREIGN KEY (apartment_id) REFERENCES apartments(id)
);

-- =====================================================
-- INDEXES ĐỂ TỐI ƯU HIỆU SUẤT
-- =====================================================

-- Indexes cho users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- Indexes cho apartments
CREATE INDEX idx_apartments_building_id ON apartments(building_id);
CREATE INDEX idx_apartments_status ON apartments(status);

-- Indexes cho announcements
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_created_by ON announcements(created_by);
CREATE INDEX idx_announcements_is_active ON announcements(is_active);

-- Indexes cho events
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_end_time ON events(end_time);

-- Indexes cho facility_bookings
CREATE INDEX idx_facility_bookings_facility_id ON facility_bookings(facility_id);
CREATE INDEX idx_facility_bookings_user_id ON facility_bookings(user_id);
CREATE INDEX idx_facility_bookings_status ON facility_bookings(status);
CREATE INDEX idx_facility_bookings_start_time ON facility_bookings(start_time);

-- Indexes cho invoices
CREATE INDEX idx_invoices_apartment_id ON invoices(apartment_id);
CREATE INDEX idx_invoices_billing_period ON invoices(billing_period);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Indexes cho service_requests
CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_service_requests_category ON service_requests(category);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_assigned_to ON service_requests(assigned_to);

-- Indexes cho activity_logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);

-- Indexes cho apartment_residents
CREATE INDEX idx_apartment_residents_apartment_id ON apartment_residents(apartment_id);
CREATE INDEX idx_apartment_residents_user_id ON apartment_residents(user_id);

-- Indexes cho event_registrations
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_resident_id ON event_registrations(resident_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);

-- =====================================================
-- CONSTRAINTS VÀ RULES
-- =====================================================

-- Đảm bảo email verification token có thời hạn
ALTER TABLE email_verification_tokens 
ADD CONSTRAINT chk_email_verification_expiry 
CHECK (expiry_date > created_at);

-- Đảm bảo refresh token có thời hạn
ALTER TABLE refresh_tokens 
ADD CONSTRAINT chk_refresh_token_expiry 
CHECK (expiry_date > created_at);

-- Đảm bảo apartment invitation có thời hạn
ALTER TABLE apartment_invitations 
ADD CONSTRAINT chk_apartment_invitation_expiry 
CHECK (expiry_date > created_at);

-- Đảm bảo facility booking có thời gian hợp lệ
ALTER TABLE facility_bookings 
ADD CONSTRAINT chk_facility_booking_duration 
CHECK (duration > 0);

-- Đảm bảo event có thời gian hợp lệ
ALTER TABLE events 
ADD CONSTRAINT chk_event_time 
CHECK (end_time > start_time);

-- Đảm bảo invoice có số tiền dương
ALTER TABLE invoices 
ADD CONSTRAINT chk_invoice_amount 
CHECK (total_amount > 0);

-- Đảm bảo payment có số tiền dương
ALTER TABLE payments 
ADD CONSTRAINT chk_payment_amount 
CHECK (amount > 0);

-- Đảm bảo rating trong khoảng 1-5
ALTER TABLE feedbacks 
ADD CONSTRAINT chk_feedback_rating 
CHECK (rating >= 1 AND rating <= 5);

-- Đảm bảo service request rating trong khoảng 1-5
ALTER TABLE service_requests 
ADD CONSTRAINT chk_service_request_rating 
CHECK (rating >= 1 AND rating <= 5);

-- Đảm bảo day_of_week trong khoảng 1-7
ALTER TABLE recurring_bookings 
ADD CONSTRAINT chk_recurring_booking_day 
CHECK (day_of_week >= 1 AND day_of_week <= 7);

-- =====================================================
-- DỮ LIỆU MẪU
-- =====================================================

-- 1. ROLES
INSERT INTO roles (name) VALUES 
('ADMIN'),
('STAFF'), 
('RESIDENT'),
('TECHNICIAN'),
('CLEANER'),
('SECURITY');

-- 2. USERS (password: password)
INSERT INTO users (username, email, password_hash, phone_number, status, created_at, updated_at) VALUES
('admin', 'admin@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234567', 'ACTIVE', NOW(), NOW()),
('manager', 'manager@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234568', 'ACTIVE', NOW(), NOW()),
('staff1', 'staff1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234569', 'ACTIVE', NOW(), NOW()),
('staff2', 'staff2@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234570', 'ACTIVE', NOW(), NOW()),
('resident1', 'nguyenvanA@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234571', 'ACTIVE', NOW(), NOW()),
('resident2', 'tranthiB@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234572', 'ACTIVE', NOW(), NOW()),
('resident3', 'levanC@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234573', 'ACTIVE', NOW(), NOW()),
('resident4', 'phamthiD@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234574', 'ACTIVE', NOW(), NOW()),
('resident5', 'hoangvanE@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234575', 'ACTIVE', NOW(), NOW()),
('resident6', 'dangthiF@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234576', 'ACTIVE', NOW(), NOW()),
('technician1', 'technician1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234577', 'ACTIVE', NOW(), NOW()),
('cleaner1', 'cleaner1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234578', 'ACTIVE', NOW(), NOW()),
('security1', 'security1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234579', 'ACTIVE', NOW(), NOW()),
('resident_locked', 'locked@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234580', 'LOCKED', NOW(), NOW()),
('resident_inactive', 'inactive@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234581', 'INACTIVE', NOW(), NOW());

-- 3. USER_ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin -> ADMIN
(2, 1), -- manager -> ADMIN
(3, 2), -- staff1 -> STAFF
(4, 2), -- staff2 -> STAFF
(5, 3), -- resident1 -> RESIDENT
(6, 3), -- resident2 -> RESIDENT
(7, 3), -- resident3 -> RESIDENT
(8, 3), -- resident4 -> RESIDENT
(9, 3), -- resident5 -> RESIDENT
(10, 3), -- resident6 -> RESIDENT
(11, 4), -- technician1 -> TECHNICIAN
(12, 5), -- cleaner1 -> CLEANER
(13, 6), -- security1 -> SECURITY
(14, 3), -- resident_locked -> RESIDENT
(15, 3); -- resident_inactive -> RESIDENT

-- 4. BUILDINGS
INSERT INTO buildings (building_name, address, floors, description) VALUES
('Tòa A', '123 Đường ABC, Quận 1, TP.HCM', 20, 'Tòa nhà cao cấp với đầy đủ tiện ích'),
('Tòa B', '456 Đường XYZ, Quận 2, TP.HCM', 15, 'Tòa nhà trung cấp phù hợp gia đình'),
('Tòa C', '789 Đường DEF, Quận 3, TP.HCM', 25, 'Tòa nhà cao cấp view đẹp');

-- 5. APARTMENTS
INSERT INTO apartments (building_id, floor_number, unit_number, area, status) VALUES
-- Tòa A
(1, 1, 'A1-01', 80.0, 'OCCUPIED'),
(1, 1, 'A1-02', 85.0, 'OCCUPIED'),
(1, 2, 'A2-01', 80.0, 'VACANT'),
(1, 2, 'A2-02', 85.0, 'OCCUPIED'),
(1, 3, 'A3-01', 80.0, 'OCCUPIED'),
(1, 3, 'A3-02', 85.0, 'VACANT'),
(1, 4, 'A4-01', 80.0, 'OCCUPIED'),
(1, 4, 'A4-02', 85.0, 'OCCUPIED'),
(1, 5, 'A5-01', 80.0, 'VACANT'),
(1, 5, 'A5-02', 85.0, 'OCCUPIED'),
-- Tòa B
(2, 1, 'B1-01', 70.0, 'OCCUPIED'),
(2, 1, 'B1-02', 75.0, 'VACANT'),
(2, 2, 'B2-01', 70.0, 'OCCUPIED'),
(2, 2, 'B2-02', 75.0, 'OCCUPIED'),
(2, 3, 'B3-01', 70.0, 'VACANT'),
(2, 3, 'B3-02', 75.0, 'OCCUPIED'),
(2, 4, 'B4-01', 70.0, 'OCCUPIED'),
(2, 4, 'B4-02', 75.0, 'VACANT'),
(2, 5, 'B5-01', 70.0, 'OCCUPIED'),
(2, 5, 'B5-02', 75.0, 'OCCUPIED'),
-- Tòa C
(3, 1, 'C1-01', 95.0, 'OCCUPIED'),
(3, 1, 'C1-02', 100.0, 'VACANT'),
(3, 2, 'C2-01', 95.0, 'OCCUPIED'),
(3, 2, 'C2-02', 100.0, 'OCCUPIED'),
(3, 3, 'C3-01', 95.0, 'VACANT'),
(3, 3, 'C3-02', 100.0, 'OCCUPIED'),
(3, 4, 'C4-01', 95.0, 'OCCUPIED'),
(3, 4, 'C4-02', 100.0, 'OCCUPIED'),
(3, 5, 'C5-01', 95.0, 'VACANT'),
(3, 5, 'C5-02', 100.0, 'OCCUPIED');

-- 6. RESIDENTS
INSERT INTO residents (user_id, full_name, date_of_birth, id_card_number, family_relation, status) VALUES
(5, 'Nguyễn Văn A', '1985-03-15', '123456789012', 'Chủ hộ', 1),
(6, 'Trần Thị B', '1986-04-16', '123456789013', 'Chủ hộ', 1),
(7, 'Lê Văn C', '1987-05-17', '123456789014', 'Chủ hộ', 1),
(8, 'Phạm Thị D', '1988-06-18', '123456789015', 'Chủ hộ', 1),
(9, 'Hoàng Văn E', '1989-07-19', '123456789016', 'Chủ hộ', 1),
(10, 'Đặng Thị F', '1990-08-20', '123456789017', 'Chủ hộ', 1),
(14, 'Nguyễn Văn Locked', '1990-01-01', '999999999999', 'Chủ hộ', 0),
(15, 'Trần Thị Inactive', '1991-02-02', '888888888888', 'Chủ hộ', 0);

-- 7. APARTMENT_RESIDENTS
INSERT INTO apartment_residents (apartment_id, user_id, relation_type, move_in_date) VALUES
(1, 5, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 6 MONTH)),
(3, 6, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 7 MONTH)),
(5, 7, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 8 MONTH)),
(7, 8, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 9 MONTH)),
(9, 9, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 10 MONTH)),
(11, 10, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 11 MONTH));

-- 8. FACILITIES
INSERT INTO facilities (name, description, capacity, other_details, usage_fee, opening_hours) VALUES
('Phòng Gym', 'Phòng tập thể dục với đầy đủ thiết bị hiện đại', 20, 'Mở cửa 6:00-22:00, có huấn luyện viên', 50000.0, '06:00 - 22:00'),
('Hồ bơi', 'Hồ bơi ngoài trời với view đẹp', 50, 'Mở cửa 6:00-21:00, có cứu hộ', 100000.0, '06:00 - 21:00'),
('Phòng họp', 'Phòng họp đa năng cho cư dân', 30, 'Có thể đặt trước, có máy chiếu', 30000.0, '08:00 - 20:00'),
('Sân tennis', 'Sân tennis ngoài trời chất lượng cao', 8, 'Có đèn chiếu sáng, có thể chơi ban đêm', 80000.0, '06:00 - 22:00'),
('Khu BBQ', 'Khu vực nướng BBQ ngoài trời', 40, 'Có bàn ghế, lò nướng', 50000.0, '16:00 - 22:00'),
('Phòng sinh hoạt cộng đồng', 'Phòng đa năng cho các hoạt động cộng đồng', 100, 'Có sân khấu, âm thanh ánh sáng', 20000.0, '08:00 - 22:00'),
('Bãi đỗ xe', 'Bãi đỗ xe có mái che', 200, 'Miễn phí cho cư dân', 10000.0, '24/7'),
('Khu vui chơi trẻ em', 'Sân chơi an toàn cho trẻ em', 30, 'Có đồ chơi, có ghế ngồi cho phụ huynh', 30000.0, '06:00 - 20:00');

-- 9. SERVICE_CATEGORIES
INSERT INTO service_categories (category_code, category_name, assigned_role, description) VALUES
('ELECTRICITY', 'Điện', 'TECHNICIAN', 'Sửa chữa điện, thay bóng đèn, ổ cắm'),
('PLUMBING', 'Nước', 'TECHNICIAN', 'Sửa ống nước, vòi nước, bồn cầu'),
('CLEANING', 'Vệ sinh', 'CLEANER', 'Dọn dẹp, lau chùi, vệ sinh chung'),
('SECURITY', 'An ninh', 'SECURITY', 'Tuần tra, kiểm tra an ninh, xử lý sự cố'),
('HVAC', 'Điều hòa', 'TECHNICIAN', 'Bảo trì, sửa chữa điều hòa'),
('ELEVATOR', 'Thang máy', 'TECHNICIAN', 'Bảo trì, sửa chữa thang máy'),
('GARDENING', 'Cây xanh', 'CLEANER', 'Chăm sóc cây xanh, cắt tỉa'),
('GENERAL', 'Khác', 'STAFF', 'Các yêu cầu khác');

-- 10. FEEDBACK_CATEGORIES
INSERT INTO feedback_categories (category_code, category_name, description) VALUES
('SUGGESTION', 'Đề xuất', 'Đề xuất cải tiến'),
('COMPLAINT', 'Khiếu nại', 'Khiếu nại về dịch vụ'),
('COMPLIMENT', 'Khen ngợi', 'Khen ngợi dịch vụ');

-- 11. ANNOUNCEMENTS
INSERT INTO announcements (title, content, type, target_audience, created_by, is_active, created_at) VALUES
('Thông báo bảo trì thang máy', 'Thang máy tòa A sẽ được bảo trì từ 8:00-12:00 ngày 15/12/2024. Vui lòng sử dụng thang máy khác.', 'REGULAR', 'ALL', 1, 1, NOW()),
('Thông báo khẩn: Mất điện', 'Sẽ có kế hoạch cắt điện bảo trì từ 22:00-06:00 ngày 20/12/2024. Vui lòng chuẩn bị đèn pin.', 'URGENT', 'ALL', 1, 1, NOW()),
('Sự kiện Tết 2025', 'Chương trình đón Tết 2025 sẽ diễn ra tại sảnh chính từ 18:00-22:00 ngày 30/12/2024. Mời tất cả cư dân tham gia.', 'EVENT', 'ALL', 1, 1, NOW()),
('Thông báo về phí dịch vụ', 'Phí dịch vụ tháng 12/2024 sẽ tăng 5% do chi phí điện nước tăng. Vui lòng thanh toán đúng hạn.', 'REGULAR', 'ALL', 1, 1, NOW()),
('Bảo trì hệ thống nước', 'Hệ thống nước sẽ được bảo trì từ 14:00-18:00 ngày 25/12/2024. Vui lòng dự trữ nước.', 'REGULAR', 'ALL', 1, 1, NOW());

-- 12. EVENTS
INSERT INTO events (title, description, start_time, end_time, location, created_at) VALUES
('Tiệc Giáng sinh 2024', 'Tiệc Giáng sinh cho cư dân với nhiều hoạt động vui nhộn', '2024-12-24 18:00:00', '2024-12-24 22:00:00', 'Sảnh chính tòa A', NOW()),
('Họp cư dân tháng 12', 'Họp cư dân định kỳ để thảo luận các vấn đề chung', '2024-12-15 19:00:00', '2024-12-15 21:00:00', 'Phòng sinh hoạt cộng đồng', NOW()),
('Lớp yoga miễn phí', 'Lớp yoga miễn phí cho cư dân mỗi sáng Chủ nhật', '2024-12-22 07:00:00', '2024-12-22 08:30:00', 'Phòng gym', NOW()),
('Workshop nấu ăn', 'Workshop nấu ăn truyền thống Việt Nam', '2024-12-28 14:00:00', '2024-12-28 17:00:00', 'Khu BBQ', NOW()),
('Giải tennis cư dân', 'Giải đấu tennis thường niên cho cư dân', '2024-12-29 08:00:00', '2024-12-29 18:00:00', 'Sân tennis', NOW());

-- 13. EVENT_REGISTRATIONS
INSERT INTO event_registrations (event_id, resident_id, status, registered_at) VALUES
(1, 1, 'REGISTERED', NOW()),
(1, 2, 'ATTENDED', NOW()),
(1, 3, 'CANCELLED', NOW());

-- 14. FACILITY_BOOKINGS
INSERT INTO facility_bookings (facility_id, user_id, booking_time, duration, status, number_of_people, purpose, created_at) VALUES
(1, 5, DATE_ADD(NOW(), INTERVAL 1 DAY), 60, 'PENDING', 2, 'Tập thể dục', NOW()),
(1, 5, DATE_ADD(NOW(), INTERVAL 2 DAY), 60, 'REJECTED', 4, 'Tập thể dục', NOW()),
(2, 6, DATE_ADD(NOW(), INTERVAL 3 DAY), 90, 'CONFIRMED', 6, 'Bơi lội', NOW()),
(3, 8, DATE_ADD(NOW(), INTERVAL 2 DAY), 90, 'CONFIRMED', 3, 'Họp gia đình', NOW()),
(4, 8, DATE_ADD(NOW(), INTERVAL 3 DAY), 60, 'PENDING', 5, 'Chơi tennis', NOW());

-- Thêm facility bookings được approved
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 3;

-- 15. INVOICES
INSERT INTO invoices (apartment_id, billing_period, issue_date, due_date, total_amount, status, created_at, updated_at) VALUES
(1, '2024-11', '2024-11-01', '2024-11-15', 1000000.0, 'UNPAID', NOW(), NOW()),
(1, '2024-10', '2024-10-01', '2024-10-15', 900000.0, 'PAID', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(1, '2024-09', '2024-09-01', '2024-09-15', 1200000.0, 'OVERDUE', DATE_SUB(NOW(), INTERVAL 3 MONTH), DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(3, '2024-11', '2024-11-01', '2024-11-15', 1000000.0, 'UNPAID', NOW(), NOW()),
(5, '2024-11', '2024-11-01', '2024-11-15', 1000000.0, 'UNPAID', NOW(), NOW()),
(7, '2024-11', '2024-11-01', '2024-11-15', 1000000.0, 'UNPAID', NOW(), NOW()),
(9, '2024-11', '2024-11-01', '2024-11-15', 1000000.0, 'UNPAID', NOW(), NOW()),
(11, '2024-11', '2024-11-01', '2024-11-15', 1000000.0, 'UNPAID', NOW(), NOW());

-- 16. INVOICE_ITEMS
INSERT INTO invoice_items (invoice_id, fee_type, description, amount) VALUES
(1, 'ELECTRICITY', 'Phí điện', 300000.0),
(1, 'WATER', 'Phí nước', 200000.0),
(1, 'PARKING', 'Phí giữ xe', 150000.0),
(1, 'INTERNET', 'Phí mạng', 100000.0),
(1, 'MAINTENANCE', 'Phí bảo trì', 250000.0),
(2, 'ELECTRICITY', 'Phí điện', 300000.0),
(2, 'WATER', 'Phí nước', 200000.0),
(2, 'PARKING', 'Phí giữ xe', 150000.0),
(2, 'INTERNET', 'Phí mạng', 100000.0),
(2, 'MAINTENANCE', 'Phí bảo trì', 150000.0),
(3, 'ELECTRICITY', 'Phí điện', 400000.0),
(3, 'WATER', 'Phí nước', 300000.0),
(3, 'PARKING', 'Phí giữ xe', 200000.0),
(3, 'INTERNET', 'Phí mạng', 150000.0),
(3, 'MAINTENANCE', 'Phí bảo trì', 150000.0);

-- 17. PAYMENTS
INSERT INTO payments (invoice_id, paid_by_user_id, amount, payment_method, payment_date, status, reference_code, created_at) VALUES
(2, 5, 900000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 10 DAY), 'SUCCESS', 'TXN2', NOW());

-- 18. SERVICE_REQUESTS
INSERT INTO service_requests (user_id, title, category, description, submitted_at, status, priority) VALUES
(5, 'Sửa ống nước', 2, 'Cần sửa ống nước', NOW(), 0, 1),
(5, 'Sửa điện', 1, 'Cần sửa điện', NOW(), 2, 0);

-- Cập nhật service request đã hoàn thành
UPDATE service_requests SET resolution_notes = 'Đã sửa xong', completed_at = NOW() WHERE id = 2;

-- 19. FEEDBACKS
INSERT INTO feedbacks (user_id, category, content, submitted_at, status) VALUES
(5, 1, 'Đề xuất tăng cường bảo vệ', NOW(), 0),
(5, 3, 'Khen ngợi dịch vụ vệ sinh', NOW(), 1);

-- Cập nhật feedback đã được phản hồi
UPDATE feedbacks SET response = 'Cảm ơn phản hồi', responded_at = NOW() WHERE id = 2;

-- 20. ACTIVITY_LOGS
INSERT INTO activity_logs (user_id, action_type, description, timestamp) VALUES
(5, 'LOGIN', 'Đăng nhập', NOW()),
(5, 'PAYMENT', 'Thanh toán hóa đơn', NOW());

-- 21. AI_QA_HISTORY
INSERT INTO ai_qa_history (user_id, question, ai_answer, asked_at, response_time, feedback) VALUES
(5, 'Làm sao đổi mật khẩu?', 'Vào phần tài khoản để đổi mật khẩu.', NOW(), 1200, 'HELPFUL'),
(5, 'Làm sao đăng ký sự kiện?', 'Chọn sự kiện và nhấn Đăng ký.', NOW(), 900, 'NOT_HELPFUL');

-- 22. SERVICE_FEE_CONFIG
INSERT INTO service_fee_config (month, year, parking_fee, service_fee_per_m2, water_fee_per_m3, created_at, updated_at) VALUES
(12, 2024, 150000.0, 5000.0, 15000.0, NOW(), NOW());

-- 23. WATER_METER_READINGS (Chỉ số nước tháng hiện tại)
INSERT INTO water_meter_readings (apartment_id, reading_month, previous_reading, current_reading, consumption, created_at) VALUES
(1, '2024-12', 0.00, 0.00, 0.00, NOW()),
(3, '2024-12', 0.00, 0.00, 0.00, NOW()),
(5, '2024-12', 0.00, 0.00, 0.00, NOW()),
(7, '2024-12', 0.00, 0.00, 0.00, NOW()),
(9, '2024-12', 0.00, 0.00, 0.00, NOW()),
(11, '2024-12', 0.00, 0.00, 0.00, NOW()),
(13, '2024-12', 0.00, 0.00, 0.00, NOW()),
(15, '2024-12', 0.00, 0.00, 0.00, NOW()),
(17, '2024-12', 0.00, 0.00, 0.00, NOW()),
(19, '2024-12', 0.00, 0.00, 0.00, NOW()),
(21, '2024-12', 0.00, 0.00, 0.00, NOW()),
(23, '2024-12', 0.00, 0.00, 0.00, NOW()),
(25, '2024-12', 0.00, 0.00, 0.00, NOW()),
(27, '2024-12', 0.00, 0.00, 0.00, NOW()),
(29, '2024-12', 0.00, 0.00, 0.00, NOW());

-- =====================================================
-- CẬP NHẬT DỮ LIỆU THEO DATAINITIALIZER.JAVA
-- =====================================================

-- Cập nhật thêm invoice items cho tất cả invoices
INSERT INTO invoice_items (invoice_id, fee_type, description, amount) VALUES
(4, 'ELECTRICITY', 'Phí điện', 300000.0),
(4, 'WATER', 'Phí nước', 200000.0),
(4, 'PARKING', 'Phí giữ xe', 150000.0),
(4, 'INTERNET', 'Phí mạng', 100000.0),
(4, 'MAINTENANCE', 'Phí bảo trì', 250000.0),
(5, 'ELECTRICITY', 'Phí điện', 300000.0),
(5, 'WATER', 'Phí nước', 200000.0),
(5, 'PARKING', 'Phí giữ xe', 150000.0),
(5, 'INTERNET', 'Phí mạng', 100000.0),
(5, 'MAINTENANCE', 'Phí bảo trì', 250000.0),
(6, 'ELECTRICITY', 'Phí điện', 300000.0),
(6, 'WATER', 'Phí nước', 200000.0),
(6, 'PARKING', 'Phí giữ xe', 150000.0),
(6, 'INTERNET', 'Phí mạng', 100000.0),
(6, 'MAINTENANCE', 'Phí bảo trì', 250000.0),
(7, 'ELECTRICITY', 'Phí điện', 300000.0),
(7, 'WATER', 'Phí nước', 200000.0),
(7, 'PARKING', 'Phí giữ xe', 150000.0),
(7, 'INTERNET', 'Phí mạng', 100000.0),
(7, 'MAINTENANCE', 'Phí bảo trì', 250000.0),
(8, 'ELECTRICITY', 'Phí điện', 300000.0),
(8, 'WATER', 'Phí nước', 200000.0),
(8, 'PARKING', 'Phí giữ xe', 150000.0),
(8, 'INTERNET', 'Phí mạng', 100000.0),
(8, 'MAINTENANCE', 'Phí bảo trì', 250000.0);

-- Thêm payments cho tất cả paid invoices
INSERT INTO payments (invoice_id, paid_by_user_id, amount, payment_method, payment_date, status, reference_code, created_at) VALUES
(2, 5, 900000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 10 DAY), 'SUCCESS', 'TXN2', NOW());

-- Thêm facility bookings cho Phạm Thị D (user_id = 8)
INSERT INTO facility_bookings (facility_id, user_id, booking_time, duration, status, number_of_people, purpose, created_at) VALUES
(3, 8, DATE_ADD(NOW(), INTERVAL 2 DAY), 90, 'CONFIRMED', 3, 'Họp gia đình', NOW()),
(4, 8, DATE_ADD(NOW(), INTERVAL 3 DAY), 60, 'PENDING', 5, 'Chơi tennis', NOW());

-- Cập nhật facility booking được approved
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 6; 