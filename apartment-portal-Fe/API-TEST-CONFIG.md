# 🚗 Test API Vehicle Capacity Limit

## 📋 Cấu Hình Test

### **Base URL**
```
http://localhost:8080/api/vehicle-capacity-config
```

### **Headers cần thiết**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

## 🧪 Test Cases

### **1. Tạo Cấu Hình Mới**

```bash
curl -X POST http://localhost:8080/api/vehicle-capacity-config \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "buildingId": 1,
    "maxCars": 50,
    "maxMotorcycles": 100,
    "maxTrucks": 20,
    "maxVans": 15,
    "maxElectricVehicles": 30,
    "maxBicycles": 80
  }'
```

### **2. Lấy Tất Cả Cấu Hình**

```bash
curl -X GET http://localhost:8080/api/vehicle-capacity-config \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **3. Lấy Cấu Hình Theo Building**

```bash
curl -X GET http://localhost:8080/api/vehicle-capacity-config/building/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **4. Kiểm Tra Capacity**

```bash
curl -X GET "http://localhost:8080/api/vehicle-capacity-config/check-capacity?buildingId=1&vehicleType=CAR_4_SEATS" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **5. Cập Nhật Cấu Hình**

```bash
curl -X PUT http://localhost:8080/api/vehicle-capacity-config/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxCars": 60,
    "maxMotorcycles": 120
  }'
```

## 📱 Test với Frontend

### **Bước 1: Khởi động Backend**
```bash
# Chạy Spring Boot application
./mvnw spring-boot:run
```

### **Bước 2: Khởi động Frontend**
```bash
# Chạy Next.js
npm run dev
```

### **Bước 3: Test UI**
1. Vào `http://localhost:3000/admin-dashboard/vehicle-registrations`
2. Chọn tab "Tổng quan giới hạn"
3. Chọn tab "Cấu hình giới hạn"
4. Test tạo/cập nhật/xóa cấu hình

## 🔍 Kiểm Tra Logs

### **Backend Logs**
```bash
# Xem logs Spring Boot
tail -f logs/application.log
```

### **Frontend Console**
- Mở Developer Tools (F12)
- Xem Console tab để check API calls
- Xem Network tab để check HTTP requests

## ⚠️ Troubleshooting

### **Lỗi 401 Unauthorized**
- Kiểm tra JWT token có hợp lệ không
- Kiểm tra token có expired không
- Kiểm tra user có ADMIN role không

### **Lỗi 404 Not Found**
- Kiểm tra URL endpoint có đúng không
- Kiểm tra backend có chạy không
- Kiểm tra port 8080 có đúng không

### **Lỗi 500 Internal Server Error**
- Kiểm tra database connection
- Kiểm tra logs backend
- Kiểm tra cấu hình application.properties

## 📊 Expected Results

### **Tạo Cấu Hình Thành Công**
```json
{
  "id": 1,
  "buildingId": 1,
  "maxCars": 50,
  "currentCars": 0,
  "remainingCars": 50,
  "isActive": true
}
```

### **Kiểm Tra Capacity Thành Công**
```json
{
  "canAdd": true,
  "buildingId": 1,
  "vehicleType": "CAR_4_SEATS",
  "currentCount": 0,
  "maxCapacity": 50,
  "remainingSlots": 50,
  "message": "Có thể đăng ký thêm xe"
}
```

## 🎯 Next Steps

1. **Test tất cả endpoints** để đảm bảo hoạt động đúng
2. **Test error cases** (invalid data, unauthorized access)
3. **Test integration** với frontend components
4. **Performance testing** với nhiều requests
5. **Security testing** để đảm bảo bảo mật
