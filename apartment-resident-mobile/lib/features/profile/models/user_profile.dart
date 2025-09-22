class EmergencyContact {
  final String name;
  final String phone;
  final String relationship;

  const EmergencyContact({
    required this.name,
    required this.phone,
    required this.relationship,
  });

  factory EmergencyContact.fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      relationship: json['relationship'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {'name': name, 'phone': phone, 'relationship': relationship};
  }
}

class UserProfile {
  final String fullName;
  final String phoneNumber;
  final String email;
  final String dateOfBirth;
  final String idCardNumber;
  final String role;
  final String? avatarUrl;
  final String apartmentNumber;
  final String buildingName;
  final int floor;
  final double area;
  final int bedrooms;
  final List<EmergencyContact> emergencyContacts;

  const UserProfile({
    required this.fullName,
    required this.phoneNumber,
    required this.email,
    required this.dateOfBirth,
    required this.idCardNumber,
    required this.role,
    this.avatarUrl,
    required this.apartmentNumber,
    required this.buildingName,
    required this.floor,
    required this.area,
    required this.bedrooms,
    required this.emergencyContacts,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      fullName: json['fullName'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      email: json['email'] ?? '',
      dateOfBirth: json['dateOfBirth'] ?? '',
      idCardNumber: json['idCardNumber'] ?? '',
      role: json['role'] ?? 'Cư dân',
      avatarUrl: json['avatarUrl'],
      apartmentNumber: json['apartmentNumber'] ?? '',
      buildingName: json['buildingName'] ?? '',
      floor: json['floor'] ?? 0,
      area: (json['area'] ?? 0).toDouble(),
      bedrooms: json['bedrooms'] ?? 0,
      emergencyContacts:
          (json['emergencyContacts'] as List<dynamic>?)
              ?.map((e) => EmergencyContact.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'phoneNumber': phoneNumber,
      'email': email,
      'dateOfBirth': dateOfBirth,
      'idCardNumber': idCardNumber,
      'role': role,
      'avatarUrl': avatarUrl,
      'apartmentNumber': apartmentNumber,
      'buildingName': buildingName,
      'floor': floor,
      'area': area,
      'bedrooms': bedrooms,
      'emergencyContacts': emergencyContacts.map((e) => e.toJson()).toList(),
    };
  }
}
