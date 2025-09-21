-- =====================================================
-- MIGRATION SCRIPT: CẬP NHẬT ENUM VALUES
-- Đồng bộ ServiceCategoryType và ServiceRequestStatus
-- =====================================================

-- 1. Cập nhật service_categories với 9 danh mục mới
-- Xóa dữ liệu cũ (nếu có)
DELETE FROM service_categories;

-- Thêm 9 danh mục mới
INSERT INTO service_categories (category_code, category_name, assigned_role, description) VALUES
('ELECTRICITY', 'Điện', 'MAINTENANCE_STAFF', 'Sửa chữa điện, hệ thống điện'),
('WATER', 'Nước', 'MAINTENANCE_STAFF', 'Hệ thống nước, đường ống'),
('CLEANING', 'Vệ sinh', 'CLEANING_STAFF', 'Dọn dẹp, vệ sinh'),
('SECURITY', 'An ninh', 'SECURITY_STAFF', 'Bảo vệ, an ninh'),
('HVAC', 'Điều hòa', 'MAINTENANCE_STAFF', 'Hệ thống điều hòa không khí'),
('ELEVATOR', 'Thang máy', 'MAINTENANCE_STAFF', 'Bảo trì, sửa chữa thang máy'),
('GARDENING', 'Cây xanh', 'GARDENING_STAFF', 'Chăm sóc cây xanh, cảnh quan'),
('IT', 'Internet & IT', 'IT_STAFF', 'Hệ thống mạng, công nghệ thông tin'),
('OTHER', 'Khác', 'GENERAL_STAFF', 'Các yêu cầu khác');

-- 2. Cập nhật service_requests status values
-- Mapping: 0=PENDING, 1=ASSIGNED, 2=IN_PROGRESS, 3=COMPLETED, 4=CANCELLED
-- Không cần thay đổi vì đã sử dụng ORDINAL

-- 3. Cập nhật service_requests priority values  
-- Mapping: 0=P1(URGENT), 1=P2(HIGH), 2=P3(MEDIUM), 3=P4(LOW), 4=P5(VERY_LOW)
-- Không cần thay đổi vì đã sử dụng ORDINAL

-- 4. Tạo indexes để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_category ON service_requests(category);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned_to ON service_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_service_requests_submitted_at ON service_requests(submitted_at);

-- 5. Cập nhật dữ liệu mẫu (nếu cần)
-- Có thể thêm dữ liệu test ở đây nếu cần
