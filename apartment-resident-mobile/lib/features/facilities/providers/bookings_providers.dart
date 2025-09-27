import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/bookings_repository.dart';
import '../data/bookings_api.dart';
import '../models/booking.dart';
import '../models/availability.dart';

/// Provider cho BookingsApi
final bookingsApiProvider = Provider<BookingsApi>((ref) {
  return BookingsApi();
});

/// Provider cho BookingsRepository
final bookingsRepositoryProvider = Provider<BookingsRepository>((ref) {
  return BookingsRepository();
});

/// Provider cho danh sách đặt chỗ của user
final myBookingsProvider = FutureProvider<List<FacilityBooking>>((ref) async {
  final repository = ref.read(bookingsRepositoryProvider);
  return await repository.getMyBookings();
});

/// Provider cho thông tin đặt chỗ theo ID
final bookingProvider = FutureProvider.family<FacilityBooking, int>((
  ref,
  id,
) async {
  final repository = ref.read(bookingsRepositoryProvider);
  return await repository.getBookingById(id);
});

/// Provider cho thông tin khả dụng của tiện ích
final availabilityProvider =
    FutureProvider.family<
      FacilityAvailability,
      ({int facilityId, String date})
    >((ref, params) async {
      final repository = ref.read(bookingsRepositoryProvider);
      return await repository.getAvailability(params.facilityId, params.date);
    });

/// Provider cho đặt chỗ theo trạng thái
final bookingsByStatusProvider =
    FutureProvider.family<List<FacilityBooking>, String>((ref, status) async {
      final repository = ref.read(bookingsRepositoryProvider);
      return await repository.getBookingsByStatus(status);
    });

/// Provider cho đặt chỗ theo tiện ích
final bookingsByFacilityProvider =
    FutureProvider.family<List<FacilityBooking>, int>((ref, facilityId) async {
      final repository = ref.read(bookingsRepositoryProvider);
      return await repository.getBookingsByFacility(facilityId);
    });

/// Provider cho đặt chỗ theo ngày
final bookingsByDateProvider =
    FutureProvider.family<List<FacilityBooking>, String>((ref, date) async {
      final repository = ref.read(bookingsRepositoryProvider);
      return await repository.getBookingsByDate(date);
    });

/// StateNotifier cho quản lý đặt chỗ
final bookingsNotifierProvider =
    StateNotifierProvider<BookingsNotifier, AsyncValue<List<FacilityBooking>>>((
      ref,
    ) {
      final repository = ref.read(bookingsRepositoryProvider);
      return BookingsNotifier(repository);
    });

/// StateNotifier cho form tạo đặt chỗ
final bookingFormNotifierProvider =
    StateNotifierProvider<BookingFormNotifier, BookingFormState>((ref) {
      final repository = ref.read(bookingsRepositoryProvider);
      return BookingFormNotifier(repository);
    });

/// State cho form tạo đặt chỗ
class BookingFormState {
  final bool isLoading;
  final String? error;
  final bool isValid;
  final Map<String, dynamic>? request;
  final FacilityAvailability? availability;

  const BookingFormState({
    this.isLoading = false,
    this.error,
    this.isValid = false,
    this.request,
    this.availability,
  });

  BookingFormState copyWith({
    bool? isLoading,
    String? error,
    bool? isValid,
    Map<String, dynamic>? request,
    FacilityAvailability? availability,
  }) {
    return BookingFormState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isValid: isValid ?? this.isValid,
      request: request ?? this.request,
      availability: availability ?? this.availability,
    );
  }
}

/// StateNotifier cho quản lý đặt chỗ
class BookingsNotifier
    extends StateNotifier<AsyncValue<List<FacilityBooking>>> {
  final BookingsRepository _repository;

  BookingsNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadBookings();
  }

  /// Tải danh sách đặt chỗ
  Future<void> loadBookings() async {
    try {
      state = const AsyncValue.loading();
      final bookings = await _repository.getMyBookings();
      state = AsyncValue.data(bookings);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Tạo đặt chỗ mới
  Future<void> createBooking(Map<String, dynamic> bookingData) async {
    try {
      await _repository.createBooking(bookingData);
      // Reload danh sách sau khi tạo thành công
      await loadBookings();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Cập nhật đặt chỗ
  Future<void> updateBooking(
    int id,
    FacilityBookingUpdateRequest request,
  ) async {
    try {
      await _repository.updateBooking(id, request);
      // Reload danh sách sau khi cập nhật thành công
      await loadBookings();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  /// Hủy đặt chỗ
  Future<FacilityBooking> cancelBooking(int id) async {
    try {
      final cancelledBooking = await _repository.cancelBooking(id);
      // Reload danh sách sau khi hủy thành công
      await loadBookings();
      return cancelledBooking;
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      rethrow;
    }
  }

  /// Refresh danh sách
  Future<void> refresh() async {
    await loadBookings();
  }
}

/// StateNotifier cho form tạo đặt chỗ
class BookingFormNotifier extends StateNotifier<BookingFormState> {
  final BookingsRepository _repository;

  BookingFormNotifier(this._repository) : super(const BookingFormState());

  /// Reset form
  void reset() {
    state = const BookingFormState();
  }

  /// Cập nhật thông tin đặt chỗ
  void updateRequest(Map<String, dynamic> request) {
    state = state.copyWith(request: request);
    _validateForm();
  }

  /// Tải thông tin khả dụng
  Future<void> loadAvailability(int facilityId, String date) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      final availability = await _repository.getAvailability(facilityId, date);
      state = state.copyWith(isLoading: false, availability: availability);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Kiểm tra xung đột thời gian
  Future<void> checkTimeConflict(
    int facilityId,
    String startTime,
    String endTime,
    String date,
  ) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      final hasConflict = await _repository.checkTimeConflict(
        facilityId,
        startTime,
        endTime,
        date,
      );

      if (hasConflict) {
        state = state.copyWith(
          isLoading: false,
          error: 'Thời gian đặt chỗ bị xung đột với đặt chỗ khác',
        );
      } else {
        state = state.copyWith(isLoading: false, error: null);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Validate form
  void _validateForm() {
    final request = state.request;
    if (request == null) {
      state = state.copyWith(isValid: false);
      return;
    }

    final isValid =
        (request['facilityId'] as int) > 0 &&
        (request['userId'] as int) > 0 &&
        (request['bookingTime'] as String).isNotEmpty &&
        (request['duration'] as int) > 0 &&
        (request['numberOfPeople'] as int) > 0 &&
        (request['purpose'] as String).trim().isNotEmpty;

    state = state.copyWith(isValid: isValid);
  }

  /// Tạo đặt chỗ
  Future<Map<String, dynamic>?> createBooking() async {
    if (!state.isValid || state.request == null) {
      state = state.copyWith(error: 'Dữ liệu đặt chỗ không hợp lệ');
      return null;
    }

    try {
      state = state.copyWith(isLoading: true, error: null);

      // Validate trước khi tạo
      await _repository.validateBooking(state.request!);

      // Tạo đặt chỗ
      final booking = await _repository.createBooking(state.request!);

      state = state.copyWith(isLoading: false);
      return booking;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return null;
    }
  }
}

/// Provider cho trạng thái loading của bookings
final bookingsLoadingProvider = StateProvider<bool>((ref) => false);

/// Provider cho error message của bookings
final bookingsErrorProvider = StateProvider<String?>((ref) => null);

/// Provider cho selected booking
final selectedBookingProvider = StateProvider<FacilityBooking?>((ref) => null);

/// Provider cho selected date
final selectedDateProvider = StateProvider<DateTime>((ref) => DateTime.now());

/// Provider cho selected time slot
final selectedTimeSlotProvider = StateProvider<TimeSlot?>((ref) => null);

/// Provider cho booking status filter
final bookingStatusFilterProvider = StateProvider<String>((ref) => 'all');

/// Provider cho facility filter
final facilityFilterProvider = StateProvider<int?>((ref) => null);

/// Provider cho date filter
final dateFilterProvider = StateProvider<DateTime?>((ref) => null);
