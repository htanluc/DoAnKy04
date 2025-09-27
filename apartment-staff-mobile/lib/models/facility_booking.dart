class FacilityBookingModel {
  final int id;
  final String facilityName;
  final String? facilityDescription;
  final String? facilityLocation;
  final String startTime;
  final String endTime;
  final String status;
  final String? purpose;
  final int numberOfPeople;
  final String? qrCode;
  final String? qrExpiresAt;
  final int checkedInCount;
  final int maxCheckins;
  final String? userName;
  final String? userPhone;
  final bool canCheckIn;

  FacilityBookingModel({
    required this.id,
    required this.facilityName,
    this.facilityDescription,
    this.facilityLocation,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.purpose,
    required this.numberOfPeople,
    this.qrCode,
    this.qrExpiresAt,
    required this.checkedInCount,
    required this.maxCheckins,
    this.userName,
    this.userPhone,
    required this.canCheckIn,
  });

  factory FacilityBookingModel.fromJson(Map<String, dynamic> json) {
    return FacilityBookingModel(
      id: (json['id'] as num).toInt(),
      facilityName: json['facilityName'] as String? ?? 'Unknown Facility',
      facilityDescription: json['facilityDescription'] as String?,
      facilityLocation: json['facilityLocation'] as String?,
      startTime:
          json['startTime']?.toString() ?? DateTime.now().toIso8601String(),
      endTime: json['endTime']?.toString() ?? DateTime.now().toIso8601String(),
      status: json['status'] as String? ?? 'UNKNOWN',
      purpose: json['purpose'] as String?,
      numberOfPeople: (json['numberOfPeople'] as num?)?.toInt() ?? 1,
      qrCode: json['qrCode'] as String?,
      qrExpiresAt: json['qrExpiresAt']?.toString(),
      checkedInCount: (json['checkedInCount'] as num?)?.toInt() ?? 0,
      maxCheckins: (json['maxCheckins'] as num?)?.toInt() ?? 1,
      userName: json['userName'] as String? ??
          json['user']?['username'] as String? ??
          'Unknown User',
      userPhone: json['userPhone'] as String? ??
          json['user']?['phoneNumber'] as String?,
      canCheckIn: json['canCheckIn'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'facilityName': facilityName,
      'facilityDescription': facilityDescription,
      'facilityLocation': facilityLocation,
      'startTime': startTime,
      'endTime': endTime,
      'status': status,
      'purpose': purpose,
      'numberOfPeople': numberOfPeople,
      'qrCode': qrCode,
      'qrExpiresAt': qrExpiresAt,
      'checkedInCount': checkedInCount,
      'maxCheckins': maxCheckins,
      'userName': userName,
      'userPhone': userPhone,
      'canCheckIn': canCheckIn,
    };
  }
}
