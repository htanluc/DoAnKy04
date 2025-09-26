"use client"

import { useEffect, useState } from "react"
import { useLanguageContext } from "../components/language-context"

export type Language = 'vi' | 'en'

export interface Translations {
  [key: string]: {
    [key in Language]: string
  }
}

// Translation data
export const translations: Translations = {
  // Login page
  'login.title': {
    vi: 'Đăng nhập',
    en: 'Login'
  },
  'login.subtitle': {
    vi: 'Nhập thông tin đăng nhập để truy cập hệ thống',
    en: 'Enter your credentials to access the system'
  },
  'login.phoneNumber': {
    vi: 'Số điện thoại',
    en: 'Phone Number'
  },
  'login.phoneNumber.placeholder': {
    vi: 'Nhập số điện thoại',
    en: 'Enter phone number'
  },
  'login.password': {
    vi: 'Mật khẩu',
    en: 'Password'
  },
  'login.password.placeholder': {
    vi: 'Nhập mật khẩu',
    en: 'Enter password'
  },
  'login.submit': {
    vi: 'Đăng nhập',
    en: 'Login'
  },
  'login.loading': {
    vi: 'Đang đăng nhập...',
    en: 'Logging in...'
  },
  'login.noAccount': {
    vi: 'Chưa có tài khoản?',
    en: "Don't have an account?"
  },
  'login.register': {
    vi: 'Đăng ký ngay',
    en: 'Register now'
  },
  'login.demo.title': {
    vi: 'Tài khoản demo:',
    en: 'Demo account:'
  },
  'login.demo.phone': {
    vi: 'Số điện thoại: admin',
    en: 'Phone: admin'
  },
  'login.demo.password': {
    vi: 'Mật khẩu: admin123',
    en: 'Password: admin123'
  },

  // Register page
  'register.title': {
    vi: 'Đăng ký',
    en: 'Register'
  },
  'register.subtitle': {
    vi: 'Tạo tài khoản mới để sử dụng hệ thống',
    en: 'Create a new account to use the system'
  },
  'register.username': {
    vi: 'Tên đăng nhập',
    en: 'Username'
  },
  'register.username.placeholder': {
    vi: 'Nhập tên đăng nhập',
    en: 'Enter username'
  },
  'register.email': {
    vi: 'Email',
    en: 'Email'
  },
  'register.email.placeholder': {
    vi: 'Nhập email',
    en: 'Enter email'
  },
  'register.phoneNumber': {
    vi: 'Số điện thoại',
    en: 'Phone Number'
  },
  'register.phoneNumber.placeholder': {
    vi: 'Nhập số điện thoại',
    en: 'Enter phone number'
  },
  'register.password': {
    vi: 'Mật khẩu',
    en: 'Password'
  },
  'register.password.placeholder': {
    vi: 'Nhập mật khẩu (tối thiểu 6 ký tự)',
    en: 'Enter password (minimum 6 characters)'
  },
  'register.submit': {
    vi: 'Đăng ký',
    en: 'Register'
  },
  'register.loading': {
    vi: 'Đang đăng ký...',
    en: 'Registering...'
  },
  'register.hasAccount': {
    vi: 'Đã có tài khoản?',
    en: 'Already have an account?'
  },
  'register.login': {
    vi: 'Đăng nhập ngay',
    en: 'Login now'
  },

  // Common
  'validation.required': {
    vi: 'Vui lòng nhập đầy đủ thông tin',
    en: 'Please fill in all required fields'
  },
  'validation.password.min': {
    vi: 'Mật khẩu phải có ít nhất 6 ký tự',
    en: 'Password must be at least 6 characters'
  },
  'validation.email.invalid': {
    vi: 'Email không hợp lệ',
    en: 'Invalid email format'
  },
  'validation.phone.invalid': {
    vi: 'Số điện thoại không hợp lệ',
    en: 'Invalid phone number'
  },
  'error.general': {
    vi: 'Có lỗi xảy ra, vui lòng thử lại',
    en: 'An error occurred, please try again'
  },
  'success.register': {
    vi: 'Đăng ký thành công! Vui lòng đăng nhập.',
    en: 'Registration successful! Please login.'
  },

  // Language switcher
  'language.vi': {
    vi: 'Tiếng Việt',
    en: 'Vietnamese'
  },
  'language.en': {
    vi: 'English',
    en: 'English'
  },

  // Transaction error
  'error.transaction': {
    vi: 'Không có EntityManager với transaction hợp lệ cho luồng hiện tại - không thể xử lý xóa dữ liệu một cách an toàn',
    en: 'No EntityManager with actual transaction available for current thread - cannot reliably process \'remove\' call'
  },

  // Activate account page
  'activate.title': {
    vi: 'Tài khoản chưa kích hoạt',
    en: 'Account not activated'
  },
  'activate.description': {
    vi: 'Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email hoặc số điện thoại {emailOrPhone} để nhận link xác thực.',
    en: 'Your account has not been activated. Please check your email or phone number {emailOrPhone} to receive the verification link.'
  },
  'activate.resend': {
    vi: 'Gửi lại email kích hoạt',
    en: 'Resend activation email'
  },
  'activate.resending': {
    vi: 'Đang gửi lại...',
    en: 'Resending...'
  },
  'activate.success': {
    vi: 'Đã gửi lại email xác thực!',
    en: 'Verification email resent!'
  },
  'activate.error': {
    vi: 'Không thể gửi lại email xác thực, vui lòng thử lại sau',
    en: 'Cannot resend verification email, please try again later'
  },
  'activate.back': {
    vi: 'Quay lại đăng nhập',
    en: 'Back to login'
  },

  // Resident dashboard
  'dashboard.resident.title': {
    vi: 'Trang tổng quan cư dân',
    en: 'Resident Dashboard'
  },
  'dashboard.notifications': {
    vi: 'Thông báo mới',
    en: 'Latest Notifications'
  },
  'dashboard.billing': {
    vi: 'Hóa đơn & Thanh toán',
    en: 'Billing & Payment'
  },
  'dashboard.facilities': {
    vi: 'Tiện ích đã đăng ký',
    en: 'Registered Facilities'
  },
  'dashboard.support': {
    vi: 'Yêu cầu hỗ trợ gần đây',
    en: 'Recent Support Requests'
  },
  'dashboard.events': {
    vi: 'Sự kiện sắp diễn ra',
    en: 'Upcoming Events'
  },
  'dashboard.aiqa': {
    vi: 'Lịch sử hỏi đáp AI',
    en: 'AI Q&A History'
  },
  'dashboard.placeholder.empty': {
    vi: 'Không có dữ liệu',
    en: 'No data available'
  },

  // Admin Dashboard
  'admin.dashboard.title': {
    vi: 'Bảng điều khiển quản trị',
    en: 'Admin Dashboard'
  },
  'admin.dashboard.welcome': {
    vi: 'Chào mừng đến với hệ thống quản lý chung cư',
    en: 'Welcome to the apartment management system'
  },
  'admin.dashboard.subtitle': {
    vi: 'Quản lý toàn diện hệ thống chung cư của bạn',
    en: 'Manage your apartment system comprehensively'
  },
  'admin.dashboard.overview': {
    vi: 'Thống kê tổng quan',
    en: 'Overview statistics'
  },
  'admin.quickActions': {
    vi: 'Thao tác nhanh',
    en: 'Quick actions'
  },
  'admin.quickCreate': {
    vi: 'Tạo nhanh',
    en: 'Quick create'
  },
  'admin.search.placeholder': {
    vi: 'Tìm kiếm...',
    en: 'Search...'
  },

  // Sidebar groups
  'admin.groups.overview': { vi: 'Tổng quan', en: 'Overview' },
  'admin.groups.people': { vi: 'Người & Căn hộ', en: 'People & Apartments' },
  'admin.groups.comms': { vi: 'Truyền thông', en: 'Communications' },
  'admin.groups.facilities': { vi: 'Tiện ích', en: 'Facilities' },
  'admin.groups.finance': { vi: 'Tài chính', en: 'Finance' },
  'admin.groups.support': { vi: 'Hỗ trợ', en: 'Support' },
  'admin.groups.reports': { vi: 'Báo cáo', en: 'Reports' },

  // Common Admin Actions
  'admin.action.create': {
    vi: 'Tạo mới',
    en: 'Create New'
  },
  'admin.action.createStaff': {
    vi: 'Tạo nhân viên mới',
    en: 'Create New Staff'
  },
  'admin.action.createResident': {
    vi: 'Tạo cư dân mới',
    en: 'Create New Resident'
  },
  'admin.action.edit': {
    vi: 'Chỉnh sửa',
    en: 'Edit'
  },
  'admin.action.delete': {
    vi: 'Xóa',
    en: 'Delete'
  },
  'admin.action.activate': { vi: 'Kích hoạt', en: 'Activate' },
  'admin.action.deactivate': { vi: 'Vô hiệu hóa', en: 'Deactivate' },
  'admin.action.confirm': { vi: 'Đồng ý', en: 'Confirm' },
  'admin.action.view': {
    vi: 'Xem chi tiết',
    en: 'View Details'
  },
  'admin.action.save': {
    vi: 'Lưu',
    en: 'Save'
  },
  'admin.action.cancel': {
    vi: 'Hủy',
    en: 'Cancel'
  },
  'admin.action.back': {
    vi: 'Quay lại',
    en: 'Back'
  },
  'admin.action.search': {
    vi: 'Tìm kiếm',
    en: 'Search'
  },
  'admin.action.filter': {
    vi: 'Lọc',
    en: 'Filter'
  },
  'admin.action.export': {
    vi: 'Xuất dữ liệu',
    en: 'Export Data'
  },
  'admin.action.retry': { vi: 'Thử lại', en: 'Retry' },
  'admin.action.reload': { vi: 'Tải lại', en: 'Reload' },
  'admin.action.saving': { vi: 'Đang lưu...', en: 'Saving...' },
  'admin.action.refresh': { vi: 'Làm mới', en: 'Refresh' },
  'admin.action.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'admin.action.logout': {
    vi: 'Đăng xuất',
    en: 'Logout'
  },
  'admin.status.active': {
    vi: 'Hoạt động',
    en: 'Active'
  },
  'admin.status.inactive': {
    vi: 'Không hoạt động',
    en: 'Inactive'
  },
  'admin.status.pending': {
    vi: 'Chờ xử lý',
    en: 'Pending'
  },
  'admin.status.completed': {
    vi: 'Đã hoàn thành',
    en: 'Completed'
  },
  'admin.status.cancelled': {
    vi: 'Đã hủy',
    en: 'Cancelled'
  },

  // User Management
  'admin.users.title': {
    vi: 'Quản lý người dùng',
    en: 'User Management'
  },
  'admin.users.list': {
    vi: 'Danh sách người dùng',
    en: 'User List'
  },
  'admin.users.listDesc': {
    vi: 'Quản lý tất cả người dùng trong hệ thống',
    en: 'Manage all users in the system'
  },
  'admin.users.staff.title': {
    vi: 'Quản lý nhân viên',
    en: 'Staff Management'
  },
  'admin.users.staff.tab': {
    vi: 'Nhân viên',
    en: 'Staff'
  },
  'admin.users.staff.list': {
    vi: 'Danh sách nhân viên',
    en: 'Staff List'
  },
  'admin.users.resident.title': {
    vi: 'Quản lý cư dân',
    en: 'Resident Management'
  },
  'admin.users.resident.tab': {
    vi: 'Cư dân',
    en: 'Resident'
  },
  'admin.users.resident.list': {
    vi: 'Danh sách cư dân',
    en: 'Resident List'
  },
  'admin.users.stats.totalUsers': {
    vi: 'Tổng số người dùng',
    en: 'Total Users'
  },
  'admin.users.stats.activeUsers': {
    vi: 'Đang hoạt động',
    en: 'Active Users'
  },
  'admin.users.stats.inactiveUsers': {
    vi: 'Đã vô hiệu hóa',
    en: 'Inactive Users'
  },
  'admin.users.filterRole': { vi: 'Lọc vai trò', en: 'Filter role' },
  'admin.users.filter.all': { vi: 'Tất cả vai trò', en: 'All roles' },
  'admin.users.filter.allStatus': { vi: 'Tất cả trạng thái', en: 'All statuses' },
  'admin.users.filterStatus': { vi: 'Lọc trạng thái', en: 'Filter status' },
  'admin.users.searchPlaceholder': { vi: 'Tìm kiếm tên, email, số ĐT...', en: 'Search name, email, phone...' },
  'admin.users.emptyHint': { vi: 'Hãy thử thay đổi bộ lọc hoặc tạo người dùng mới', en: 'Try changing filters or create a new user' },
  'admin.users.role.admin': { vi: 'Quản trị', en: 'Admin' },
  'admin.users.role.staff': { vi: 'Nhân viên', en: 'Staff' },
  'admin.users.role.resident': { vi: 'Cư dân', en: 'Resident' },
  'admin.users.role.technician': { vi: 'Kỹ thuật viên', en: 'Technician' },
  'admin.users.role.cleaner': { vi: 'Nhân viên vệ sinh', en: 'Cleaner' },
  'admin.users.role.security': { vi: 'Bảo vệ', en: 'Security' },
  'admin.users.create': {
    vi: 'Tạo người dùng mới',
    en: 'Create New User'
  },
  'admin.users.createStaff': {
    vi: 'Tạo tài khoản nhân viên',
    en: 'Create staff account'
  },
  'admin.users.createStaffDesc': {
    vi: 'Thêm mới tài khoản cho nhân viên quản lý',
    en: 'Add a new account for management staff'
  },
  'admin.users.edit': {
    vi: 'Chỉnh sửa người dùng',
    en: 'Edit User'
  },
  'admin.users.details': {
    vi: 'Chi tiết người dùng',
    en: 'User Details'
  },
  'admin.users.deactivate.title': { vi: 'Vô hiệu hóa tài khoản', en: 'Deactivate account' },
  'admin.users.deactivate.desc': { vi: 'Bạn sắp vô hiệu hóa tài khoản của {username} ({email}). Vui lòng chọn một lý do để gửi thông báo cho cư dân.', en: 'You are about to deactivate the account of {username} ({email}). Please select a reason to notify the resident.' },
  'admin.users.deactivate.reason': { vi: 'Lý do vô hiệu hóa', en: 'Deactivation reason' },
  'admin.users.deactivate.reason.placeholder': { vi: 'Chọn lý do', en: 'Select a reason' },
  'admin.users.deactivate.emailNotice': { vi: 'Email thông báo sẽ được gửi tự động đến {email} với lý do đã chọn và hướng dẫn khôi phục tài khoản.', en: 'A notification email will be sent to {email} with the selected reason and instructions to restore the account.' },
  'admin.users.deactivate.reason.required': { vi: 'Bạn phải chọn lý do vô hiệu hóa!', en: 'You must select a deactivation reason!' },
  // Deactivation reason options
  'admin.users.deactivate.reason.VIOLATION_RULES': { vi: 'Vi phạm nội quy', en: 'Violation of community rules' },
  'admin.users.deactivate.reason.FRAUD_SUSPICION': { vi: 'Nghi ngờ gian lận', en: 'Fraud suspicion' },
  'admin.users.deactivate.reason.INAPPROPRIATE_BEHAVIOR': { vi: 'Hành vi không phù hợp', en: 'Inappropriate behavior' },
  'admin.users.deactivate.reason.SECURITY_CONCERN': { vi: 'Vấn đề bảo mật', en: 'Security concern' },
  'admin.users.deactivate.reason.REQUESTED_BY_USER': { vi: 'Theo yêu cầu của người dùng', en: 'Per user request' },
  'admin.users.unlink': { vi: 'Hủy liên kết', en: 'Unlink' },
  'admin.users.username': {
    vi: 'Tên đăng nhập',
    en: 'Username'
  },
  'admin.users.phoneNumber': { vi: 'Số điện thoại', en: 'Phone number' },
  'admin.users.email': {
    vi: 'Email',
    en: 'Email'
  },
  'admin.users.phone': {
    vi: 'Số điện thoại',
    en: 'Phone Number'
  },
  'admin.users.role': {
    vi: 'Vai trò',
    en: 'Role'
  },
  'admin.users.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },
  'admin.users.createdAt': {
    vi: 'Ngày tạo',
    en: 'Created At'
  },
  'admin.users.actions': {
    vi: 'Thao tác',
    en: 'Actions'
  },
  // User detail - linked apartments
  'admin.users.linkedApartments': { vi: 'Căn hộ đã liên kết', en: 'Linked apartments' },
  'admin.users.apartmentCode': { vi: 'Mã căn hộ', en: 'Apartment code' },
  'admin.users.building': { vi: 'Tòa', en: 'Building' },
  'admin.users.relationType': { vi: 'Loại quan hệ', en: 'Relation type' },
  'admin.users.relationType.OWNER': { vi: 'Chủ hộ', en: 'Owner' },
  'admin.users.relationType.TENANT': { vi: 'Người thuê', en: 'Tenant' },
  'admin.users.relationType.FAMILY_MEMBER': { vi: 'Thành viên', en: 'Family member' },
  'admin.users.action': { vi: 'Hành động', en: 'Action' },
  'admin.users.linkedApartments.none': { vi: 'Chưa liên kết căn hộ nào', en: 'No linked apartments' },
  'admin.users.unlink.confirmTitle': { vi: 'Xác nhận hủy liên kết', en: 'Confirm unlink' },
  'admin.users.unlink.confirmDesc': { vi: 'Bạn có chắc chắn muốn hủy liên kết căn hộ {unit} với tài khoản này không?', en: 'Are you sure you want to unlink apartment {unit} from this account?' },
  'admin.users.fullName': {
    vi: 'Họ và tên',
    en: 'Full Name'
  },
  'admin.users.personalInfo': {
    vi: 'Thông tin cá nhân',
    en: 'Personal Information'
  },
  'admin.users.details.subtitle': {
    vi: 'Thông tin chi tiết người dùng',
    en: 'User detailed information'
  },
  'admin.users.notUpdated': {
    vi: 'Chưa cập nhật',
    en: 'Not updated'
  },
  'admin.users.noRole': {
    vi: 'Chưa phân quyền',
    en: 'No role assigned'
  },
  'admin.users.status.active': {
    vi: 'Hoạt động',
    en: 'Active'
  },
  'admin.users.status.inactive': {
    vi: 'Vô hiệu hóa',
    en: 'Inactive'
  },
  'admin.users.apartment': {
    vi: 'Căn hộ',
    en: 'Apartment'
  },
  'admin.users.linkedApartments.noDescription': {
    vi: 'User này chưa được gán vào căn hộ nào trong hệ thống. Bạn có thể liên kết căn hộ từ trang quản lý căn hộ.',
    en: 'This user has not been assigned to any apartment in the system. You can link apartments from the apartment management page.'
  },
  'admin.users.staff.history': {
    vi: 'Lịch sử nhiệm vụ đã làm',
    en: 'Task History'
  },
  'admin.users.staff.residentName': {
    vi: 'Tên cư dân',
    en: 'Resident Name'
  },
  'admin.users.staff.category': {
    vi: 'Danh mục',
    en: 'Category'
  },
  'admin.users.staff.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },
  'admin.users.staff.createdAt': {
    vi: 'Ngày tạo',
    en: 'Created Date'
  },
  'admin.users.staff.noTasks': {
    vi: 'Nhân viên này chưa hoàn thành nhiệm vụ nào',
    en: 'This staff member has not completed any tasks'
  },
  'admin.users.unknown': {
    vi: 'Không rõ',
    en: 'Unknown'
  },
  'admin.users.noCategory': {
    vi: 'Không phân loại',
    en: 'Uncategorized'
  },
  'admin.supportRequests.none': {
    vi: 'Chưa có nhiệm vụ đã hoàn thành',
    en: 'No completed tasks yet'
  },
  'admin.users.loadError': {
    vi: 'Không thể tải dữ liệu',
    en: 'Failed to load data'
  },
  'admin.users.noToken': {
    vi: 'Không có token xác thực!',
    en: 'No authentication token!'
  },
  'admin.users.deactivate.success': {
    vi: 'Tài khoản {username} đã được vô hiệu hóa. Email thông báo đã được gửi đến {email} với lý do: "{reason}"',
    en: 'Account {username} has been deactivated. Notification email has been sent to {email} with reason: "{reason}"'
  },
  'admin.users.activate.success': {
    vi: 'Tài khoản {username} đã được kích hoạt lại!',
    en: 'Account {username} has been reactivated!'
  },
  'admin.users.statusChangeError': {
    vi: 'Không thể đổi trạng thái người dùng: {error}',
    en: 'Failed to change user status: {error}'
  },
  'admin.users.deactivate.noReason': {
    vi: 'Bạn phải chọn lý do vô hiệu hóa!',
    en: 'You must select a deactivation reason!'
  },
  'admin.users.unlinkSuccess': {
    vi: 'Đã hủy liên kết căn hộ.',
    en: 'Apartment unlinked successfully.'
  },
  'admin.users.unlinkError': {
    vi: 'Không thể hủy liên kết!',
    en: 'Failed to unlink apartment!'
  },
  'admin.users.assignRoleSuccess': {
    vi: 'Đã gán vai trò cho user.',
    en: 'Role assigned to user successfully.'
  },
  'admin.users.statusUpdateError': {
    vi: 'Cập nhật trạng thái thất bại: {status} {statusText}',
    en: 'Failed to update status: {status} {statusText}'
  },
  'admin.users.unlinkFailed': {
    vi: 'Hủy liên kết thất bại',
    en: 'Failed to unlink'
  },
  'admin.users.assignRoleFailed': {
    vi: 'Gán vai trò thất bại',
    en: 'Failed to assign role'
  },
  'admin.users.assignRoleError': {
    vi: 'Không thể gán vai trò!',
    en: 'Failed to assign role!'
  },
  'admin.users.removeRoleSuccess': {
    vi: 'Đã xóa vai trò khỏi user.',
    en: 'Role removed from user successfully.'
  },
  'admin.users.removeRoleError': {
    vi: 'Không thể xóa vai trò!',
    en: 'Failed to remove role!'
  },
  'admin.users.removeRoleFailed': {
    vi: 'Xóa vai trò thất bại',
    en: 'Failed to remove role'
  },

  // Resident Management
  'admin.residents.title': {
    vi: 'Quản lý cư dân',
    en: 'Resident Management'
  },
  'admin.residents.list': { vi: 'Danh sách cư dân', en: 'Resident List' },
  'admin.residents.listDesc': { vi: 'Quản lý thông tin cư dân trong hệ thống', en: 'Manage resident information in the system' },
  'admin.residents.searchPlaceholder': { vi: 'Tìm theo tên, CMND, SĐT, email...', en: 'Search by name, ID, phone, email...' },
  'admin.residents.status.all': { vi: 'Tất cả trạng thái', en: 'All statuses' },
  'admin.residents.status.ACTIVE': { vi: 'Hoạt động', en: 'Active' },
  'admin.residents.status.INACTIVE': { vi: 'Không hoạt động', en: 'Inactive' },
  'admin.residents.columns.fullName': { vi: 'Họ Tên', en: 'Full Name' },
  'admin.residents.columns.phone': { vi: 'Số Điện Thoại', en: 'Phone Number' },
  'admin.residents.columns.email': { vi: 'Email', en: 'Email' },
  'admin.residents.columns.idCard': { vi: 'CMND/CCCD', en: 'ID Card' },
  'admin.residents.columns.status': { vi: 'Trạng Thái', en: 'Status' },
  'admin.residents.columns.actions': { vi: 'Thao Tác', en: 'Actions' },
  'admin.residents.empty': { vi: 'Không tìm thấy cư dân nào', en: 'No residents found' },
  'admin.residents.edit': {
    vi: 'Chỉnh sửa cư dân',
    en: 'Edit Resident'
  },
  'admin.residents.details': {
    vi: 'Chi tiết cư dân',
    en: 'Resident Details'
  },
  'admin.residents.fullName': {
    vi: 'Họ và tên',
    en: 'Full Name'
  },
  'admin.residents.idCard': {
    vi: 'CMND/CCCD',
    en: 'ID Card'
  },
  'admin.residents.dateOfBirth': {
    vi: 'Ngày sinh',
    en: 'Date of Birth'
  },
  'admin.residents.gender': {
    vi: 'Giới tính',
    en: 'Gender'
  },
  'admin.residents.phone': {
    vi: 'Số điện thoại',
    en: 'Phone Number'
  },
  'admin.residents.email': {
    vi: 'Email',
    en: 'Email'
  },
  'admin.residents.apartment': {
    vi: 'Căn hộ',
    en: 'Apartment'
  },
  'admin.residents.relationType': {
    vi: 'Quan hệ với chủ hộ',
    en: 'Relation to Owner'
  },

  // Resident Stats
  'admin.residents.stats.total': {
    vi: 'Tổng số cư dân',
    en: 'Total Residents'
  },
  'admin.residents.stats.totalDesc': {
    vi: 'Tất cả cư dân trong hệ thống',
    en: 'All residents in the system'
  },
  'admin.residents.stats.active': {
    vi: 'Cư dân hoạt động',
    en: 'Active Residents'
  },
  'admin.residents.stats.inactive': {
    vi: 'Cư dân không hoạt động',
    en: 'Inactive Residents'
  },
  'admin.residents.stats.ofTotal': {
    vi: 'tổng số',
    en: 'of total'
  },
  'admin.residents.results': {
    vi: 'kết quả',
    en: 'results'
  },
  'admin.residents.filter.byStatus': {
    vi: 'Lọc theo trạng thái',
    en: 'Filter by status'
  },
  'admin.residents.empty.search': {
    vi: 'Không tìm thấy cư dân nào phù hợp',
    en: 'No residents found matching your search'
  },
  'admin.residents.empty.noData': {
    vi: 'Chưa có cư dân nào',
    en: 'No residents yet'
  },
  'admin.residents.empty.searchHint': {
    vi: 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc',
    en: 'Try changing your search terms or filters'
  },
  'admin.residents.empty.noDataHint': {
    vi: 'Bắt đầu bằng cách thêm cư dân đầu tiên vào hệ thống',
    en: 'Start by adding the first resident to the system'
  },
  'admin.residents.delete.confirm': {
    vi: 'Bạn có chắc chắn muốn xóa cư dân này?',
    en: 'Are you sure you want to delete this resident?'
  },
  'admin.residents.delete.action': {
    vi: 'Xóa cư dân',
    en: 'Delete Resident'
  },

  // Export functionality
  'admin.export.exporting': {
    vi: 'Đang xuất...',
    en: 'Exporting...'
  },
  'admin.export.all': {
    vi: 'Xuất tất cả cư dân',
    en: 'Export All Residents'
  },
  'admin.export.filtered': {
    vi: 'Xuất cư dân đã lọc',
    en: 'Export Filtered Residents'
  },
  'admin.export.currentPage': {
    vi: 'Xuất trang hiện tại',
    en: 'Export Current Page'
  },
  'admin.export.stats': {
    vi: 'Xuất báo cáo thống kê',
    en: 'Export Statistics Report'
  },
  'admin.export.success.title': {
    vi: 'Xuất Excel thành công',
    en: 'Excel Export Successful'
  },
  'admin.export.success.all': {
    vi: 'Đã xuất tất cả cư dân ra file Excel',
    en: 'All residents exported to Excel file'
  },
  'admin.export.success.filtered': {
    vi: 'Đã xuất cư dân đã lọc ra file Excel',
    en: 'Filtered residents exported to Excel file'
  },
  'admin.export.success.page': {
    vi: 'Đã xuất cư dân trang {page} ra file Excel',
    en: 'Residents from page {page} exported to Excel file'
  },
  'admin.export.success.stats': {
    vi: 'Đã xuất báo cáo thống kê ra file Excel',
    en: 'Statistics report exported to Excel file'
  },
  'admin.export.error.title': {
    vi: 'Lỗi xuất Excel',
    en: 'Excel Export Error'
  },
  'admin.export.error.general': {
    vi: 'Không thể xuất file Excel',
    en: 'Unable to export Excel file'
  },

  // Pagination
  'admin.pagination.showing': {
    vi: 'Hiển thị {start}-{end} trong tổng số {total} cư dân',
    en: 'Showing {start}-{end} of {total} residents'
  },
  'admin.pagination.first': {
    vi: 'Trang đầu',
    en: 'First Page'
  },
  'admin.pagination.previous': {
    vi: 'Trang trước',
    en: 'Previous Page'
  },
  'admin.pagination.next': {
    vi: 'Trang sau',
    en: 'Next Page'
  },
  'admin.pagination.last': {
    vi: 'Trang cuối',
    en: 'Last Page'
  },

  // Apartment Management
  'admin.apartments.title': {
    vi: 'Quản lý căn hộ',
    en: 'Apartment Management'
  },
  'admin.apartments.listDesc': { vi: 'Quản lý thông tin căn hộ trong hệ thống', en: 'Manage apartment information in the system' },
  'admin.apartments.list': {
    vi: 'Danh sách căn hộ',
    en: 'Apartment List'
  },
  'admin.apartments.searchPlaceholder': { vi: 'Tìm theo mã căn hộ, tòa nhà...', en: 'Search by unit number, building...' },
  'admin.apartments.status.all': { vi: 'Tất cả trạng thái', en: 'All statuses' },
  'admin.apartments.status.AVAILABLE': { vi: 'Còn trống', en: 'Available' },
  'admin.apartments.status.OCCUPIED': { vi: 'Có người ở', en: 'Occupied' },
  'admin.apartments.status.VACANT': { vi: 'Trống', en: 'Vacant' },
  'admin.apartments.status.MAINTENANCE': { vi: 'Bảo trì', en: 'Maintenance' },
  'admin.apartments.create': {
    vi: 'Tạo căn hộ mới',
    en: 'Create New Apartment'
  },
  'admin.apartments.addButton': { vi: 'Thêm Căn Hộ', en: 'Add Apartment' },
  'admin.apartments.edit': {
    vi: 'Chỉnh sửa căn hộ',
    en: 'Edit Apartment'
  },
  'admin.apartments.details': {
    vi: 'Chi tiết căn hộ',
    en: 'Apartment Details'
  },
  'admin.apartments.columns.id': { vi: 'ID', en: 'ID' },
  'admin.apartments.columns.unitNumber': { vi: 'Mã Căn Hộ', en: 'Unit Number' },
  'admin.apartments.columns.building': { vi: 'Tòa Nhà', en: 'Building' },
  'admin.apartments.columns.floor': { vi: 'Tầng', en: 'Floor' },
  'admin.apartments.columns.area': { vi: 'Diện Tích (m²)', en: 'Area (m²)' },
  'admin.apartments.columns.status': { vi: 'Trạng Thái', en: 'Status' },
  'admin.apartments.columns.actions': { vi: 'Thao Tác', en: 'Actions' },
  'admin.apartments.results': { vi: 'kết quả', en: 'results' },

  // Commonly used short apartment labels
  'admin.apartments.building': { vi: 'Tòa', en: 'Building' },
  'admin.apartments.floor': { vi: 'Tầng', en: 'Floor' },
  'admin.apartments.unitNumber': { vi: 'Mã căn hộ', en: 'Unit Number' },
  'admin.apartments.apartment': { vi: 'Căn hộ', en: 'Apartment' },

  // Apartment Stats
  'admin.apartments.stats.total': { vi: 'Tổng số căn hộ', en: 'Total Apartments' },
  'admin.apartments.stats.totalDesc': { vi: 'Tất cả căn hộ trong hệ thống', en: 'All apartments in the system' },
  'admin.apartments.stats.occupied': { vi: 'Căn hộ có người ở', en: 'Occupied Apartments' },
  'admin.apartments.stats.vacant': { vi: 'Căn hộ trống', en: 'Vacant Apartments' },
  'admin.apartments.stats.totalArea': { vi: 'Tổng diện tích', en: 'Total Area' },
  'admin.apartments.stats.areaDesc': { vi: 'm² - Trung bình', en: 'm² - Average' },
  'admin.apartments.stats.perApartment': { vi: 'm²/căn', en: 'm²/apartment' },
  'admin.apartments.stats.ofTotal': { vi: 'tổng số', en: 'of total' },

  // Apartment Empty States
  'admin.apartments.empty.search': { vi: 'Không tìm thấy căn hộ nào phù hợp', en: 'No apartments found matching your search' },
  'admin.apartments.empty.noData': { vi: 'Chưa có căn hộ nào', en: 'No apartments yet' },
  'admin.apartments.empty.searchHint': { vi: 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc', en: 'Try changing your search terms or filters' },
  'admin.apartments.empty.noDataHint': { vi: 'Bắt đầu bằng cách thêm căn hộ đầu tiên vào hệ thống', en: 'Start by adding the first apartment to the system' },

  // Apartments detail sections
  'admin.apartments.info.title': { vi: 'Thông tin căn hộ', en: 'Apartment Information' },
  'admin.apartments.info.number': { vi: 'Mã/Số căn hộ', en: 'Apartment number' },
  'admin.apartments.info.building': { vi: 'Tòa nhà', en: 'Building' },
  'admin.apartments.info.floor': { vi: 'Tầng', en: 'Floor' },
  'admin.apartments.info.area': { vi: 'Diện tích', en: 'Area' },
  'admin.apartments.info.status': { vi: 'Trạng thái', en: 'Status' },
  'admin.apartments.notFound': { vi: 'Không tìm thấy thông tin căn hộ', en: 'Apartment not found' },

  // Residents management inside apartment
  'admin.apartments.residents.manage': { vi: 'Quản lý cư dân', en: 'Residents Management' },
  'admin.apartments.residents.linkNew': { vi: 'Liên kết cư dân mới', en: 'Link new resident' },
  'admin.apartments.residents.phone': { vi: 'Số điện thoại', en: 'Phone number' },
  'admin.apartments.residents.phone.placeholder': { vi: 'Nhập số điện thoại', en: 'Enter phone number' },
  'admin.apartments.residents.find': { vi: 'Tìm', en: 'Find' },
  'admin.apartments.residents.notFound': { vi: 'Không tìm thấy tài khoản với số điện thoại này', en: 'No account found with this phone number' },
  'admin.apartments.residents.findError': { vi: 'Lỗi khi tìm kiếm tài khoản', en: 'Error searching account' },
  'admin.apartments.residents.networkError': { vi: 'Lỗi kết nối', en: 'Network error' },
  'admin.apartments.residents.linkSuccess': { vi: 'Liên kết cư dân thành công!', en: 'Resident linked successfully!' },
  'admin.apartments.residents.relation': { vi: 'Quan hệ với căn hộ', en: 'Relation to apartment' },
  'admin.apartments.residents.relation.OWNER': { vi: 'Chủ hộ', en: 'Owner' },
  'admin.apartments.residents.relation.TENANT': { vi: 'Người thuê', en: 'Tenant' },
  'admin.apartments.residents.relation.FAMILY_MEMBER': { vi: 'Thành viên gia đình', en: 'Family member' },
  'admin.apartments.residents.linkBtn': { vi: 'Liên kết cư dân', en: 'Link resident' },
  'admin.apartments.residents.linking': { vi: 'Đang liên kết...', en: 'Linking...' },
  'admin.apartments.residents.current': { vi: 'Cư dân đang ở', en: 'Current residents' },
  'admin.apartments.residents.none': { vi: 'Chưa có cư dân liên kết', en: 'No linked residents' },
  'admin.apartments.residents.useFormHint': { vi: 'Sử dụng form bên trên để liên kết cư dân với căn hộ này.', en: 'Use the form above to link a resident to this apartment.' },
  'admin.apartments.residents.table.name': { vi: 'Tên', en: 'Name' },
  'admin.apartments.residents.table.phone': { vi: 'SĐT', en: 'Phone' },
  'admin.apartments.residents.table.relation': { vi: 'Quan hệ', en: 'Relation' },
  'admin.apartments.residents.table.moveIn': { vi: 'Ngày vào', en: 'Move-in date' },
  'admin.apartments.residents.table.moveOut': { vi: 'Ngày ra', en: 'Move-out date' },
  'admin.apartments.residents.table.actions': { vi: 'Thao tác', en: 'Actions' },
  'admin.apartments.residents.staying': { vi: 'Đang ở', en: 'Staying' },

  // Vehicles
  'admin.apartments.vehicles.title': { vi: 'Xe đăng ký', en: 'Registered Vehicles' },
  'admin.apartments.vehicles.none': { vi: 'Chưa có xe đăng ký', en: 'No vehicles registered' },
  'admin.apartments.vehicles.table.owner': { vi: 'Chủ xe', en: 'Owner' },
  'admin.apartments.vehicles.table.type': { vi: 'Loại xe', en: 'Vehicle type' },
  'admin.apartments.vehicles.table.brandModel': { vi: 'Thương hiệu & Model', en: 'Brand & Model' },
  'admin.apartments.vehicles.table.license': { vi: 'Biển số', en: 'License plate' },
  'admin.apartments.vehicles.table.color': { vi: 'Màu sắc', en: 'Color' },
  'admin.apartments.vehicles.table.registrationDate': { vi: 'Ngày đăng ký', en: 'Registration date' },

  // Water
  'admin.apartments.water.title': { vi: 'Chỉ số nước', en: 'Water meter readings' },
  'admin.apartments.water.none': { vi: 'Chưa có chỉ số nước', en: 'No water meter readings' },
  'admin.apartments.water.table.date': { vi: 'Ngày đọc', en: 'Reading date' },
  'admin.apartments.water.table.previous': { vi: 'Chỉ số trước', en: 'Previous reading' },
  'admin.apartments.water.table.current': { vi: 'Chỉ số hiện tại', en: 'Current reading' },
  'admin.apartments.water.table.consumption': { vi: 'Tiêu thụ', en: 'Consumption' },

  // Latest invoice
  'admin.apartments.invoice.latest': { vi: 'Hóa đơn gần nhất', en: 'Latest invoice' },
  'admin.apartments.invoice.period': { vi: 'Kỳ hóa đơn', en: 'Billing period' },
  'admin.apartments.invoice.total': { vi: 'Tổng tiền', en: 'Total amount' },
  'admin.apartments.invoice.status': { vi: 'Trạng thái', en: 'Status' },
  'admin.invoices.status.PAID': { vi: 'Đã thanh toán', en: 'Paid' },
  'admin.invoices.status.UNPAID': { vi: 'Chưa thanh toán', en: 'Unpaid' },

  // Filters common

  // Common Actions
  'admin.action.viewDetails': { vi: 'Xem chi tiết', en: 'View Details' },
  'admin.action.viewResidents': { vi: 'Xem cư dân', en: 'View Residents' },
  'admin.action.moreOptions': { vi: 'Thêm tùy chọn', en: 'More Options' },
  'admin.action.viewPrice': { vi: 'Xem giá thuê', en: 'View Price' },

  // Singular apartment edit (legacy keys used in edit page)
  'admin.apartment.edit.title': { vi: 'Chỉnh sửa căn hộ', en: 'Edit apartment' },
  'admin.apartment.edit.loading': { vi: 'Đang tải dữ liệu...', en: 'Loading data...' },
  'admin.apartment.edit.unitNumber': { vi: 'Mã căn hộ', en: 'Unit number' },
  'admin.apartment.edit.buildingId': { vi: 'Tòa', en: 'Building' },
  'admin.apartment.edit.floorNumber': { vi: 'Tầng', en: 'Floor' },
  'admin.apartment.edit.area': { vi: 'Diện tích (m²)', en: 'Area (m²)' },
  'admin.apartment.edit.status': { vi: 'Trạng thái', en: 'Status' },

  // Announcement Management
  'admin.announcements.title': {
    vi: 'Quản lý thông báo',
    en: 'Announcement Management'
  },
  'admin.announcements.list': {
    vi: 'Danh sách thông báo',
    en: 'Announcement List'
  },
  'admin.announcements.listDesc': { vi: 'Quản lý tất cả thông báo trong hệ thống', en: 'Manage all announcements in the system' },
  'admin.announcements.create': {
    vi: 'Tạo thông báo mới',
    en: 'Create New Announcement'
  },
  'admin.announcements.createDesc': {
    vi: 'Tạo một thông báo gửi đến cư dân',
    en: 'Create an announcement for residents'
  },
  'admin.announcements.edit': {
    vi: 'Chỉnh sửa thông báo',
    en: 'Edit Announcement'
  },
  'admin.announcements.details': {
    vi: 'Chi tiết thông báo',
    en: 'Announcement Details'
  },
  'admin.announcements.info': { vi: 'Thông tin thông báo', en: 'Announcement Information' },
  'admin.announcements.titleLabel': { vi: 'Tiêu đề', en: 'Title' },
  'admin.announcements.title.placeholder': { vi: 'Nhập tiêu đề thông báo', en: 'Enter announcement title' },
  'admin.announcements.contentLabel': { vi: 'Nội dung', en: 'Content' },
  'admin.announcements.content.placeholder': { vi: 'Nhập nội dung thông báo', en: 'Enter announcement content' },
  'admin.announcements.targetAudience.placeholder': { vi: 'Chọn đối tượng nhận', en: 'Select target audience' },
  'admin.announcements.targetAudience.all': { vi: 'Tất cả cư dân', en: 'All residents' },
  'admin.announcements.targetAudience.towerA': { vi: 'Cư dân tòa A', en: 'Tower A residents' },
  'admin.announcements.targetAudience.towerB': { vi: 'Cư dân tòa B', en: 'Tower B residents' },
  'admin.announcements.targetAudience.specific': { vi: 'Căn hộ cụ thể', en: 'Specific apartments' },
  'admin.announcements.isActive': { vi: 'Trạng thái hoạt động', en: 'Active status' },
  'admin.announcements.isActive.desc': { vi: 'Thông báo sẽ hiển thị cho cư dân khi được kích hoạt', en: 'Announcement will be visible to residents when activated' },
  'admin.announcements.createSuccess': { vi: 'Đã tạo thông báo mới', en: 'Announcement created successfully' },
  'admin.announcements.createError': { vi: 'Không thể tạo thông báo', en: 'Failed to create announcement' },
  'admin.announcements.announcementTitle': {
    vi: 'Tiêu đề',
    en: 'Title'
  },
  'admin.announcements.content': {
    vi: 'Nội dung',
    en: 'Content'
  },
  'admin.announcements.type': {
    vi: 'Loại thông báo',
    en: 'Announcement Type'
  },
  'admin.announcements.priority': {
    vi: 'Mức độ ưu tiên',
    en: 'Priority'
  },
  'admin.announcements.publishedAt': {
    vi: 'Ngày đăng',
    en: 'Published At'
  },
  'admin.announcements.author': {
    vi: 'Người đăng',
    en: 'Author'
  },
  'admin.announcements.searchPlaceholder': { vi: 'Tìm kiếm theo tiêu đề, nội dung...', en: 'Search by title, content...' },
  'admin.announcements.type.all': { vi: 'Tất cả loại', en: 'All types' },
  'admin.announcements.type.news': { vi: 'Tin tức', en: 'News' },
  'admin.announcements.type.regular': { vi: 'Thường', en: 'Regular' },
  'admin.announcements.type.urgent': { vi: 'Khẩn cấp', en: 'Urgent' },
  'admin.announcements.targetAudience': { vi: 'Đối tượng', en: 'Target Audience' },
  'admin.announcements.targetAudience.ALL_RESIDENTS': { vi: 'Tất cả cư dân', en: 'All residents' },
  'admin.announcements.targetAudience.TOWER_A_RESIDENTS': { vi: 'Tòa A', en: 'Tower A' },
  'admin.announcements.targetAudience.TOWER_B_RESIDENTS': { vi: 'Tòa B', en: 'Tower B' },
  'admin.announcements.targetAudience.SPECIFIC_APARTMENTS': { vi: 'Căn hộ cụ thể', en: 'Specific apartments' },
  'admin.announcements.loadError': { vi: 'Không thể tải danh sách thông báo', en: 'Unable to load announcements' },
  'admin.announcements.deleteSuccess': { vi: 'Đã xóa thông báo', en: 'Announcement deleted' },
  'admin.announcements.deleteError': { vi: 'Không thể xóa thông báo', en: 'Unable to delete announcement' },
  'admin.announcements.confirmDelete': { vi: 'Bạn có chắc chắn muốn xóa thông báo này?', en: 'Are you sure you want to delete this announcement?' },

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
  'admin.edit': { vi: 'Chỉnh sửa', en: 'Edit' },
  'admin.delete': { vi: 'Xóa', en: 'Delete' },

  // Admin Export
  'admin.export.data': { vi: 'Xuất dữ liệu', en: 'Export Data' },

  // Admin Announcements Additional
  'admin.announcements.noResults': { vi: 'Không tìm thấy thông báo', en: 'No announcements found' },
  'admin.announcements.noResultsDesc': { vi: 'Không có thông báo nào khớp với tiêu chí tìm kiếm của bạn', en: 'No announcements match your search criteria' },
  'admin.announcements.createFirst': { vi: 'Tạo thông báo đầu tiên', en: 'Create first announcement' },
  'admin.announcements.results': { vi: 'kết quả', en: 'results' },

  // Event Management
  'admin.events.title': {
    vi: 'Quản lý sự kiện',
    en: 'Event Management'
  },
  'admin.events.list': {
    vi: 'Danh sách sự kiện',
    en: 'Event List'
  },
  'admin.events.listDesc': { vi: 'Quản lý tất cả sự kiện trong chung cư', en: 'Manage all events in the apartment' },
  'admin.events.create': {
    vi: 'Tạo sự kiện mới',
    en: 'Create New Event'
  },
  'admin.events.createDesc': {
    vi: 'Tổ chức sự kiện cho cư dân',
    en: 'Organize an event for residents'
  },
  'admin.events.edit': {
    vi: 'Chỉnh sửa sự kiện',
    en: 'Edit Event'
  },
  'admin.events.details': {
    vi: 'Chi tiết sự kiện',
    en: 'Event Details'
  },
  'admin.events.createSuccess': { vi: 'Đã tạo sự kiện mới', en: 'Event created successfully' },
  'admin.events.createError': { vi: 'Không thể tạo sự kiện', en: 'Failed to create event' },
  'admin.events.time.invalid': { vi: 'Thời gian kết thúc phải sau thời gian bắt đầu', en: 'End time must be after start time' },
  'admin.events.name': {
    vi: 'Tên sự kiện',
    en: 'Event Name'
  },
  'admin.events.description': {
    vi: 'Mô tả',
    en: 'Description'
  },
  'admin.events.startDate': {
    vi: 'Ngày bắt đầu',
    en: 'Start Date'
  },
  'admin.events.endDate': {
    vi: 'Ngày kết thúc',
    en: 'End Date'
  },
  'admin.events.location': {
    vi: 'Địa điểm',
    en: 'Location'
  },
  'admin.events.maxParticipants': {
    vi: 'Số người tham gia tối đa',
    en: 'Max Participants'
  },
  'admin.events.currentParticipants': {
    vi: 'Số người đã đăng ký',
    en: 'Current Participants'
  },
  'admin.events.searchPlaceholder': { vi: 'Tìm kiếm theo tên, mô tả, địa điểm...', en: 'Search by name, description, location...' },
  'admin.events.status.all': { vi: 'Tất cả trạng thái', en: 'All statuses' },
  'admin.events.status.UPCOMING': { vi: 'Sắp diễn ra', en: 'Upcoming' },
  'admin.events.status.ONGOING': { vi: 'Đang diễn ra', en: 'Ongoing' },
  'admin.events.status.COMPLETED': { vi: 'Đã kết thúc', en: 'Completed' },
  'admin.events.status.CANCELLED': { vi: 'Đã hủy', en: 'Cancelled' },
  'admin.events.filter.status': { vi: 'Lọc theo trạng thái', en: 'Filter by status' },

  // Vehicle Management
  'admin.vehicleRegistrations.title': {
    vi: 'Quản lý đăng ký xe',
    en: 'Vehicle Registration Management'
  },
  'admin.vehicleRegistrations.main.title': {
    vi: 'Quản lý đăng ký xe',
    en: 'Vehicle Registration Management'
  },
  'admin.vehicleRegistrations.main.subtitle': {
    vi: 'Quản lý tất cả đăng ký xe của cư dân',
    en: 'Manage all resident vehicle registrations'
  },
  'admin.vehicleRegistrations.pending.cars.title': {
    vi: 'Ô tô chờ duyệt',
    en: 'Pending Cars'
  },
  'admin.vehicleRegistrations.pending.cars.subtitle': {
    vi: 'Ô tô chờ duyệt ({count})',
    en: 'Pending cars ({count})'
  },
  'admin.vehicleRegistrations.pending.cars.description': {
    vi: 'Danh sách ô tô đang chờ phê duyệt',
    en: 'List of cars pending approval'
  },
  'admin.vehicleRegistrations.pending.motorcycles.title': {
    vi: 'Xe máy chờ duyệt',
    en: 'Pending Motorcycles'
  },
  'admin.vehicleRegistrations.pending.motorcycles.subtitle': {
    vi: 'Xe máy chờ duyệt ({count})',
    en: 'Pending motorcycles ({count})'
  },
  'admin.vehicleRegistrations.pending.motorcycles.description': {
    vi: 'Danh sách xe máy/xe đạp đang chờ phê duyệt',
    en: 'List of motorcycles/bicycles pending approval'
  },
  'admin.vehicleRegistrations.pending.all.title': {
    vi: 'Chờ duyệt ({count})',
    en: 'Pending ({count})'
  },
  'admin.vehicleRegistrations.all.title': {
    vi: 'Tất cả xe ({count})',
    en: 'All Vehicles ({count})'
  },
  'admin.vehicleRegistrations.approved.title': {
    vi: 'Đã duyệt ({count})',
    en: 'Approved ({count})'
  },
  'admin.vehicleRegistrations.rejected.title': {
    vi: 'Từ chối ({count})',
    en: 'Rejected ({count})'
  },
  'admin.vehicleRegistrations.capacity.overview.title': {
    vi: 'Tổng quan giới hạn',
    en: 'Capacity Overview'
  },
  'admin.vehicleRegistrations.capacity.config.title': {
    vi: 'Cấu hình giới hạn',
    en: 'Capacity Configuration'
  },
  'admin.vehicleRegistrations.fifo.title': {
    vi: 'Nguyên tắc duyệt xe: FIFO (First In, First Out)',
    en: 'Vehicle approval principle: FIFO (First In, First Out)'
  },
  'admin.vehicleRegistrations.fifo.description': {
    vi: 'Xe đăng ký trước sẽ được duyệt trước. Chỉ có thể duyệt xe sau khi xe trước đó đã được xử lý.',
    en: 'Vehicles registered first will be approved first. You can only approve subsequent vehicles after previous ones have been processed.'
  },
  'admin.vehicleRegistrations.actions.approve': {
    vi: 'Duyệt',
    en: 'Approve'
  },
  'admin.vehicleRegistrations.actions.reject': {
    vi: 'Từ chối',
    en: 'Reject'
  },
  'admin.vehicleRegistrations.actions.cancel': {
    vi: 'Hủy đăng ký',
    en: 'Cancel Registration'
  },
  'admin.vehicleRegistrations.actions.restore': {
    vi: 'Khôi phục',
    en: 'Restore'
  },
  'admin.vehicleRegistrations.actions.back': {
    vi: 'Quay lại',
    en: 'Back'
  },
  'admin.vehicleRegistrations.actions.viewDetails': {
    vi: 'Xem chi tiết',
    en: 'View Details'
  },
  'admin.vehicleRegistrations.actions.createNew': {
    vi: 'Tạo mới',
    en: 'Create New'
  },
  'admin.vehicleRegistrations.status.canApprove': {
    vi: 'Có thể duyệt',
    en: 'Can Approve'
  },
  'admin.vehicleRegistrations.status.cannotApprove': {
    vi: 'Không thể duyệt',
    en: 'Cannot Approve'
  },
  'admin.vehicleRegistrations.table.owner': {
    vi: 'Chủ xe',
    en: 'Owner'
  },
  'admin.vehicleRegistrations.table.type': {
    vi: 'Loại xe',
    en: 'Vehicle Type'
  },
  'admin.vehicleRegistrations.table.licensePlate': {
    vi: 'Biển số',
    en: 'License Plate'
  },
  'admin.vehicleRegistrations.table.color': {
    vi: 'Màu sắc',
    en: 'Color'
  },
  'admin.vehicleRegistrations.table.apartment': {
    vi: 'Căn hộ',
    en: 'Apartment'
  },
  'admin.vehicleRegistrations.table.registrationDate': {
    vi: 'Thời gian đăng ký',
    en: 'Registration Date'
  },
  'admin.vehicleRegistrations.table.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },
  'admin.vehicleRegistrations.table.capacityLimit': {
    vi: 'Giới hạn xe',
    en: 'Capacity Limit'
  },
  'admin.vehicleRegistrations.table.actions': {
    vi: 'Hành động',
    en: 'Actions'
  },
  'admin.vehicleRegistrations.table.sequence': {
    vi: 'Thứ tự',
    en: 'Sequence'
  },
  'admin.vehicleRegistrations.table.image': {
    vi: 'Hình ảnh',
    en: 'Image'
  },
  'admin.vehicleRegistrations.capacity.overview.title.full': {
    vi: 'Tổng quan giới hạn xe',
    en: 'Vehicle Capacity Overview'
  },
  'admin.vehicleRegistrations.capacity.overview.description': {
    vi: 'Xem tình trạng sức chứa xe của tất cả tòa nhà',
    en: 'View capacity status of vehicles for all buildings'
  },
  'admin.vehicleRegistrations.capacity.loading': {
    vi: 'Đang tải thông tin giới hạn xe...',
    en: 'Loading vehicle capacity information...'
  },
  'admin.vehicleRegistrations.capacity.empty': {
    vi: 'Chưa có cấu hình giới hạn xe',
    en: 'No vehicle capacity configurations yet'
  },
  'admin.vehicleRegistrations.capacity.overview.cardTitle': {
    vi: 'Giới hạn xe - {building}',
    en: 'Vehicle limit - {building}'
  },
  'admin.vehicleRegistrations.capacity.overview.cardSubtitle': {
    vi: 'Tình trạng sức chứa xe hiện tại',
    en: 'Current vehicle capacity status'
  },
  'admin.vehicleRegistrations.capacity.labels.cars': {
    vi: 'Ô tô (4-7 chỗ)',
    en: 'Cars (4-7 seats)'
  },
  'admin.vehicleRegistrations.capacity.labels.motorcycles': {
    vi: 'Xe máy',
    en: 'Motorcycles'
  },
  'admin.vehicleRegistrations.capacity.labels.current': { vi: 'Hiện tại', en: 'Current' },
  'admin.vehicleRegistrations.capacity.labels.max': { vi: 'Tối đa', en: 'Max' },
  'admin.vehicleRegistrations.capacity.labels.status': { vi: 'Trạng thái', en: 'Status' },
  'admin.vehicleRegistrations.capacity.labels.cannotRegisterMore': { vi: 'Không thể đăng ký thêm', en: 'Cannot register more' },
  'admin.vehicleRegistrations.capacity.labels.remainingSpots': { vi: 'Chỉ còn {count} chỗ', en: '{count} spots remaining' },
  'admin.vehicleRegistrations.capacity.labels.applied': { vi: 'Cấu hình đang được áp dụng', en: 'Configuration is applied' },
  'admin.vehicleRegistrations.capacity.labels.disabledNote': { vi: 'Cấu hình đã bị tắt, không áp dụng giới hạn', en: 'Configuration is disabled; limits not applied' },
  'admin.vehicleRegistrations.capacity.labels.buildingName': { vi: 'Tòa {id}', en: 'Building {id}' },
  'admin.vehicleRegistrations.capacity.status.disabled': { vi: 'Không hỗ trợ', en: 'Not supported' },
  'admin.vehicleRegistrations.capacity.status.full': { vi: 'Đã đầy', en: 'Full' },
  'admin.vehicleRegistrations.capacity.status.warning': { vi: 'Gần đầy', en: 'Almost full' },
  'admin.vehicleRegistrations.capacity.status.available': { vi: 'Còn chỗ', en: 'Available' },
  'admin.vehicleRegistrations.loading': {
    vi: 'Đang tải...',
    en: 'Loading...'
  },
  'admin.vehicleRegistrations.noData': {
    vi: 'Không có dữ liệu',
    en: 'No data available'
  },
  'admin.vehicleRegistrations.empty.pending': {
    vi: 'Không có xe chờ duyệt',
    en: 'No pending vehicles'
  },
  'admin.vehicleRegistrations.empty.all': {
    vi: 'Chưa có xe nào trong hệ thống',
    en: 'No vehicles in the system yet'
  },
  'admin.vehicleRegistrations.rejectModal.title': {
    vi: 'Chọn lý do từ chối',
    en: 'Select rejection reason'
  },
  'admin.vehicleRegistrations.rejectModal.quickReasons': {
    vi: 'Lý do nhanh:',
    en: 'Quick reasons:'
  },
  'admin.vehicleRegistrations.rejectModal.cancel': {
    vi: 'Hủy',
    en: 'Cancel'
  },
  'admin.vehicleRegistrations.rejectModal.confirm': {
    vi: 'Xác nhận từ chối',
    en: 'Confirm rejection'
  },
  'admin.vehicleRegistrations.cancelModal.title': {
    vi: 'Xác nhận hủy đăng ký xe',
    en: 'Confirm vehicle registration cancellation'
  },
  'admin.vehicleRegistrations.cancelModal.description': {
    vi: 'Bạn có chắc chắn muốn hủy đăng ký xe này không?',
    en: 'Are you sure you want to cancel this vehicle registration?'
  },
  'admin.vehicleRegistrations.cancelModal.quickReasons': {
    vi: 'Chọn lý do nhanh:',
    en: 'Select quick reason:'
  },
  'admin.vehicleRegistrations.cancelModal.placeholder': {
    vi: 'Nhập lý do hủy đăng ký...',
    en: 'Enter cancellation reason...'
  },
  'admin.vehicleRegistrations.cancelModal.cancel': {
    vi: 'Hủy',
    en: 'Cancel'
  },
  'admin.vehicleRegistrations.cancelModal.confirm': {
    vi: 'Xác nhận hủy',
    en: 'Confirm cancellation'
  },
  'admin.vehicleRegistrations.cancelModal.processing': {
    vi: 'Đang xử lý...',
    en: 'Processing...'
  },
  'admin.vehicleRegistrations.error.requiredReason': {
    vi: 'Vui lòng nhập lý do hủy.',
    en: 'Please enter a cancellation reason.'
  },
  'admin.vehicleRegistrations.imageModal.total': {
    vi: 'Tổng cộng: {count} hình ảnh',
    en: 'Total: {count} images'
  },
  'admin.vehicleRegistrations.imageModal.clickHint': {
    vi: 'Click vào hình ảnh để xem full size',
    en: 'Click on image to view full size'
  },
  'admin.vehicleRegistrations.capacityWarning.title': {
    vi: 'Cảnh báo: Một số xe không thể duyệt',
    en: 'Warning: Some vehicles cannot be approved'
  },
  'admin.vehicleRegistrations.capacityWarning.description': {
    vi: 'Các xe này đã đạt giới hạn số lượng tối đa cho loại xe tương ứng trong tòa nhà',
    en: 'These vehicles have reached the maximum limit for their vehicle type in the building'
  },
  'admin.vehicleRegistrations.image.clickToView': {
    vi: 'Click để xem tất cả hình ảnh',
    en: 'Click to view all images'
  },
  'admin.vehicleRegistrations.image.errorLoading': {
    vi: 'Lỗi tải ảnh',
    en: 'Error loading image'
  },
  'admin.vehicleRegistrations.image.noImage': {
    vi: 'Không có ảnh',
    en: 'No image'
  },
  'admin.vehicleRegistrations.image.viewAll': {
    vi: 'Xem tất cả',
    en: 'View all'
  },
  'admin.vehicleRegistrations.tooltip.approve': {
    vi: 'Duyệt xe',
    en: 'Approve vehicle'
  },
  'admin.vehicleRegistrations.tooltip.cannotApproveQueue': {
    vi: 'Không thể duyệt - Phải duyệt xe trước đó trước',
    en: 'Cannot approve - Must approve previous vehicles first'
  },
  'admin.vehicleRegistrations.tooltip.cannotApproveLimit': {
    vi: 'Không thể duyệt - Đã đạt giới hạn',
    en: 'Cannot approve - Limit reached'
  },
  'admin.vehicleRegistrations.rejectionReasons.inaccurateInfo': {
    vi: 'Thông tin xe không chính xác',
    en: 'Inaccurate vehicle information'
  },
  'admin.vehicleRegistrations.rejectionReasons.unreadablePlate': {
    vi: 'Biển số xe không rõ ràng',
    en: 'Unreadable license plate'
  },
  'admin.vehicleRegistrations.rejectionReasons.missingDocuments': {
    vi: 'Thiếu giấy tờ xe',
    en: 'Missing vehicle documents'
  },
  'admin.vehicleRegistrations.rejectionReasons.unsafetyStandards': {
    vi: 'Xe không đủ tiêu chuẩn an toàn',
    en: 'Vehicle does not meet safety standards'
  },
  'admin.vehicleRegistrations.rejectionReasons.invalidOwnerInfo': {
    vi: 'Thông tin chủ xe không hợp lệ',
    en: 'Invalid owner information'
  },
  'admin.vehicleRegistrations.rejectionReasons.exceedsLimit': {
    vi: 'Vượt quá giới hạn xe cho phép',
    en: 'Exceeds allowed vehicle limit'
  },
  'admin.vehicleRegistrations.rejectionReasons.other': {
    vi: 'Lý do khác',
    en: 'Other reason'
  },
  'admin.vehicleRegistrations.tabs.pending': {
    vi: 'Chờ duyệt ({count})',
    en: 'Pending ({count})'
  },
  'admin.vehicleRegistrations.tabs.all': {
    vi: 'Tất cả xe ({count})',
    en: 'All Vehicles ({count})'
  },
  'admin.vehicleRegistrations.tabs.approved': {
    vi: 'Đã duyệt ({count})',
    en: 'Approved ({count})'
  },
  'admin.vehicleRegistrations.tabs.rejected': {
    vi: 'Từ chối ({count})',
    en: 'Rejected ({count})'
  },

  // Additional vehicle registration keys
  'admin.vehicleRegistrations.search.placeholder': { vi: 'Tìm kiếm theo tên chủ xe, biển số, căn hộ...', en: 'Search by owner name, license plate, apartment...' },
  'admin.vehicleRegistrations.sort.newest': { vi: 'Mới nhất', en: 'Newest' },
  'admin.vehicleRegistrations.sort.oldest': { vi: 'Cũ nhất', en: 'Oldest' },
  'admin.vehicleRegistrations.sort.name': { vi: 'Tên A-Z', en: 'Name A-Z' },
  'admin.vehicleRegistrations.capacity.label.motorcycles': { vi: 'Xe máy/Xe đạp', en: 'Motorcycles/Bicycles' },
  'admin.vehicleRegistrations.capacity.label.cars': { vi: 'Ô tô', en: 'Cars' },
  'admin.vehicleRegistrations.cancelModal.requiredReason': { vi: 'Vui lòng nhập lý do hủy.', en: 'Please enter cancellation reason.' },
  'admin.vehicleRegistrations.restore.cannotRestore': { vi: 'Bãi xe đã đầy hoặc cấu hình không cho phép. Không thể khôi phục.', en: 'Parking lot is full or configuration does not allow. Cannot restore.' },
  'admin.vehicleRegistrations.table.updated': { vi: 'Cập nhật:', en: 'Updated:' },
  'admin.vehicleRegistrations.tooltip.canRestore': { vi: 'Khôi phục', en: 'Restore' },
  'admin.vehicleRegistrations.tooltip.cannotRestore': { vi: 'Không thể khôi phục - Bãi xe đã đầy hoặc không có cấu hình hoạt động', en: 'Cannot restore - Parking lot is full or no active configuration' },

  // Facility Management
  'admin.facilities.title': {
    vi: 'Quản lý tiện ích',
    en: 'Facility Management'
  },
  'admin.facilities.list': {
    vi: 'Danh sách tiện ích',
    en: 'Facility List'
  },
  'admin.facilities.listDesc': {
    vi: 'Quản lý tất cả tiện ích trong chung cư',
    en: 'Manage all facilities in the apartment'
  },
  'admin.facilities.create': {
    vi: 'Tạo tiện ích mới',
    en: 'Create New Facility'
  },
  'admin.facilities.edit': {
    vi: 'Chỉnh sửa tiện ích',
    en: 'Edit Facility'
  },
  'admin.facilities.editDesc': {
    vi: 'Cập nhật thông tin tiện ích',
    en: 'Update facility information'
  },
  'admin.facilities.info': {
    vi: 'Thông tin tiện ích',
    en: 'Facility Information'
  },
  'admin.facilities.details': {
    vi: 'Chi tiết tiện ích',
    en: 'Facility Details'
  },
  'admin.facilities.name': {
    vi: 'Tên tiện ích',
    en: 'Facility Name'
  },
  'admin.facilities.description': {
    vi: 'Mô tả',
    en: 'Description'
  },
  'admin.facilities.type': {
    vi: 'Loại tiện ích',
    en: 'Facility Type'
  },
  'admin.facilities.capacity': {
    vi: 'Sức chứa',
    en: 'Capacity'
  },
  'admin.facilities.capacity.label.small': { vi: 'Nhỏ', en: 'Small' },
  'admin.facilities.capacity.label.medium': { vi: 'Trung bình', en: 'Medium' },
  'admin.facilities.capacity.label.large': { vi: 'Lớn', en: 'Large' },
  'admin.facilities.openingHours': {
    vi: 'Giờ mở cửa',
    en: 'Opening Hours'
  },
  'admin.facilities.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },
  'admin.facilities.recentBookingsTitle': {
    vi: '10 tiện ích cư dân đã đặt gần nhất',
    en: '10 most recent resident facility bookings'
  },
  'admin.facilities.recent.resident': { vi: 'Cư dân', en: 'Resident' },
  'admin.facilities.recent.facility': { vi: 'Tiện ích', en: 'Facility' },
  'admin.facilities.recent.bookingTime': { vi: 'Thời gian đặt', en: 'Booking time' },
  'admin.facilities.recent.numPeople': { vi: 'Số người', en: 'People' },
  'admin.facilities.recent.status': { vi: 'Trạng thái', en: 'Status' },

  // Facility Statistics
  'admin.facilities.stats.total': { vi: 'Tổng tiện ích', en: 'Total Facilities' },
  'admin.facilities.stats.totalDesc': { vi: 'Tiện ích trong hệ thống', en: 'Facilities in the system' },
  'admin.facilities.stats.location': { vi: 'Có vị trí', en: 'Has Location' },
  'admin.facilities.stats.locationDesc': { vi: 'Tiện ích có vị trí', en: 'Facilities with location' },
  'admin.facilities.stats.capacity': { vi: 'Tổng sức chứa', en: 'Total Capacity' },
  'admin.facilities.stats.capacityDesc': { vi: 'Người có thể sử dụng', en: 'People who can use' },
  'admin.facilities.stats.avgFee': { vi: 'Phí trung bình', en: 'Average Fee' },
  'admin.facilities.stats.avgFeeDesc': { vi: 'Phí sử dụng trung bình', en: 'Average usage fee' },

  // Facility Actions
  'admin.facilities.exportCSV': { vi: 'Xuất CSV', en: 'Export CSV' },
  'admin.facilities.exportExcel': { vi: 'Xuất Excel', en: 'Export Excel' },
  'admin.facilities.worksheetName': { vi: 'Tiện ích', en: 'Facilities' },

  // Facility Filters
  'admin.facilities.searchPlaceholder': { vi: 'Tìm kiếm theo tên, mô tả, vị trí...', en: 'Search by name, description, location...' },
  'admin.facilities.capacity.all': { vi: 'Tất cả sức chứa', en: 'All capacities' },
  'admin.facilities.capacity.small': { vi: 'Nhỏ (1-20)', en: 'Small (1-20)' },
  'admin.facilities.capacity.medium': { vi: 'Trung bình (21-50)', en: 'Medium (21-50)' },
  'admin.facilities.capacity.large': { vi: 'Lớn (>50)', en: 'Large (>50)' },

  // Facility Table

  'admin.facilities.location': { vi: 'Vị trí', en: 'Location' },
  'admin.facilities.otherDetails': { vi: 'Chi tiết khác', en: 'Other Details' },
  'admin.facilities.count': { vi: 'tiện ích', en: 'facilities' },
  'admin.facilities.noDescription': { vi: 'Không có mô tả', en: 'No description' },
  'admin.facilities.noLocation': { vi: 'Không có vị trí', en: 'No location' },
  'admin.facilities.noDetails': { vi: 'Không có chi tiết', en: 'No details' },
  'admin.facilities.visible': { vi: 'Hiển thị', en: 'Visible' },
  'admin.facilities.hidden': { vi: 'Ẩn', en: 'Hidden' },
  'admin.facilities.show': { vi: 'Hiện', en: 'Show' },
  'admin.facilities.hide': { vi: 'Ẩn', en: 'Hide' },

  // Facility Bulk Actions
  'admin.facilities.selected': { vi: 'tiện ích đã chọn', en: 'facilities selected' },
  'admin.facilities.deselect': { vi: 'Bỏ chọn', en: 'Deselect' },
  'admin.facilities.bulkDelete': { vi: 'Xóa đã chọn', en: 'Delete Selected' },

  // Facility Empty States
  'admin.facilities.noResults': { vi: 'Không tìm thấy tiện ích', en: 'No facilities found' },
  'admin.facilities.noResultsDesc': { vi: 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm', en: 'Try changing filters or search keywords' },
  'admin.facilities.noData': { vi: 'Chưa có tiện ích nào', en: 'No facilities yet' },
  'admin.facilities.noDataDesc': { vi: 'Bắt đầu bằng cách tạo tiện ích đầu tiên', en: 'Start by creating the first facility' },

  // Facility Confirmations
  'admin.facilities.confirmDelete': { vi: 'Bạn có chắc chắn muốn xóa tiện ích này?', en: 'Are you sure you want to delete this facility?' },
  'admin.facilities.confirmBulkDelete': { vi: 'Bạn có chắc chắn muốn xóa {count} tiện ích đã chọn?', en: 'Are you sure you want to delete {count} selected facilities?' },

  // Facility Success Messages
  'admin.facilities.deleteSuccess': { vi: 'Đã xóa tiện ích thành công', en: 'Facility deleted successfully' },
  'admin.facilities.visibilityToggleSuccess': { vi: 'Đã cập nhật trạng thái hiển thị', en: 'Visibility status updated' },
  'admin.facilities.bulkDeleteSuccess': { vi: 'Đã xóa các tiện ích đã chọn', en: 'Selected facilities deleted' },
  'admin.facilities.exportSuccess': { vi: 'Đã xuất dữ liệu thành công', en: 'Data exported successfully' },
  'admin.facilities.excelExportSuccess': { vi: 'Đã xuất Excel thành công', en: 'Excel exported successfully' },

  // Facility Warning Messages
  'admin.facilities.selectToDelete': { vi: 'Vui lòng chọn tiện ích để xóa', en: 'Please select facilities to delete' },

  // Admin Filters
  'admin.filters.clear': { vi: 'Xóa bộ lọc', en: 'Clear Filters' },

  // Admin Pagination
  'admin.pagination.itemsPerPage': { vi: 'Hiển thị:', en: 'Show:' },
  'admin.pagination.pageSize.5': { vi: '5', en: '5' },
  'admin.pagination.pageSize.10': { vi: '10', en: '10' },
  'admin.pagination.pageSize.20': { vi: '20', en: '20' },
  'admin.pagination.pageSize.50': { vi: '50', en: '50' },
  'admin.pagination.of': { vi: 'của', en: 'of' },
  'admin.pagination.results': { vi: 'kết quả', en: 'results' },

  // Admin Actions
  'admin.action.actions': { vi: 'Thao tác', en: 'Actions' },

  // Admin Success Messages
  'admin.success.delete': { vi: 'Thành công', en: 'Success' },
  'admin.success.update': { vi: 'Thành công', en: 'Success' },
  'admin.success.export': { vi: 'Thành công', en: 'Success' },

  // Admin Error Messages
  'admin.error.update': { vi: 'Lỗi', en: 'Error' },

  // Admin Warning Messages
  'admin.warning': { vi: 'Cảnh báo', en: 'Warning' },

  // Admin Common
  'admin.common.locale': { vi: 'vi-VN', en: 'en-US' },

  // Invoice Management
  'admin.invoices.title': {
    vi: 'Quản lý hóa đơn',
    en: 'Invoice Management'
  },
  'admin.invoices.list': {
    vi: 'Danh sách hóa đơn',
    en: 'Invoice List'
  },
  'admin.invoices.listDesc': {
    vi: 'Quản lý tất cả hóa đơn của cư dân',
    en: 'Manage all resident invoices'
  },
  'admin.invoices.create': {
    vi: 'Tạo hóa đơn mới',
    en: 'Create New Invoice'
  },
  'admin.invoices.createDesc': {
    vi: 'Xuất hóa đơn cho cư dân',
    en: 'Issue invoices for residents'
  },
  'admin.invoices.edit': {
    vi: 'Chỉnh sửa hóa đơn',
    en: 'Edit Invoice'
  },
  'admin.invoices.details': {
    vi: 'Chi tiết hóa đơn',
    en: 'Invoice Details'
  },
  'admin.invoices.invoiceNumber': {
    vi: 'Số hóa đơn',
    en: 'Invoice Number'
  },
  'admin.invoices.apartment': {
    vi: 'Căn hộ',
    en: 'Apartment'
  },
  'admin.invoices.resident': {
    vi: 'Cư dân',
    en: 'Resident'
  },
  'admin.invoices.amount': {
    vi: 'Số tiền',
    en: 'Amount'
  },
  'admin.invoices.dueDate': {
    vi: 'Ngày đến hạn',
    en: 'Due Date'
  },
  'admin.invoices.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },
  'admin.invoices.status.PENDING': { vi: 'Chờ thanh toán', en: 'Pending' },
  'admin.invoices.status.OVERDUE': { vi: 'Quá hạn', en: 'Overdue' },
  'admin.invoices.status.CANCELLED': { vi: 'Đã hủy', en: 'Cancelled' },
  'admin.invoices.loadingDetail': { vi: 'Đang tải thông tin hóa đơn...', en: 'Loading invoice details...' },
  'admin.invoices.notFound': { vi: 'Không tìm thấy hóa đơn', en: 'Invoice not found' },
  'admin.invoices.issueDate': { vi: 'Ngày phát hành', en: 'Issue Date' },
  'admin.invoices.total': { vi: 'Tổng cộng', en: 'Total' },
  'admin.invoices.totalDesc': { vi: 'Tất cả các khoản phí', en: 'All charges' },
  'admin.summary.title': { vi: 'Tóm tắt', en: 'Summary' },
  'admin.summary.invoiceId': { vi: 'Mã hóa đơn', en: 'Invoice ID' },
  'admin.actions.title': { vi: 'Hành động', en: 'Actions' },
  'admin.actions.downloadPdf': { vi: 'Tải PDF', en: 'Download PDF' },
  'admin.actions.sendEmail': { vi: 'Gửi email', en: 'Send email' },
  'admin.actions.printInvoice': { vi: 'In hóa đơn', en: 'Print invoice' },
  'admin.invoices.emailSent': { vi: 'Đã gửi email hóa đơn.', en: 'Invoice email sent.' },
  'admin.invoices.emailFailed': { vi: 'Gửi email thất bại', en: 'Failed to send email' },
  'admin.debug.title': { vi: 'Debug', en: 'Debug' },
  'admin.createdAt': { vi: 'Ngày tạo', en: 'Created At' },
  'admin.updatedAt': { vi: 'Cập nhật', en: 'Updated' },
  'admin.invoices.items.title': { vi: 'Chi tiết các khoản phí', en: 'Charge details' },
  'admin.invoices.items.empty': { vi: 'Chưa có chi tiết phí', en: 'No charge details' },
  'admin.invoices.items.itemLabel': { vi: 'Khoản phí', en: 'Item' },
  'admin.invoices.items.count': { vi: 'Số khoản phí', en: 'Number of items' },
  'admin.invoices.type': {
    vi: 'Loại hóa đơn',
    en: 'Invoice Type'
  },
  'admin.invoices.subtitle': { vi: 'Danh sách và trạng thái hóa đơn của cư dân', en: 'List and status of resident invoices' },
  'admin.invoices.searchPlaceholder': { vi: 'Tìm kiếm theo số hóa đơn, căn hộ, cư dân...', en: 'Search by invoice number, apartment, resident...' },
  'admin.invoices.filter.title': { vi: 'Trạng thái hóa đơn', en: 'Invoice status' },
  'admin.invoices.filter.all': { vi: 'Tất cả trạng thái', en: 'All statuses' },
  'admin.invoices.refresh': { vi: 'Làm mới', en: 'Refresh' },
  'admin.invoices.refreshing': { vi: 'Đang tải...', en: 'Loading...' },
  'admin.invoices.period': { vi: 'Kỳ', en: 'Period' },

  // Generate monthly invoices
  'admin.invoices.generateMonthly.title': { vi: 'Tạo hóa đơn theo tháng', en: 'Generate monthly invoices' },
  'admin.invoices.generateMonthly.year': { vi: 'Năm', en: 'Year' },
  'admin.invoices.generateMonthly.month': { vi: 'Tháng', en: 'Month' },
  'admin.invoices.generateMonthly.generating': { vi: 'Đang tạo...', en: 'Generating...' },
  'admin.invoices.generateMonthly.alreadyExists': { vi: 'Đã có hóa đơn tháng này', en: 'Invoices already exist for this month' },
  'admin.invoices.generateMonthly.cannotBatch': { vi: 'Không thể tạo đồng loạt.', en: 'Cannot batch-create.' },
  'admin.invoices.generateMonthly.generateFor': { vi: 'Tạo hóa đơn tháng', en: 'Generate invoices for month' },
  'admin.invoices.generateMonthly.monthLabel': { vi: 'Tháng', en: 'Month' },

  // Invoice Statistics
  'admin.invoices.stats.totalInvoices': { vi: 'Tổng hóa đơn', en: 'Total Invoices' },
  'admin.invoices.stats.paidInvoices': { vi: 'Đã thanh toán', en: 'Paid' },
  'admin.invoices.stats.pendingInvoices': { vi: 'Chờ thanh toán', en: 'Pending Payment' },
  'admin.invoices.stats.overdueInvoices': { vi: 'Quá hạn', en: 'Overdue' },
  'admin.invoices.stats.totalAmount': { vi: 'Tổng tiền hóa đơn', en: 'Total Invoice Amount' },
  'admin.invoices.stats.paidAmount': { vi: 'Đã thanh toán', en: 'Paid Amount' },
  'admin.invoices.stats.unpaidAmount': { vi: 'Chưa thanh toán', en: 'Unpaid Amount' },
  'admin.invoices.stats.overdueAmount': { vi: 'Quá hạn', en: 'Overdue Amount' },
  'admin.invoices.stats.invoices': { vi: 'hóa đơn', en: 'invoices' },
  'admin.invoices.stats.grandTotal': { vi: 'TỔNG CỘNG TẤT CẢ', en: 'GRAND TOTAL ALL' },
  'admin.invoices.stats.grandTotalDesc': { vi: 'Tổng hợp tất cả hóa đơn trong hệ thống', en: 'Summary of all invoices in the system' },

  // Invoice Table Headers
  'admin.invoices.hạnThanhToan': { vi: 'Hạn thanh toán', en: 'Due Date' },

  // Yearly Billing
  'admin.yearly-billing.title': {
    vi: 'Tạo biểu phí 1 năm',
    en: 'Create Yearly Billing'
  },
  'admin.yearly-billing.subtitle': {
    vi: 'Tạo biểu phí dịch vụ cho tất cả căn hộ hoặc một căn hộ cụ thể trong 1 năm',
    en: 'Create service billing for all apartments or a specific apartment for 1 year'
  },
  'admin.yearly-billing.create': {
    vi: 'Tạo biểu phí',
    en: 'Create Billing'
  },
  'admin.yearly-billing.config': {
    vi: 'Cấu hình phí',
    en: 'Fee Configuration'
  },
  'admin.yearly-billing.history': {
    vi: 'Lịch sử',
    en: 'History'
  },
  'admin.yearly-billing.info': {
    vi: 'Thông tin',
    en: 'Information'
  },
  'admin.yearly-billing.year': {
    vi: 'Năm tạo biểu phí',
    en: 'Billing Year'
  },
  'admin.yearly-billing.months': {
    vi: 'tháng',
    en: 'months'
  },
  'admin.yearly-billing.month': {
    vi: 'Tháng',
    en: 'Month'
  },
  'admin.yearly-billing.notExists': { vi: 'Chưa có cấu hình (có thể tạo)', en: 'No configuration yet (can create)' },
  'admin.yearly-billing.existsDetail': { vi: 'Năm {year} đã có cấu hình phí dịch vụ. Không thể tạo lại. Vui lòng chọn năm khác hoặc dùng tab Cấu hình phí.', en: 'Year {year} already has a fee configuration. Cannot create again. Please choose another year or use the Fee Configuration tab.' },
  'admin.yearly-billing.description': { vi: 'Tạo biểu phí cấu hình cho tất cả căn hộ trong năm {year}. Hệ thống chỉ tạo cấu hình phí dịch vụ (không tạo hóa đơn).', en: 'Create fee configuration for all apartments in {year}. The system only creates configurations (no invoices).' },
  'admin.yearly-billing.scope': {
    vi: 'Phạm vi tạo biểu phí',
    en: 'Billing Scope'
  },
  'admin.yearly-billing.allApartments': {
    vi: 'Tất cả căn hộ',
    en: 'All Apartments'
  },
  'admin.yearly-billing.specificApartment': {
    vi: 'Căn hộ cụ thể',
    en: 'Specific Apartment'
  },
  'admin.yearly-billing.selectApartment': {
    vi: 'Chọn căn hộ',
    en: 'Select Apartment'
  },
  'admin.yearly-billing.feeConfig': {
    vi: 'Cấu hình đơn giá',
    en: 'Fee Configuration'
  },
  'admin.yearly-billing.serviceFee': {
    vi: 'Phí dịch vụ (VND/m²)',
    en: 'Service Fee (VND/m²)'
  },
  'admin.yearly-billing.waterFee': {
    vi: 'Phí nước (VND/m³)',
    en: 'Water Fee (VND/m³)'
  },
  'admin.yearly-billing.parkingFee': {
    vi: 'Phí gửi xe (VND/tháng)',
    en: 'Parking Fee (VND/month)'
  },
  'admin.yearly-billing.parking.motorcycle.label': { vi: 'Phí xe máy', en: 'Motorcycle fee' },
  'admin.yearly-billing.parking.car4.label': { vi: 'Phí xe 4 chỗ', en: '4-seat car fee' },
  'admin.yearly-billing.parking.car7.label': { vi: 'Phí xe 7 chỗ', en: '7-seat car fee' },
  'admin.yearly-billing.feeSummary': {
    vi: 'Tóm tắt đơn giá',
    en: 'Fee Summary'
  },
  'admin.yearly-billing.createButton': {
    vi: 'Tạo biểu phí 1 năm',
    en: 'Create Yearly Billing'
  },
  'admin.yearly-billing.creating': {
    vi: 'Đang tạo biểu phí...',
    en: 'Creating billing...'
  },
  'admin.yearly-billing.step1.title': {
    vi: 'Chọn phạm vi',
    en: 'Select Scope'
  },
  'admin.yearly-billing.step1.description': {
    vi: 'Chọn tất cả căn hộ hoặc căn hộ cụ thể cho năm {year}',
    en: 'Select all apartments or specific apartments for year {year}'
  },
  'admin.yearly-billing.step2.title': {
    vi: 'Cấu hình đơn giá',
    en: 'Configure Unit Prices'
  },
  'admin.yearly-billing.step2.description': {
    vi: 'Nhập đơn giá cho 3 loại phí: dịch vụ, nước, gửi xe',
    en: 'Enter unit prices for 3 fee types: service, water, parking'
  },
  'admin.yearly-billing.step3.title': {
    vi: 'Hệ thống tự động tạo cấu hình',
    en: 'System Automatically Creates Configuration'
  },
  'admin.yearly-billing.step3.description': {
    vi: 'Tạo cấu hình phí dịch vụ cho 12 tháng',
    en: 'Create service fee configuration for 12 months'
  },
  'admin.yearly-billing.feeCalculation.service': {
    vi: 'Diện tích (m²) × Đơn giá (VND/m²)',
    en: 'Area (m²) × Unit Price (VND/m²)'
  },
  'admin.yearly-billing.feeCalculation.water': {
    vi: 'Lượng tiêu thụ (m³) × Đơn giá (VND/m³)',
    en: 'Consumption (m³) × Unit Price (VND/m³)'
  },
  'admin.yearly-billing.feeCalculation.vehicle': {
    vi: 'Số xe × Đơn giá theo loại xe',
    en: 'Number of vehicles × Unit price by vehicle type'
  },
  'admin.yearly-billing.importantNotes': {
    vi: 'Lưu ý quan trọng',
    en: 'Important Notes'
  },
  'admin.yearly-billing.note1.title': {
    vi: 'Chỉ tạo cấu hình',
    en: 'Configuration Only'
  },
  'admin.yearly-billing.note1.description': {
    vi: 'Hệ thống chỉ tạo cấu hình phí dịch vụ, không tạo hóa đơn',
    en: 'System only creates service fee configuration, not invoices'
  },
  'admin.yearly-billing.note2.title': {
    vi: 'Chọn năm linh hoạt',
    en: 'Flexible Year Selection'
  },
  'admin.yearly-billing.note2.description': {
    vi: 'Có thể tạo biểu phí cho năm hiện tại và các năm khác',
    en: 'Can create billing for current year and other years'
  },
  'admin.yearly-billing.note3.title': {
    vi: 'Tự động bỏ qua trùng lặp',
    en: 'Auto-skip Duplicates'
  },
  'admin.yearly-billing.note3.description': {
    vi: 'Hệ thống tự động bỏ qua cấu hình đã tồn tại',
    en: 'System automatically skips existing configurations'
  },
  'admin.yearly-billing.note4.title': {
    vi: 'Cấu hình theo tháng',
    en: 'Monthly Configuration'
  },
  'admin.yearly-billing.note4.description': {
    vi: 'Có thể chỉnh sửa cấu hình cho từng tháng riêng biệt',
    en: 'Can edit configuration for each month separately'
  },
  'admin.yearly-billing.apiInfo': {
    vi: 'Thông tin API',
    en: 'API Information'
  },
  'admin.yearly-billing.api.mainEndpoint': {
    vi: 'Endpoint chính',
    en: 'Main Endpoint'
  },
  'admin.yearly-billing.api.feeConfig': {
    vi: 'Cấu hình phí',
    en: 'Fee Configuration'
  },
  'admin.yearly-billing.api.updateMonth': {
    vi: 'Cập nhật tháng',
    en: 'Update Month'
  },
  'admin.billing-config.selectYearMonth': {
    vi: 'Chọn năm và tháng',
    en: 'Select Year and Month'
  },
  'admin.billing-config.existing': {
    vi: 'Cấu hình phí dịch vụ cho {month}/{year} đã tồn tại. Bạn có thể chỉnh sửa.',
    en: 'Service fee configuration for {month}/{year} already exists. You can edit it.'
  },
  'admin.billing-config.missing': {
    vi: 'Chưa có cấu hình phí dịch vụ cho {month}/{year}. Vui lòng tạo cấu hình mới.',
    en: 'No service fee configuration for {month}/{year}. Please create a new configuration.'
  },

  // Feedback Management
  'admin.feedbacks.title': {
    vi: 'Quản lý phản hồi',
    en: 'Feedback Management'
  },
  'admin.feedbacks.list': {
    vi: 'Danh sách phản hồi',
    en: 'Feedback List'
  },
  'admin.feedbacks.listDesc': { vi: 'Quản lý tất cả phản hồi từ cư dân', en: 'Manage all feedback from residents' },
  'admin.feedbacks.details': {
    vi: 'Chi tiết phản hồi',
    en: 'Feedback Details'
  },
  'admin.feedbacks.resident': {
    vi: 'Cư dân',
    en: 'Resident'
  },
  'admin.feedbacks.subject': {
    vi: 'Tiêu đề',
    en: 'Subject'
  },
  'admin.feedbacks.content': {
    vi: 'Nội dung',
    en: 'Content'
  },
  'admin.feedbacks.rating': {
    vi: 'Đánh giá',
    en: 'Rating'
  },
  'admin.feedbacks.createdAt': {
    vi: 'Ngày gửi',
    en: 'Created At'
  },
  'admin.feedbacks.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },
  'admin.feedbacks.type': { vi: 'Loại phản hồi', en: 'Feedback Type' },
  'admin.feedbacks.category.SUGGESTION': { vi: 'Góp ý', en: 'Suggestion' },
  'admin.feedbacks.category.COMPLIMENT': { vi: 'Khen ngợi', en: 'Compliment' },
  'admin.feedbacks.category.COMPLAINT': { vi: 'Phàn nàn', en: 'Complaint' },
  // Additional category mappings commonly returned by backend
  'admin.feedbacks.category.GENERAL_SERVICE': { vi: 'Dịch vụ chung', en: 'General service' },
  'admin.feedbacks.category.SECURITY': { vi: 'An ninh', en: 'Security' },
  'admin.feedbacks.category.CLEANING': { vi: 'Vệ sinh', en: 'Cleaning' },
  'admin.feedbacks.category.FACILITY': { vi: 'Tiện ích', en: 'Facility' },
  'admin.feedbacks.category.MANAGEMENT': { vi: 'Quản lý', en: 'Management' },
  'admin.feedbacks.status.PENDING': { vi: 'Chờ xử lý', en: 'Pending' },
  'admin.feedbacks.status.RESPONDED': { vi: 'Đã phản hồi', en: 'Responded' },
  'admin.feedbacks.status.REJECTED': { vi: 'Từ chối', en: 'Rejected' },
  'admin.feedbacks.searchPlaceholder': { vi: 'Tìm kiếm theo cư dân, tiêu đề, nội dung...', en: 'Search by resident, subject, content...' },
  'admin.feedbacks.filter.rating.all': { vi: 'Tất cả đánh giá', en: 'All ratings' },
  'admin.feedbacks.filter.rating.5': { vi: '5 sao', en: '5 stars' },
  'admin.feedbacks.filter.rating.4': { vi: '4 sao', en: '4 stars' },
  'admin.feedbacks.filter.rating.3': { vi: '3 sao', en: '3 stars' },
  'admin.feedbacks.filter.rating.2': { vi: '2 sao', en: '2 stars' },
  'admin.feedbacks.filter.rating.1': { vi: '1 sao', en: '1 star' },
  'admin.feedbacks.updateStatus.loading': { vi: 'Đang cập nhật...', en: 'Updating...' },
  'admin.feedbacks.updateStatus.hint': { vi: 'Nhấn để đánh dấu đã xem', en: 'Click to mark as seen' },
  'admin.feedbacks.loadError': { vi: 'Lỗi khi tải phản hồi', en: 'Failed to load feedbacks' },
  'admin.feedbacks.updateStatusError': { vi: 'Cập nhật trạng thái thất bại', en: 'Failed to update status' },
  'common.anonymous': { vi: 'Ẩn danh', en: 'Anonymous' },
  'common.na': { vi: '(Không có)', en: '(N/A)' },

  // Support Request Management
  'admin.support-requests.title': {
    vi: 'Quản lý yêu cầu hỗ trợ',
    en: 'Support Request Management'
  },
  'admin.support-requests.list': {
    vi: 'Danh sách yêu cầu hỗ trợ',
    en: 'Support Request List'
  },
  'admin.support-requests.listDesc': { vi: 'Quản lý tất cả yêu cầu hỗ trợ của cư dân', en: 'Manage all resident support requests' },
  'admin.support-requests.details': {
    vi: 'Chi tiết yêu cầu hỗ trợ',
    en: 'Support Request Details'
  },
  'admin.support-requests.resident': {
    vi: 'Cư dân',
    en: 'Resident'
  },
  'admin.support-requests.supportRequestTitle': {
    vi: 'Tiêu đề',
    en: 'Title'
  },
  'admin.support-requests.description': {
    vi: 'Mô tả',
    en: 'Description'
  },
  'admin.support-requests.category': {
    vi: 'Danh mục',
    en: 'Category'
  },
  'admin.support-requests.priority': {
    vi: 'Mức độ ưu tiên',
    en: 'Priority'
  },
  'admin.support-requests.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },
  'admin.support-requests.category.PLUMBING': { vi: 'Điện nước', en: 'Plumbing' },
  'admin.support-requests.category.ELEVATOR': { vi: 'Thang máy', en: 'Elevator' },
  'admin.support-requests.category.ELECTRICAL': { vi: 'Điện', en: 'Electrical' },
  'admin.support-requests.category.ADMINISTRATIVE': { vi: 'Hành chính', en: 'Administrative' },
  'admin.support-requests.category.SECURITY': { vi: 'An ninh', en: 'Security' },
  'admin.support-requests.category.CLEANING': { vi: 'Vệ sinh', en: 'Cleaning' },
  'admin.support-requests.category.OTHER': { vi: 'Khác', en: 'Other' },
  'admin.support-requests.error.loadList': {
    vi: 'Lỗi tải danh sách yêu cầu hỗ trợ: ',
    en: 'Error loading support requests list: '
  },
  'admin.support-requests.stats.filtered': {
    vi: 'Kết quả lọc',
    en: 'Filtered results'
  },
  'admin.support-requests.stats.all': {
    vi: 'Tất cả yêu cầu',
    en: 'All requests'
  },
  'admin.support-requests.stats.pendingDesc': {
    vi: 'Cần xử lý ngay',
    en: 'Need immediate attention'
  },
  'admin.support-requests.stats.inProgressDesc': {
    vi: 'Đang được xử lý',
    en: 'Currently being processed'
  },
  'admin.support-requests.stats.completedDesc': {
    vi: 'Đã hoàn thành',
    en: 'Completed'
  },
  'admin.support-requests.searchPlaceholder': {
    vi: 'Tìm kiếm theo cư dân, số điện thoại, tiêu đề, mô tả...',
    en: 'Search by resident, phone, title, description...'
  },
  'admin.support-requests.filter.statusTitle': {
    vi: 'Trạng thái yêu cầu',
    en: 'Request status'
  },
  'admin.support-requests.sort.title': {
    vi: 'Sắp xếp theo thời gian',
    en: 'Sort by time'
  },
  'admin.support-requests.sort.newest': {
    vi: 'Mới nhất trước',
    en: 'Newest first'
  },
  'admin.support-requests.sort.oldest': {
    vi: 'Cũ nhất trước',
    en: 'Oldest first'
  },
  'admin.support-requests.request': {
    vi: 'yêu cầu',
    en: 'request'
  },
  'admin.support-requests.requests': {
    vi: 'yêu cầu',
    en: 'requests'
  },
  'admin.support-requests.noData': {
    vi: 'Không có yêu cầu hỗ trợ nào',
    en: 'No support requests'
  },
  'admin.support-requests.noResults': {
    vi: 'Không tìm thấy yêu cầu phù hợp với bộ lọc của bạn',
    en: 'No requests found matching your filters'
  },
  'admin.support-requests.noDataDesc': {
    vi: 'Chưa có yêu cầu hỗ trợ nào từ cư dân',
    en: 'No support requests from residents yet'
  },
  'admin.support-requests.noTitle': {
    vi: 'Không có tiêu đề',
    en: 'No title'
  },
  'admin.support-requests.assignmentHistory': {
    vi: 'Chi tiết lịch sử gán nhân viên',
    en: 'Staff assignment history details'
  },
  'admin.support-requests.assignmentInfo': {
    vi: 'Thông tin gán',
    en: 'Assignment information'
  },
  'admin.support-requests.staff': {
    vi: 'Nhân viên',
    en: 'Staff'
  },
  'admin.support-requests.currentStatus': {
    vi: 'Trạng thái hiện tại',
    en: 'Current status'
  },
  'admin.support-requests.attachments': {
    vi: 'Hình ảnh đính kèm',
    en: 'Attached images'
  },
  'admin.support-requests.images': {
    vi: 'ảnh',
    en: 'images'
  },
  'admin.support-requests.imageAlt': {
    vi: 'Hình ảnh',
    en: 'Image'
  },
  'admin.support-requests.clickToView': {
    vi: 'Click để xem ảnh đầy đủ',
    en: 'Click to view full image'
  },
  'admin.support-requests.notAssignedDesc': {
    vi: 'Yêu cầu này chưa được gán cho nhân viên nào',
    en: 'This request has not been assigned to any staff'
  },
  'admin.support-requests.assignTip': {
    vi: 'Click vào nút "Gán nhân viên" trong trang chi tiết để gán',
    en: 'Click the "Assign Staff" button in the detail page to assign'
  },
  'admin.support-requests.viewFullDetails': {
    vi: 'Xem chi tiết đầy đủ',
    en: 'View full details'
  },
  'admin.support-requests.detail.title': {
    vi: 'Chi tiết yêu cầu hỗ trợ',
    en: 'Support Request Details'
  },
  'admin.support-requests.detail.backToList': {
    vi: 'Quay lại danh sách',
    en: 'Back to List'
  },
  'admin.support-requests.detail.requestInfo': {
    vi: 'Thông tin yêu cầu',
    en: 'Request Information'
  },
  'admin.support-requests.detail.residentInfo': {
    vi: 'Thông tin cư dân',
    en: 'Resident Information'
  },
  'admin.support-requests.detail.name': {
    vi: 'Tên',
    en: 'Name'
  },
  'admin.support-requests.detail.phone': {
    vi: 'Số điện thoại',
    en: 'Phone Number'
  },
  'admin.support-requests.detail.requestTitle': {
    vi: 'Tiêu đề',
    en: 'Title'
  },
  'admin.support-requests.detail.description': {
    vi: 'Mô tả',
    en: 'Description'
  },
  'admin.support-requests.detail.category': {
    vi: 'Danh mục',
    en: 'Category'
  },
  'admin.support-requests.detail.priority': {
    vi: 'Mức độ ưu tiên',
    en: 'Priority'
  },
  'admin.support-requests.detail.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },
  'admin.support-requests.detail.createdAt': {
    vi: 'Ngày tạo',
    en: 'Created At'
  },
  'admin.support-requests.detail.assignedTo': {
    vi: 'Được giao cho',
    en: 'Assigned To'
  },
  'admin.support-requests.detail.completedAt': {
    vi: 'Ngày hoàn thành',
    en: 'Completed At'
  },
  'admin.support-requests.detail.resolutionNotes': {
    vi: 'Ghi chú xử lý',
    en: 'Resolution Notes'
  },
  'admin.support-requests.detail.images': {
    vi: 'Hình ảnh',
    en: 'Images'
  },
  'admin.support-requests.detail.beforeImages': {
    vi: 'Hình ảnh trước khi sửa',
    en: 'Before Images'
  },
  'admin.support-requests.detail.afterImages': {
    vi: 'Hình ảnh sau khi sửa',
    en: 'After Images'
  },
  'admin.support-requests.detail.noImages': {
    vi: 'Không có hình ảnh',
    en: 'No images'
  },
  'admin.support-requests.detail.clickToView': {
    vi: 'Click để xem',
    en: 'Click to view'
  },
  'admin.support-requests.detail.assignStaff': {
    vi: 'Gán nhân viên',
    en: 'Assign Staff'
  },
  'admin.support-requests.detail.selectStaff': {
    vi: 'Chọn nhân viên',
    en: 'Select Staff'
  },
  'admin.support-requests.detail.selectStaffPlaceholder': {
    vi: 'Chọn nhân viên để gán...',
    en: 'Select staff to assign...'
  },
  'admin.support-requests.detail.selectPriority': {
    vi: 'Chọn mức độ ưu tiên',
    en: 'Select Priority'
  },
  'admin.support-requests.detail.priority.low': {
    vi: 'Thấp',
    en: 'Low'
  },
  'admin.support-requests.detail.priority.medium': {
    vi: 'Trung bình',
    en: 'Medium'
  },
  'admin.support-requests.detail.priority.high': {
    vi: 'Cao',
    en: 'High'
  },
  'admin.support-requests.detail.priority.urgent': {
    vi: 'Khẩn cấp',
    en: 'Urgent'
  },
  'admin.support-requests.detail.assignButton': {
    vi: 'Gán',
    en: 'Assign'
  },
  'admin.support-requests.detail.assigning': {
    vi: 'Đang gán...',
    en: 'Assigning...'
  },
  'admin.support-requests.detail.updateStatus': {
    vi: 'Cập nhật trạng thái',
    en: 'Update Status'
  },
  'admin.support-requests.detail.selectNewStatus': {
    vi: 'Chọn trạng thái mới',
    en: 'Select New Status'
  },
  'admin.support-requests.detail.status.pending': {
    vi: 'Chờ xử lý',
    en: 'Pending'
  },
  'admin.support-requests.detail.status.assigned': {
    vi: 'Đã giao',
    en: 'Assigned'
  },
  'admin.support-requests.detail.status.inProgress': {
    vi: 'Đang xử lý',
    en: 'In Progress'
  },
  'admin.support-requests.detail.status.completed': {
    vi: 'Hoàn thành',
    en: 'Completed'
  },
  'admin.support-requests.detail.status.cancelled': {
    vi: 'Đã hủy',
    en: 'Cancelled'
  },
  'admin.support-requests.detail.updateButton': {
    vi: 'Cập nhật',
    en: 'Update'
  },
  'admin.support-requests.detail.updating': {
    vi: 'Đang cập nhật...',
    en: 'Updating...'
  },
  'admin.support-requests.detail.addResolutionNotes': {
    vi: 'Thêm ghi chú xử lý',
    en: 'Add Resolution Notes'
  },
  'admin.support-requests.detail.notesPlaceholder': {
    vi: 'Nhập ghi chú về việc xử lý yêu cầu...',
    en: 'Enter notes about the request resolution...'
  },
  'admin.support-requests.detail.saveNotes': {
    vi: 'Lưu ghi chú',
    en: 'Save Notes'
  },
  'admin.support-requests.detail.saving': {
    vi: 'Đang lưu...',
    en: 'Saving...'
  },
  'admin.support-requests.detail.error.load': {
    vi: 'Không thể tải chi tiết yêu cầu hỗ trợ',
    en: 'Failed to load support request details'
  },
  'admin.support-requests.detail.error.assign': {
    vi: 'Không thể gán nhân viên',
    en: 'Failed to assign staff'
  },
  'admin.support-requests.detail.error.update': {
    vi: 'Không thể cập nhật trạng thái',
    en: 'Failed to update status'
  },
  'admin.support-requests.detail.error.saveNotes': {
    vi: 'Không thể lưu ghi chú',
    en: 'Failed to save notes'
  },
  'admin.support-requests.detail.error.selectStaff': {
    vi: 'Vui lòng chọn nhân viên!',
    en: 'Please select a staff member!'
  },
  'admin.support-requests.detail.success.assign': {
    vi: 'Đã gán nhân viên thành công',
    en: 'Staff assigned successfully'
  },
  'admin.support-requests.detail.success.update': {
    vi: 'Đã cập nhật trạng thái thành công',
    en: 'Status updated successfully'
  },
  'admin.support-requests.detail.success.saveNotes': {
    vi: 'Đã lưu ghi chú thành công',
    en: 'Notes saved successfully'
  },
  'admin.support-requests.detail.noData': {
    vi: 'Không có',
    en: 'No data'
  },
  'admin.support-requests.detail.current': {
    vi: 'hiện tại',
    en: 'current'
  },
  'admin.support-requests.detail.time': {
    vi: 'thời gian',
    en: 'time'
  },
  'admin.support-requests.detail.staff': {
    vi: 'Nhân viên',
    en: 'Staff'
  },
  'admin.support-requests.detail.responsible': {
    vi: 'phụ trách',
    en: 'responsible'
  },
  'admin.support-requests.detail.assigned': {
    vi: 'được gán',
    en: 'assigned'
  },
  'admin.support-requests.detail.assignmentTime': {
    vi: 'Thời gian gán',
    en: 'Assignment time'
  },
  'admin.support-requests.detail.assignmentNotes': {
    vi: 'Ghi chú khi gán',
    en: 'Assignment notes'
  },
  'admin.support-requests.detail.imageCount': {
    vi: 'ảnh',
    en: 'images'
  },
  'admin.support-requests.priority.MEDIUM': { vi: 'Trung bình', en: 'Medium' },
  'admin.support-requests.priority.LOW': { vi: 'Thấp', en: 'Low' },
  'admin.support-requests.status.PENDING': { vi: 'Chờ xử lý', en: 'Pending' },
  'admin.support-requests.status.ASSIGNED': { vi: 'Đã giao', en: 'Assigned' },
  'admin.support-requests.status.IN_PROGRESS': { vi: 'Đang xử lý', en: 'In progress' },
  'admin.support-requests.status.COMPLETED': { vi: 'Hoàn thành', en: 'Completed' },
  'admin.support-requests.status.CANCELLED': { vi: 'Đã hủy', en: 'Cancelled' },
  'admin.support-requests.assignedTo': {
    vi: 'Được giao cho',
    en: 'Assigned To'
  },
  'admin.support-requests.createdAt': {
    vi: 'Ngày tạo',
    en: 'Created At'
  },
  'admin.support-requests.tab.support': { vi: 'Yêu cầu hỗ trợ', en: 'Support requests' },
  'admin.support-requests.tab.vehicles': { vi: 'Đăng ký xe (chờ duyệt)', en: 'Vehicle registrations (pending)' },
  'admin.support-requests.notAssigned': { vi: 'Chưa giao', en: 'Not assigned' },
  'admin.support-requests.vehicles.pendingTitle': { vi: 'Đăng ký xe chờ duyệt', en: 'Pending vehicle registrations' },
  'admin.support-requests.vehicles.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'admin.support-requests.vehicles.empty': { vi: 'Không có đăng ký xe chờ duyệt', en: 'No pending vehicle registrations' },
  'admin.support-requests.vehicles.columns.owner': { vi: 'Chủ xe', en: 'Owner' },
  'admin.support-requests.vehicles.columns.type': { vi: 'Loại xe', en: 'Vehicle type' },
  'admin.support-requests.vehicles.columns.license': { vi: 'Biển số', en: 'License plate' },
  'admin.support-requests.vehicles.columns.color': { vi: 'Màu sắc', en: 'Color' },
  'admin.support-requests.vehicles.columns.apartment': { vi: 'Căn hộ', en: 'Apartment' },
  'admin.support-requests.vehicles.columns.status': { vi: 'Trạng thái', en: 'Status' },
  'admin.support-requests.vehicles.columns.actions': { vi: 'Hành động', en: 'Actions' },
  'admin.support-requests.vehicles.approve': { vi: 'Duyệt', en: 'Approve' },
  'admin.support-requests.vehicles.reject': { vi: 'Từ chối', en: 'Reject' },
  'admin.support-requests.vehicles.rejectDialog.title': { vi: 'Nhập lý do từ chối', en: 'Enter rejection reason' },
  'admin.support-requests.vehicles.rejectDialog.placeholder': { vi: 'Lý do từ chối...', en: 'Rejection reason...' },
  'admin.support-requests.vehicles.rejectDialog.cancel': { vi: 'Hủy', en: 'Cancel' },
  'admin.support-requests.vehicles.rejectDialog.confirm': { vi: 'Xác nhận từ chối', en: 'Confirm rejection' },

  // AI Q&A History Management
  'admin.history.title': {
    vi: 'Quản lý lịch sử AI Q&A',
    en: 'AI Q&A History Management'
  },
  'admin.history.list': {
    vi: 'Danh sách lịch sử hỏi đáp',
    en: 'Q&A History List'
  },
  'admin.history.listDesc': { vi: 'Quản lý lịch sử hỏi đáp AI với cư dân', en: 'Manage AI Q&A history with residents' },
  'admin.history.searchPlaceholder': { vi: 'Tìm kiếm theo người dùng, câu hỏi, câu trả lời...', en: 'Search by user, question, answer...' },
  'admin.history.details': {
    vi: 'Chi tiết hỏi đáp',
    en: 'Q&A Details'
  },
  'admin.history.user': {
    vi: 'Người dùng',
    en: 'User'
  },
  'admin.history.question': {
    vi: 'Câu hỏi',
    en: 'Question'
  },
  'admin.history.answer': {
    vi: 'Câu trả lời',
    en: 'Answer'
  },
  'admin.history.feedback': {
    vi: 'Đánh giá',
    en: 'Feedback'
  },
  'admin.history.createdAt': {
    vi: 'Thời gian',
    en: 'Created At'
  },
  'admin.history.filter.title': { vi: 'Lọc đánh giá', en: 'Filter feedback' },
  'admin.history.filter.all': { vi: 'Tất cả đánh giá', en: 'All feedback' },
  'admin.history.feedback.POSITIVE': { vi: 'Tích cực', en: 'Positive' },
  'admin.history.feedback.NEGATIVE': { vi: 'Tiêu cực', en: 'Negative' },
  'admin.history.feedback.NEUTRAL': { vi: 'Trung lập', en: 'Neutral' },

  // Report Management
  'admin.reports.title': {
    vi: 'Quản lý báo cáo',
    en: 'Report Management'
  },
  'admin.reports.activity-logs': {
    vi: 'Nhật ký hoạt động',
    en: 'Activity Logs'
  },
  'admin.reports.listDesc': { vi: 'Quản lý nhật ký hoạt động hệ thống', en: 'Manage system activity logs' },
  'admin.reports.list': {
    vi: 'Danh sách báo cáo',
    en: 'Report List'
  },
  'admin.reports.details': {
    vi: 'Chi tiết báo cáo',
    en: 'Report Details'
  },
  'admin.reports.detailsCol': { vi: 'Chi tiết', en: 'Details' },
  'admin.reports.user': {
    vi: 'Người dùng',
    en: 'User'
  },
  'admin.reports.action': {
    vi: 'Hành động',
    en: 'Action'
  },
  'admin.reports.action.all': { vi: 'Tất cả hành động', en: 'All actions' },
  'admin.reports.action.CREATE': { vi: 'Tạo mới', en: 'Create' },
  'admin.reports.action.UPDATE': { vi: 'Cập nhật', en: 'Update' },
  'admin.reports.action.DELETE': { vi: 'Xóa', en: 'Delete' },
  'admin.reports.action.LOGIN': { vi: 'Đăng nhập', en: 'Login' },
  'admin.reports.action.LOGOUT': { vi: 'Đăng xuất', en: 'Logout' },
  'admin.reports.resource': {
    vi: 'Tài nguyên',
    en: 'Resource'
  },
  'admin.reports.resource.User': { vi: 'Người dùng', en: 'User' },
  'admin.reports.resource.Apartment': { vi: 'Căn hộ', en: 'Apartment' },
  'admin.reports.resource.Announcement': { vi: 'Thông báo', en: 'Announcement' },
  'admin.reports.resource.Auth': { vi: 'Xác thực', en: 'Auth' },
  'admin.reports.timestamp': {
    vi: 'Thời gian',
    en: 'Timestamp'
  },
  'admin.reports.ipAddress': {
    vi: 'Địa chỉ IP',
    en: 'IP Address'
  },
  'admin.reports.export': { vi: 'Xuất báo cáo', en: 'Export report' },
  'admin.reports.searchPlaceholder': { vi: 'Tìm kiếm theo người dùng, hành động, tài nguyên...', en: 'Search by user, action, resource...' },

  // Facility Booking Management
  'admin.facility-bookings.title': {
    vi: 'Quản lý đặt tiện ích',
    en: 'Facility Booking Management'
  },
  'admin.facility-bookings.list': {
    vi: 'Danh sách đặt tiện ích',
    en: 'Facility Booking List'
  },
  'admin.facility-bookings.listDesc': {
    vi: 'Quản lý tất cả đặt tiện ích trong chung cư',
    en: 'Manage all facility bookings in the apartment'
  },
  'admin.facility-bookings.searchPlaceholder': {
    vi: 'Tìm kiếm theo cư dân, tiện ích, mục đích...',
    en: 'Search by resident, facility, purpose...'
  },
  'admin.facility-bookings.status.all': { vi: 'Tất cả trạng thái', en: 'All statuses' },
  'admin.facility-bookings.status.PENDING': { vi: 'Chờ xác nhận', en: 'Pending' },
  'admin.facility-bookings.status.APPROVED': { vi: 'Đã xác nhận', en: 'Approved' },
  'admin.facility-bookings.status.REJECTED': { vi: 'Từ chối', en: 'Rejected' },
  'admin.facility-bookings.status.CANCELLED': { vi: 'Đã hủy', en: 'Cancelled' },
  'admin.facility-bookings.columns.resident': { vi: 'Cư dân', en: 'Resident' },
  'admin.facility-bookings.columns.facility': { vi: 'Tiện ích', en: 'Facility' },
  'admin.facility-bookings.columns.startTime': { vi: 'Thời gian bắt đầu', en: 'Start time' },
  'admin.facility-bookings.columns.endTime': { vi: 'Thời gian kết thúc', en: 'End time' },
  'admin.facility-bookings.columns.purpose': { vi: 'Mục đích', en: 'Purpose' },
  'admin.facility-bookings.columns.status': { vi: 'Trạng thái', en: 'Status' },
  'admin.facility-bookings.columns.actions': { vi: 'Thao tác', en: 'Actions' },
  'admin.status.all': { vi: 'Tất cả trạng thái', en: 'All statuses' },
  // Filters generic
  // 'admin.filters.searchAndFilter' đã khai báo phía trên
  'admin.filters.statusLabel': { vi: 'Trạng thái:', en: 'Status:' },
  // Export generic
  'admin.export.excel': { vi: 'Xuất Excel', en: 'Export Excel' },
  // Counter label generic
  'admin.counter.bookings': { vi: 'đặt chỗ', en: 'bookings' },

  // Support Requests

  // Water meter
  'admin.waterMeter.title': { vi: 'Danh sách chỉ số nước', en: 'Water meter list' },
  'admin.billing-config.title': { vi: 'Cấu Hình Phí', en: 'Billing Configuration' },
  'admin.billing-config.subtitle': { vi: 'Quản lý cấu hình phí dịch vụ cho từng tháng/năm', en: 'Manage service fee configuration per month/year' },
  'admin.billing-config.current': { vi: 'Cấu Hình Hiện Tại', en: 'Current Configuration' },
  'admin.billing-config.new': { vi: 'Cấu Hình Mới', en: 'New Configuration' },
  'admin.billing-config.history': { vi: 'Lịch Sử', en: 'History' },
  'admin.billing-config.currentMonth': { vi: 'Cấu Hình Phí Tháng', en: 'Fee Configuration Month' },
  'admin.billing-config.create': { vi: 'Tạo Cấu Hình Phí Mới', en: 'Create New Fee Configuration' },
  'admin.facility-bookings.details': {
    vi: 'Chi tiết đặt tiện ích',
    en: 'Facility Booking Details'
  },
  'admin.facility-bookings.resident': {
    vi: 'Cư dân',
    en: 'Resident'
  },
  'admin.facility-bookings.facility': {
    vi: 'Tiện ích',
    en: 'Facility'
  },
  'admin.facility-bookings.startTime': {
    vi: 'Thời gian bắt đầu',
    en: 'Start Time'
  },
  'admin.facility-bookings.endTime': {
    vi: 'Thời gian kết thúc',
    en: 'End Time'
  },
  'admin.facility-bookings.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },
  'admin.facility-bookings.purpose': {
    vi: 'Mục đích sử dụng',
    en: 'Purpose'
  },

  // Loading and Error States
  'admin.error': {
    vi: 'Lỗi',
    en: 'Error'
  },
  'admin.error.load': {
    vi: 'Không thể tải dữ liệu',
    en: 'Failed to load data'
  },
  'admin.error.loadApartments': {
    vi: 'Lỗi tải dữ liệu căn hộ',
    en: 'Error loading apartments'
  },
  'admin.error.loadInvoices': {
    vi: 'Lỗi tải dữ liệu hóa đơn',
    en: 'Error loading invoices'
  },
  'admin.error.unknown': {
    vi: 'Đã xảy ra lỗi không xác định',
    en: 'An unknown error occurred'
  },
  'admin.error.save': {
    vi: 'Không thể lưu dữ liệu',
    en: 'Failed to save data'
  },
  'admin.error.delete': {
    vi: 'Không thể xóa dữ liệu',
    en: 'Failed to delete data'
  },
  'admin.success': {
    vi: 'Thành công',
    en: 'Success'
  },
  'admin.success.save': {
    vi: 'Lưu thành công',
    en: 'Saved successfully'
  },
  'admin.confirm.delete': {
    vi: 'Bạn có chắc chắn muốn xóa?',
    en: 'Are you sure you want to delete?'
  },
  // Water meter extended
  'admin.waterMeter.searchPlaceholder': { vi: 'Tìm kiếm căn hộ (ID hoặc mã)', en: 'Search apartment (ID or code)' },
  'admin.waterMeter.pickMonthHint': { vi: 'Vui lòng chọn tháng để xem chỉ số nước', en: 'Please select a month to view water readings' },
  'admin.waterMeter.viewingMonth': { vi: 'Đang xem chỉ số nước tháng:', en: 'Viewing water readings for month:' },
  'admin.waterMeter.totalApts': { vi: 'Tổng căn hộ:', en: 'Total apartments:' },
  'admin.waterMeter.totalConsumption': { vi: 'Tổng tiêu thụ:', en: 'Total consumption:' },
  'admin.waterMeter.viewAll': { vi: 'Xem tất cả', en: 'View all' },
  'admin.waterMeter.generate': { vi: 'Tạo lịch sử chỉ số nước', en: 'Generate water meter history' },
  'admin.waterMeter.generating': { vi: 'Đang tạo...', en: 'Generating...' },
  'admin.waterMeter.generateSuccess': { vi: 'Tạo lịch sử chỉ số nước thành công!', en: 'Generated water meter history successfully!' },
  'admin.waterMeter.monthExists': { vi: 'Tháng này đã có dữ liệu chỉ số nước', en: 'This month already has water meter data' },
  'admin.waterMeter.cannotGenerate': { vi: 'Không thể tạo chỉ số cho tháng đã có dữ liệu', en: 'Cannot generate readings for month with existing data' },
  'admin.waterMeter.loading': { vi: 'Đang tải dữ liệu...', en: 'Loading data...' },
  'admin.waterMeter.pagination.previous': { vi: 'Trước', en: 'Previous' },
  'admin.waterMeter.pagination.next': { vi: 'Tiếp', en: 'Next' },
  'admin.waterMeter.pagination.showing': { vi: 'Hiển thị', en: 'Showing' },
  'admin.waterMeter.pagination.of': { vi: 'của', en: 'of' },
  'admin.waterMeter.pagination.entries': { vi: 'bản ghi', en: 'entries' },
  'admin.waterMeter.table.apartment': { vi: 'Căn hộ', en: 'Apartment' },
  'admin.waterMeter.table.month': { vi: 'Tháng', en: 'Month' },
  'admin.waterMeter.table.prev': { vi: 'Chỉ số trước', en: 'Previous reading' },
  'admin.waterMeter.table.current': { vi: 'Chỉ số mới', en: 'Current reading' },
  'admin.waterMeter.table.consumption': { vi: 'Lượng tiêu thụ (m³)', en: 'Consumption (m³)' },
  'admin.waterMeter.table.actions': { vi: 'Hành động', en: 'Actions' },
  'admin.waterMeter.btn.save': { vi: 'Lưu', en: 'Save' },
  'admin.waterMeter.btn.cancel': { vi: 'Hủy', en: 'Cancel' },
  'admin.waterMeter.btn.edit': { vi: 'Sửa', en: 'Edit' },
  'admin.waterMeter.btn.delete': { vi: 'Xóa', en: 'Delete' },
  'admin.waterMeter.loadingLatestMonth': { vi: 'Đang tải dữ liệu tháng mới nhất...', en: 'Loading latest month data...' },
  'admin.waterMeter.latestMonth': { vi: 'Tháng mới nhất', en: 'Latest month' },
  'admin.waterMeter.table.recordedBy': { vi: 'Người ghi', en: 'Recorded by' },
  'admin.waterMeter.table.recordedAt': { vi: 'Thời gian ghi', en: 'Recorded at' },
  'admin.waterMeter.confirmDelete': { vi: 'Bạn có chắc chắn muốn xóa bản ghi này?', en: 'Are you sure you want to delete this record?' },

  // Additional water meter page texts
  'admin.waterMeter.showLatest': { vi: 'Chỉ số mới nhất', en: 'Latest readings' },
  'admin.waterMeter.showAll': { vi: 'Tất cả chỉ số', en: 'All readings' },
  'admin.waterMeter.selectMonth.placeholder': { vi: 'Chọn tháng', en: 'Select month' },
  'admin.waterMeter.viewAllButton': { vi: 'Tất cả', en: 'All' },
  'admin.waterMeter.loadingText': { vi: 'Đang tải...', en: 'Loading...' },
  'admin.waterMeter.creatingInvoice': { vi: 'Đang tạo...', en: 'Creating...' },
  'admin.waterMeter.createInvoice': { vi: 'Tạo hóa đơn', en: 'Create invoice' },
  'admin.waterMeter.noDataForMonth': { vi: 'Không có dữ liệu chỉ số nước cho tháng {month}', en: 'No water meter data for month {month}' },
  'admin.waterMeter.selectMonthForInvoice': { vi: 'Vui lòng chọn tháng để tạo hóa đơn', en: 'Please select a month to create invoice' },
  'admin.waterMeter.invoiceSuccess': { vi: 'Tạo hóa đơn thành công', en: 'Invoice created successfully' },
  'admin.waterMeter.invoiceError': { vi: 'Có lỗi xảy ra khi tạo hóa đơn', en: 'Error occurred while creating invoice' },
  'admin.waterMeter.monthHeader': { vi: 'Tháng {month}', en: 'Month {month}' },

  // Invoices fee type labels
  'admin.invoices.feeType.SERVICE_FEE': { vi: 'Phí dịch vụ', en: 'Service Fee' },
  'admin.invoices.feeType.WATER_FEE': { vi: 'Phí nước', en: 'Water Fee' },
  'admin.invoices.feeType.VEHICLE_FEE': { vi: 'Phí gửi xe', en: 'Vehicle Fee' },

  // Additional invoice page texts
  'admin.invoices.header.totalInvoices': { vi: 'Tổng hóa đơn', en: 'Total Invoices' },
  'admin.invoices.header.monthYear': { vi: 'Tháng {month}/{year}', en: 'Month {month}/{year}' },
  'admin.invoices.generateMonthly.existsWarning': { vi: 'Tháng {month}/{year} đã có {count} hóa đơn', en: '{count} invoices already exist for {month}/{year}' },
  'admin.invoices.generateMonthly.skipExisting': { vi: 'Hệ thống sẽ tạo hóa đơn cho căn hộ chưa có hóa đơn và bỏ qua căn hộ đã có hóa đơn', en: 'System will create invoices for apartments without invoices and skip apartments that already have invoices' },
  'admin.invoices.generateMonthly.instructions.title': { vi: 'Hướng dẫn:', en: 'Instructions:' },
  'admin.invoices.generateMonthly.instructions.step1': { vi: 'Vào tab "Tạo biểu phí"', en: 'Go to "Create Fee Schedule" tab' },
  'admin.invoices.generateMonthly.instructions.step2': { vi: 'Chọn "Tạo cấu hình phí dịch vụ"', en: 'Select "Create Service Fee Configuration"' },
  'admin.invoices.generateMonthly.instructions.step3': { vi: 'Chọn năm {year} và tháng {month}', en: 'Select year {year} and month {month}' },
  'admin.invoices.generateMonthly.instructions.step4': { vi: 'Nhập các mức phí và nhấn "Tạo cấu hình"', en: 'Enter fee rates and click "Create Configuration"' },
  'admin.invoices.generateMonthly.instructions.step5': { vi: 'Quay lại tab này để tạo hóa đơn', en: 'Return to this tab to create invoices' },
  'admin.invoices.searchAndFilter.title': { vi: 'Tìm kiếm và Lọc', en: 'Search and Filter' },
  'admin.invoices.search.label': { vi: 'Tìm kiếm hóa đơn', en: 'Search invoices' },
  'admin.invoices.filter.status': { vi: 'Trạng thái', en: 'Status' },
  'admin.invoices.filter.byMonth': { vi: 'Lọc theo tháng', en: 'Filter by month' },
  'admin.invoices.filter.month': { vi: 'Tháng {month}', en: 'Month {month}' },
  'admin.invoices.search.results': { vi: 'Kết quả tìm kiếm:', en: 'Search results:' },
  'admin.invoices.search.resultsCount': { vi: '{count} hóa đơn được tìm thấy', en: '{count} invoices found' },
  'admin.invoices.reminderEmail.title': { vi: 'Gửi mail nhắc nhở:', en: 'Send reminder emails:' },
  'admin.invoices.reminderEmail.selected': { vi: 'Đã chọn: {count} hóa đơn', en: 'Selected: {count} invoices' },
  'admin.invoices.reminderEmail.selectAllOverdue': { vi: 'Chọn tất cả quá hạn', en: 'Select all overdue' },
  'admin.invoices.reminderEmail.deselectAll': { vi: 'Bỏ chọn tất cả', en: 'Deselect all' },
  'admin.invoices.reminderEmail.send': { vi: 'Gửi mail nhắc nhở ({count})', en: 'Send reminder emails ({count})' },
  'admin.invoices.reminderEmail.sending': { vi: 'Đang gửi...', en: 'Sending...' },
  'admin.invoices.reminderEmail.sent': { vi: 'Đã gửi mail nhắc nhở cho {count} hóa đơn.', en: 'Reminder emails sent for {count} invoices.' },
  'admin.invoices.reminderEmail.error': { vi: 'Có lỗi xảy ra khi gửi mail nhắc nhở.', en: 'Error occurred while sending reminder emails.' },
  'admin.invoices.reminderEmail.noneSelected': { vi: 'Vui lòng chọn ít nhất một hóa đơn để gửi mail nhắc nhở.', en: 'Please select at least one invoice to send reminder emails.' },
  'admin.invoices.updateOverdueStatus': { vi: 'Cập nhật trạng thái quá hạn', en: 'Update overdue status' },
  'admin.invoices.updateOverdueStatus.success': { vi: 'Đã cập nhật trạng thái quá hạn cho {count} hóa đơn.', en: 'Updated overdue status for {count} invoices.' },
  'admin.invoices.updateOverdueStatus.error': { vi: 'Có lỗi xảy ra khi cập nhật trạng thái quá hạn.', en: 'Error occurred while updating overdue status.' },
  'admin.invoices.updateOverdueStatus.none': { vi: 'Không có hóa đơn nào cần cập nhật trạng thái quá hạn.', en: 'No invoices need overdue status update.' },
  'admin.invoices.stats.monthYear': { vi: 'Tháng {month}/{year}', en: 'Month {month}/{year}' },
  'admin.invoices.stats.invoicesCount': { vi: '{count} hóa đơn', en: '{count} invoices' },
  'admin.invoices.stats.totalDesc': { vi: '{count} hóa đơn - Tháng {month}/{year}', en: '{count} invoices - Month {month}/{year}' },
  'admin.invoices.overdue.days': { vi: 'Quá hạn {days} ngày', en: 'Overdue by {days} days' },
  'admin.invoices.pagination.display': { vi: 'Hiển thị {start}-{end} trong {total}', en: 'Showing {start}-{end} of {total}' },
  'admin.invoices.pagination.previous': { vi: 'Trước', en: 'Previous' },
  'admin.invoices.pagination.next': { vi: 'Sau', en: 'Next' },

  // Facilities extras
  'admin.facilities.usageFee': { vi: 'Phí sử dụng', en: 'Usage fee' },
  // Units
  'admin.units.perVehiclePerMonth': { vi: 'đ/xe/tháng', en: 'VND/vehicle/month' },
  'admin.facilities.free': { vi: 'Miễn phí', en: 'Free' },
  'admin.facilities.loadError': { vi: 'Không thể tải danh sách tiện ích', en: 'Unable to load facilities' },
  'admin.facilities.deleteError': { vi: 'Không thể xóa tiện ích', en: 'Unable to delete facility' },
  'admin.facilities.createError': { vi: 'Không thể tạo tiện ích', en: 'Unable to create facility' },
  'admin.facilities.editError': { vi: 'Không thể cập nhật cơ sở vật chất', en: 'Unable to update facility' },
  'admin.facilities.editIncomplete': { vi: 'Vui lòng điền đầy đủ thông tin', en: 'Please fill in all required information' },
  'admin.facilities.editSuccess': { vi: 'Đã cập nhật cơ sở vật chất', en: 'Facility updated successfully' },
  'admin.facilities.editLoading': { vi: 'Đang tải...', en: 'Loading...' },
  'admin.facilities.notFound': { vi: 'Không tìm thấy cơ sở vật chất', en: 'Facility not found' },
  'admin.facilities.notFoundTitle': { vi: 'Không tìm thấy cơ sở vật chất', en: 'Facility not found' },
  'admin.facilities.notFoundDescription': { vi: 'Cơ sở vật chất bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.', en: 'The facility you are looking for does not exist or has been deleted.' },
  
  // Facility Placeholder Keys
  'admin.facilities.name.placeholder': { vi: 'Nhập tên tiện ích', en: 'Enter facility name' },
  'admin.facilities.description.placeholder': { vi: 'Nhập mô tả tiện ích', en: 'Enter facility description' },
  'admin.facilities.location.placeholder': { vi: 'Nhập vị trí tiện ích (ví dụ: Tầng 1, Khu A)', en: 'Enter facility location (e.g., Floor 1, Area A)' },
  'admin.facilities.capacity.placeholder': { vi: 'Nhập sức chứa tối đa', en: 'Enter maximum capacity' },
  'admin.facilities.openingHours.placeholder': { vi: 'Nhập giờ mở cửa (ví dụ: 06:00-22:00)', en: 'Enter opening hours (e.g., 06:00-22:00)' },
  'admin.facilities.otherDetails.placeholder': { vi: 'Nhập thông tin bổ sung (quy định sử dụng, v.v.)', en: 'Enter additional information (usage rules, etc.)' },
  'admin.facilities.usageFee.placeholder': { vi: 'Nhập phí sử dụng (nếu có)', en: 'Enter usage fee (if any)' },
  'admin.facilities.visibility': { vi: 'Trạng thái hiển thị', en: 'Visibility Status' },
  'admin.facilities.visibilityDesc': { vi: 'Tiện ích bị ẩn sẽ không hiển thị cho cư dân khi họ xem danh sách tiện ích', en: 'Hidden facilities will not be visible to residents when they view the facility list' },
  
  'admin.error.incomplete': { vi: 'Thiếu thông tin', en: 'Incomplete information' },
  'admin.noData': {
    vi: 'Không có dữ liệu',
    en: 'No data available'
  },

  // Resident Create Page
  'admin.residents.create.title': {
    vi: 'Tạo cư dân mới',
    en: 'Create New Resident'
  },
  'admin.residents.create.subtitle': {
    vi: 'Thêm thông tin cư dân mới vào hệ thống',
    en: 'Add new resident information to the system'
  },
  'admin.residents.create.info.title': {
    vi: 'Thông tin cư dân',
    en: 'Resident Information'
  },
  'admin.residents.create.form.fullName': {
    vi: 'Họ tên',
    en: 'Full Name'
  },
  'admin.residents.create.form.fullName.placeholder': {
    vi: 'Nhập họ tên đầy đủ',
    en: 'Enter full name'
  },
  'admin.residents.create.form.fullName.required': {
    vi: 'Họ tên là bắt buộc',
    en: 'Full name is required'
  },
  'admin.residents.create.form.identityNumber': {
    vi: 'Số CMND/CCCD',
    en: 'ID Card Number'
  },
  'admin.residents.create.form.identityNumber.placeholder': {
    vi: 'Nhập số CMND/CCCD',
    en: 'Enter ID card number'
  },
  'admin.residents.create.form.identityNumber.required': {
    vi: 'Số CMND/CCCD là bắt buộc',
    en: 'ID card number is required'
  },
  'admin.residents.create.form.identityNumber.invalid': {
    vi: 'Số CMND/CCCD không hợp lệ (9 hoặc 12 số)',
    en: 'Invalid ID card number (9 or 12 digits)'
  },
  'admin.residents.create.form.phoneNumber': {
    vi: 'Số điện thoại',
    en: 'Phone Number'
  },
  'admin.residents.create.form.phoneNumber.placeholder': {
    vi: 'Nhập số điện thoại',
    en: 'Enter phone number'
  },
  'admin.residents.create.form.phoneNumber.required': {
    vi: 'Số điện thoại là bắt buộc',
    en: 'Phone number is required'
  },
  'admin.residents.create.form.phoneNumber.invalid': {
    vi: 'Số điện thoại không hợp lệ',
    en: 'Invalid phone number'
  },
  'admin.residents.create.form.email': {
    vi: 'Email',
    en: 'Email'
  },
  'admin.residents.create.form.email.placeholder': {
    vi: 'Nhập địa chỉ email',
    en: 'Enter email address'
  },
  'admin.residents.create.form.email.required': {
    vi: 'Email là bắt buộc',
    en: 'Email is required'
  },
  'admin.residents.create.form.email.invalid': {
    vi: 'Email không hợp lệ',
    en: 'Invalid email'
  },
  'admin.residents.create.form.dateOfBirth': {
    vi: 'Ngày sinh',
    en: 'Date of Birth'
  },
  'admin.residents.create.form.dateOfBirth.required': {
    vi: 'Ngày sinh là bắt buộc',
    en: 'Date of birth is required'
  },
  'admin.residents.create.form.dateOfBirth.invalid': {
    vi: 'Ngày sinh không hợp lệ',
    en: 'Invalid date of birth'
  },
  'admin.residents.create.form.required': {
    vi: 'bắt buộc',
    en: 'required'
  },
  'admin.residents.create.success.redirecting': {
    vi: 'Đang chuyển hướng về danh sách cư dân...',
    en: 'Redirecting to residents list...'
  },
  'admin.residents.create.loading': {
    vi: 'Đang tạo...',
    en: 'Creating...'
  },
  'admin.residents.create.submit': {
    vi: 'Tạo cư dân',
    en: 'Create Resident'
  },

  // Pagination
  'pagination.display': {
    vi: 'Hiển thị {start}-{end} trong {total}',
    en: 'Displaying {start}-{end} of {total}'
  },
  'pagination.previous': {
    vi: 'Trước',
    en: 'Previous'
  },
  'pagination.next': {
    vi: 'Sau',
    en: 'Next'
  },
  'pagination.page': {
    vi: 'Trang {page}',
    en: 'Page {page}'
  },
  'pagination.goToPage': {
    vi: 'Đi đến trang {page}',
    en: 'Go to page {page}'
  },
  'pagination.showPerPage': {
    vi: 'Hiển thị {count} mục mỗi trang',
    en: 'Show {count} items per page'
  },
  'pagination.totalPages': {
    vi: 'Tổng {total} trang',
    en: 'Total {total} pages'
  },

  // UI Pagination Component
  'pagination.previous.label': {
    vi: 'Trước',
    en: 'Previous'
  },
  'pagination.next.label': {
    vi: 'Sau',
    en: 'Next'
  },
  'pagination.previous.ariaLabel': {
    vi: 'Đi đến trang trước',
    en: 'Go to previous page'
  },
  'pagination.next.ariaLabel': {
    vi: 'Đi đến trang sau',
    en: 'Go to next page'
  },
  'pagination.morePages': {
    vi: 'Thêm trang',
    en: 'More pages'
  }
}

// Simple translation function
export function t(key: string, language: Language = 'vi'): string {
  return translations[key]?.[language] || key
}

// Hook: useLanguage
export function useLanguage() {
  const { language, setLanguage } = useLanguageContext();
  // Hàm dịch đã bind sẵn
  const translate = (key: string, fallback?: string, placeholders?: Record<string, string | number>) => {
    let result = translations[key]?.[language] || fallback || key
    
    // Xử lý placeholder nếu có
    if (placeholders) {
      Object.entries(placeholders).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(value))
      })
    }
    
    return result
  }
  return { language, setLanguage, t: translate }
} 