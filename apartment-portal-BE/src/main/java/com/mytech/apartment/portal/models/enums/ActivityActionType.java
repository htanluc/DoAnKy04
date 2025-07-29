package com.mytech.apartment.portal.models.enums;

public enum ActivityActionType {
    // Authentication & User Management
    LOGIN("LOGIN", "Đăng nhập"),
    LOGOUT("LOGOUT", "Đăng xuất"),
    REGISTER("REGISTER", "Đăng ký tài khoản"),
    CHANGE_PASSWORD("CHANGE_PASSWORD", "Đổi mật khẩu"),
    FORGOT_PASSWORD("FORGOT_PASSWORD", "Quên mật khẩu"),
    RESET_PASSWORD("RESET_PASSWORD", "Đặt lại mật khẩu"),
    UPDATE_PROFILE("UPDATE_PROFILE", "Cập nhật thông tin cá nhân"),
    UPLOAD_AVATAR("UPLOAD_AVATAR", "Upload ảnh đại diện"),
    
    // Invoice & Payment
    VIEW_INVOICE("VIEW_INVOICE", "Xem hóa đơn"),
    PAY_INVOICE("PAY_INVOICE", "Thanh toán hóa đơn"),
    DOWNLOAD_INVOICE("DOWNLOAD_INVOICE", "Tải hóa đơn"),
    
    // Announcements
    VIEW_ANNOUNCEMENT("VIEW_ANNOUNCEMENT", "Xem thông báo"),
    MARK_ANNOUNCEMENT_READ("MARK_ANNOUNCEMENT_READ", "Đánh dấu thông báo đã đọc"),
    
    // Events
    VIEW_EVENT("VIEW_EVENT", "Xem sự kiện"),
    REGISTER_EVENT("REGISTER_EVENT", "Đăng ký sự kiện"),
    CANCEL_EVENT_REGISTRATION("CANCEL_EVENT_REGISTRATION", "Hủy đăng ký sự kiện"),
    
    // Service Requests
    CREATE_SERVICE_REQUEST("CREATE_SERVICE_REQUEST", "Tạo yêu cầu dịch vụ"),
    UPDATE_SERVICE_REQUEST("UPDATE_SERVICE_REQUEST", "Cập nhật yêu cầu dịch vụ"),
    CANCEL_SERVICE_REQUEST("CANCEL_SERVICE_REQUEST", "Hủy yêu cầu dịch vụ"),
    RATE_SERVICE_REQUEST("RATE_SERVICE_REQUEST", "Đánh giá yêu cầu dịch vụ"),
    
    // Facility Bookings
    CREATE_FACILITY_BOOKING("CREATE_FACILITY_BOOKING", "Đặt tiện ích"),
    UPDATE_FACILITY_BOOKING("UPDATE_FACILITY_BOOKING", "Cập nhật đặt tiện ích"),
    CANCEL_FACILITY_BOOKING("CANCEL_FACILITY_BOOKING", "Hủy đặt tiện ích"),
    CHECK_IN_FACILITY("CHECK_IN_FACILITY", "Check-in tiện ích"),
    CHECK_OUT_FACILITY("CHECK_OUT_FACILITY", "Check-out tiện ích"),
    
    // Vehicle Management
    REGISTER_VEHICLE("REGISTER_VEHICLE", "Đăng ký xe"),
    UPDATE_VEHICLE("UPDATE_VEHICLE", "Cập nhật thông tin xe"),
    DELETE_VEHICLE("DELETE_VEHICLE", "Xóa đăng ký xe"),
    
    // Feedback
    CREATE_FEEDBACK("CREATE_FEEDBACK", "Gửi phản hồi"),
    UPDATE_FEEDBACK("UPDATE_FEEDBACK", "Cập nhật phản hồi"),
    DELETE_FEEDBACK("DELETE_FEEDBACK", "Xóa phản hồi"),
    
    // File Operations
    UPLOAD_FILE("UPLOAD_FILE", "Upload file"),
    DELETE_FILE("DELETE_FILE", "Xóa file"),
    
    // System
    VIEW_DASHBOARD("VIEW_DASHBOARD", "Xem trang tổng quan"),
    VIEW_ACTIVITY_LOGS("VIEW_ACTIVITY_LOGS", "Xem lịch sử hoạt động"),
    EXPORT_DATA("EXPORT_DATA", "Xuất dữ liệu"),
    
    // Error & Security
    LOGIN_FAILED("LOGIN_FAILED", "Đăng nhập thất bại"),
    UNAUTHORIZED_ACCESS("UNAUTHORIZED_ACCESS", "Truy cập trái phép"),
    SESSION_EXPIRED("SESSION_EXPIRED", "Phiên đăng nhập hết hạn");

    private final String code;
    private final String displayName;

    ActivityActionType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static ActivityActionType fromCode(String code) {
        for (ActivityActionType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown activity action type: " + code);
    }
} 