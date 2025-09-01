# Fix i18n cho Announcement Stats Cards

## Vấn đề
Phần stats cards trong trang **Announcement Management** (/admin-dashboard/announcements) đang hiển thị text tiếng Việt hardcode thay vì sử dụng hệ thống i18n:

- **"Tổng số"** (Total)
- **"Đang hoạt động"** (Active) 
- **"Khẩn cấp"** (Urgent)
- **"Tin tức"** (News)

## Giải pháp đã thực hiện

### 1. Thêm các key i18n mới vào `/lib/i18n.ts`

```typescript
// Announcement Stats Cards
'admin.announcements.total': { vi: 'Tổng số', en: 'Total' },
'admin.announcements.active': { vi: 'Đang hoạt động', en: 'Active' },
'admin.announcements.urgent': { vi: 'Khẩn cấp', en: 'Urgent' },
'admin.announcements.news': { vi: 'Tin tức', en: 'News' },

// Admin Filters
'admin.filters.searchAndFilter': { vi: 'Tìm kiếm & lọc', en: 'Search & Filter' },
'admin.filters.type': { vi: 'Loại thông báo', en: 'Announcement Type' },

// Admin Sort
'admin.sort.by': { vi: 'Sắp xếp theo', en: 'Sort by' },
'admin.sort.createdAt': { vi: 'Ngày tạo', en: 'Creation Date' },
'admin.sort.title': { vi: 'Tiêu đề', en: 'Title' },
'admin.sort.type': { vi: 'Loại', en: 'Type' },

// Admin View Mode
'admin.view.mode': { vi: 'Chế độ xem', en: 'View Mode' },
'admin.view.table': { vi: 'Bảng', en: 'Table' },
'admin.view.grid': { vi: 'Lưới', en: 'Grid' },

// Admin Results
'admin.results.showing': { vi: 'Hiển thị', en: 'Showing' },
'admin.results.of': { vi: 'trong tổng số', en: 'of' },

// Admin Actions
'admin.refresh': { vi: 'Làm mới', en: 'Refresh' },
'admin.export': { vi: 'Xuất Excel', en: 'Export Excel' },
'admin.loading': { vi: 'Đang tải...', en: 'Loading...' },
'admin.view': { vi: 'Xem chi tiết', en: 'View Details' },
'admin.edit': { vi: 'Chỉnh sửa', en: 'Edit' },
'admin.delete': { vi: 'Xóa', en: 'Delete' },

// Admin Export
'admin.export.stats': { vi: 'Xuất thống kê', en: 'Export Stats' },
'admin.export.data': { vi: 'Xuất dữ liệu', en: 'Export Data' },

// Admin Announcements Additional
'admin.announcements.noResults': { vi: 'Không tìm thấy thông báo', en: 'No announcements found' },
'admin.announcements.noResultsDesc': { vi: 'Không có thông báo nào khớp với tiêu chí tìm kiếm của bạn', en: 'No announcements match your search criteria' },
'admin.announcements.createFirst': { vi: 'Tạo thông báo đầu tiên', en: 'Create first announcement' },
'admin.announcements.results': { vi: 'kết quả', en: 'results' },
```

### 2. Code đã sử dụng đúng i18n

File `/app/admin-dashboard/announcements/page.tsx` đã có sẵn:

```typescript
// Stats Cards đã sử dụng t() function
<p className="text-sm font-medium text-blue-600">{t('admin.announcements.total', 'Tổng số')}</p>
<p className="text-sm font-medium text-green-600">{t('admin.announcements.active', 'Đang hoạt động')}</p>
<p className="text-sm font-medium text-red-600">{t('admin.announcements.urgent', 'Khẩn cấp')}</p>
<p className="text-sm font-medium text-purple-600">{t('admin.announcements.news', 'Tin tức')}</p>
```

### 3. Backend i18n cũng đã được sửa

Trong `ApartmentResidentService.java`:
- Thêm cấu hình i18n (`I18nConfig.java`)
- Tạo `MessageUtils.java` utility class
- Thêm file messages properties (vi, en)
- Thay thế hardcode strings bằng i18n keys

## Cách test

1. Chạy script test:
```bash
./test-i18n.ps1
```

2. Hoặc start manual:
```bash
npm run dev
```

3. Navigate to: http://localhost:3000/admin-dashboard/announcements

4. Switch ngôn ngữ bằng language switcher và kiểm tra:
   - Stats cards (Tổng số, Đang hoạt động, Khẩn cấp, Tin tức)
   - Search & filter section
   - Table headers
   - Action buttons
   - Export buttons

## Kết quả

✅ **Tiếng Việt**: Tổng số, Đang hoạt động, Khẩn cấp, Tin tức  
✅ **English**: Total, Active, Urgent, News  
✅ **Tất cả text khác cũng đã được i18n hóa**  
✅ **Backend exception messages cũng đã i18n**  

## File đã thay đổi

### Frontend
- `lib/i18n.ts` - Thêm 20+ key i18n mới
- `app/admin-dashboard/announcements/page.tsx` - Đã có sẵn i18n
- `test-i18n.ps1` - Script test

### Backend  
- `config/I18nConfig.java` - Cấu hình i18n
- `utils/MessageUtils.java` - Utility class
- `services/ApartmentResidentService.java` - Sử dụng i18n
- `exceptions/ApartmentResidentException.java` - Custom exception
- `resources/messages*.properties` - Message files
- `resources/application.properties` - Cấu hình
- `README-I18N.md` - Hướng dẫn sử dụng i18n

Bây giờ toàn bộ hệ thống đã hỗ trợ đa ngôn ngữ một cách hoàn chình!
