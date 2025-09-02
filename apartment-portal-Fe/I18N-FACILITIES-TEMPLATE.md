# I18N Template cho Facilities Management

## Tổng quan
File này chứa template i18n cho trang quản lý tiện ích và trang chi tiết tiện ích. Sử dụng template này để chuẩn hóa tất cả các text trong ứng dụng.

## Cấu trúc I18N

### 1. Admin Facilities - Trang Danh sách

```typescript
// app/admin-dashboard/facilities/page.tsx
const { t } = useLanguage();

// Page Title & Description
t('admin.facilities.title', 'Quản lý tiện ích')
t('admin.facilities.listDesc', 'Quản lý tất cả tiện ích trong chung cư')

// Action Buttons
t('admin.facilities.exportCSV', 'Xuất CSV')
t('admin.facilities.exportExcel', 'Xuất Excel')
t('admin.facilities.create', 'Tạo tiện ích mới')

// Statistics Cards
t('admin.facilities.stats.total', 'Tổng tiện ích')
t('admin.facilities.stats.totalDesc', 'Tiện ích trong hệ thống')
t('admin.facilities.stats.location', 'Có vị trí')
t('admin.facilities.stats.locationDesc', 'Tiện ích có vị trí')
t('admin.facilities.stats.capacity', 'Tổng sức chứa')
t('admin.facilities.stats.capacityDesc', 'Người có thể sử dụng')
t('admin.facilities.stats.avgFee', 'Phí trung bình')
t('admin.facilities.stats.avgFeeDesc', 'Phí sử dụng trung bình')

// Search & Filters
t('admin.filters.searchAndFilter', 'Tìm kiếm & lọc')
t('admin.facilities.searchPlaceholder', 'Tìm kiếm theo tên, mô tả, vị trí...')
t('admin.facilities.capacity.all', 'Tất cả sức chứa')
t('admin.facilities.capacity.small', 'Nhỏ (1-20)')
t('admin.facilities.capacity.medium', 'Trung bình (21-50)')
t('admin.facilities.capacity.large', 'Lớn (>50)')
t('admin.filters.clear', 'Xóa bộ lọc')

// Bulk Actions
t('admin.facilities.selected', 'tiện ích đã chọn')
t('admin.facilities.deselect', 'Bỏ chọn')
t('admin.facilities.bulkDelete', 'Xóa đã chọn')

// Table Headers
t('admin.facilities.name', 'Tên tiện ích')
t('admin.facilities.description', 'Mô tả')
t('admin.facilities.capacity', 'Sức chứa')
t('admin.facilities.usageFee', 'Phí sử dụng')
t('admin.facilities.location', 'Vị trí')
t('admin.facilities.otherDetails', 'Chi tiết khác')
t('admin.facilities.status', 'Trạng thái')
t('admin.action.actions', 'Thao tác')

// Table Content
t('admin.facilities.noDescription', 'Không có mô tả')
t('admin.facilities.noLocation', 'Không có vị trí')
t('admin.facilities.noDetails', 'Không có chi tiết')
t('admin.facilities.visible', 'Hiển thị')
t('admin.facilities.hidden', 'Ẩn')
t('admin.facilities.free', 'Miễn phí')

// Capacity Badges
t('admin.facilities.capacity.label.small', 'Nhỏ')
t('admin.facilities.capacity.label.medium', 'Trung bình')
t('admin.facilities.capacity.label.large', 'Lớn')

// Pagination
t('admin.pagination.itemsPerPage', 'Hiển thị:')
t('admin.pagination.pageSize.5', '5')
t('admin.pagination.pageSize.10', '10')
t('admin.pagination.pageSize.20', '20')
t('admin.pagination.pageSize.50', '50')
t('admin.pagination.showing', 'Hiển thị')
t('admin.pagination.of', 'của')
t('admin.pagination.results', 'kết quả')
t('admin.pagination.previous', 'Trước')
t('admin.pagination.next', 'Sau')

// Empty States
t('admin.facilities.noResults', 'Không tìm thấy tiện ích')
t('admin.facilities.noResultsDesc', 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm')
t('admin.facilities.noData', 'Chưa có tiện ích nào')
t('admin.facilities.noDataDesc', 'Bắt đầu bằng cách tạo tiện ích đầu tiên')

// Confirmations
t('admin.facilities.confirmDelete', 'Bạn có chắc chắn muốn xóa tiện ích này?')
t('admin.facilities.confirmBulkDelete', 'Bạn có chắc chắn muốn xóa {count} tiện ích đã chọn?')

// Success Messages
t('admin.success.delete', 'Thành công')
t('admin.success.update', 'Thành công')
t('admin.success.export', 'Thành công')
t('admin.facilities.deleteSuccess', 'Đã xóa tiện ích thành công')
t('admin.facilities.visibilityToggleSuccess', 'Đã cập nhật trạng thái hiển thị')
t('admin.facilities.bulkDeleteSuccess', 'Đã xóa các tiện ích đã chọn')
t('admin.facilities.exportSuccess', 'Đã xuất dữ liệu thành công')
t('admin.facilities.excelExportSuccess', 'Đã xuất Excel thành công')

// Error Messages
t('admin.error.delete', 'Lỗi')
t('admin.error.update', 'Lỗi')
t('admin.facilities.deleteError', 'Không thể xóa tiện ích')
t('admin.facilities.visibilityToggleError', 'Không thể cập nhật trạng thái hiển thị')
t('admin.facilities.bulkDeleteError', 'Không thể xóa một số tiện ích')
t('admin.facilities.loadError', 'Không thể tải danh sách tiện ích')

// Warning Messages
t('admin.warning', 'Cảnh báo')
t('admin.facilities.selectToDelete', 'Vui lòng chọn tiện ích để xóa')

// Export Headers
t('admin.facilities.exportHeaders.id', 'ID')
t('admin.facilities.exportHeaders.name', 'Tên')
t('admin.facilities.exportHeaders.description', 'Mô tả')
t('admin.facilities.exportHeaders.location', 'Vị trí')
t('admin.facilities.exportHeaders.capacity', 'Sức chứa')
t('admin.facilities.exportHeaders.usageFee', 'Phí sử dụng')
t('admin.facilities.exportHeaders.otherDetails', 'Chi tiết khác')
t('admin.facilities.exportHeaders.exportDate', 'Ngày xuất')

// Excel Worksheet
t('admin.facilities.worksheetName', 'Tiện ích')

// Common
t('admin.common.locale', 'vi-VN')
```

### 2. Admin Facilities Detail - Trang Chi tiết

```typescript
// app/admin-dashboard/facilities/[id]/page.tsx
const { t } = useLanguage();

// Page Title & Description
t('admin.facilities.details', 'Chi tiết tiện ích')
t('admin.facilities.detailsDesc', 'Thông tin chi tiết của tiện ích')

// Navigation
t('admin.action.back', 'Quay lại')

// Statistics Cards
t('admin.facilities.stats.capacity', 'Sức chứa')
t('admin.facilities.stats.capacityDesc', 'Người có thể sử dụng')
t('admin.facilities.stats.usageFee', 'Phí sử dụng')
t('admin.facilities.stats.usageFeeDesc', 'Phí cho mỗi lần sử dụng')
t('admin.facilities.stats.location', 'Vị trí')
t('admin.facilities.stats.locationDesc', 'Thông tin vị trí')
t('admin.facilities.stats.status', 'Trạng thái')
t('admin.facilities.stats.statusDesc', 'Tiện ích đang hoạt động')

// Content Cards
t('admin.facilities.description', 'Mô tả')
t('admin.facilities.noDescription', 'Chưa có mô tả cho tiện ích này')
t('admin.facilities.otherDetails', 'Chi tiết khác')
t('admin.facilities.quickActions', 'Thao tác nhanh')

// Sidebar Cards
t('admin.facilities.info', 'Thông tin tiện ích')
t('admin.facilities.id', 'ID')
t('admin.facilities.status', 'Trạng thái')
t('admin.facilities.support', 'Hỗ trợ')
t('admin.facilities.contactSupport', 'Liên hệ hỗ trợ')

// Quick Actions
t('admin.facilities.viewBookings', 'Xem đặt chỗ')

// Support Information
t('admin.facilities.support.workingHours', 'Giờ làm việc: 8:00 - 18:00')
t('admin.facilities.support.office', 'Văn phòng quản lý')
t('admin.facilities.support.needHelp', 'Cần hỗ trợ về tiện ích này?')

// Error States
t('admin.facilities.notFound', 'Không tìm thấy tiện ích')
t('admin.facilities.notFoundDesc', 'Tiện ích bạn đang tìm kiếm không tồn tại hoặc đã bị xóa')
t('admin.facilities.backToList', 'Quay lại danh sách')

// Copy Actions
t('admin.action.copyName', 'Sao chép tên')
t('admin.action.copyDescription', 'Sao chép mô tả')
t('admin.success.copy', 'Đã sao chép')
t('admin.facilities.copySuccess', '{label} đã được sao chép vào clipboard')
```

### 3. Admin Common - Các thành phần chung

```typescript
// Common admin translations
t('admin.loading', 'Đang tải...')
t('admin.noData', 'Không có dữ liệu')
t('admin.error.load', 'Lỗi')
t('admin.error.general', 'Đã xảy ra lỗi')

// Action buttons
t('admin.action.view', 'Xem')
t('admin.action.edit', 'Chỉnh sửa')
t('admin.action.delete', 'Xóa')
t('admin.action.save', 'Lưu')
t('admin.action.cancel', 'Hủy')
t('admin.action.confirm', 'Xác nhận')

// Status
t('admin.status.active', 'Hoạt động')
t('admin.status.inactive', 'Không hoạt động')
t('admin.status.pending', 'Đang chờ')
t('admin.status.completed', 'Hoàn thành')
t('admin.status.cancelled', 'Đã hủy')

// Messages
t('admin.message.confirmDelete', 'Bạn có chắc chắn muốn xóa?')
t('admin.message.confirmUpdate', 'Bạn có chắc chắn muốn cập nhật?')
t('admin.message.operationSuccess', 'Thao tác thành công')
t('admin.message.operationFailed', 'Thao tác thất bại')
```

## Cách sử dụng

### 1. Import useLanguage hook
```typescript
import { useLanguage } from '@/lib/i18n';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('admin.facilities.title', 'Quản lý tiện ích')}</h1>
    </div>
  );
}
```

### 2. Sử dụng với parameters
```typescript
// Với số lượng
t('admin.facilities.confirmBulkDelete', 'Bạn có chắc chắn muốn xóa {count} tiện ích đã chọn?', { count: selectedCount })

// Với tên
t('admin.facilities.copySuccess', '{label} đã được sao chép vào clipboard', { label: 'Tên tiện ích' })
```

### 3. Fallback values
```typescript
// Luôn có fallback value
t('admin.facilities.title', 'Quản lý tiện ích')
t('admin.facilities.stats.total', 'Tổng tiện ích')
```

## Lưu ý quan trọng

1. **Luôn có fallback value**: Mỗi lần gọi `t()` phải có fallback value
2. **Sử dụng key có cấu trúc**: `admin.facilities.stats.total` thay vì `total`
3. **Parameters**: Sử dụng `{param}` cho dynamic content
4. **Consistency**: Giữ nhất quán trong việc đặt tên keys
5. **Testing**: Test với các ngôn ngữ khác nhau

## Cập nhật file i18n

Sau khi chuẩn hóa, cập nhật file `lib/i18n.ts` để thêm các keys mới:

```typescript
// lib/i18n.ts
export const translations = {
  vi: {
    admin: {
      facilities: {
        title: 'Quản lý tiện ích',
        stats: {
          total: 'Tổng tiện ích',
          // ... các keys khác
        }
      }
    }
  },
  en: {
    admin: {
      facilities: {
        title: 'Facility Management',
        stats: {
          total: 'Total Facilities',
          // ... các keys khác
        }
      }
    }
  }
};
```
