import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/announcement.dart';

class AnnouncementsApi {
  static const String _baseUrl = 'http://localhost:8080/api';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<List<Announcement>> getAnnouncements() async {
    try {
      final token = await _getToken();
      final response = await http.get(
        Uri.parse('$_baseUrl/announcements'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Announcement.fromJson(json)).toList();
      } else {
        // Trả về dữ liệu mẫu nếu API lỗi
        return _getSampleAnnouncements();
      }
    } catch (e) {
      print('API Error getting announcements: $e');
      // Trả về dữ liệu mẫu nếu API lỗi
      return _getSampleAnnouncements();
    }
  }

  Future<void> markAsRead(String announcementId) async {
    try {
      final token = await _getToken();
      await http.put(
        Uri.parse('$_baseUrl/announcements/$announcementId/read'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
    } catch (e) {
      print('API Error marking announcement as read: $e');
      // Không throw error để không làm crash app
    }
  }

  Future<void> markAllAsRead(List<String> announcementIds) async {
    try {
      final token = await _getToken();
      await http.put(
        Uri.parse('$_baseUrl/announcements/mark-all-read'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode({'announcementIds': announcementIds}),
      );
    } catch (e) {
      print('API Error marking all announcements as read: $e');
      // Không throw error để không làm crash app
    }
  }

  // Dữ liệu mẫu cho testing
  List<Announcement> _getSampleAnnouncements() {
    return [
      const Announcement(
        id: '1',
        title: 'Thông báo bảo trì thang máy',
        content:
            'Thang máy tòa A1 sẽ được bảo trì định kỳ vào ngày 25/12/2024 từ 8:00 - 12:00. Trong thời gian này, thang máy sẽ tạm ngừng hoạt động. Cư dân vui lòng sử dụng thang bộ hoặc thang máy tòa A2. Xin cảm ơn sự hợp tác của quý cư dân.',
        type: 'URGENT',
        read: false,
        createdAt: '2024-12-20T10:30:00Z',
        createdBy: 'Ban quản lý',
      ),
      const Announcement(
        id: '2',
        title: 'Tiệc Giáng sinh 2024',
        content:
            'Chung cư FPT sẽ tổ chức tiệc Giáng sinh cho toàn thể cư dân vào ngày 24/12/2024 tại sảnh tầng 1. Thời gian: 18:00 - 22:00. Có buffet miễn phí và chương trình văn nghệ đặc sắc. Đăng ký tham gia tại quầy lễ tân trước ngày 22/12.',
        type: 'EVENT',
        read: false,
        createdAt: '2024-12-19T14:20:00Z',
        createdBy: 'Ban quản lý',
      ),
      const Announcement(
        id: '3',
        title: 'Cập nhật quy định sử dụng tiện ích chung',
        content:
            'Từ ngày 01/01/2025, quy định sử dụng các tiện ích chung sẽ có một số thay đổi: 1) Phòng gym: Tăng phí từ 50,000 VND/tháng lên 60,000 VND/tháng. 2) Hồ bơi: Giới hạn tối đa 20 người/lần. 3) Sân tennis: Cần đặt trước ít nhất 2 giờ. Chi tiết xem tại bảng thông báo tầng 1.',
        type: 'NEWS',
        read: true,
        createdAt: '2024-12-18T09:15:00Z',
        createdBy: 'Ban quản lý',
      ),
      const Announcement(
        id: '4',
        title: 'Lịch thu gom rác tái chế',
        content:
            'Thứ 2 hàng tuần: Giấy, bìa carton. Thứ 4 hàng tuần: Chai nhựa, lon kim loại. Thứ 6 hàng tuần: Pin, thiết bị điện tử. Vui lòng để rác tái chế tại khu vực quy định trước 8:00 sáng. Không để rác tái chế chung với rác thải sinh hoạt.',
        type: 'REGULAR',
        read: true,
        createdAt: '2024-12-17T16:45:00Z',
        createdBy: 'Ban quản lý',
      ),
      const Announcement(
        id: '5',
        title: 'Cảnh báo an ninh',
        content:
            'Gần đây có một số vụ trộm cắp xảy ra tại khu vực lân cận. Ban quản lý khuyến cáo cư dân: 1) Khóa cửa cẩn thận khi ra ngoài. 2) Không để người lạ vào chung cư. 3) Báo ngay cho bảo vệ khi phát hiện tình huống khả nghi. Hotline bảo vệ: 1900-xxxx.',
        type: 'URGENT',
        read: false,
        createdAt: '2024-12-16T11:20:00Z',
        createdBy: 'Ban quản lý',
      ),
    ];
  }
}
