package com.mytech.apartment.portal.models.enums;

public enum ActivityActionType {
    // Authentication
    LOGIN,
    LOGOUT,
    PASSWORD_CHANGE,
    
    // Invoice & Payment
    VIEW_INVOICE,
    DOWNLOAD_INVOICE,
    PAY_INVOICE,
    CREATE_INVOICE,
    UPDATE_INVOICE,
    DELETE_INVOICE,
    SEND_EMAIL,
    
    // Vehicle Management
    REGISTER_VEHICLE,
    UPDATE_VEHICLE,
    DELETE_VEHICLE,
    
    // Facility Booking
    CREATE_FACILITY_BOOKING,
    UPDATE_FACILITY_BOOKING,
    CANCEL_FACILITY_BOOKING,
    FACILITY_CHECKIN,
    FACILITY_CHECKOUT,
    PAYMENT_FACILITY_BOOKING,
    UPDATE_PAYMENT_STATUS,
    
    // Announcements & Events
    VIEW_ANNOUNCEMENT,
    MARK_ANNOUNCEMENT_READ,
    VIEW_EVENT,
    CREATE_EVENT,
    UPDATE_EVENT,
    DELETE_EVENT,
    CANCEL_EVENT_REGISTRATION,
    
    // Support & Feedback
    CREATE_SUPPORT_REQUEST,
    UPDATE_SUPPORT_REQUEST,
    SUBMIT_FEEDBACK,
    
    // Staff Portal
    VIEW_STAFF_DASHBOARD,
    CREATE_STAFF_TASK,
    UPDATE_STAFF_TASK,
    COMPLETE_STAFF_TASK,
    
    // Admin Actions
    CREATE_USER,
    UPDATE_USER,
    DELETE_USER,
    CREATE_ANNOUNCEMENT,
    UPDATE_ANNOUNCEMENT,
    DELETE_ANNOUNCEMENT,
    REGISTER_EVENT,
    
    // Additional action types
    CREATE_SERVICE_REQUEST,
    USER_MANAGEMENT,
    ANNOUNCEMENT_CREATE,
    SERVICE_REQUEST,
    FACILITY_BOOKING,
    PAYMENT;

    public String getDisplayName() {
        switch (this) {
            case LOGIN: return "Đăng nhập";
            case LOGOUT: return "Đăng xuất";
            case PASSWORD_CHANGE: return "Đổi mật khẩu";
            case VIEW_INVOICE: return "Xem hóa đơn";
            case DOWNLOAD_INVOICE: return "Tải hóa đơn";
            case PAY_INVOICE: return "Thanh toán hóa đơn";
            case REGISTER_VEHICLE: return "Đăng ký xe";
            case SEND_EMAIL: return "Gửi email";
            case UPDATE_VEHICLE: return "Cập nhật thông tin xe";
            case DELETE_VEHICLE: return "Xóa thông tin xe";
            case CREATE_FACILITY_BOOKING: return "Đặt tiện ích";
            case UPDATE_FACILITY_BOOKING: return "Cập nhật đặt tiện ích";
            case CANCEL_FACILITY_BOOKING: return "Hủy đặt tiện ích";
            case FACILITY_CHECKIN: return "Check-in tiện ích";
            case FACILITY_CHECKOUT: return "Check-out tiện ích";
            case PAYMENT_FACILITY_BOOKING: return "Thanh toán đặt tiện ích";
            case UPDATE_PAYMENT_STATUS: return "Cập nhật trạng thái thanh toán";
            case VIEW_ANNOUNCEMENT: return "Xem thông báo";
            case MARK_ANNOUNCEMENT_READ: return "Đánh dấu đã đọc thông báo";
            case VIEW_EVENT: return "Xem sự kiện";
            case CREATE_EVENT: return "Tạo sự kiện";
            case UPDATE_EVENT: return "Cập nhật sự kiện";
            case DELETE_EVENT: return "Xóa sự kiện";
            case CANCEL_EVENT_REGISTRATION: return "Hủy đăng ký sự kiện";
            case CREATE_SUPPORT_REQUEST: return "Tạo yêu cầu hỗ trợ";
            case UPDATE_SUPPORT_REQUEST: return "Cập nhật yêu cầu hỗ trợ";
            case SUBMIT_FEEDBACK: return "Gửi phản hồi";
            case VIEW_STAFF_DASHBOARD: return "Xem bảng điều khiển nhân viên";
            case CREATE_STAFF_TASK: return "Tạo nhiệm vụ nhân viên";
            case UPDATE_STAFF_TASK: return "Cập nhật nhiệm vụ nhân viên";
            case COMPLETE_STAFF_TASK: return "Hoàn thành nhiệm vụ nhân viên";
            case CREATE_USER: return "Tạo người dùng";
            case UPDATE_USER: return "Cập nhật người dùng";
            case DELETE_USER: return "Xóa người dùng";
            case CREATE_ANNOUNCEMENT: return "Tạo thông báo";
            case UPDATE_ANNOUNCEMENT: return "Cập nhật thông báo";
            case DELETE_ANNOUNCEMENT: return "Xóa thông báo";
            case REGISTER_EVENT: return "Đăng ký sự kiện";
            case CREATE_SERVICE_REQUEST: return "Tạo yêu cầu dịch vụ";
            case USER_MANAGEMENT: return "Quản lý người dùng";
            case ANNOUNCEMENT_CREATE: return "Tạo thông báo";
            case SERVICE_REQUEST: return "Yêu cầu dịch vụ";
            case FACILITY_BOOKING: return "Đặt tiện ích";
            case PAYMENT: return "Thanh toán";
            default: return this.name();
        }
    }

    public static ActivityActionType fromCode(String code) {
        try {
            return ActivityActionType.valueOf(code);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid activity action type: " + code);
        }
    }
} 