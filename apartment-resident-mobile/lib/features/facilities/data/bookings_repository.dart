import '../models/booking.dart';
import '../models/availability.dart';
import 'bookings_api.dart';

class BookingsRepository {
  static final BookingsRepository _instance = BookingsRepository._internal();
  factory BookingsRepository() => _instance;
  BookingsRepository._internal();

  /// Lấy danh sách đặt chỗ của user hiện tại
  Future<List<FacilityBooking>> getMyBookings() async {
    try {
      final bookings = await BookingsApi.getMyBookings();

      // Sắp xếp booking mới nhất lên trên cùng
      bookings.sort((a, b) {
        // Sắp xếp theo createdAt nếu có, nếu không thì theo startTime
        if (a.createdAt != null && b.createdAt != null) {
          return DateTime.parse(
            b.createdAt!,
          ).compareTo(DateTime.parse(a.createdAt!));
        }
        // Fallback: sắp xếp theo startTime (mới nhất lên trên)
        return DateTime.parse(
          b.startTime,
        ).compareTo(DateTime.parse(a.startTime));
      });

      return bookings;
    } catch (e) {
      // If authentication fails, return empty list instead of throwing error
      if (e.toString().contains('Authentication failed') ||
          e.toString().contains('401')) {
        print('Authentication failed, returning empty bookings list');
        return [];
      }
      throw Exception('Không thể tải danh sách đặt chỗ: $e');
    }
  }

  /// Tạo đặt chỗ mới
  Future<FacilityBooking> createBooking(
    FacilityBookingCreateRequest request,
  ) async {
    try {
      // Kiểm tra xung đột thời gian trước khi tạo
      final date = request.bookingTime.split('T')[0];
      final startTime = request.bookingTime.split('T')[1];
      final endTime = _calculateEndTime(request.bookingTime, request.duration);

      final hasConflict = await AvailabilityApi.checkTimeConflict(
        request.facilityId,
        startTime,
        endTime,
        date,
      );

      if (hasConflict) {
        throw Exception('Thời gian đặt chỗ bị xung đột với đặt chỗ khác');
      }

      return await BookingsApi.create(request);
    } catch (e) {
      throw Exception('Không thể tạo đặt chỗ: $e');
    }
  }

  /// Cập nhật đặt chỗ
  Future<FacilityBooking> updateBooking(
    int id,
    FacilityBookingUpdateRequest request,
  ) async {
    try {
      return await BookingsApi.update(id, request);
    } catch (e) {
      throw Exception('Không thể cập nhật đặt chỗ: $e');
    }
  }

  /// Hủy đặt chỗ
  Future<FacilityBooking> cancelBooking(int id) async {
    try {
      return await BookingsApi.cancel(id);
    } catch (e) {
      throw Exception('Không thể hủy đặt chỗ: $e');
    }
  }

  /// Lấy thông tin đặt chỗ theo ID
  Future<FacilityBooking> getBookingById(int id) async {
    try {
      return await BookingsApi.getById(id);
    } catch (e) {
      throw Exception('Không thể tải thông tin đặt chỗ: $e');
    }
  }

  /// Lấy thông tin khả dụng của tiện ích theo ngày
  Future<FacilityAvailability> getAvailability(
    int facilityId,
    String date,
  ) async {
    try {
      return await AvailabilityApi.getAvailability(facilityId, date);
    } catch (e) {
      throw Exception('Không thể tải thông tin khả dụng: $e');
    }
  }

  /// Kiểm tra xung đột thời gian
  Future<bool> checkTimeConflict(
    int facilityId,
    String startTime,
    String endTime,
    String date,
  ) async {
    try {
      return await AvailabilityApi.checkTimeConflict(
        facilityId,
        startTime,
        endTime,
        date,
      );
    } catch (e) {
      throw Exception('Không thể kiểm tra xung đột thời gian: $e');
    }
  }

  /// Lấy danh sách đặt chỗ theo trạng thái
  Future<List<FacilityBooking>> getBookingsByStatus(String status) async {
    try {
      final bookings = await BookingsApi.getMyBookings();
      return bookings.where((booking) => booking.status == status).toList();
    } catch (e) {
      throw Exception('Không thể lọc đặt chỗ theo trạng thái: $e');
    }
  }

  /// Lấy danh sách đặt chỗ theo tiện ích
  Future<List<FacilityBooking>> getBookingsByFacility(int facilityId) async {
    try {
      final bookings = await BookingsApi.getMyBookings();
      return bookings
          .where((booking) => booking.facilityId == facilityId)
          .toList();
    } catch (e) {
      throw Exception('Không thể lọc đặt chỗ theo tiện ích: $e');
    }
  }

  /// Lấy danh sách đặt chỗ theo ngày
  Future<List<FacilityBooking>> getBookingsByDate(String date) async {
    try {
      final bookings = await BookingsApi.getMyBookings();
      return bookings
          .where((booking) => booking.startTime.startsWith(date))
          .toList();
    } catch (e) {
      throw Exception('Không thể lọc đặt chỗ theo ngày: $e');
    }
  }

  /// Tính toán thời gian kết thúc dựa trên thời gian bắt đầu và thời lượng
  String _calculateEndTime(String startTime, int durationMinutes) {
    try {
      final start = DateTime.parse(startTime);
      final end = start.add(Duration(minutes: durationMinutes));
      return end.toIso8601String();
    } catch (e) {
      throw Exception('Không thể tính toán thời gian kết thúc: $e');
    }
  }

  /// Validate đặt chỗ
  Future<bool> validateBooking(FacilityBookingCreateRequest request) async {
    try {
      // Kiểm tra thời gian trong tương lai
      final bookingTime = DateTime.parse(request.bookingTime);
      if (bookingTime.isBefore(DateTime.now())) {
        throw Exception('Thời gian đặt chỗ phải trong tương lai');
      }

      // Kiểm tra số người hợp lệ
      if (request.numberOfPeople <= 0) {
        throw Exception('Số người phải lớn hơn 0');
      }

      // Kiểm tra thời lượng hợp lệ
      if (request.duration <= 0) {
        throw Exception('Thời lượng phải lớn hơn 0');
      }

      // Kiểm tra mục đích không rỗng
      if (request.purpose.trim().isEmpty) {
        throw Exception('Mục đích sử dụng không được để trống');
      }

      return true;
    } catch (e) {
      throw Exception('Dữ liệu đặt chỗ không hợp lệ: $e');
    }
  }

  /// Lấy danh sách tất cả đặt chỗ (admin only)
  Future<List<FacilityBooking>> getAllBookingsAdmin() async {
    try {
      return await BookingsApi.getAllAdmin();
    } catch (e) {
      throw Exception('Không thể tải danh sách đặt chỗ (admin): $e');
    }
  }

  /// Cập nhật trạng thái đặt chỗ (admin only)
  Future<FacilityBooking> updateBookingStatus(
    int id,
    String status, {
    String? rejectionReason,
  }) async {
    try {
      return await BookingsApi.updateStatus(
        id,
        status,
        rejectionReason: rejectionReason,
      );
    } catch (e) {
      throw Exception('Không thể cập nhật trạng thái đặt chỗ: $e');
    }
  }
}
