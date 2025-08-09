-- Thêm apartment 52 vào database
INSERT INTO apartments (building_id, floor_number, unit_number, area, status) VALUES
(3, 5, 'C5-02', 100.0, 'OCCUPIED');

-- Thêm chỉ số nước cho apartment 52 tháng 2025-08
INSERT INTO water_meter_readings (apartment_id, reading_month, previous_reading, current_reading, consumption, created_at) VALUES
(52, '2025-08', 0.00, 2222.00, 2222.00, NOW());

-- Thêm ServiceFeeConfig cho tháng 8/2025 nếu chưa có
INSERT INTO service_fee_config (month, year, parking_fee, service_fee_per_m2, water_fee_per_m3, motorcycle_fee, car_4_seats_fee, car_7_seats_fee, created_at, updated_at) VALUES
(8, 2025, 150000.0, 5000.0, 15000.0, 50000.0, 200000.0, 250000.0, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Query để kiểm tra dữ liệu
SELECT 'Apartment 52:' as info;
SELECT * FROM apartments WHERE id = 52;

SELECT 'Water meter reading for apartment 52:' as info;
SELECT * FROM water_meter_readings WHERE apartment_id = 52 AND reading_month = '2025-08';

SELECT 'Service fee config for 8/2025:' as info;
SELECT * FROM service_fee_config WHERE month = 8 AND year = 2025;