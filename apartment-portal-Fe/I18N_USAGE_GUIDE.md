# Hướng dẫn sử dụng hệ thống đa ngôn ngữ (i18n)

## Tổng quan

Dự án đã được thiết lập hệ thống đa ngôn ngữ hoàn chỉnh hỗ trợ tiếng Việt và tiếng Anh. Hệ thống sử dụng React Context và hooks để quản lý ngôn ngữ.

## Cấu trúc hệ thống

### 1. File cấu hình (`lib/i18n.ts`)
- Chứa tất cả các bản dịch song ngữ
- Định nghĩa interface `Translations` và type `Language`
- Export function `t()` để dịch text
- Export hook `useLanguage()` để sử dụng trong components

### 2. Language Context (`components/language-context.tsx`)
- Quản lý state ngôn ngữ hiện tại
- Lưu trữ ngôn ngữ trong cookie để duy trì qua các lần reload
- Cung cấp `LanguageProvider` để wrap toàn bộ ứng dụng

### 3. Language Switcher (`components/language-switcher.tsx`)
- Component UI để chuyển đổi giữa các ngôn ngữ
- Hiển thị dropdown với các tùy chọn ngôn ngữ

## Cách sử dụng

### 1. Import và sử dụng hook

```tsx
import { useLanguage } from '@/lib/i18n';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('admin.users.title', 'Quản lý người dùng')}</h1>
      <p>Current language: {language}</p>
    </div>
  );
}
```

### 2. Sử dụng function t()

```tsx
// Cú pháp: t(key, fallback)
t('admin.users.title', 'Quản lý người dùng')

// Nếu có key trong translations, sẽ trả về bản dịch
// Nếu không có, sẽ trả về fallback text
```

### 3. Thêm bản dịch mới

Trong file `lib/i18n.ts`, thêm vào object `translations`:

```tsx
export const translations: Translations = {
  // ... existing translations
  
  'new.key': {
    vi: 'Bản dịch tiếng Việt',
    en: 'English translation'
  },
  
  // ... more translations
}
```

## Quy tắc sử dụng

### 1. Luôn sử dụng fallback text
```tsx
// ✅ Đúng
t('admin.users.title', 'Quản lý người dùng')

// ❌ Sai - không có fallback
t('admin.users.title')
```

### 2. Sử dụng key có cấu trúc rõ ràng
```tsx
// ✅ Tốt - có cấu trúc rõ ràng
'admin.users.title'
'admin.users.create'
'admin.users.edit'

// ❌ Không tốt - không có cấu trúc
'users_title'
'create_user'
```

### 3. Sử dụng hook useLanguage() thay vì gọi trực tiếp
```tsx
// ✅ Đúng
const { t } = useLanguage();
t('key', 'fallback')

// ❌ Sai - không sử dụng hook
import { t } from '@/lib/i18n';
t('key', 'fallback')
```

## Các component đã được sửa

### 1. AdminLayout
- Sidebar menu items
- Header titles và descriptions
- Search placeholder

### 2. Admin Dashboard
- Stats cards titles
- Page titles
- Loading states

### 3. Users Management
- Page title và descriptions
- Table headers
- Status badges
- Action buttons

### 4. Apartments Management
- Page title và descriptions
- Table headers
- Status badges
- Search placeholders

### 5. Announcements Management
- Page title và descriptions
- Form labels
- Status badges
- Search placeholders

### 6. Events Management
- Page title và descriptions
- Status badges
- Search placeholders

### 7. Facilities Management
- Page title và descriptions
- Capacity options
- Search placeholders

## Kiểm tra và test

### 1. Chuyển đổi ngôn ngữ
- Click vào icon globe ở header
- Chọn ngôn ngữ mong muốn
- Kiểm tra xem tất cả text đã được dịch chưa

### 2. Kiểm tra fallback
- Xóa một số key trong translations
- Kiểm tra xem fallback text có hiển thị không

### 3. Kiểm tra cookie
- Mở DevTools > Application > Cookies
- Kiểm tra cookie `language` có được set đúng không

## Troubleshooting

### 1. Text không được dịch
- Kiểm tra key có tồn tại trong translations không
- Kiểm tra có sử dụng hook useLanguage() không
- Kiểm tra có truyền fallback text không

### 2. Ngôn ngữ không được lưu
- Kiểm tra cookie có được set đúng không
- Kiểm tra LanguageProvider có wrap đúng components không

### 3. Lỗi hydration
- Đảm bảo LanguageProvider được wrap ở cấp cao nhất
- Kiểm tra server-side và client-side có đồng bộ không

## Lưu ý quan trọng

1. **Luôn sử dụng fallback text** để tránh hiển thị key khi có lỗi
2. **Sử dụng hook useLanguage()** thay vì import trực tiếp function t
3. **Kiểm tra kỹ** khi thêm bản dịch mới
4. **Test cả hai ngôn ngữ** để đảm bảo UI không bị vỡ
5. **Sử dụng key có cấu trúc** để dễ quản lý và maintain

## Tài liệu tham khảo

- [React Context API](https://react.dev/reference/react/createContext)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Next.js Internationalization](https://nextjs.org/docs/advanced-features/i18n-routing)
