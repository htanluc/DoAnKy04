class EventRegistrationModel {
  final int id;
  final String eventTitle;
  final String? eventDescription;
  final String? eventLocation;
  final String startTime;
  final String endTime;
  final String status;
  final String? qrCode;
  final String? qrExpiresAt;
  final bool checkedIn;
  final String? checkedInAt;
  final String? userName;
  final String? userPhone;
  final bool canCheckIn;

  EventRegistrationModel({
    required this.id,
    required this.eventTitle,
    this.eventDescription,
    this.eventLocation,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.qrCode,
    this.qrExpiresAt,
    required this.checkedIn,
    this.checkedInAt,
    this.userName,
    this.userPhone,
    required this.canCheckIn,
  });

  factory EventRegistrationModel.fromJson(Map<String, dynamic> json) {
    return EventRegistrationModel(
      id: (json['id'] as num).toInt(),
      eventTitle: json['eventTitle'] as String? ?? 'Unknown Event',
      eventDescription: json['eventDescription'] as String?,
      eventLocation: json['eventLocation'] as String?,
      startTime:
          json['startTime']?.toString() ?? DateTime.now().toIso8601String(),
      endTime: json['endTime']?.toString() ?? DateTime.now().toIso8601String(),
      status: json['status'] as String? ?? 'UNKNOWN',
      qrCode: json['qrCode'] as String?,
      qrExpiresAt: json['qrExpiresAt']?.toString(),
      checkedIn: json['checkedIn'] as bool? ?? false,
      checkedInAt: json['checkedInAt']?.toString(),
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
      'eventTitle': eventTitle,
      'eventDescription': eventDescription,
      'eventLocation': eventLocation,
      'startTime': startTime,
      'endTime': endTime,
      'status': status,
      'qrCode': qrCode,
      'qrExpiresAt': qrExpiresAt,
      'checkedIn': checkedIn,
      'checkedInAt': checkedInAt,
      'userName': userName,
      'userPhone': userPhone,
      'canCheckIn': canCheckIn,
    };
  }
}
