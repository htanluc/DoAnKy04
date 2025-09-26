-- Kiểm tra dữ liệu xe trong database
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
ORDER BY created_at DESC 
LIMIT 10;
