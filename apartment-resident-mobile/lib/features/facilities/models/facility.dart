import 'package:freezed_annotation/freezed_annotation.dart';

part 'facility.freezed.dart';
part 'facility.g.dart';

@freezed
class Facility with _$Facility {
  const factory Facility({
    required int id,
    required String name,
    required String description,
    required String location,
    required int capacity,
    required String otherDetails,
    required double usageFee,
    String? openingHours,
    @Default(true) bool isVisible,
  }) = _Facility;

  factory Facility.fromJson(Map<String, dynamic> json) =>
      _$FacilityFromJson(json);
}

@freezed
class FacilityCreateRequest with _$FacilityCreateRequest {
  const factory FacilityCreateRequest({
    required String name,
    required String description,
    required String location,
    required int capacity,
    required String otherDetails,
    required double usageFee,
    String? openingHours,
    @Default(true) bool isVisible,
  }) = _FacilityCreateRequest;

  factory FacilityCreateRequest.fromJson(Map<String, dynamic> json) =>
      _$FacilityCreateRequestFromJson(json);
}

@freezed
class FacilityUpdateRequest with _$FacilityUpdateRequest {
  const factory FacilityUpdateRequest({
    String? name,
    String? description,
    String? location,
    int? capacity,
    String? otherDetails,
    double? usageFee,
    String? openingHours,
    bool? isVisible,
  }) = _FacilityUpdateRequest;

  factory FacilityUpdateRequest.fromJson(Map<String, dynamic> json) =>
      _$FacilityUpdateRequestFromJson(json);
}
