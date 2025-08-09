-- =====================================================
-- FIX: Add water meter reading for apartment 56
-- =====================================================

-- 1. Check if apartment 56 exists
SELECT id, unit_number, building_id, area, status 
FROM apartments 
WHERE id = 56;

-- 2. If apartment 56 doesn't exist, we'll see 0 rows above
-- If it exists, add water meter reading for August 2025

-- 3. Insert water meter reading for apartment 56, August 2025
INSERT INTO water_meter_readings (apartment_id, reading_month, previous_reading, current_reading, consumption, created_at) 
VALUES (56, '2025-08', 0.00, 22.00, 22.00, NOW())
ON DUPLICATE KEY UPDATE 
    previous_reading = 0.00,
    current_reading = 22.00,
    consumption = 22.00,
    created_at = NOW();

-- 4. Verify the data was inserted
SELECT * FROM water_meter_readings WHERE apartment_id = 56 AND reading_month = '2025-08';

-- 5. Check current invoice for apartment 56
SELECT id, apartment_id, billing_period, total_amount, status 
FROM invoices 
WHERE apartment_id = 56 AND billing_period = '2025-08';

-- 6. Check invoice items for apartment 56
SELECT ii.*, i.billing_period 
FROM invoice_items ii 
JOIN invoices i ON ii.invoice_id = i.id 
WHERE i.apartment_id = 56 AND i.billing_period = '2025-08';

-- =====================================================
-- Expected results after running this:
-- - Water meter reading: 22 m³ consumption 
-- - Expected water fee: 22 × 15000 = 330,000 VND
-- =====================================================