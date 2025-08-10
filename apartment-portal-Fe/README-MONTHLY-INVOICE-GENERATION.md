# Tạo Hóa Đơn Theo Tháng - API Documentation

## API Endpoint

```
POST /api/admin/yearly-billing/generate-month/{year}/{month}
```

## Mô tả

API này được sử dụng để tạo hóa đơn cho **tất cả căn hộ** trong một tháng cụ thể.

## Request Body

```json
{
  "serviceFeePerM2": 5000,
  "waterFeePerM3": 15000,
  "motorcycleFee": 50000,
  "car4SeatsFee": 200000,
  "car7SeatsFee": 250000
}
```

## Parameters

- `year` (path parameter): Năm cần tạo hóa đơn (ví dụ: 2025)
- `month` (path parameter): Tháng cần tạo hóa đơn (1-12)

## Response

### Success Response (200)
```json
{
  "success": true,
  "message": "Đã tạo hóa đơn thành công cho tháng 8/2025 cho tất cả căn hộ",
  "data": {
    "totalInvoices": 45,
    "totalAmount": 12500000,
    "billingPeriod": "2025-08"
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy cấu hình phí cho tháng/năm này. Vui lòng tạo cấu hình trước."
}
```

#### 409 Conflict
```json
{
  "success": false,
  "message": "Hóa đơn cho tháng này đã tồn tại. Vui lòng kiểm tra lại."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Lỗi server: Vui lòng thử lại sau hoặc liên hệ quản trị viên."
}
```

## Cách Sử Dụng Trong Frontend

### 1. Hook Implementation

```typescript
// hooks/use-yearly-billing.ts
const generateMonthlyInvoices = async (year: number, month: number, feeConfig?: Partial<YearlyBillingRequest>): Promise<GenerateInvoiceResponse | null> => {
  const requestData = {
    serviceFeePerM2: feeConfig?.serviceFeePerM2 || 5000,
    waterFeePerM3: feeConfig?.waterFeePerM3 || 15000,
    motorcycleFee: feeConfig?.motorcycleFee || 50000,
    car4SeatsFee: feeConfig?.car4SeatsFee || 200000,
    car7SeatsFee: feeConfig?.car7SeatsFee || 250000,
  };
  
  const response = await api.post(`/api/admin/yearly-billing/generate-month/${year}/${month}`, requestData);
  // ... handle response
};
```

### 2. Component Usage

```typescript
// components/admin/YearlyBillingForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (billingMode === 'monthly') {
    // Validation
    const errors: {[key: string]: string} = {};
    if (!form.serviceFeePerM2 || form.serviceFeePerM2 <= 0) {
      errors.serviceFeePerM2 = 'Phí dịch vụ phải lớn hơn 0';
    }
    // ... other validations
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Generate invoices for all apartments
    const result = await generateMonthlyInvoices(selectedYear, selectedMonth, form);
    if (result?.success) {
      // Handle success
    }
  }
};
```

## Tính Năng

1. **Tạo hóa đơn hàng loạt**: Tạo hóa đơn cho tất cả căn hộ trong một tháng
2. **Cấu hình phí linh hoạt**: Cho phép thiết lập các loại phí khác nhau
3. **Validation**: Kiểm tra dữ liệu đầu vào trước khi tạo hóa đơn
4. **Error handling**: Xử lý các trường hợp lỗi khác nhau
5. **Success feedback**: Thông báo kết quả tạo hóa đơn

## Lưu Ý

- API này sẽ tạo hóa đơn cho **tất cả căn hộ** trong hệ thống
- Cần có cấu hình phí cho tháng/năm trước khi tạo hóa đơn
- Hóa đơn đã tồn tại sẽ không được tạo lại (trả về lỗi 409)
- API hỗ trợ các loại phí: dịch vụ, nước, xe máy, xe 4 chỗ, xe 7 chỗ

## Ví Dụ Sử Dụng

```bash
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2025/8" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceFeePerM2": 5000,
    "waterFeePerM3": 15000,
    "motorcycleFee": 50000,
    "car4SeatsFee": 200000,
    "car7SeatsFee": 250000
  }'
``` 