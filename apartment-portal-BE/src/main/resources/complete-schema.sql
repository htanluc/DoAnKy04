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
    usage_fee DOUBLE
);

-- 9. SERVICE_CATEGORIES (Danh mục dịch vụ)
CREATE TABLE IF NOT EXISTS service_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
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
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 13. FACILITY_BOOKINGS (Đặt tiện ích)
CREATE TABLE IF NOT EXISTS facility_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    facility_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    purpose VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
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
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_price DOUBLE NOT NULL,
    total_price DOUBLE NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- 16. PAYMENTS (Thanh toán)
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- 17. SERVICE_REQUESTS (Yêu cầu dịch vụ)
CREATE TABLE IF NOT EXISTS service_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    description TEXT,
    image_attachment VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_to BIGINT,
    assigned_at TIMESTAMP,
    status VARCHAR(20),
    priority VARCHAR(20),
    resolution_notes TEXT,
    completed_at TIMESTAMP,
    rating INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES service_categories(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- 18. FEEDBACKS (Phản hồi)
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    rating INT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 19. ACTIVITY_LOGS (Nhật ký hoạt động)
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 20. AI_QA_HISTORY (Lịch sử hỏi đáp AI)
CREATE TABLE IF NOT EXISTS ai_qa_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    name VARCHAR(100) NOT NULL,
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
CREATE INDEX idx_service_requests_category_id ON service_requests(category_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_assigned_to ON service_requests(assigned_to);

-- Indexes cho activity_logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Indexes cho apartment_residents
CREATE INDEX idx_apartment_residents_apartment_id ON apartment_residents(apartment_id);
CREATE INDEX idx_apartment_residents_user_id ON apartment_residents(user_id);

-- Indexes cho event_registrations
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
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
ADD CONSTRAINT chk_facility_booking_time 
CHECK (end_time > start_time);

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