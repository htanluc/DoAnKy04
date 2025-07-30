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
    avatar_url VARCHAR(500),
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
    resident_id BIGINT NOT NULL,  -- Sửa từ user_id thành resident_id
    relation_type VARCHAR(50) NOT NULL,
    move_in_date DATE,
    move_out_date DATE,
    PRIMARY KEY (apartment_id, resident_id),
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
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

-- 24. FEEDBACK_CATEGORIES (Danh mục phản hồi)
CREATE TABLE IF NOT EXISTS feedback_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 25. SERVICE_FEE_CONFIG (Cấu hình phí dịch vụ, nước, gửi xe)
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

-- 26. WATER_METER_READINGS (Chỉ số nước)
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

-- 27. ANNOUNCEMENT_READS table
CREATE TABLE announcement_reads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_announcement_user (announcement_id, user_id)
) COMMENT '27. ANNOUNCEMENT_READS - Track which users have read which announcements';

-- 28. EMERGENCY_CONTACTS table
CREATE TABLE emergency_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resident_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
) COMMENT '28. EMERGENCY_CONTACTS - Emergency contact information for residents';

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
CREATE INDEX idx_apartment_residents_resident_id ON apartment_residents(resident_id);

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
-- Admin users
('admin', 'admin@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234567', 'ACTIVE', NOW(), NOW()),
('manager', 'manager@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234568', 'ACTIVE', NOW(), NOW()),
('supervisor', 'supervisor@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234569', 'ACTIVE', NOW(), NOW()),

-- Staff users
('staff1', 'staff1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234570', 'ACTIVE', NOW(), NOW()),
('staff2', 'staff2@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234571', 'ACTIVE', NOW(), NOW()),
('staff3', 'staff3@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234572', 'INACTIVE', NOW(), NOW()),
('staff4', 'staff4@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234573', 'LOCKED', NOW(), NOW()),

-- Resident users - Active
('resident1', 'nguyenvanA@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234574', 'ACTIVE', NOW(), NOW()),
('resident2', 'tranthiB@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234575', 'ACTIVE', NOW(), NOW()),
('resident3', 'levanC@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234576', 'ACTIVE', NOW(), NOW()),
('resident4', 'phamthiD@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234577', 'ACTIVE', NOW(), NOW()),
('resident5', 'hoangvanE@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234578', 'ACTIVE', NOW(), NOW()),
('resident6', 'dangthiF@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234579', 'ACTIVE', NOW(), NOW()),
('resident7', 'vuthiG@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234580', 'ACTIVE', NOW(), NOW()),
('resident8', 'nguyenthiH@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234581', 'ACTIVE', NOW(), NOW()),
('resident9', 'tranvanI@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234582', 'ACTIVE', NOW(), NOW()),
('resident10', 'levanJ@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234583', 'ACTIVE', NOW(), NOW()),

-- Resident users - Different statuses
('resident_locked', 'locked@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234584', 'LOCKED', NOW(), NOW()),
('resident_inactive', 'inactive@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234585', 'INACTIVE', NOW(), NOW()),
('resident_suspended', 'suspended@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234586', 'SUSPENDED', NOW(), NOW()),
('resident_pending', 'pending@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234587', 'PENDING', NOW(), NOW()),

-- Technician users
('technician1', 'technician1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234588', 'ACTIVE', NOW(), NOW()),
('technician2', 'technician2@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234589', 'ACTIVE', NOW(), NOW()),
('technician3', 'technician3@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234590', 'INACTIVE', NOW(), NOW()),

-- Cleaner users
('cleaner1', 'cleaner1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234591', 'ACTIVE', NOW(), NOW()),
('cleaner2', 'cleaner2@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234592', 'ACTIVE', NOW(), NOW()),
('cleaner3', 'cleaner3@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234593', 'LOCKED', NOW(), NOW()),

-- Security users
('security1', 'security1@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234594', 'ACTIVE', NOW(), NOW()),
('security2', 'security2@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234595', 'ACTIVE', NOW(), NOW()),
('security3', 'security3@apartment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234596', 'INACTIVE', NOW(), NOW());

-- 3. USER_ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
-- Admin roles
(1, 1), -- admin -> ADMIN
(2, 1), -- manager -> ADMIN
(3, 1), -- supervisor -> ADMIN

-- Staff roles
(4, 2), -- staff1 -> STAFF
(5, 2), -- staff2 -> STAFF
(6, 2), -- staff3 -> STAFF
(7, 2), -- staff4 -> STAFF

-- Resident roles - Active
(8, 3), -- resident1 -> RESIDENT
(9, 3), -- resident2 -> RESIDENT
(10, 3), -- resident3 -> RESIDENT
(11, 3), -- resident4 -> RESIDENT
(12, 3), -- resident5 -> RESIDENT
(13, 3), -- resident6 -> RESIDENT
(14, 3), -- resident7 -> RESIDENT
(15, 3), -- resident8 -> RESIDENT
(16, 3), -- resident9 -> RESIDENT
(17, 3), -- resident10 -> RESIDENT

-- Resident roles - Different statuses
(18, 3), -- resident_locked -> RESIDENT
(19, 3), -- resident_inactive -> RESIDENT
(20, 3), -- resident_suspended -> RESIDENT
(21, 3), -- resident_pending -> RESIDENT

-- Technician roles
(22, 4), -- technician1 -> TECHNICIAN
(23, 4), -- technician2 -> TECHNICIAN
(24, 4), -- technician3 -> TECHNICIAN

-- Cleaner roles
(25, 5), -- cleaner1 -> CLEANER
(26, 5), -- cleaner2 -> CLEANER
(27, 5), -- cleaner3 -> CLEANER

-- Security roles
(28, 6), -- security1 -> SECURITY
(29, 6), -- security2 -> SECURITY
(30, 6); -- security3 -> SECURITY

-- 4. BUILDINGS
INSERT INTO buildings (building_name, address, floors, description) VALUES
('Tòa A', '123 Đường ABC, Quận 1, TP.HCM', 20, 'Tòa nhà cao cấp với đầy đủ tiện ích'),
('Tòa B', '456 Đường XYZ, Quận 2, TP.HCM', 15, 'Tòa nhà trung cấp phù hợp gia đình'),
('Tòa C', '789 Đường DEF, Quận 3, TP.HCM', 25, 'Tòa nhà cao cấp view đẹp');

-- 5. APARTMENTS
INSERT INTO apartments (building_id, floor_number, unit_number, area, status) VALUES
-- Tòa A (20 căn hộ)
(1, 1, 'A1-01', 80.0, 'OCCUPIED'),
(1, 1, 'A1-02', 85.0, 'OCCUPIED'),
(1, 1, 'A1-03', 90.0, 'VACANT'),
(1, 1, 'A1-04', 95.0, 'OCCUPIED'),
(1, 2, 'A2-01', 80.0, 'VACANT'),
(1, 2, 'A2-02', 85.0, 'OCCUPIED'),
(1, 2, 'A2-03', 90.0, 'OCCUPIED'),
(1, 2, 'A2-04', 95.0, 'VACANT'),
(1, 3, 'A3-01', 80.0, 'OCCUPIED'),
(1, 3, 'A3-02', 85.0, 'VACANT'),
(1, 3, 'A3-03', 90.0, 'OCCUPIED'),
(1, 3, 'A3-04', 95.0, 'OCCUPIED'),
(1, 4, 'A4-01', 80.0, 'OCCUPIED'),
(1, 4, 'A4-02', 85.0, 'OCCUPIED'),
(1, 4, 'A4-03', 90.0, 'VACANT'),
(1, 4, 'A4-04', 95.0, 'OCCUPIED'),
(1, 5, 'A5-01', 80.0, 'VACANT'),
(1, 5, 'A5-02', 85.0, 'OCCUPIED'),
(1, 5, 'A5-03', 90.0, 'OCCUPIED'),
(1, 5, 'A5-04', 95.0, 'VACANT'),

-- Tòa B (15 căn hộ)
(2, 1, 'B1-01', 70.0, 'OCCUPIED'),
(2, 1, 'B1-02', 75.0, 'VACANT'),
(2, 1, 'B1-03', 80.0, 'OCCUPIED'),
(2, 2, 'B2-01', 70.0, 'OCCUPIED'),
(2, 2, 'B2-02', 75.0, 'OCCUPIED'),
(2, 2, 'B2-03', 80.0, 'VACANT'),
(2, 3, 'B3-01', 70.0, 'VACANT'),
(2, 3, 'B3-02', 75.0, 'OCCUPIED'),
(2, 3, 'B3-03', 80.0, 'OCCUPIED'),
(2, 4, 'B4-01', 70.0, 'OCCUPIED'),
(2, 4, 'B4-02', 75.0, 'VACANT'),
(2, 4, 'B4-03', 80.0, 'OCCUPIED'),
(2, 5, 'B5-01', 70.0, 'OCCUPIED'),
(2, 5, 'B5-02', 75.0, 'OCCUPIED'),
(2, 5, 'B5-03', 80.0, 'VACANT'),

-- Tòa C (15 căn hộ)
(3, 1, 'C1-01', 95.0, 'OCCUPIED'),
(3, 1, 'C1-02', 100.0, 'VACANT'),
(3, 1, 'C1-03', 105.0, 'OCCUPIED'),
(3, 2, 'C2-01', 95.0, 'OCCUPIED'),
(3, 2, 'C2-02', 100.0, 'OCCUPIED'),
(3, 2, 'C2-03', 105.0, 'VACANT'),
(3, 3, 'C3-01', 95.0, 'VACANT'),
(3, 3, 'C3-02', 100.0, 'OCCUPIED'),
(3, 3, 'C3-03', 105.0, 'OCCUPIED'),
(3, 4, 'C4-01', 95.0, 'OCCUPIED'),
(3, 4, 'C4-02', 100.0, 'OCCUPIED'),
(3, 4, 'C4-03', 105.0, 'VACANT'),
(3, 5, 'C5-01', 95.0, 'VACANT'),
(3, 5, 'C5-02', 100.0, 'OCCUPIED'),
(3, 5, 'C5-03', 105.0, 'OCCUPIED');

-- 6. RESIDENTS
INSERT INTO residents (user_id, full_name, date_of_birth, id_card_number, family_relation, status) VALUES
-- Active residents
(8, 'Nguyễn Văn A', '1985-03-15', '123456789012', 'Chủ hộ', 1),
(9, 'Trần Thị B', '1986-04-16', '123456789013', 'Chủ hộ', 1),
(10, 'Lê Văn C', '1987-05-17', '123456789014', 'Chủ hộ', 1),
(11, 'Phạm Thị D', '1988-06-18', '123456789015', 'Chủ hộ', 1),
(12, 'Hoàng Văn E', '1989-07-19', '123456789016', 'Chủ hộ', 1),
(13, 'Đặng Thị F', '1990-08-20', '123456789017', 'Chủ hộ', 1),
(14, 'Vũ Thị G', '1991-09-21', '123456789018', 'Chủ hộ', 1),
(15, 'Nguyễn Thị H', '1992-10-22', '123456789019', 'Chủ hộ', 1),
(16, 'Trần Văn I', '1993-11-23', '123456789020', 'Chủ hộ', 1),
(17, 'Lê Văn J', '1994-12-24', '123456789021', 'Chủ hộ', 1),

-- Residents with different statuses
(18, 'Nguyễn Văn Locked', '1990-01-01', '999999999999', 'Chủ hộ', 0),
(19, 'Trần Thị Inactive', '1991-02-02', '888888888888', 'Chủ hộ', 0),
(20, 'Lê Văn Suspended', '1992-03-03', '777777777777', 'Chủ hộ', 0),
(21, 'Phạm Thị Pending', '1993-04-04', '666666666666', 'Chủ hộ', 0);

-- 7. APARTMENT_RESIDENTS
INSERT INTO apartment_residents (apartment_id, resident_id, relation_type, move_in_date) VALUES
-- Active residents with apartments
(1, 8, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 6 MONTH)),
(2, 9, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 7 MONTH)),
(4, 10, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 8 MONTH)),
(6, 11, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 9 MONTH)),
(8, 12, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 10 MONTH)),
(10, 13, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 11 MONTH)),
(12, 14, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 12 MONTH)),
(14, 15, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 13 MONTH)),
(16, 16, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 14 MONTH)),
(18, 17, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 15 MONTH)),

-- Residents with different statuses (no apartment assignment)
-- (18, 18, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 16 MONTH)), -- Locked resident
-- (19, 19, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 17 MONTH)), -- Inactive resident
-- (20, 20, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 18 MONTH)), -- Suspended resident
-- (21, 21, 'OWNER', DATE_SUB(CURDATE(), INTERVAL 19 MONTH)); -- Pending resident

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

-- 11. ANNOUNCEMENTS - Diverse announcements for different scenarios
INSERT INTO announcements (title, content, type, target_audience, created_by, is_active, created_at) VALUES
-- Regular announcements
('Thông báo bảo trì thang máy', 'Thang máy tòa A sẽ được bảo trì từ 8:00-12:00 ngày 15/12/2024. Vui lòng sử dụng thang máy khác.', 'REGULAR', 'ALL', 1, 1, NOW()),
('Thông báo về phí dịch vụ', 'Phí dịch vụ tháng 12/2024 sẽ tăng 5% do chi phí điện nước tăng. Vui lòng thanh toán đúng hạn.', 'REGULAR', 'ALL', 1, 1, NOW()),
('Bảo trì hệ thống nước', 'Hệ thống nước sẽ được bảo trì từ 14:00-18:00 ngày 25/12/2024. Vui lòng dự trữ nước.', 'REGULAR', 'ALL', 1, 1, NOW()),
('Thông báo về an ninh', 'Tăng cường an ninh vào ban đêm từ 22:00-06:00. Vui lòng báo cáo người lạ cho bảo vệ.', 'REGULAR', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Thông báo về wifi', 'Hệ thống wifi sẽ được nâng cấp từ 23:00-02:00 ngày 18/12/2024. Có thể bị gián đoạn tạm thời.', 'REGULAR', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Thông báo về rác thải', 'Vui lòng phân loại rác thải đúng quy định. Rác tái chế thu gom vào thứ 2 và thứ 5 hàng tuần.', 'REGULAR', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Urgent announcements
('Thông báo khẩn: Mất điện', 'Sẽ có kế hoạch cắt điện bảo trì từ 22:00-06:00 ngày 20/12/2024. Vui lòng chuẩn bị đèn pin.', 'URGENT', 'ALL', 1, 1, NOW()),
('Thông báo khẩn: Sự cố nước', 'Có sự cố rò rỉ nước tại tầng 5. Vui lòng tránh sử dụng nước trong 2 giờ tới.', 'URGENT', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Thông báo khẩn: Thang máy hỏng', 'Thang máy tòa B bị hỏng, đang sửa chữa. Vui lòng sử dụng thang máy tòa A hoặc cầu thang bộ.', 'URGENT', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Event announcements
('Sự kiện Tết 2025', 'Chương trình đón Tết 2025 sẽ diễn ra tại sảnh chính từ 18:00-22:00 ngày 30/12/2024. Mời tất cả cư dân tham gia.', 'EVENT', 'ALL', 1, 1, NOW()),
('Sự kiện Giáng sinh', 'Tiệc Giáng sinh sẽ diễn ra vào ngày 24/12/2024 từ 18:00-22:00 tại sảnh chính.', 'EVENT', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Họp cư dân tháng 12', 'Họp cư dân định kỳ sẽ diễn ra vào ngày 15/12/2024 từ 19:00-21:00 tại phòng sinh hoạt cộng đồng.', 'EVENT', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Lớp yoga miễn phí', 'Lớp yoga miễn phí cho cư dân sẽ diễn ra vào Chủ nhật hàng tuần từ 7:00-8:30 tại phòng gym.', 'EVENT', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Workshop nấu ăn', 'Workshop nấu ăn truyền thống Việt Nam sẽ diễn ra vào ngày 28/12/2024 từ 14:00-17:00 tại khu BBQ.', 'EVENT', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Maintenance announcements
('Bảo trì hệ thống điện', 'Hệ thống điện sẽ được bảo trì từ 23:00-02:00 ngày 22/12/2024. Vui lòng chuẩn bị đèn pin.', 'REGULAR', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 6 DAY)),
('Bảo trì hệ thống thông gió', 'Hệ thống thông gió sẽ được bảo trì từ 9:00-17:00 ngày 26/12/2024.', 'REGULAR', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
('Bảo trì camera an ninh', 'Hệ thống camera an ninh sẽ được bảo trì từ 2:00-4:00 ngày 27/12/2024.', 'REGULAR', 'ALL', 1, 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),

-- Inactive announcements (for testing)
('Thông báo cũ - không hoạt động', 'Thông báo này đã hết hạn và không còn hoạt động.', 'REGULAR', 'ALL', 1, 0, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('Sự kiện đã qua - không hoạt động', 'Sự kiện này đã diễn ra và không còn hoạt động.', 'EVENT', 'ALL', 1, 0, DATE_SUB(NOW(), INTERVAL 15 DAY));

-- 12. EVENTS - Diverse events for different scenarios
INSERT INTO events (title, description, start_time, end_time, location, created_at) VALUES
-- Upcoming events
('Tiệc Giáng sinh 2024', 'Tiệc Giáng sinh cho cư dân với nhiều hoạt động vui nhộn, có quà tặng và tiệc buffet', '2024-12-24 18:00:00', '2024-12-24 22:00:00', 'Sảnh chính tòa A', NOW()),
('Họp cư dân tháng 12', 'Họp cư dân định kỳ để thảo luận các vấn đề chung và kế hoạch năm 2025', '2024-12-15 19:00:00', '2024-12-15 21:00:00', 'Phòng sinh hoạt cộng đồng', NOW()),
('Lớp yoga miễn phí', 'Lớp yoga miễn phí cho cư dân mỗi sáng Chủ nhật, phù hợp cho mọi lứa tuổi', '2024-12-22 07:00:00', '2024-12-22 08:30:00', 'Phòng gym', NOW()),
('Workshop nấu ăn', 'Workshop nấu ăn truyền thống Việt Nam với đầu bếp chuyên nghiệp', '2024-12-28 14:00:00', '2024-12-28 17:00:00', 'Khu BBQ', NOW()),
('Giải tennis cư dân', 'Giải đấu tennis thường niên cho cư dân với giải thưởng hấp dẫn', '2024-12-29 08:00:00', '2024-12-29 18:00:00', 'Sân tennis', NOW()),

-- Future events
('Tiệc Tết 2025', 'Tiệc đón năm mới 2025 với chương trình văn nghệ và pháo hoa', '2025-01-01 18:00:00', '2025-01-01 23:00:00', 'Sảnh chính tòa A', NOW()),
('Hội thảo đầu tư', 'Hội thảo về đầu tư bất động sản và quản lý tài chính cá nhân', '2025-01-10 14:00:00', '2025-01-10 17:00:00', 'Phòng họp lớn', NOW()),
('Lớp học bơi', 'Lớp học bơi cơ bản cho trẻ em từ 6-12 tuổi', '2025-01-15 09:00:00', '2025-01-15 11:00:00', 'Hồ bơi', NOW()),
('Chợ phiên cuối tuần', 'Chợ phiên bán các sản phẩm thủ công và nông sản sạch', '2025-01-18 08:00:00', '2025-01-18 16:00:00', 'Sân chung', NOW()),
('Lễ hội mùa xuân', 'Lễ hội mùa xuân với các hoạt động văn hóa truyền thống', '2025-02-01 09:00:00', '2025-02-01 18:00:00', 'Khu vực chung', NOW()),

-- Past events (for testing history)
('Tiệc Halloween 2024', 'Tiệc Halloween cho cư dân với trang phục hóa trang', '2024-10-31 18:00:00', '2024-10-31 22:00:00', 'Sảnh chính tòa A', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
('Họp cư dân tháng 11', 'Họp cư dân định kỳ tháng 11', '2024-11-15 19:00:00', '2024-11-15 21:00:00', 'Phòng sinh hoạt cộng đồng', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
('Workshop trồng cây', 'Workshop trồng cây và chăm sóc cây cảnh', '2024-11-20 14:00:00', '2024-11-20 17:00:00', 'Khu vườn chung', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
('Giải cầu lông', 'Giải đấu cầu lông thường niên cho cư dân', '2024-11-25 08:00:00', '2024-11-25 18:00:00', 'Sân cầu lông', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
('Lễ hội trung thu', 'Lễ hội trung thu cho trẻ em với múa lân và phá cỗ', '2024-09-15 18:00:00', '2024-09-15 22:00:00', 'Sân chung', DATE_SUB(NOW(), INTERVAL 3 MONTH));

-- 13. EVENT_REGISTRATIONS - Diverse event registrations for different scenarios
INSERT INTO event_registrations (event_id, resident_id, status, registered_at) VALUES
-- Christmas Party registrations (event_id = 1)
(1, 1, 'REGISTERED', NOW()),
(1, 2, 'ATTENDED', NOW()),
(1, 3, 'CANCELLED', NOW()),
(1, 4, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 5, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 6, 'NO_SHOW', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Resident Meeting registrations (event_id = 2)
(2, 1, 'REGISTERED', NOW()),
(2, 2, 'ATTENDED', NOW()),
(2, 7, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 8, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 9, 'CANCELLED', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Yoga Class registrations (event_id = 3)
(3, 3, 'REGISTERED', NOW()),
(3, 4, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 5, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 10, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 11, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Cooking Workshop registrations (event_id = 4)
(4, 6, 'REGISTERED', NOW()),
(4, 7, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 8, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 12, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 13, 'CANCELLED', DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Tennis Tournament registrations (event_id = 5)
(5, 9, 'REGISTERED', NOW()),
(5, 10, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 11, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 14, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- New Year Party registrations (event_id = 6)
(6, 1, 'REGISTERED', NOW()),
(6, 2, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 3, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 4, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 5, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(6, 6, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Investment Seminar registrations (event_id = 7)
(7, 7, 'REGISTERED', NOW()),
(7, 8, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 9, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Swimming Class registrations (event_id = 8)
(8, 10, 'REGISTERED', NOW()),
(8, 11, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 12, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Weekend Market registrations (event_id = 9)
(9, 13, 'REGISTERED', NOW()),
(9, 14, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(9, 1, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(9, 2, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Spring Festival registrations (event_id = 10)
(10, 3, 'REGISTERED', NOW()),
(10, 4, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(10, 5, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10, 6, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(10, 7, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Past events registrations (for testing history)
-- Halloween Party (event_id = 11)
(11, 1, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(11, 2, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(11, 3, 'NO_SHOW', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(11, 4, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 2 MONTH)),

-- November Meeting (event_id = 12)
(12, 1, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(12, 2, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(12, 5, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(12, 6, 'NO_SHOW', DATE_SUB(NOW(), INTERVAL 1 MONTH)),

-- Plant Workshop (event_id = 13)
(13, 7, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(13, 8, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(13, 9, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),

-- Badminton Tournament (event_id = 14)
(14, 10, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(14, 11, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(14, 12, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 1 MONTH)),

-- Mid-Autumn Festival (event_id = 15)
(15, 13, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
(15, 14, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
(15, 1, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
(15, 2, 'ATTENDED', DATE_SUB(NOW(), INTERVAL 3 MONTH));

-- 14. FACILITY_BOOKINGS - Diverse facility bookings for different scenarios
INSERT INTO facility_bookings (facility_id, user_id, booking_time, duration, status, number_of_people, purpose, created_at) VALUES
-- Gym bookings (facility_id = 1)
(1, 8, DATE_ADD(NOW(), INTERVAL 1 DAY), 60, 'PENDING', 2, 'Tập thể dục cá nhân', NOW()),
(1, 9, DATE_ADD(NOW(), INTERVAL 2 DAY), 60, 'REJECTED', 4, 'Tập thể dục nhóm', NOW()),
(1, 10, DATE_ADD(NOW(), INTERVAL 3 DAY), 90, 'CONFIRMED', 1, 'Tập yoga', NOW()),
(1, 11, DATE_ADD(NOW(), INTERVAL 4 DAY), 60, 'PENDING', 3, 'Tập cardio', NOW()),
(1, 12, DATE_ADD(NOW(), INTERVAL 5 DAY), 120, 'CONFIRMED', 2, 'Tập thể hình', NOW()),

-- Swimming pool bookings (facility_id = 2)
(2, 13, DATE_ADD(NOW(), INTERVAL 1 DAY), 90, 'CONFIRMED', 6, 'Bơi lội gia đình', NOW()),
(2, 14, DATE_ADD(NOW(), INTERVAL 2 DAY), 60, 'PENDING', 4, 'Bơi lội nhóm', NOW()),
(2, 8, DATE_ADD(NOW(), INTERVAL 3 DAY), 120, 'REJECTED', 8, 'Tiệc bể bơi', NOW()),
(2, 9, DATE_ADD(NOW(), INTERVAL 4 DAY), 90, 'CONFIRMED', 3, 'Bơi lội cá nhân', NOW()),
(2, 10, DATE_ADD(NOW(), INTERVAL 5 DAY), 60, 'PENDING', 5, 'Lớp học bơi', NOW()),

-- Meeting room bookings (facility_id = 3)
(3, 8, DATE_ADD(NOW(), INTERVAL 2 DAY), 90, 'CONFIRMED', 3, 'Họp gia đình', NOW()),
(3, 11, DATE_ADD(NOW(), INTERVAL 3 DAY), 120, 'PENDING', 5, 'Họp công ty', NOW()),
(3, 12, DATE_ADD(NOW(), INTERVAL 4 DAY), 60, 'CONFIRMED', 2, 'Họp nhóm', NOW()),
(3, 13, DATE_ADD(NOW(), INTERVAL 5 DAY), 90, 'PENDING', 4, 'Thuyết trình', NOW()),
(3, 14, DATE_ADD(NOW(), INTERVAL 6 DAY), 180, 'REJECTED', 10, 'Hội thảo', NOW()),

-- Tennis court bookings (facility_id = 4)
(4, 8, DATE_ADD(NOW(), INTERVAL 3 DAY), 60, 'PENDING', 5, 'Chơi tennis', NOW()),
(4, 9, DATE_ADD(NOW(), INTERVAL 4 DAY), 90, 'CONFIRMED', 4, 'Đấu tennis', NOW()),
(4, 10, DATE_ADD(NOW(), INTERVAL 5 DAY), 120, 'PENDING', 6, 'Giải tennis', NOW()),
(4, 11, DATE_ADD(NOW(), INTERVAL 6 DAY), 60, 'CONFIRMED', 2, 'Tập tennis', NOW()),
(4, 12, DATE_ADD(NOW(), INTERVAL 7 DAY), 90, 'PENDING', 4, 'Chơi tennis nhóm', NOW()),

-- BBQ area bookings (facility_id = 5)
(5, 13, DATE_ADD(NOW(), INTERVAL 2 DAY), 180, 'CONFIRMED', 8, 'Tiệc BBQ gia đình', NOW()),
(5, 14, DATE_ADD(NOW(), INTERVAL 3 DAY), 120, 'PENDING', 6, 'Tiệc sinh nhật', NOW()),
(5, 8, DATE_ADD(NOW(), INTERVAL 4 DAY), 240, 'REJECTED', 15, 'Tiệc công ty', NOW()),
(5, 9, DATE_ADD(NOW(), INTERVAL 5 DAY), 180, 'CONFIRMED', 10, 'Tiệc cuối tuần', NOW()),
(5, 10, DATE_ADD(NOW(), INTERVAL 6 DAY), 120, 'PENDING', 4, 'BBQ nhỏ', NOW()),

-- Past bookings (for testing history)
(1, 8, DATE_SUB(NOW(), INTERVAL 1 DAY), 60, 'COMPLETED', 2, 'Tập thể dục', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 9, DATE_SUB(NOW(), INTERVAL 2 DAY), 90, 'COMPLETED', 3, 'Tập yoga', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 10, DATE_SUB(NOW(), INTERVAL 1 DAY), 90, 'COMPLETED', 4, 'Bơi lội', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 11, DATE_SUB(NOW(), INTERVAL 2 DAY), 120, 'COMPLETED', 5, 'Họp nhóm', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 12, DATE_SUB(NOW(), INTERVAL 1 DAY), 90, 'COMPLETED', 4, 'Chơi tennis', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 13, DATE_SUB(NOW(), INTERVAL 3 DAY), 180, 'COMPLETED', 8, 'Tiệc BBQ', DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Cancelled bookings
(1, 14, DATE_ADD(NOW(), INTERVAL 7 DAY), 60, 'CANCELLED', 2, 'Tập thể dục', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 8, DATE_ADD(NOW(), INTERVAL 8 DAY), 90, 'CANCELLED', 4, 'Bơi lội', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 9, DATE_ADD(NOW(), INTERVAL 9 DAY), 120, 'CANCELLED', 6, 'Họp công ty', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Update approved bookings
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 3;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 5;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 7;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 9;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 11;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 13;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 15;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 17;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 19;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 21;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 23;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 25;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 27;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 29;
UPDATE facility_bookings SET approved_by = 1, approved_at = NOW() WHERE id = 31;

-- 15. INVOICES - Diverse statuses for testing
INSERT INTO invoices (apartment_id, billing_period, issue_date, due_date, total_amount, status, created_at, updated_at) VALUES
-- Apartment 1 - Multiple invoices with different statuses
(1, '2024-11', '2024-11-01', '2024-11-15', 1000000.0, 'UNPAID', NOW(), NOW()),
(1, '2024-10', '2024-10-01', '2024-10-15', 900000.0, 'PAID', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(1, '2024-09', '2024-09-01', '2024-09-15', 1200000.0, 'OVERDUE', DATE_SUB(NOW(), INTERVAL 3 MONTH), DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(1, '2024-08', '2024-08-01', '2024-08-15', 850000.0, 'PAID', DATE_SUB(NOW(), INTERVAL 4 MONTH), DATE_SUB(NOW(), INTERVAL 3 MONTH)),

-- Apartment 2 - Different payment patterns
(2, '2024-11', '2024-11-01', '2024-11-15', 950000.0, 'PAID', NOW(), NOW()),
(2, '2024-10', '2024-10-01', '2024-10-15', 950000.0, 'PAID', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(2, '2024-09', '2024-09-01', '2024-09-15', 950000.0, 'PAID', DATE_SUB(NOW(), INTERVAL 3 MONTH), DATE_SUB(NOW(), INTERVAL 2 MONTH)),

-- Apartment 4 - Overdue payments
(4, '2024-11', '2024-11-01', '2024-11-15', 1100000.0, 'OVERDUE', NOW(), NOW()),
(4, '2024-10', '2024-10-01', '2024-10-15', 1100000.0, 'OVERDUE', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(4, '2024-09', '2024-09-01', '2024-09-15', 1100000.0, 'PAID', DATE_SUB(NOW(), INTERVAL 3 MONTH), DATE_SUB(NOW(), INTERVAL 2 MONTH)),

-- Apartment 6 - Mixed statuses
(6, '2024-11', '2024-11-01', '2024-11-15', 1050000.0, 'UNPAID', NOW(), NOW()),
(6, '2024-10', '2024-10-01', '2024-10-15', 1050000.0, 'PAID', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH)),

-- Apartment 8 - All unpaid
(8, '2024-11', '2024-11-01', '2024-11-15', 1150000.0, 'UNPAID', NOW(), NOW()),
(8, '2024-10', '2024-10-01', '2024-10-15', 1150000.0, 'UNPAID', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH)),

-- Apartment 10 - All paid
(10, '2024-11', '2024-11-01', '2024-11-15', 980000.0, 'PAID', NOW(), NOW()),
(10, '2024-10', '2024-10-01', '2024-10-15', 980000.0, 'PAID', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH)),

-- Apartment 12 - Overdue
(12, '2024-11', '2024-11-01', '2024-11-15', 1020000.0, 'OVERDUE', NOW(), NOW()),
(12, '2024-10', '2024-10-01', '2024-10-15', 1020000.0, 'OVERDUE', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH)),

-- Apartment 14 - Mixed
(14, '2024-11', '2024-11-01', '2024-11-15', 1080000.0, 'UNPAID', NOW(), NOW()),
(14, '2024-10', '2024-10-01', '2024-10-15', 1080000.0, 'PAID', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH)),

-- Apartment 16 - All paid
(16, '2024-11', '2024-11-01', '2024-11-15', 920000.0, 'PAID', NOW(), NOW()),
(16, '2024-10', '2024-10-01', '2024-10-15', 920000.0, 'PAID', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH)),

-- Apartment 18 - Overdue
(18, '2024-11', '2024-11-01', '2024-11-15', 1250000.0, 'OVERDUE', NOW(), NOW()),
(18, '2024-10', '2024-10-01', '2024-10-15', 1250000.0, 'OVERDUE', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH));

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

-- 17. PAYMENTS - Diverse payment records for different scenarios
INSERT INTO payments (invoice_id, paid_by_user_id, amount, payment_method, payment_date, status, reference_code, created_at) VALUES
-- Successful payments for different invoices
(2, 5, 900000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 10 DAY), 'SUCCESS', 'TXN001', NOW()),
(5, 9, 950000.0, 'CREDIT_CARD', DATE_SUB(NOW(), INTERVAL 5 DAY), 'SUCCESS', 'TXN002', NOW()),
(6, 9, 950000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 15 DAY), 'SUCCESS', 'TXN003', NOW()),
(7, 9, 950000.0, 'E_WALLET', DATE_SUB(NOW(), INTERVAL 25 DAY), 'SUCCESS', 'TXN004', NOW()),
(9, 11, 1100000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 20 DAY), 'SUCCESS', 'TXN005', NOW()),
(11, 13, 1050000.0, 'CREDIT_CARD', DATE_SUB(NOW(), INTERVAL 8 DAY), 'SUCCESS', 'TXN006', NOW()),
(13, 14, 1080000.0, 'E_WALLET', DATE_SUB(NOW(), INTERVAL 12 DAY), 'SUCCESS', 'TXN007', NOW()),
(15, 16, 920000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 3 DAY), 'SUCCESS', 'TXN008', NOW()),
(16, 16, 920000.0, 'CREDIT_CARD', DATE_SUB(NOW(), INTERVAL 18 DAY), 'SUCCESS', 'TXN009', NOW()),

-- Partial payments
(1, 8, 500000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 2 DAY), 'SUCCESS', 'TXN010', NOW()),
(4, 10, 600000.0, 'E_WALLET', DATE_SUB(NOW(), INTERVAL 1 DAY), 'SUCCESS', 'TXN011', NOW()),
(8, 12, 800000.0, 'CREDIT_CARD', NOW(), 'SUCCESS', 'TXN012', NOW()),

-- Failed payments
(3, 8, 1200000.0, 'CREDIT_CARD', DATE_SUB(NOW(), INTERVAL 1 DAY), 'FAILED', 'TXN013', NOW()),
(10, 10, 1000000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 3 DAY), 'FAILED', 'TXN014', NOW()),
(12, 12, 1020000.0, 'E_WALLET', DATE_SUB(NOW(), INTERVAL 5 DAY), 'FAILED', 'TXN015', NOW()),

-- Pending payments
(17, 18, 1250000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 1 DAY), 'PENDING', 'TXN016', NOW()),
(18, 18, 1250000.0, 'CREDIT_CARD', NOW(), 'PENDING', 'TXN017', NOW()),

-- Multiple payments for same invoice (partial payments)
(1, 8, 300000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 5 DAY), 'SUCCESS', 'TXN018', NOW()),
(1, 8, 200000.0, 'E_WALLET', DATE_SUB(NOW(), INTERVAL 3 DAY), 'SUCCESS', 'TXN019', NOW()),

-- Late payments (after due date)
(3, 8, 1200000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 5 DAY), 'SUCCESS', 'TXN020', NOW()),
(10, 10, 1000000.0, 'CREDIT_CARD', DATE_SUB(NOW(), INTERVAL 2 DAY), 'SUCCESS', 'TXN021', NOW()),
(12, 12, 1020000.0, 'E_WALLET', DATE_SUB(NOW(), INTERVAL 1 DAY), 'SUCCESS', 'TXN022', NOW()),

-- Early payments (before due date)
(19, 20, 1300000.0, 'BANK_TRANSFER', DATE_SUB(NOW(), INTERVAL 10 DAY), 'SUCCESS', 'TXN023', NOW()),
(20, 20, 1300000.0, 'CREDIT_CARD', DATE_SUB(NOW(), INTERVAL 25 DAY), 'SUCCESS', 'TXN024', NOW());

-- 18. SERVICE_REQUESTS - Diverse statuses and priorities
INSERT INTO service_requests (user_id, title, category, description, submitted_at, status, priority, assigned_to) VALUES
-- Resident 1 (user_id = 8) - Multiple requests with different statuses
(8, 'Sửa ống nước bị rò rỉ', 2, 'Ống nước trong nhà bếp bị rò rỉ, cần sửa gấp', NOW(), 0, 1, 22),
(8, 'Thay bóng đèn phòng khách', 1, 'Bóng đèn phòng khách bị cháy, cần thay mới', DATE_SUB(NOW(), INTERVAL 2 DAY), 1, 2, 22),
(8, 'Dọn dẹp hành lang', 3, 'Hành lang tầng 3 có rác, cần dọn dẹp', DATE_SUB(NOW(), INTERVAL 5 DAY), 2, 3, 25),

-- Resident 2 (user_id = 9) - Completed requests
(9, 'Sửa điều hòa không lạnh', 5, 'Điều hòa phòng ngủ không lạnh, cần kiểm tra', DATE_SUB(NOW(), INTERVAL 10 DAY), 2, 1, 22),
(9, 'Kiểm tra an ninh', 4, 'Có người lạ đi lại nhiều, cần kiểm tra', DATE_SUB(NOW(), INTERVAL 15 DAY), 2, 1, 28),

-- Resident 3 (user_id = 10) - Pending requests
(10, 'Sửa thang máy', 6, 'Thang máy tòa A bị kẹt, cần sửa gấp', NOW(), 0, 1, 22),
(10, 'Chăm sóc cây xanh', 7, 'Cây xanh trước nhà bị héo, cần chăm sóc', DATE_SUB(NOW(), INTERVAL 1 DAY), 0, 3, 25),

-- Resident 4 (user_id = 11) - Mixed statuses
(11, 'Sửa ổ cắm điện', 1, 'Ổ cắm điện phòng bếp bị lỏng', DATE_SUB(NOW(), INTERVAL 3 DAY), 1, 2, 22),
(11, 'Dọn dẹp sân chung', 3, 'Sân chung có lá rụng nhiều, cần quét dọn', DATE_SUB(NOW(), INTERVAL 7 DAY), 2, 3, 25),

-- Resident 5 (user_id = 12) - High priority requests
(12, 'Sửa khóa cửa', 8, 'Khóa cửa chính bị hỏng, không mở được', NOW(), 0, 1, 22),
(12, 'Kiểm tra camera an ninh', 4, 'Camera an ninh không hoạt động', DATE_SUB(NOW(), INTERVAL 1 DAY), 0, 1, 28),

-- Resident 6 (user_id = 13) - Low priority requests
(13, 'Sửa vòi nước', 2, 'Vòi nước nhà tắm bị rò rỉ nhẹ', DATE_SUB(NOW(), INTERVAL 5 DAY), 0, 3, 22),
(13, 'Thay bóng đèn cầu thang', 1, 'Bóng đèn cầu thang tầng 2 bị cháy', DATE_SUB(NOW(), INTERVAL 8 DAY), 1, 2, 22),

-- Resident 7 (user_id = 14) - Completed with ratings
(14, 'Sửa máy bơm nước', 2, 'Máy bơm nước không hoạt động', DATE_SUB(NOW(), INTERVAL 20 DAY), 2, 1, 22),
(14, 'Dọn dẹp khu vực chung', 3, 'Khu vực chung có mùi hôi', DATE_SUB(NOW(), INTERVAL 25 DAY), 2, 2, 25),

-- Resident 8 (user_id = 15) - New requests
(15, 'Sửa cửa sổ', 8, 'Cửa sổ phòng ngủ không đóng được', NOW(), 0, 2, 22),
(15, 'Kiểm tra hệ thống điện', 1, 'Thường xuyên bị cúp điện', DATE_SUB(NOW(), INTERVAL 2 DAY), 0, 1, 22),

-- Resident 9 (user_id = 16) - Mixed priorities
(16, 'Sửa máy giặt', 8, 'Máy giặt không vắt được', DATE_SUB(NOW(), INTERVAL 4 DAY), 1, 1, 22),
(16, 'Chăm sóc cây cảnh', 7, 'Cây cảnh trong sảnh bị héo', DATE_SUB(NOW(), INTERVAL 6 DAY), 0, 3, 25),

-- Resident 10 (user_id = 17) - Emergency requests
(17, 'Sửa gas rò rỉ', 8, 'Có mùi gas trong nhà, cần kiểm tra gấp', NOW(), 0, 1, 22),
(17, 'Sửa ống nước vỡ', 2, 'Ống nước bị vỡ, nước chảy ra ngoài', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, 1, 22);

-- Update completed service requests with resolution notes and ratings
UPDATE service_requests SET 
    resolution_notes = 'Đã thay bóng đèn mới, hoạt động bình thường', 
    completed_at = DATE_SUB(NOW(), INTERVAL 1 DAY),
    rating = 5
WHERE id = 2;

UPDATE service_requests SET 
    resolution_notes = 'Đã dọn dẹp sạch sẽ, đã thông báo cho cư dân giữ gìn vệ sinh', 
    completed_at = DATE_SUB(NOW(), INTERVAL 3 DAY),
    rating = 4
WHERE id = 3;

UPDATE service_requests SET 
    resolution_notes = 'Đã sửa điều hòa, thay gas và làm sạch bộ lọc', 
    completed_at = DATE_SUB(NOW(), INTERVAL 8 DAY),
    rating = 5
WHERE id = 4;

UPDATE service_requests SET 
    resolution_notes = 'Đã kiểm tra và tăng cường tuần tra an ninh', 
    completed_at = DATE_SUB(NOW(), INTERVAL 12 DAY),
    rating = 4
WHERE id = 5;

UPDATE service_requests SET 
    resolution_notes = 'Đã sửa ổ cắm điện, hoạt động bình thường', 
    completed_at = DATE_SUB(NOW(), INTERVAL 1 DAY),
    rating = 5
WHERE id = 8;

UPDATE service_requests SET 
    resolution_notes = 'Đã dọn dẹp sạch sẽ sân chung', 
    completed_at = DATE_SUB(NOW(), INTERVAL 5 DAY),
    rating = 4
WHERE id = 9;

UPDATE service_requests SET 
    resolution_notes = 'Đã thay bóng đèn mới cho cầu thang', 
    completed_at = DATE_SUB(NOW(), INTERVAL 6 DAY),
    rating = 5
WHERE id = 12;

UPDATE service_requests SET 
    resolution_notes = 'Đã sửa máy bơm nước, thay phụ tùng mới', 
    completed_at = DATE_SUB(NOW(), INTERVAL 18 DAY),
    rating = 5
WHERE id = 13;

UPDATE service_requests SET 
    resolution_notes = 'Đã dọn dẹp và khử mùi khu vực chung', 
    completed_at = DATE_SUB(NOW(), INTERVAL 22 DAY),
    rating = 4
WHERE id = 14;

UPDATE service_requests SET 
    resolution_notes = 'Đã sửa máy giặt, thay dây curoa mới', 
    completed_at = DATE_SUB(NOW(), INTERVAL 2 DAY),
    rating = 4
WHERE id = 17;

-- 19. FEEDBACKS - Diverse feedback from different users
INSERT INTO feedbacks (user_id, category, content, submitted_at, status) VALUES
-- Resident 1 (user_id = 8) - Multiple feedbacks
(8, 1, 'Đề xuất tăng cường bảo vệ vào ban đêm', NOW(), 0),
(8, 2, 'Khen ngợi dịch vụ vệ sinh rất tốt', DATE_SUB(NOW(), INTERVAL 2 DAY), 1),
(8, 3, 'Phản ánh về tiếng ồn từ hàng xóm', DATE_SUB(NOW(), INTERVAL 5 DAY), 0),

-- Resident 2 (user_id = 9) - Positive feedback
(9, 2, 'Dịch vụ bảo trì rất nhanh và chuyên nghiệp', DATE_SUB(NOW(), INTERVAL 1 DAY), 1),
(9, 1, 'Đề xuất lắp thêm camera an ninh', DATE_SUB(NOW(), INTERVAL 3 DAY), 0),

-- Resident 3 (user_id = 10) - Mixed feedback
(10, 3, 'Phản ánh về thang máy thường xuyên bị hỏng', NOW(), 0),
(10, 2, 'Khen ngợi nhân viên bảo vệ rất nhiệt tình', DATE_SUB(NOW(), INTERVAL 4 DAY), 1),

-- Resident 4 (user_id = 11) - Suggestions
(11, 1, 'Đề xuất tăng cường wifi ở khu vực chung', DATE_SUB(NOW(), INTERVAL 1 DAY), 0),
(11, 2, 'Khen ngợi dịch vụ dọn dẹp hàng ngày', DATE_SUB(NOW(), INTERVAL 6 DAY), 1),

-- Resident 5 (user_id = 12) - Complaints
(12, 3, 'Phản ánh về mùi hôi từ hệ thống thoát nước', NOW(), 0),
(12, 1, 'Đề xuất cải thiện hệ thống chiếu sáng', DATE_SUB(NOW(), INTERVAL 2 DAY), 0),

-- Resident 6 (user_id = 13) - Positive feedback
(13, 2, 'Dịch vụ khách hàng rất tốt', DATE_SUB(NOW(), INTERVAL 3 DAY), 1),
(13, 1, 'Đề xuất tổ chức thêm các hoạt động cộng đồng', DATE_SUB(NOW(), INTERVAL 7 DAY), 0),

-- Resident 7 (user_id = 14) - Technical feedback
(14, 3, 'Phản ánh về hệ thống điện không ổn định', DATE_SUB(NOW(), INTERVAL 1 DAY), 0),
(14, 2, 'Khen ngợi đội ngũ kỹ thuật rất chuyên nghiệp', DATE_SUB(NOW(), INTERVAL 5 DAY), 1),

-- Resident 8 (user_id = 15) - General feedback
(15, 1, 'Đề xuất cải thiện hệ thống thông gió', NOW(), 0),
(15, 2, 'Khen ngợi môi trường sống rất sạch sẽ', DATE_SUB(NOW(), INTERVAL 4 DAY), 1);

-- Cập nhật feedback đã được phản hồi
UPDATE feedbacks SET response = 'Cảm ơn phản hồi, chúng tôi sẽ tăng cường bảo vệ vào ban đêm', responded_at = NOW() WHERE id = 2;
UPDATE feedbacks SET response = 'Cảm ơn phản hồi tích cực, chúng tôi sẽ duy trì chất lượng dịch vụ', responded_at = NOW() WHERE id = 4;
UPDATE feedbacks SET response = 'Cảm ơn phản hồi, chúng tôi sẽ kiểm tra và khắc phục vấn đề thang máy', responded_at = NOW() WHERE id = 6;
UPDATE feedbacks SET response = 'Cảm ơn phản hồi, chúng tôi sẽ cải thiện hệ thống wifi', responded_at = NOW() WHERE id = 8;
UPDATE feedbacks SET response = 'Cảm ơn phản hồi tích cực, chúng tôi sẽ tiếp tục nỗ lực', responded_at = NOW() WHERE id = 10;
UPDATE feedbacks SET response = 'Cảm ơn phản hồi, chúng tôi sẽ kiểm tra hệ thống thoát nước', responded_at = NOW() WHERE id = 11;
UPDATE feedbacks SET response = 'Cảm ơn phản hồi tích cực, chúng tôi sẽ tổ chức thêm hoạt động', responded_at = NOW() WHERE id = 12;
UPDATE feedbacks SET response = 'Cảm ơn phản hồi, chúng tôi sẽ kiểm tra hệ thống điện', responded_at = NOW() WHERE id = 13;
UPDATE feedbacks SET response = 'Cảm ơn phản hồi tích cực, chúng tôi sẽ duy trì môi trường sạch sẽ', responded_at = NOW() WHERE id = 16;

-- 20. ACTIVITY_LOGS - Diverse activity logs from different users
INSERT INTO activity_logs (user_id, action_type, description, timestamp) VALUES
-- Admin activities
(1, 'LOGIN', 'Đăng nhập hệ thống', NOW()),
(1, 'ANNOUNCEMENT_CREATE', 'Tạo thông báo mới về bảo trì hệ thống', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'USER_MANAGE', 'Cập nhật thông tin người dùng', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 'REPORT_VIEW', 'Xem báo cáo doanh thu tháng 12', DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Staff activities
(2, 'LOGIN', 'Đăng nhập hệ thống', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(2, 'SERVICE_REQUEST_ASSIGN', 'Phân công yêu cầu dịch vụ cho kỹ thuật viên', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 'INVOICE_CREATE', 'Tạo hóa đơn mới cho căn hộ A101', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 'FEEDBACK_RESPOND', 'Phản hồi phản hồi từ cư dân', DATE_SUB(NOW(), INTERVAL 4 HOUR)),

-- Resident activities - User 8 (Phạm Thị D)
(8, 'LOGIN', 'Đăng nhập hệ thống', NOW()),
(8, 'SERVICE_REQUEST_CREATE', 'Tạo yêu cầu sửa ống nước', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 'PAYMENT', 'Thanh toán hóa đơn tháng 11', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 'FACILITY_BOOK', 'Đặt phòng họp', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(8, 'FEEDBACK_SUBMIT', 'Gửi phản hồi về dịch vụ', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(8, 'EVENT_REGISTER', 'Đăng ký tham gia sự kiện', DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Resident activities - User 9 (Nguyễn Văn E)
(9, 'LOGIN', 'Đăng nhập hệ thống', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(9, 'SERVICE_REQUEST_CREATE', 'Tạo yêu cầu sửa điều hòa', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(9, 'PAYMENT', 'Thanh toán hóa đơn tháng 11', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(9, 'ANNOUNCEMENT_READ', 'Đọc thông báo mới', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(9, 'PROFILE_UPDATE', 'Cập nhật thông tin cá nhân', DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Resident activities - User 10 (Trần Thị F)
(10, 'LOGIN', 'Đăng nhập hệ thống', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(10, 'SERVICE_REQUEST_CREATE', 'Tạo yêu cầu sửa thang máy', NOW()),
(10, 'PAYMENT', 'Thanh toán hóa đơn tháng 11', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(10, 'FEEDBACK_SUBMIT', 'Gửi phản hồi về thang máy', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10, 'FACILITY_BOOK', 'Đặt sân tennis', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Resident activities - User 11 (Lê Văn G)
(11, 'LOGIN', 'Đăng nhập hệ thống', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(11, 'SERVICE_REQUEST_CREATE', 'Tạo yêu cầu sửa ổ cắm điện', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(11, 'PAYMENT', 'Thanh toán hóa đơn tháng 11', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(11, 'ANNOUNCEMENT_READ', 'Đọc thông báo về bảo trì', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(11, 'FEEDBACK_SUBMIT', 'Gửi đề xuất cải thiện wifi', DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Resident activities - User 12 (Phạm Thị H)
(12, 'LOGIN', 'Đăng nhập hệ thống', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(12, 'SERVICE_REQUEST_CREATE', 'Tạo yêu cầu sửa khóa cửa', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(12, 'PAYMENT', 'Thanh toán hóa đơn tháng 11', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(12, 'FEEDBACK_SUBMIT', 'Phản ánh về mùi hôi', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(12, 'EVENT_REGISTER', 'Đăng ký tham gia sự kiện', DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Technician activities - User 22 (Nguyễn Văn Kỹ Thuật)
(22, 'LOGIN', 'Đăng nhập hệ thống', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(22, 'SERVICE_REQUEST_UPDATE', 'Cập nhật trạng thái yêu cầu sửa ống nước', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(22, 'SERVICE_REQUEST_COMPLETE', 'Hoàn thành yêu cầu sửa điều hòa', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(22, 'SERVICE_REQUEST_UPDATE', 'Bắt đầu sửa ổ cắm điện', DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Cleaner activities - User 25 (Trần Thị Dọn Dẹp)
(25, 'LOGIN', 'Đăng nhập hệ thống', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(25, 'SERVICE_REQUEST_COMPLETE', 'Hoàn thành dọn dẹp hành lang', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(25, 'SERVICE_REQUEST_UPDATE', 'Bắt đầu dọn dẹp sân chung', DATE_SUB(NOW(), INTERVAL 4 HOUR)),

-- Security activities - User 28 (Lê Văn Bảo Vệ)
(28, 'LOGIN', 'Đăng nhập hệ thống', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(28, 'SERVICE_REQUEST_COMPLETE', 'Hoàn thành kiểm tra an ninh', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(28, 'SERVICE_REQUEST_UPDATE', 'Bắt đầu kiểm tra camera an ninh', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 21. AI_QA_HISTORY - Diverse AI interactions from different users
INSERT INTO ai_qa_history (user_id, question, ai_answer, asked_at, response_time, feedback) VALUES
-- Resident 1 (user_id = 8) - Multiple questions
(8, 'Làm sao đổi mật khẩu?', 'Bạn có thể vào phần Cài đặt tài khoản > Đổi mật khẩu để thay đổi mật khẩu của mình.', NOW(), 1200, 'HELPFUL'),
(8, 'Làm sao đăng ký sự kiện?', 'Để đăng ký sự kiện, bạn vào phần Sự kiện, chọn sự kiện muốn tham gia và nhấn nút "Đăng ký".', DATE_SUB(NOW(), INTERVAL 1 DAY), 900, 'HELPFUL'),
(8, 'Cách thanh toán hóa đơn online?', 'Bạn có thể thanh toán hóa đơn qua các phương thức: chuyển khoản ngân hàng, ví điện tử, hoặc thẻ tín dụng.', DATE_SUB(NOW(), INTERVAL 2 DAY), 1500, 'HELPFUL'),
(8, 'Làm sao tạo yêu cầu dịch vụ?', 'Vào phần Yêu cầu dịch vụ > Tạo yêu cầu mới, điền thông tin và gửi yêu cầu.', DATE_SUB(NOW(), INTERVAL 3 DAY), 800, 'NOT_HELPFUL'),

-- Resident 2 (user_id = 9) - Technical questions
(9, 'Hệ thống thang máy có hoạt động 24/7 không?', 'Thang máy hoạt động từ 6h sáng đến 23h tối hàng ngày. Ngoài giờ này chỉ có thang máy khẩn cấp.', DATE_SUB(NOW(), INTERVAL 1 DAY), 1100, 'HELPFUL'),
(9, 'Cách báo cáo sự cố kỹ thuật?', 'Bạn có thể báo cáo sự cố qua ứng dụng trong phần Yêu cầu dịch vụ hoặc gọi số hotline 1900-xxxx.', DATE_SUB(NOW(), INTERVAL 2 DAY), 1300, 'HELPFUL'),
(9, 'Giờ mở cửa khu vực chung?', 'Khu vực chung mở cửa từ 6h sáng đến 22h tối hàng ngày.', DATE_SUB(NOW(), INTERVAL 3 DAY), 700, 'HELPFUL'),

-- Resident 3 (user_id = 10) - Payment questions
(10, 'Hạn chót thanh toán hóa đơn là khi nào?', 'Hạn chót thanh toán hóa đơn là ngày 15 của tháng tiếp theo.', DATE_SUB(NOW(), INTERVAL 1 DAY), 1000, 'HELPFUL'),
(10, 'Có thể thanh toán trễ hạn không?', 'Có thể thanh toán trễ hạn nhưng sẽ bị tính phí trễ hạn 5% số tiền chưa thanh toán.', DATE_SUB(NOW(), INTERVAL 2 DAY), 1400, 'HELPFUL'),
(10, 'Cách xem lịch sử thanh toán?', 'Vào phần Hóa đơn > Lịch sử thanh toán để xem các giao dịch đã thực hiện.', DATE_SUB(NOW(), INTERVAL 3 DAY), 900, 'NOT_HELPFUL'),

-- Resident 4 (user_id = 11) - Facility questions
(11, 'Cách đặt phòng họp?', 'Vào phần Đặt tiện ích > Phòng họp, chọn thời gian và đặt phòng.', DATE_SUB(NOW(), INTERVAL 1 DAY), 1200, 'HELPFUL'),
(11, 'Có thể đặt sân tennis không?', 'Có thể đặt sân tennis qua ứng dụng hoặc liên hệ bảo vệ để đặt trực tiếp.', DATE_SUB(NOW(), INTERVAL 2 DAY), 1100, 'HELPFUL'),
(11, 'Giá thuê phòng gym là bao nhiêu?', 'Phòng gym miễn phí cho tất cả cư dân, chỉ cần đăng ký thẻ thành viên.', DATE_SUB(NOW(), INTERVAL 3 DAY), 800, 'HELPFUL'),

-- Resident 5 (user_id = 12) - Security questions
(12, 'Cách báo cáo người lạ?', 'Liên hệ bảo vệ qua số hotline hoặc báo cáo qua ứng dụng trong phần An ninh.', DATE_SUB(NOW(), INTERVAL 1 DAY), 1300, 'HELPFUL'),
(12, 'Hệ thống camera có ghi hình 24/7 không?', 'Hệ thống camera ghi hình 24/7 và được lưu trữ trong 30 ngày.', DATE_SUB(NOW(), INTERVAL 2 DAY), 1000, 'HELPFUL'),
(12, 'Cách đăng ký khách đến thăm?', 'Đăng ký khách qua ứng dụng hoặc báo với bảo vệ trước khi khách đến.', DATE_SUB(NOW(), INTERVAL 3 DAY), 1200, 'NOT_HELPFUL'),

-- Resident 6 (user_id = 13) - General questions
(13, 'Cách liên hệ ban quản lý?', 'Liên hệ ban quản lý qua số điện thoại 1900-xxxx hoặc email contact@apartment.com', DATE_SUB(NOW(), INTERVAL 1 DAY), 1100, 'HELPFUL'),
(13, 'Có wifi miễn phí ở khu vực chung không?', 'Có wifi miễn phí ở tất cả khu vực chung với mật khẩu được cung cấp.', DATE_SUB(NOW(), INTERVAL 2 DAY), 900, 'HELPFUL'),
(13, 'Cách đăng ký nhận thông báo?', 'Vào phần Cài đặt > Thông báo để bật/tắt các loại thông báo.', DATE_SUB(NOW(), INTERVAL 3 DAY), 800, 'HELPFUL'),

-- Resident 7 (user_id = 14) - Maintenance questions
(14, 'Lịch bảo trì định kỳ?', 'Bảo trì định kỳ được thực hiện vào ngày 15 hàng tháng, thông báo sẽ được gửi trước 3 ngày.', DATE_SUB(NOW(), INTERVAL 1 DAY), 1400, 'HELPFUL'),
(14, 'Cách báo cáo sự cố điện nước?', 'Báo cáo sự cố qua ứng dụng hoặc gọi số khẩn cấp 1900-xxxx.', DATE_SUB(NOW(), INTERVAL 2 DAY), 1200, 'HELPFUL'),
(14, 'Thời gian sửa chữa thông thường?', 'Thời gian sửa chữa thông thường từ 2-24 giờ tùy theo mức độ nghiêm trọng.', DATE_SUB(NOW(), INTERVAL 3 DAY), 1000, 'NOT_HELPFUL'),

-- Resident 8 (user_id = 15) - Event questions
(15, 'Có sự kiện gì trong tháng này?', 'Trong tháng này có sự kiện: Họp cư dân (15/12), Tiệc Giáng sinh (25/12).', DATE_SUB(NOW(), INTERVAL 1 DAY), 1300, 'HELPFUL'),
(15, 'Cách đăng ký tham gia sự kiện?', 'Vào phần Sự kiện, chọn sự kiện muốn tham gia và nhấn "Đăng ký".', DATE_SUB(NOW(), INTERVAL 2 DAY), 900, 'HELPFUL'),
(15, 'Có thể hủy đăng ký sự kiện không?', 'Có thể hủy đăng ký sự kiện trước 24 giờ diễn ra sự kiện.', DATE_SUB(NOW(), INTERVAL 3 DAY), 800, 'HELPFUL');

-- 22. SERVICE_FEE_CONFIG
INSERT INTO service_fee_config (month, year, parking_fee, service_fee_per_m2, water_fee_per_m3, created_at, updated_at) VALUES
(12, 2024, 150000.0, 5000.0, 15000.0, NOW(), NOW());

-- 23. WATER_METER_READINGS - Diverse water consumption data for different scenarios
INSERT INTO water_meter_readings (apartment_id, reading_month, previous_reading, current_reading, consumption, created_at) VALUES
-- Current month readings (December 2024)
(1, '2024-12', 1250.50, 1350.75, 100.25, NOW()),
(2, '2024-12', 980.25, 1080.50, 100.25, NOW()),
(3, '2024-12', 2100.00, 2250.30, 150.30, NOW()),
(4, '2024-12', 1750.75, 1900.25, 149.50, NOW()),
(5, '2024-12', 3200.50, 3350.80, 150.30, NOW()),
(6, '2024-12', 890.00, 990.25, 100.25, NOW()),
(7, '2024-12', 1450.30, 1600.60, 150.30, NOW()),
(8, '2024-12', 2800.75, 2950.90, 150.15, NOW()),
(9, '2024-12', 1100.50, 1200.75, 100.25, NOW()),
(10, '2024-12', 1950.25, 2100.50, 150.25, NOW()),
(11, '2024-12', 1650.80, 1800.10, 149.30, NOW()),
(12, '2024-12', 2300.40, 2450.70, 150.30, NOW()),
(13, '2024-12', 1350.90, 1500.15, 149.25, NOW()),
(14, '2024-12', 2700.60, 2850.85, 150.25, NOW()),
(15, '2024-12', 1850.15, 2000.40, 150.25, NOW()),
(16, '2024-12', 950.75, 1050.00, 99.25, NOW()),
(17, '2024-12', 2200.30, 2350.55, 150.25, NOW()),
(18, '2024-12', 1600.45, 1750.70, 150.25, NOW()),
(19, '2024-12', 3000.20, 3150.45, 150.25, NOW()),
(20, '2024-12', 1200.80, 1350.05, 149.25, NOW()),
(21, '2024-12', 1400.35, 1550.60, 150.25, NOW()),
(22, '2024-12', 2500.90, 2650.15, 149.25, NOW()),
(23, '2024-12', 1700.55, 1850.80, 150.25, NOW()),
(24, '2024-12', 2400.10, 2550.35, 150.25, NOW()),
(25, '2024-12', 1050.65, 1200.90, 150.25, NOW()),
(26, '2024-12', 1900.40, 2050.65, 150.25, NOW()),
(27, '2024-12', 2600.75, 2750.00, 149.25, NOW()),
(28, '2024-12', 1300.20, 1450.45, 150.25, NOW()),
(29, '2024-12', 2000.85, 2150.10, 149.25, NOW()),
(30, '2024-12', 1500.30, 1650.55, 150.25, NOW()),

-- Previous month readings (November 2024) - for comparison
(1, '2024-11', 1150.25, 1250.50, 100.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(2, '2024-11', 880.00, 980.25, 100.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(3, '2024-11', 1950.70, 2100.00, 149.30, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(4, '2024-11', 1600.25, 1750.75, 150.50, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(5, '2024-11', 3050.20, 3200.50, 150.30, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(6, '2024-11', 790.75, 890.00, 99.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(7, '2024-11', 1300.00, 1450.30, 150.30, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(8, '2024-11', 2650.60, 2800.75, 150.15, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(9, '2024-11', 1000.25, 1100.50, 100.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(10, '2024-11', 1800.00, 1950.25, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(11, '2024-11', 1500.50, 1650.80, 150.30, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(12, '2024-11', 2150.10, 2300.40, 150.30, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(13, '2024-11', 1200.65, 1350.90, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(14, '2024-11', 2550.35, 2700.60, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(15, '2024-11', 1700.90, 1850.15, 149.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(16, '2024-11', 850.50, 950.75, 100.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(17, '2024-11', 2050.05, 2200.30, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(18, '2024-11', 1450.20, 1600.45, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(19, '2024-11', 2850.95, 3000.20, 149.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(20, '2024-11', 1050.55, 1200.80, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(21, '2024-11', 1250.10, 1400.35, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(22, '2024-11', 2350.65, 2500.90, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(23, '2024-11', 1550.30, 1700.55, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(24, '2024-11', 2250.85, 2400.10, 149.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(25, '2024-11', 900.40, 1050.65, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(26, '2024-11', 1750.15, 1900.40, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(27, '2024-11', 2450.50, 2600.75, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(28, '2024-11', 1150.95, 1300.20, 149.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(29, '2024-11', 1850.60, 2000.85, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(30, '2024-11', 1350.05, 1500.30, 150.25, DATE_SUB(NOW(), INTERVAL 1 MONTH)),

-- October 2024 readings - for trend analysis
(1, '2024-10', 1050.00, 1150.25, 100.25, DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(2, '2024-10', 780.75, 880.00, 99.25, DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(3, '2024-10', 1800.40, 1950.70, 150.30, DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(4, '2024-10', 1450.75, 1600.25, 149.50, DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(5, '2024-10', 2900.90, 3050.20, 149.30, DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(6, '2024-10', 690.50, 790.75, 100.25, DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(7, '2024-10', 1150.70, 1300.00, 149.30, DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(8, '2024-10', 2500.45, 2650.60, 150.15, DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(9, '2024-10', 900.00, 1000.25, 100.25, DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(10, '2024-10', 1650.75, 1800.00, 149.25, DATE_SUB(NOW(), INTERVAL 2 MONTH)),

-- High consumption apartments (for testing alerts)
(31, '2024-12', 5000.00, 5300.00, 300.00, NOW()),
(32, '2024-12', 4500.50, 4850.75, 350.25, NOW()),
(33, '2024-12', 3800.25, 4200.50, 400.25, NOW()),

-- Low consumption apartments (for testing efficiency)
(34, '2024-12', 500.00, 550.25, 50.25, NOW()),
(35, '2024-12', 600.75, 650.00, 49.25, NOW()),
(36, '2024-12', 450.50, 500.75, 50.25, NOW()),

-- Zero consumption apartments (vacant or issues)
(37, '2024-12', 1200.00, 1200.00, 0.00, NOW()),
(38, '2024-12', 1500.50, 1500.50, 0.00, NOW()),
(39, '2024-12', 800.25, 800.25, 0.00, NOW()),
(40, '2024-12', 2000.75, 2000.75, 0.00, NOW());

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