# Chức Năng Đăng Ký Xe

## 📋 Tổng quan

Chức năng đăng ký xe là một tính năng quan trọng trong hệ thống quản lý chung cư, cho phép cư dân đăng ký phương tiện của mình để sử dụng các dịch vụ gửi xe trong tòa nhà. Hệ thống hỗ trợ nhiều loại phương tiện khác nhau với quy trình duyệt và quản lý chặt chẽ.

## 🎯 Mục tiêu

- Cung cấp quy trình đăng ký xe thuận tiện cho cư dân
- Quản lý sức chứa bãi xe một cách hiệu quả
- Đảm bảo tính công bằng trong việc phân bổ chỗ đậu xe
- Tự động hóa việc thu phí gửi xe hàng tháng

## 🏗️ Kiến trúc hệ thống

### Các thành phần chính:

1. **Backend (Spring Boot)**: API xử lý logic nghiệp vụ
2. **Frontend Web (Next.js)**: Giao diện quản trị viên
3. **Mobile App (Flutter)**: Giao diện cư dân
4. **Database (MySQL)**: Lưu trữ dữ liệu

## 📊 Cấu trúc Database

### Bảng `vehicles`
```sql
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    image_urls TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    monthly_fee DECIMAL(10,2),
    user_id BIGINT NOT NULL,
    apartment_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
);
```

### Bảng `vehicle_capacity_config`
```sql
CREATE TABLE vehicle_capacity_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT NOT NULL,
    max_cars INT NOT NULL DEFAULT 0,
    max_motorcycles INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY uk_building_vehicle_capacity (building_id)
);
```

## 🚗 Các loại phương tiện hỗ trợ

| Loại xe | Tên hiển thị | Phí hàng tháng |
|---------|-------------|----------------|
| MOTORCYCLE | Xe máy | 50,000 VND |
| CAR_4_SEATS | Ô tô 4 chỗ | 200,000 VND |
| CAR_7_SEATS | Ô tô 7 chỗ | 250,000 VND |
| TRUCK | Xe tải | 300,000 VND |
| VAN | Xe van | 250,000 VND |
| ELECTRIC_MOTORCYCLE | Xe máy điện | 40,000 VND |
| ELECTRIC_CAR | Ô tô điện | 150,000 VND |
| BICYCLE | Xe đạp | 20,000 VND |
| ELECTRIC_BICYCLE | Xe đạp điện | 30,000 VND |

## 🔄 Quy trình đăng ký xe

### 1. Từ phía cư dân (Mobile App)

#### Bước 1: Truy cập form đăng ký
- Mở ứng dụng mobile
- Chọn menu "Quản lý xe"
- Chọn tab "Đăng ký"

#### Bước 2: Điền thông tin xe
**Thông tin bắt buộc:**
- **Biển số xe**: Chuỗi ký tự duy nhất, không được để trống
- **Loại phương tiện**: Chọn từ dropdown, hiển thị kèm phí tháng
- **Căn hộ**: Tự động lấy từ danh sách căn hộ đã liên kết với tài khoản

**Thông tin tùy chọn:**
- Hãng xe (brand)
- Dòng xe (model)
- Màu sắc (color)

#### Bước 3: Upload hình ảnh
- **Yêu cầu**: 1-5 ảnh, mỗi ảnh < 5MB
- **Định dạng**: JPG, PNG, JPEG
- **Nội dung**: Ảnh xe rõ ràng, dễ nhận biết

#### Bước 4: Gửi đăng ký
- Hệ thống validate đầy đủ thông tin
- Upload ảnh lên server
- Tạo bản ghi với trạng thái `PENDING`
- Gửi thông báo thành công cho cư dân

### 2. Từ phía quản trị viên (Web Admin)

#### Bước 1: Xem danh sách chờ duyệt
- Truy cập menu "Quản lý đăng ký xe"
- Tab "Chờ duyệt" hiển thị:
  - Ô tô chờ duyệt
  - Xe máy chờ duyệt
- Sắp xếp theo thứ tự ưu tiên

#### Bước 2: Kiểm tra thông tin
- Xem chi tiết đăng ký xe
- Xác minh thông tin cư dân và căn hộ
- Kiểm tra sức chứa bãi xe theo tòa nhà

#### Bước 3: Duyệt hoặc từ chối
**Duyệt đăng ký:**
- Kiểm tra giới hạn sức chứa
- Nếu đủ chỗ: Chuyển trạng thái thành `APPROVED`
- Tự động cập nhật số lượng xe hiện tại

**Từ chối đăng ký:**
- Nhập lý do từ chối
- Chuyển trạng thái thành `REJECTED`
- Gửi thông báo cho cư dân

## ⚙️ Hệ thống quản lý sức chứa

### Nguyên tắc hoạt động:

1. **Phân theo tòa nhà**: Mỗi tòa nhà có cấu hình riêng
2. **Phân loại xe**: Ô tô và xe máy (bao gồm xe đạp) riêng biệt
3. **Giới hạn cứng**: Không cho phép vượt quá sức chứa tối đa
4. **Ưu tiên**: Theo thứ tự đăng ký (FIFO - First In, First Out)

### Cấu hình sức chứa:

```typescript
interface VehicleCapacityConfig {
  id: number;
  buildingId: number;
  maxCars: number;        // Số ô tô tối đa
  maxMotorcycles: number; // Số xe máy/xe đạp tối đa
  currentCars: number;    // Số ô tô hiện tại
  currentMotorcycles: number; // Số xe máy hiện tại
  isActive: boolean;      // Trạng thái kích hoạt
}
```

## 📱 API Endpoints

### API cho cư dân:

```typescript
// Lấy danh sách loại xe
GET /api/vehicles/types

// Lấy xe của cư dân hiện tại
GET /api/vehicles/my

// Đăng ký xe mới
POST /api/vehicles
Body: {
  licensePlate: string,    // Biển số xe
  vehicleType: string,     // Loại xe
  apartmentId: number,     // ID căn hộ
  brand?: string,          // Hãng xe
  model?: string,          // Dòng xe
  color?: string,          // Màu sắc
  imageUrls?: string[]     // URL ảnh
}

// Upload ảnh xe
POST /api/vehicles/upload-images
FormData: files[] (multipart)

// Hủy đăng ký xe
POST /api/vehicles/{id}/cancel
Body: { reason: string }
```

### API cho quản trị viên:

```typescript
// Lấy tất cả xe
GET /api/admin/vehicles

// Lấy xe theo trạng thái
GET /api/admin/vehicles/status/{status}

// Lấy xe chờ duyệt
GET /api/admin/vehicles/pending

// Cập nhật trạng thái xe
PUT /api/admin/vehicles/{id}/status
Body: {
  status: string,           // APPROVED | REJECTED
  rejectionReason?: string  // Lý do từ chối (nếu REJECTED)
}

// Xóa xe
DELETE /api/admin/vehicles/{id}
```

### API cấu hình sức chứa:

```typescript
// Lấy cấu hình sức chứa
GET /api/admin/vehicle-capacity-config

// Cập nhật cấu hình
PUT /api/admin/vehicle-capacity-config/{id}
Body: {
  maxCars: number,
  maxMotorcycles: number,
  isActive: boolean
}
```

## 🎨 Giao diện người dùng

### Mobile App (Flutter)

#### Màn hình chính:
- **Tab "Đăng ký"**: Form đăng ký xe
- **Tab "Xe của tôi"**: Danh sách xe đã đăng ký
- **Tab "Xe chờ duyệt"**: Danh sách xe chờ duyệt trong tòa

#### Form đăng ký:
- Các trường input với validation
- Dropdown chọn loại xe (hiển thị phí)
- Dropdown chọn căn hộ
- Image picker với preview
- Button submit với loading state

#### Danh sách xe:
- Card hiển thị thông tin xe
- Badge trạng thái với màu sắc
- Hình ảnh xe (click để xem chi tiết)
- Pull-to-refresh

### Web Admin (Next.js)

#### Trang quản lý đăng ký xe:
- **Tabs**: Chờ duyệt, Tất cả xe, Từ chối, Giới hạn sức chứa
- **Bộ lọc**: Tìm kiếm theo biển số, tên chủ xe, căn hộ
- **Sắp xếp**: Theo thời gian, tên
- **Actions**: Duyệt, Từ chối, Khôi phục

#### Modal từ chối:
- Lý do từ chối (textarea)
- Các preset lý do nhanh
- Validation bắt buộc nhập lý do

## 🔐 Quy tắc nghiệp vụ

### Validation đăng ký:

1. **Biển số xe**: Không được trùng lặp trong hệ thống
2. **Loại xe**: Phải chọn từ danh sách định nghĩa
3. **Căn hộ**: Phải thuộc sở hữu của cư dân đăng ký
4. **Ảnh**: Ít nhất 1 ảnh, tối đa 5 ảnh, mỗi ảnh < 5MB

### Quy tắc duyệt xe:

1. **Kiểm tra sức chứa**: Đảm bảo không vượt quá giới hạn tòa nhà
2. **Thứ tự ưu tiên**: Xử lý theo thứ tự đăng ký
3. **Lý do từ chối**: Bắt buộc phải nhập khi từ chối

### Quy tắc hủy/thay đổi:

1. **Cư dân**: Chỉ có thể hủy xe ở trạng thái `PENDING`
2. **Quản trị viên**: Có thể hủy/khôi phục xe ở mọi trạng thái
3. **Khôi phục**: Chỉ khi còn chỗ trống trong bãi xe

## 📊 Báo cáo và thống kê

### Thống kê sức chứa:
- Tổng số chỗ đậu xe theo tòa nhà
- Số lượng xe hiện tại theo loại
- Tỷ lệ sử dụng bãi xe
- Danh sách xe chờ duyệt

### Báo cáo đăng ký:
- Số lượng đăng ký theo tháng
- Tỷ lệ duyệt/từ chối
- Doanh thu phí gửi xe
- Thống kê theo tòa nhà

## 🔔 Hệ thống thông báo

### Thông báo cho cư dân:
- **Đăng ký thành công**: Khi submit form thành công
- **Được duyệt**: Khi quản trị viên duyệt xe
- **Bị từ chối**: Khi quản trị viên từ chối với lý do
- **Sắp hết hạn**: Nhắc nhở đóng phí hàng tháng

### Thông báo cho quản trị viên:
- **Có đăng ký mới**: Khi cư dân đăng ký xe
- **Đạt giới hạn**: Khi bãi xe sắp đầy
- **Cần xử lý**: Nhắc nhở xử lý đăng ký chờ duyệt

## 🔧 Bảo trì và hỗ trợ

### Các tác vụ định kỳ:
- **Sao lưu dữ liệu**: Định kỳ backup bảng vehicles
- **Kiểm tra sức chứa**: Monitor tỷ lệ sử dụng bãi xe
- **Xóa ảnh cũ**: Dọn dẹp ảnh không còn sử dụng
- **Cập nhật phí**: Điều chỉnh phí gửi xe theo chính sách

### Xử lý sự cố:
- **Ảnh bị lỗi**: Fallback hiển thị placeholder
- **Upload thất bại**: Retry mechanism với exponential backoff
- **Database lock**: Handle concurrent access khi duyệt xe
- **Network timeout**: Timeout handling cho các API calls

## 🚀 Tối ưu hóa hiệu suất

### Database optimization:
- Index trên `license_plate`, `status`, `apartment_id`
- Partitioning theo thời gian cho bảng lịch sử
- Connection pooling cho high concurrency

### API optimization:
- Caching danh sách loại xe
- Pagination cho danh sách lớn
- Lazy loading hình ảnh
- CDN cho static assets

### Mobile optimization:
- Local storage cho dữ liệu offline
- Image compression trước khi upload
- Background sync cho upload ảnh
- Optimistic UI updates

## 📋 Checklist triển khai

### Backend:
- [x] Model Vehicle và VehicleCapacityConfig
- [x] VehicleController với đầy đủ endpoints
- [x] VehicleService xử lý logic nghiệp vụ
- [x] Validation và error handling
- [x] File upload service
- [x] Activity logging

### Frontend Web:
- [x] Trang quản lý đăng ký xe
- [x] Component capacity management
- [x] Modal duyệt/từ chối
- [x] Real-time updates
- [x] Responsive design

### Mobile App:
- [x] Form đăng ký xe
- [x] Danh sách xe cá nhân
- [x] Danh sách xe chờ duyệt
- [x] Image picker và viewer
- [x] Offline support

### Testing:
- [x] Unit tests cho services
- [x] Integration tests cho APIs
- [x] UI tests cho mobile app
- [x] E2E tests cho web admin
- [x] Performance testing

## 🔮 Phát triển tương lai

### Tính năng nâng cao:
- **QR Code**: Tạo QR cho xe để check-in tự động
- **Camera AI**: Nhận diện biển số xe tự động
- **Mobile Payment**: Thanh toán phí gửi xe qua app
- **Reservation**: Đặt chỗ đậu xe trước
- **Analytics**: Báo cáo chi tiết về sử dụng bãi xe

### Tối ưu hóa:
- **Machine Learning**: Dự đoán nhu cầu đậu xe
- **IoT Integration**: Tích hợp với camera và sensor
- **Blockchain**: Lưu trữ lịch sử đăng ký an toàn
- **Microservices**: Tách riêng service quản lý xe

# Chức Năng Yêu Cầu Dịch Vụ

## 📋 Tổng quan

Chức năng yêu cầu dịch vụ là hệ thống quản lý các yêu cầu hỗ trợ, bảo trì và dịch vụ từ cư dân đến ban quản lý tòa nhà. Hệ thống cho phép cư dân gửi yêu cầu dịch vụ với hình ảnh minh họa, theo dõi tiến trình xử lý và nhận thông báo cập nhật.

## 🎯 Mục tiêu

- Cung cấp kênh liên lạc thuận tiện giữa cư dân và ban quản lý
- Quản lý và theo dõi các yêu cầu dịch vụ một cách có hệ thống
- Tối ưu hóa quy trình xử lý yêu cầu với phân loại theo mức độ ưu tiên
- Cải thiện chất lượng dịch vụ và sự hài lòng của cư dân

## 🏗️ Kiến trúc hệ thống

### Các thành phần chính:

1. **Backend (Spring Boot)**: Xử lý logic nghiệp vụ và quản lý trạng thái
2. **Frontend Web (Next.js)**: Giao diện quản trị viên và nhân viên
3. **Mobile App (Flutter)**: Giao diện cư dân
4. **Database (MySQL)**: Lưu trữ yêu cầu và lịch sử xử lý

## 📊 Cấu trúc Database

### Bảng `service_requests`
```sql
CREATE TABLE service_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_attachment TEXT,
    attachment_urls TEXT,
    before_images TEXT,
    after_images TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_to BIGINT,
    assigned_at TIMESTAMP,
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    priority ENUM('P1', 'P2', 'P3', 'P4', 'P5'),
    resolution_notes TEXT,
    completed_at TIMESTAMP,
    rating INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

### Bảng `service_categories`
```sql
CREATE TABLE service_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    assigned_role VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Quy trình xử lý yêu cầu dịch vụ

### 1. Từ phía cư dân (Mobile App)

#### Bước 1: Tạo yêu cầu mới
- Chọn danh mục dịch vụ phù hợp
- Nhập tiêu đề và mô tả chi tiết vấn đề
- Chọn mức độ ưu tiên (Thấp/Trung bình/Cao/Khẩn cấp)
- Upload hình ảnh minh họa (tối đa 5 ảnh, < 5MB/ảnh)

#### Bước 2: Theo dõi trạng thái
- **PENDING**: Chờ xử lý
- **ASSIGNED**: Đã giao cho nhân viên
- **IN_PROGRESS**: Đang xử lý
- **COMPLETED**: Hoàn thành
- **CANCELLED**: Đã hủy

#### Bước 3: Đánh giá dịch vụ
- Sau khi hoàn thành, cư dân có thể đánh giá chất lượng dịch vụ
- Nhận xét và góp ý để cải thiện dịch vụ

### 2. Từ phía quản trị viên

#### Bước 1: Tiếp nhận và phân loại
- Xem tất cả yêu cầu mới (PENDING)
- Phân tích mức độ khẩn cấp và phân loại
- Gán cho nhân viên phụ trách phù hợp

#### Bước 2: Phân công nhiệm vụ
- Gán yêu cầu cho nhân viên kỹ thuật
- Cập nhật thông tin liên hệ
- Đặt thời hạn xử lý

#### Bước 3: Giám sát tiến độ
- Theo dõi trạng thái xử lý
- Nhận báo cáo từ nhân viên
- Cập nhật thông tin cho cư dân

#### Bước 4: Đóng yêu cầu
- Xác nhận hoàn thành
- Upload hình ảnh sau sửa chữa
- Gửi thông báo cho cư dân

## 📋 Danh mục dịch vụ hỗ trợ

| Danh mục | Mô tả | Vai trò phụ trách |
|----------|--------|-------------------|
| MAINTENANCE | Bảo trì, sửa chữa cơ sở hạ tầng | Kỹ thuật viên |
| CLEANING | Vệ sinh chung, dọn dẹp | Nhân viên vệ sinh |
| SECURITY | An ninh, bảo vệ | Bảo vệ |
| UTILITY | Tiện ích chung (điện, nước, gas) | Kỹ thuật viên |
| OTHER | Các vấn đề khác | Theo tình huống |

## 🎯 Mức độ ưu tiên

| Mức độ | Mô tả | Thời gian xử lý dự kiến |
|--------|--------|------------------------|
| P1 - URGENT | Khẩn cấp - Nguy hiểm đến tính mạng/tài sản | < 2 giờ |
| P2 - HIGH | Cao - Ảnh hưởng nghiêm trọng đến sinh hoạt | < 4 giờ |
| P3 - MEDIUM | Trung bình - Ảnh hưởng đến tiện nghi | < 24 giờ |
| P4 - LOW | Thấp - Vấn đề nhỏ, không cấp bách | < 72 giờ |
| P5 - VERY_LOW | Rất thấp - Yêu cầu cải thiện | Theo kế hoạch |

## 📱 API Endpoints

### API cho cư dân:

```typescript
// Lấy yêu cầu dịch vụ của cư dân hiện tại
GET /api/support-requests/my

// Tạo yêu cầu dịch vụ mới
POST /api/support-requests
Body: {
  categoryId: number,      // ID danh mục
  title: string,          // Tiêu đề
  description: string,    // Mô tả chi tiết
  priority: string,       // Mức độ ưu tiên
  attachmentUrls: string[] // URL hình ảnh
}

// Upload hình ảnh
POST /api/upload/service-request
FormData: files[] (multipart)

// Hủy yêu cầu
PUT /api/support-requests/{id}/cancel
```

### API cho quản trị viên:

```typescript
// Lấy tất cả yêu cầu dịch vụ
GET /api/admin/support-requests

// Lấy yêu cầu theo ID
GET /api/admin/support-requests/{id}

// Cập nhật yêu cầu
PUT /api/admin/support-requests/{id}

// Xóa yêu cầu
DELETE /api/admin/support-requests/{id}

// Gán yêu cầu cho nhân viên
POST /api/admin/support-requests/{id}/assign
Body: {
  staffId: number,
  priority: string
}
```

### API cho nhân viên:

```typescript
// Lấy yêu cầu được gán cho nhân viên
GET /api/staff/support-requests/assigned

// Lấy yêu cầu theo vai trò
GET /api/staff/support-requests

// Cập nhật trạng thái yêu cầu
PUT /api/staff/support-requests/{id}/status
Body: {
  status: string,
  resolutionNotes: string,
  beforeImages: string[],
  afterImages: string[]
}
```

## 🎨 Giao diện người dùng

### Mobile App (Flutter)

#### Màn hình danh sách yêu cầu:
- **Tabs**: Tất cả, Chờ xử lý, Đang xử lý, Hoàn thành
- **Card design** cho mỗi yêu cầu với thông tin cơ bản
- **Status indicators** với màu sắc phân biệt
- **Pull-to-refresh** để cập nhật dữ liệu

#### Form tạo yêu cầu:
- **Dropdown** chọn danh mục dịch vụ
- **Text fields** cho tiêu đề và mô tả
- **Priority selector** với radio buttons
- **Image picker** với preview grid
- **Validation** đầy đủ trước khi submit

#### Màn hình chi tiết:
- **Progress indicator** hiển thị 4 bước xử lý
- **Thông tin chi tiết** yêu cầu và người xử lý
- **Image gallery** với zoom và swipe
- **Comments section** cho trao đổi

### Web Admin (Next.js)

#### Trang quản lý yêu cầu:
- **Data table** với sorting và filtering
- **Status badges** với màu sắc
- **Quick actions** cho assign và update
- **Search và filter** theo nhiều tiêu chí
- **Pagination** cho danh sách lớn

#### Modal chi tiết yêu cầu:
- **Thông tin đầy đủ** của yêu cầu
- **Assignment form** gán cho nhân viên
- **Status update** với lý do
- **Image viewer** với lightbox
- **Activity log** lịch sử xử lý

## 🔐 Quy tắc nghiệp vụ

### Validation tạo yêu cầu:

1. **Tiêu đề**: Bắt buộc, 3-255 ký tự
2. **Mô tả**: Bắt buộc, 5-1000 ký tự
3. **Danh mục**: Phải chọn từ danh sách có sẵn
4. **Hình ảnh**: Tối đa 5 ảnh, mỗi ảnh < 5MB
5. **Authentication**: Chỉ cư dân đã xác thực mới được tạo

### Quy tắc xử lý:

1. **Phân loại ưu tiên**: Admin có quyền điều chỉnh mức độ ưu tiên
2. **Thời hạn xử lý**: Theo SLA dựa trên mức độ ưu tiên
3. **Gán nhân viên**: Chỉ gán cho nhân viên có vai trò phù hợp
4. **Cập nhật trạng thái**: Theo thứ tự logic (không thể skip bước)

### Quy tắc đánh giá:

1. **Thời hạn đánh giá**: 7 ngày sau khi hoàn thành
2. **Điểm số**: 1-5 sao
3. **Nhận xét**: Tùy chọn nhưng khuyến khích
4. **Ẩn danh**: Đánh giá không hiển thị tên người đánh giá

## 📊 Báo cáo và thống kê

### Thống kê yêu cầu:
- **Số lượng theo trạng thái**: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED
- **Thời gian xử lý trung bình**: Theo danh mục và mức độ ưu tiên
- **Tỷ lệ hoàn thành**: Theo thời hạn SLA
- **Đánh giá chất lượng**: Điểm trung bình và phân phối

### Báo cáo hiệu suất:
- **Hiệu suất nhân viên**: Số yêu cầu xử lý, thời gian trung bình
- **Hiệu suất danh mục**: Tần suất yêu cầu theo loại
- **Xu hướng theo thời gian**: Biểu đồ theo tháng/quý
- **Điểm cải thiện**: Vấn đề thường gặp và giải pháp

## 🔔 Hệ thống thông báo

### Thông báo cho cư dân:
- **Tạo yêu cầu thành công**: Xác nhận đã nhận được
- **Đã gán nhân viên**: Thông tin người phụ trách
- **Bắt đầu xử lý**: Thông báo bắt đầu công việc
- **Hoàn thành**: Thông báo hoàn thành với hình ảnh
- **Yêu cầu đánh giá**: Nhắc nhở đánh giá dịch vụ

### Thông báo cho nhân viên:
- **Yêu cầu mới**: Khi được gán công việc
- **Nhắc nhở deadline**: Khi sắp đến hạn xử lý
- **Cập nhật từ admin**: Thay đổi ưu tiên hoặc thông tin
- **Feedback từ cư dân**: Khi có đánh giá

### Thông báo cho admin:
- **Yêu cầu khẩn cấp**: Cần xử lý ngay lập tức
- **Quá hạn SLA**: Yêu cầu chưa hoàn thành đúng hạn
- **Tích lũy yêu cầu**: Khi có nhiều yêu cầu cùng loại
- **Báo cáo định kỳ**: Thống kê hàng tuần/tháng

## 🔧 Bảo trì và hỗ trợ

### Các tác vụ định kỳ:
- **Dọn dẹp file**: Xóa hình ảnh cũ không còn sử dụng
- **Backup dữ liệu**: Sao lưu bảng service_requests
- **Cập nhật SLA**: Điều chỉnh thời hạn xử lý
- **Đánh giá nhân viên**: Định kỳ review hiệu suất

### Xử lý sự cố:
- **Upload thất bại**: Retry mechanism với exponential backoff
- **Database deadlock**: Handle concurrent updates
- **File corruption**: Fallback hiển thị placeholder
- **Network timeout**: Timeout handling cho API calls

## 🚀 Tối ưu hóa hiệu suất

### Database optimization:
- **Indexing**: Trên user_id, status, priority, created_at
- **Partitioning**: Theo tháng cho bảng lịch sử
- **Connection pooling**: Cho high concurrency
- **Query optimization**: Sử dụng prepared statements

### API optimization:
- **Caching**: Danh sách categories và common data
- **Pagination**: Cho danh sách lớn
- **Lazy loading**: Hình ảnh và attachments
- **Batch operations**: Cho bulk updates

### Mobile optimization:
- **Local storage**: Cache dữ liệu offline
- **Image compression**: Trước khi upload
- **Background sync**: Đồng bộ khi có kết nối
- **Push notifications**: Real-time updates

## 📋 Checklist triển khai

### Backend:
- [x] Model ServiceRequest và ServiceCategory
- [x] ServiceRequestController với đầy đủ endpoints
- [x] ServiceRequestService xử lý logic nghiệp vụ
- [x] File upload service cho hình ảnh
- [x] Activity logging và audit trail

### Frontend Web:
- [x] Trang quản lý yêu cầu dịch vụ
- [x] Component assignment và status update
- [x] Image viewer với lightbox
- [x] Real-time notifications
- [x] Advanced filtering và search

### Mobile App:
- [x] Danh sách yêu cầu với tabs
- [x] Form tạo yêu cầu với validation
- [x] Chi tiết yêu cầu với progress
- [x] Image picker và gallery viewer
- [x] Push notifications

### Testing:
- [x] Unit tests cho services
- [x] Integration tests cho APIs
- [x] UI tests cho mobile app
- [x] E2E tests cho web admin
- [x] Performance testing với 1000+ requests

## 🔮 Phát triển tương lai

### Tính năng nâng cao:
- **Chat realtime**: Trao đổi trực tiếp với nhân viên
- **Voice recording**: Gửi yêu cầu bằng giọng nói
- **AI categorization**: Tự động phân loại yêu cầu
- **Predictive maintenance**: Dự đoán vấn đề trước khi xảy ra
- **Mobile payment**: Thanh toán phí dịch vụ

### Tích hợp:
- **IoT sensors**: Giám sát cơ sở hạ tầng
- **Smart locks**: Truy cập tự động cho kỹ thuật viên
- **QR codes**: Check-in/out cho nhân viên
- **Blockchain**: Lưu trữ lịch sử yêu cầu an toàn
- **Machine Learning**: Phân tích xu hướng và dự đoán

---

## 📞 Liên hệ hỗ trợ

**Đội ngũ phát triển**: Nhóm 1 - Đồ án Kỹ 4
**Email**: support@apartment-portal.com
**Version**: 1.0.0
**Last updated**: September 2025
