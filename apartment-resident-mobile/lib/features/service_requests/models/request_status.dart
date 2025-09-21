import 'package:freezed_annotation/freezed_annotation.dart';

part 'request_status.freezed.dart';
part 'request_status.g.dart';

@freezed
class RequestStatus with _$RequestStatus {
  const factory RequestStatus({
    required String status,
    required String displayName,
    required String description,
    required int step,
    required bool isCompleted,
    required bool isActive,
    required bool isCancelled,
  }) = _RequestStatus;

  factory RequestStatus.fromJson(Map<String, dynamic> json) =>
      _$RequestStatusFromJson(json);

  // Factory constructors for common statuses
  factory RequestStatus.pending() => const RequestStatus(
    status: 'PENDING',
    displayName: 'Chờ xử lý',
    description: 'Yêu cầu đã được tiếp nhận',
    step: 1,
    isCompleted: false,
    isActive: true,
    isCancelled: false,
  );

  factory RequestStatus.assigned() => const RequestStatus(
    status: 'ASSIGNED',
    displayName: 'Đã giao',
    description: 'Đã giao cho nhân viên',
    step: 2,
    isCompleted: false,
    isActive: true,
    isCancelled: false,
  );

  factory RequestStatus.inProgress() => const RequestStatus(
    status: 'IN_PROGRESS',
    displayName: 'Đang xử lý',
    description: 'Nhân viên đang xử lý yêu cầu',
    step: 3,
    isCompleted: false,
    isActive: true,
    isCancelled: false,
  );

  factory RequestStatus.completed() => const RequestStatus(
    status: 'COMPLETED',
    displayName: 'Hoàn thành',
    description: 'Yêu cầu đã hoàn thành',
    step: 4,
    isCompleted: true,
    isActive: false,
    isCancelled: false,
  );

  factory RequestStatus.cancelled() => const RequestStatus(
    status: 'CANCELLED',
    displayName: 'Đã hủy',
    description: 'Yêu cầu đã bị hủy',
    step: 1,
    isCompleted: false,
    isActive: false,
    isCancelled: true,
  );

  // Helper method to get status from string
  static RequestStatus fromString(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return RequestStatus.pending();
      case 'ASSIGNED':
        return RequestStatus.assigned();
      case 'IN_PROGRESS':
        return RequestStatus.inProgress();
      case 'COMPLETED':
        return RequestStatus.completed();
      case 'CANCELLED':
        return RequestStatus.cancelled();
      default:
        return RequestStatus.pending();
    }
  }
}
