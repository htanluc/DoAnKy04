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

  // Common Admin Actions
  'admin.action.create': {
    vi: 'Tạo mới',
    en: 'Create New'
  },
  'admin.action.edit': {
    vi: 'Chỉnh sửa',
    en: 'Edit'
  },
  'admin.action.delete': {
    vi: 'Xóa',
    en: 'Delete'
  },
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
  'admin.users.create': {
    vi: 'Tạo người dùng mới',
    en: 'Create New User'
  },
  'admin.users.edit': {
    vi: 'Chỉnh sửa người dùng',
    en: 'Edit User'
  },
  'admin.users.details': {
    vi: 'Chi tiết người dùng',
    en: 'User Details'
  },
  'admin.users.username': {
    vi: 'Tên đăng nhập',
    en: 'Username'
  },
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

  // Resident Management
  'admin.residents.title': {
    vi: 'Quản lý cư dân',
    en: 'Resident Management'
  },
  'admin.residents.list': {
    vi: 'Danh sách cư dân',
    en: 'Resident List'
  },
  'admin.residents.create': {
    vi: 'Tạo cư dân mới',
    en: 'Create New Resident'
  },
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

  // Apartment Management
  'admin.apartments.title': {
    vi: 'Quản lý căn hộ',
    en: 'Apartment Management'
  },
  'admin.apartments.list': {
    vi: 'Danh sách căn hộ',
    en: 'Apartment List'
  },
  'admin.apartments.create': {
    vi: 'Tạo căn hộ mới',
    en: 'Create New Apartment'
  },
  'admin.apartments.edit': {
    vi: 'Chỉnh sửa căn hộ',
    en: 'Edit Apartment'
  },
  'admin.apartments.details': {
    vi: 'Chi tiết căn hộ',
    en: 'Apartment Details'
  },
  'admin.apartments.number': {
    vi: 'Số căn hộ',
    en: 'Apartment Number'
  },
  'admin.apartments.floor': {
    vi: 'Tầng',
    en: 'Floor'
  },
  'admin.apartments.area': {
    vi: 'Diện tích',
    en: 'Area'
  },
  'admin.apartments.bedrooms': {
    vi: 'Số phòng ngủ',
    en: 'Bedrooms'
  },
  'admin.apartments.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },
  'admin.apartments.owner': {
    vi: 'Chủ hộ',
    en: 'Owner'
  },
  'admin.apartments.residents': {
    vi: 'Cư dân',
    en: 'Residents'
  },

  // Announcement Management
  'admin.announcements.title': {
    vi: 'Quản lý thông báo',
    en: 'Announcement Management'
  },
  'admin.announcements.list': {
    vi: 'Danh sách thông báo',
    en: 'Announcement List'
  },
  'admin.announcements.create': {
    vi: 'Tạo thông báo mới',
    en: 'Create New Announcement'
  },
  'admin.announcements.edit': {
    vi: 'Chỉnh sửa thông báo',
    en: 'Edit Announcement'
  },
  'admin.announcements.details': {
    vi: 'Chi tiết thông báo',
    en: 'Announcement Details'
  },
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

  // Event Management
  'admin.events.title': {
    vi: 'Quản lý sự kiện',
    en: 'Event Management'
  },
  'admin.events.list': {
    vi: 'Danh sách sự kiện',
    en: 'Event List'
  },
  'admin.events.create': {
    vi: 'Tạo sự kiện mới',
    en: 'Create New Event'
  },
  'admin.events.edit': {
    vi: 'Chỉnh sửa sự kiện',
    en: 'Edit Event'
  },
  'admin.events.details': {
    vi: 'Chi tiết sự kiện',
    en: 'Event Details'
  },
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

  // Facility Management
  'admin.facilities.title': {
    vi: 'Quản lý tiện ích',
    en: 'Facility Management'
  },
  'admin.facilities.list': {
    vi: 'Danh sách tiện ích',
    en: 'Facility List'
  },
  'admin.facilities.create': {
    vi: 'Tạo tiện ích mới',
    en: 'Create New Facility'
  },
  'admin.facilities.edit': {
    vi: 'Chỉnh sửa tiện ích',
    en: 'Edit Facility'
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
  'admin.facilities.openingHours': {
    vi: 'Giờ mở cửa',
    en: 'Opening Hours'
  },
  'admin.facilities.status': {
    vi: 'Trạng thái',
    en: 'Status'
  },

  // Invoice Management
  'admin.invoices.title': {
    vi: 'Quản lý hóa đơn',
    en: 'Invoice Management'
  },
  'admin.invoices.list': {
    vi: 'Danh sách hóa đơn',
    en: 'Invoice List'
  },
  'admin.invoices.create': {
    vi: 'Tạo hóa đơn mới',
    en: 'Create New Invoice'
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
  'admin.invoices.type': {
    vi: 'Loại hóa đơn',
    en: 'Invoice Type'
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

  // Support Request Management
  'admin.support-requests.title': {
    vi: 'Quản lý yêu cầu hỗ trợ',
    en: 'Support Request Management'
  },
  'admin.support-requests.list': {
    vi: 'Danh sách yêu cầu hỗ trợ',
    en: 'Support Request List'
  },
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
  'admin.support-requests.assignedTo': {
    vi: 'Được giao cho',
    en: 'Assigned To'
  },
  'admin.support-requests.createdAt': {
    vi: 'Ngày tạo',
    en: 'Created At'
  },

  // AI Q&A History Management
  'admin.history.title': {
    vi: 'Quản lý lịch sử AI Q&A',
    en: 'AI Q&A History Management'
  },
  'admin.history.list': {
    vi: 'Danh sách lịch sử hỏi đáp',
    en: 'Q&A History List'
  },
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

  // Report Management
  'admin.reports.title': {
    vi: 'Quản lý báo cáo',
    en: 'Report Management'
  },
  'admin.reports.activity-logs': {
    vi: 'Nhật ký hoạt động',
    en: 'Activity Logs'
  },
  'admin.reports.list': {
    vi: 'Danh sách báo cáo',
    en: 'Report List'
  },
  'admin.reports.details': {
    vi: 'Chi tiết báo cáo',
    en: 'Report Details'
  },
  'admin.reports.user': {
    vi: 'Người dùng',
    en: 'User'
  },
  'admin.reports.action': {
    vi: 'Hành động',
    en: 'Action'
  },
  'admin.reports.resource': {
    vi: 'Tài nguyên',
    en: 'Resource'
  },
  'admin.reports.timestamp': {
    vi: 'Thời gian',
    en: 'Timestamp'
  },
  'admin.reports.ipAddress': {
    vi: 'Địa chỉ IP',
    en: 'IP Address'
  },

  // Facility Booking Management
  'admin.facility-bookings.title': {
    vi: 'Quản lý đặt tiện ích',
    en: 'Facility Booking Management'
  },
  'admin.facility-bookings.list': {
    vi: 'Danh sách đặt tiện ích',
    en: 'Facility Booking List'
  },
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
  'admin.loading': {
    vi: 'Đang tải...',
    en: 'Loading...'
  },
  'admin.error.load': {
    vi: 'Không thể tải dữ liệu',
    en: 'Failed to load data'
  },
  'admin.error.save': {
    vi: 'Không thể lưu dữ liệu',
    en: 'Failed to save data'
  },
  'admin.error.delete': {
    vi: 'Không thể xóa dữ liệu',
    en: 'Failed to delete data'
  },
  'admin.success.save': {
    vi: 'Lưu thành công',
    en: 'Saved successfully'
  },
  'admin.success.delete': {
    vi: 'Xóa thành công',
    en: 'Deleted successfully'
  },
  'admin.confirm.delete': {
    vi: 'Bạn có chắc chắn muốn xóa?',
    en: 'Are you sure you want to delete?'
  },
  'admin.noData': {
    vi: 'Không có dữ liệu',
    en: 'No data available'
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
  const translate = (key: string, fallback?: string) => {
    const result = translations[key]?.[language]
    return result || fallback || key
  }
  return { language, setLanguage, t: translate }
} 