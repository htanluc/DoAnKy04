-- Tạo dữ liệu xe mẫu với hình ảnh
-- Chạy script này để tạo dữ liệu test cho vehicles

-- Lấy user ID đầu tiên (resident_1)
SET @user_id = (SELECT id FROM users WHERE username = 'resident_1' LIMIT 1);

-- Lấy apartment ID đầu tiên
SET @apartment_id = (SELECT id FROM apartments LIMIT 1);

-- Thêm xe mẫu với hình ảnh
INSERT INTO vehicles (
    license_plate, 
    vehicle_type, 
    brand, 
    model, 
    color, 
    image_urls, 
    status, 
    monthly_fee, 
    user_id, 
    apartment_id, 
    created_at, 
    updated_at
) VALUES 
(
    '51G-59910', 
    'CAR_7_SEATS', 
    'Honda', 
    'Sorento', 
    'Đen', 
    '["http://localhost:8080/api/files/vehicles/user_1/20250925/2_1758767169673_a2fd1f62.jpg"]', 
    'PENDING', 
    500000.00, 
    @user_id, 
    @apartment_id, 
    NOW(), 
    NOW()
),
(
    '51G-59911', 
    'CAR_4_SEATS', 
    'Toyota', 
    'Camry', 
    'Trắng', 
    '["http://localhost:8080/api/files/vehicles/user_1/20250925/2_1758767169673_a2fd1f62.jpg"]', 
    'PENDING', 
    400000.00, 
    @user_id, 
    @apartment_id, 
    NOW(), 
    NOW()
),
(
    '51G-59912', 
    'MOTORCYCLE', 
    'Honda', 
    'Wave', 
    'Xanh', 
    '["http://localhost:8080/api/files/vehicles/user_1/20250925/2_1758767169673_a2fd1f62.jpg"]', 
    'APPROVED', 
    100000.00, 
    @user_id, 
    @apartment_id, 
    NOW(), 
    NOW()
);

-- Hiển thị kết quả
SELECT 
    'Tổng số xe' as metric,
    COUNT(*) as count
FROM vehicles
UNION ALL
SELECT 
    'Xe chờ duyệt' as metric,
    COUNT(*) as count
FROM vehicles WHERE status = 'PENDING'
UNION ALL
SELECT 
    'Xe đã duyệt' as metric,
    COUNT(*) as count
FROM vehicles WHERE status = 'APPROVED';

-- Hiển thị chi tiết xe
SELECT 
    id,
    license_plate,
    vehicle_type,
    brand,
    model,
    color,
    image_urls,
    status,
    created_at
FROM vehicles 
ORDER BY created_at DESC;
