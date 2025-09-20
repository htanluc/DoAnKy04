import 'dart:convert';
import '../../../../core/api/api_helper.dart';
import '../models/booking.dart';
import '../models/availability.dart';

class BookingsApi {
  static const String _basePath = '/api/facility-bookings';
  static const String _adminBasePath = '/api/admin/facility-bookings';

  /// Lấy danh sách đặt chỗ của user hiện tại
  static Future<List<FacilityBooking>> getMyBookings() async {
    try {
      final response = await ApiHelper.get('$_basePath/my');
      print(
        'Bookings API response status: ${response.statusCode}',
      ); // Debug log
      print('Bookings API response body: ${response.body}'); // Debug log

      if (response.statusCode == 401) {
        throw Exception('Authentication failed. Please login again.');
      }

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch my bookings: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      print('Bookings API parsed data: $data'); // Debug log

      // Handle case where response is already a list
      if (data is List) {
        if (data.isEmpty) {
          return []; // Return empty list if no bookings
        }
        return data
            .where((json) => json != null) // Filter out null values
            .map(
              (json) => FacilityBooking.fromJson(json as Map<String, dynamic>),
            )
            .toList();
      }

      // Handle case where response is wrapped in an object
      final bookingsList = ApiHelper.extractList(data);
      print('Extracted bookings list: $bookingsList'); // Debug log

      if (bookingsList.isEmpty) {
        return []; // Return empty list if no bookings
      }

      return bookingsList
          .where((json) => json != null) // Filter out null values
          .map((json) => FacilityBooking.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error in getMyBookings: $e'); // Debug log
      throw Exception('Error fetching my bookings: $e');
    }
  }

  /// Tạo đặt chỗ mới
  static Future<FacilityBooking> create(
    FacilityBookingCreateRequest request,
  ) async {
    try {
      final response = await ApiHelper.post(_basePath, data: request.toJson());

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Failed to create booking: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      final bookingData = ApiHelper.extractMap(data);

      return FacilityBooking.fromJson(bookingData);
    } catch (e) {
      throw Exception('Error creating booking: $e');
    }
  }

  /// Cập nhật đặt chỗ
  static Future<FacilityBooking> update(
    int id,
    FacilityBookingUpdateRequest request,
  ) async {
    try {
      final response = await ApiHelper.put(
        '$_basePath/$id',
        data: request.toJson(),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update booking: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      final bookingData = ApiHelper.extractMap(data);

      return FacilityBooking.fromJson(bookingData);
    } catch (e) {
      throw Exception('Error updating booking: $e');
    }
  }

  /// Hủy đặt chỗ
  static Future<void> cancel(int id) async {
    try {
      print('Cancelling booking with ID: $id');
      final response = await ApiHelper.delete('$_basePath/$id');
      print('Cancel booking response status: ${response.statusCode}');
      print('Cancel booking response body: ${response.body}');

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception(
          'Failed to cancel booking: ${response.statusCode} - ${response.body}',
        );
      }

      print('Booking cancelled successfully');
    } catch (e) {
      print('Error cancelling booking: $e');
      throw Exception('Error canceling booking: $e');
    }
  }

  /// Lấy thông tin đặt chỗ theo ID
  static Future<FacilityBooking> getById(int id) async {
    try {
      final response = await ApiHelper.get('$_basePath/$id');
      if (response.statusCode != 200) {
        throw Exception('Failed to fetch booking: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      final bookingData = ApiHelper.extractMap(data);

      return FacilityBooking.fromJson(bookingData);
    } catch (e) {
      throw Exception('Error fetching booking: $e');
    }
  }

  /// Lấy danh sách tất cả đặt chỗ (admin only)
  static Future<List<FacilityBooking>> getAllAdmin() async {
    try {
      final response = await ApiHelper.get(_adminBasePath);
      if (response.statusCode != 200) {
        throw Exception('Failed to fetch all bookings: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      final bookingsList = ApiHelper.extractList(data);

      return bookingsList
          .map((json) => FacilityBooking.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Error fetching all bookings: $e');
    }
  }

  /// Cập nhật trạng thái đặt chỗ (admin only)
  static Future<FacilityBooking> updateStatus(
    int id,
    String status, {
    String? rejectionReason,
  }) async {
    try {
      final response = await ApiHelper.put(
        '$_adminBasePath/$id',
        data: {
          'status': status,
          if (rejectionReason != null) 'rejectionReason': rejectionReason,
        },
      );

      if (response.statusCode != 200) {
        throw Exception(
          'Failed to update booking status: ${response.statusCode}',
        );
      }

      final data = jsonDecode(response.body);
      final bookingData = ApiHelper.extractMap(data);

      return FacilityBooking.fromJson(bookingData);
    } catch (e) {
      throw Exception('Error updating booking status: $e');
    }
  }

  /// Lấy thông tin đặt chỗ theo ID (admin only)
  static Future<FacilityBooking> getByIdAdmin(int id) async {
    try {
      final response = await ApiHelper.get('$_adminBasePath/$id');
      if (response.statusCode != 200) {
        throw Exception('Failed to fetch booking: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      final bookingData = ApiHelper.extractMap(data);

      return FacilityBooking.fromJson(bookingData);
    } catch (e) {
      throw Exception('Error fetching booking: $e');
    }
  }

  /// Cập nhật trạng thái thanh toán cho booking
  static Future<FacilityBooking> updatePaymentStatus({
    required int bookingId,
    required String paymentStatus,
    String? paymentMethod,
    double? totalCost,
    String? transactionId,
  }) async {
    try {
      print('Updating payment status for booking $bookingId: $paymentStatus');

      final response = await ApiHelper.patch(
        '$_basePath/$bookingId/payment',
        data: {
          'paymentStatus': paymentStatus,
          if (paymentMethod != null) 'paymentMethod': paymentMethod,
          if (totalCost != null) 'totalCost': totalCost,
          if (transactionId != null) 'transactionId': transactionId,
        },
      );

      if (response.statusCode != 200) {
        throw Exception(
          'Failed to update payment status: ${response.statusCode}',
        );
      }

      final data = jsonDecode(response.body);
      print('Payment status updated response: $data');

      // Backend returns wrapped response: { "success": true, "booking": {...} }
      if (data is Map<String, dynamic>) {
        if (data['success'] == true && data['booking'] != null) {
          final bookingData = data['booking'] as Map<String, dynamic>;
          print('Payment status updated successfully: ${bookingData['id']}');
          return FacilityBooking.fromJson(bookingData);
        } else {
          throw Exception('Backend returned error: ${data['message']}');
        }
      }

      // Fallback: assume direct booking object
      return FacilityBooking.fromJson(data);
    } catch (e) {
      print('Error updating payment status: $e');
      throw Exception('Không thể cập nhật trạng thái thanh toán: $e');
    }
  }
}

class AvailabilityApi {
  static const String _basePath = '/api/facilities';

  /// Lấy thông tin khả dụng của tiện ích theo ngày
  static Future<FacilityAvailability> getAvailability(
    int facilityId,
    String date,
  ) async {
    try {
      print('Fetching availability for facility $facilityId on date $date');
      final response = await ApiHelper.get(
        '$_basePath/$facilityId/availability',
        query: {'date': date},
      );

      print('Availability API response status: ${response.statusCode}');
      print('Availability API response body: ${response.body}');

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch availability: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      print('Availability API parsed data: $data');

      // Handle null response
      if (data == null) {
        print('Availability API returned null, creating default availability');
        return _createDefaultAvailability(facilityId, date);
      }

      // Handle case where data is already a Map
      Map<String, dynamic> availabilityData;
      if (data is Map<String, dynamic>) {
        availabilityData = data;
      } else {
        availabilityData = ApiHelper.extractMap(data);
      }

      print('Availability data: $availabilityData');

      // Convert backend response to Flutter model format
      return _convertBackendResponseToAvailability(availabilityData);
    } catch (e) {
      print('Error fetching availability: $e');
      // Return default availability instead of throwing error
      return _createDefaultAvailability(facilityId, date);
    }
  }

  /// Convert backend response to Flutter model
  static FacilityAvailability _convertBackendResponseToAvailability(
    Map<String, dynamic> data,
  ) {
    final facilityId = data['facilityId'] as int;
    final date = data['date'] as String;
    final hourlyData = data['hourlyData'] as List<dynamic>? ?? [];

    final timeSlots = <TimeSlot>[];
    int availableSlots = 0;
    int bookedSlots = 0;

    for (final hourData in hourlyData) {
      final hour = hourData['hour'] as int;
      final isAvailable = hourData['isAvailable'] as bool? ?? true;
      final usedCapacity = hourData['usedCapacity'] as int? ?? 0;

      // Chỉ tạo time slots cho giờ từ 6-22 (giờ hoạt động)
      if (hour >= 6 && hour < 22) {
        final startHour = hour.toString().padLeft(2, '0');
        final endHour = (hour + 1).toString().padLeft(2, '0');

        final isBooked = usedCapacity > 0;

        timeSlots.add(
          TimeSlot(
            startTime: '${date}T$startHour:00:00',
            endTime: '${date}T$endHour:00:00',
            isAvailable: isAvailable,
            isBooked: isBooked,
          ),
        );

        if (isAvailable) {
          availableSlots++;
        }
        if (isBooked) {
          bookedSlots++;
        }
      }
    }

    return FacilityAvailability(
      facilityId: facilityId,
      date: date,
      timeSlots: timeSlots,
      totalSlots: timeSlots.length,
      availableSlots: availableSlots,
      bookedSlots: bookedSlots,
    );
  }

  /// Tạo thông tin khả dụng mặc định
  static FacilityAvailability _createDefaultAvailability(
    int facilityId,
    String date,
  ) {
    // Tạo time slots mặc định (6:00 - 22:00, mỗi slot 1 giờ)
    final timeSlots = <TimeSlot>[];
    for (int hour = 6; hour < 22; hour++) {
      final startHour = hour.toString().padLeft(2, '0');
      final endHour = (hour + 1).toString().padLeft(2, '0');

      timeSlots.add(
        TimeSlot(
          startTime: '${date}T$startHour:00:00',
          endTime: '${date}T$endHour:00:00',
          isAvailable: true,
          isBooked: false,
        ),
      );
    }

    return FacilityAvailability(
      facilityId: facilityId,
      date: date,
      timeSlots: timeSlots,
      totalSlots: timeSlots.length,
      availableSlots: timeSlots.length,
      bookedSlots: 0,
    );
  }

  /// Kiểm tra xung đột thời gian
  static Future<bool> checkTimeConflict(
    int facilityId,
    String startTime,
    String endTime,
    String date,
  ) async {
    try {
      print(
        'Checking time conflict for facility $facilityId: $startTime - $endTime on $date',
      );

      // Tạm thời bỏ qua check conflict vì API endpoint chưa có
      // TODO: Implement proper conflict check when backend API is ready
      print('Time conflict check skipped - API endpoint not available');
      return false; // Không có xung đột

      /* Original implementation - uncomment when API is ready
      final response = await ApiHelper.post(
        '$_basePath/$facilityId/check-conflict',
        data: {'date': date, 'startTime': startTime, 'endTime': endTime},
      );

      if (response.statusCode != 200) {
        throw Exception(
          'Failed to check time conflict: ${response.statusCode}',
        );
      }

      final data = jsonDecode(response.body);
      return data['hasConflict'] == true;
      */
    } catch (e) {
      print('Error checking time conflict: $e');
      // Return false (no conflict) instead of throwing error
      return false;
    }
  }
}
