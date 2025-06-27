-- Cập nhật database cho Apartment API
-- Chạy script này nếu cần thêm dữ liệu mẫu hoặc cập nhật cấu trúc

-- Thêm dữ liệu mẫu cho tòa nhà (nếu chưa có)
INSERT INTO buildings (building_name, address, floors, description) VALUES
('Tòa A', '123 Đường ABC, Quận 1, TP.HCM', 20, 'Tòa nhà cao cấp'),
('Tòa B', '456 Đường XYZ, Quận 2, TP.HCM', 15, 'Tòa nhà trung cấp')
ON DUPLICATE KEY UPDATE building_name = VALUES(building_name);

-- Thêm dữ liệu mẫu cho căn hộ (nếu chưa có)
INSERT INTO apartments (building_id, floor_number, unit_number, area, status) VALUES
(1, 1, '1A', 60.0, 'VACANT'),
(1, 1, '1B', 75.0, 'VACANT'),
(1, 2, '2A', 60.0, 'VACANT'),
(1, 2, '2B', 75.0, 'VACANT'),
(1, 3, '3A', 60.0, 'VACANT'),
(1, 3, '3B', 75.0, 'VACANT'),
(2, 1, '1A', 50.0, 'VACANT'),
(2, 1, '1B', 65.0, 'VACANT'),
(2, 2, '2A', 50.0, 'VACANT'),
(2, 2, '2B', 65.0, 'VACANT')
ON DUPLICATE KEY UPDATE unit_number = VALUES(unit_number);

-- Thêm dữ liệu mẫu cho cư dân (nếu chưa có)
INSERT INTO residents (full_name, date_of_birth, id_card_number, phone, email, family_relation, status) VALUES
('Nguyễn Văn A', '1990-01-01', '123456789012', '0123456789', 'nguyenvana@example.com', 'Chủ hộ', 'ACTIVE'),
('Trần Thị B', '1992-05-15', '123456789013', '0123456790', 'tranthib@example.com', 'Chủ hộ', 'ACTIVE'),
('Lê Văn C', '1985-12-20', '123456789014', '0123456791', 'levanc@example.com', 'Chủ hộ', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Thêm dữ liệu mẫu cho liên kết căn hộ-cư dân
INSERT INTO apartment_residents (apartment_id, resident_id, relation_type, move_in_date) VALUES
(1, 1, 'Chủ sở hữu', '2024-01-01'),
(3, 2, 'Chủ sở hữu', '2024-02-01'),
(5, 3, 'Chủ sở hữu', '2024-03-01')
ON DUPLICATE KEY UPDATE relation_type = VALUES(relation_type);

-- Cập nhật trạng thái căn hộ đã có cư dân
UPDATE apartments SET status = 'OCCUPIED' WHERE id IN (1, 3, 5);

-- Kiểm tra dữ liệu
SELECT 
    a.id as apartment_id,
    a.unit_number,
    a.status,
    b.building_name,
    COUNT(ar.resident_id) as resident_count
FROM apartments a
LEFT JOIN buildings b ON a.building_id = b.id
LEFT JOIN apartment_residents ar ON a.id = ar.apartment_id
GROUP BY a.id, a.unit_number, a.status, b.building_name
ORDER BY a.id; 