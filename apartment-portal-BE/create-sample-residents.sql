-- Tạo cư dân mẫu để test gửi email
-- Chạy script này trong MySQL để tạo dữ liệu test

-- Lấy role RESIDENT
SET @resident_role_id = (SELECT id FROM roles WHERE name = 'RESIDENT' LIMIT 1);

-- Tạo 10 cư dân mẫu cho 10 căn hộ đầu tiên
INSERT INTO users (username, email, phone_number, full_name, date_of_birth, id_card_number, status, created_at, updated_at)
SELECT 
    CONCAT('resident_', a.id) as username,
    CONCAT('resident', a.id, '@apartment.com') as email,
    CONCAT('090', LPAD(a.id, 7, '0')) as phone_number,
    CONCAT('Cư dân căn hộ ', a.unit_number) as full_name,
    DATE_ADD('1980-01-01', INTERVAL (a.id % 20) YEAR) as date_of_birth,
    CONCAT('123456789', LPAD(a.id, 3, '0')) as id_card_number,
    'ACTIVE' as status,
    NOW() as created_at,
    NOW() as updated_at
FROM apartments a
WHERE a.id <= 10
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Tạo liên kết apartment-resident
INSERT INTO apartment_residents (apartment_id, user_id, move_in_date, relation_type, is_primary_resident)
SELECT 
    a.id as apartment_id,
    u.id as user_id,
    DATE_SUB(NOW(), INTERVAL 6 MONTH) as move_in_date,
    'OWNER' as relation_type,
    true as is_primary_resident
FROM apartments a
JOIN users u ON u.username = CONCAT('resident_', a.id)
WHERE a.id <= 10
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Gán role RESIDENT cho các user vừa tạo
INSERT INTO user_roles (user_id, role_id)
SELECT 
    u.id as user_id,
    @resident_role_id as role_id
FROM users u
WHERE u.username LIKE 'resident_%'
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Hiển thị kết quả
SELECT 
    'Tổng số căn hộ' as metric,
    COUNT(*) as count
FROM apartments
UNION ALL
SELECT 
    'Tổng số cư dân' as metric,
    COUNT(*) as count
FROM apartment_residents
UNION ALL
SELECT 
    'Tổng số users' as metric,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 
    'Cư dân có email' as metric,
    COUNT(*) as count
FROM users u
JOIN apartment_residents ar ON ar.user_id = u.id
WHERE u.email IS NOT NULL AND u.email != '';