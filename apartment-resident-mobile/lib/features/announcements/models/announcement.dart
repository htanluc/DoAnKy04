class Announcement {
  final String id;
  final String title;
  final String content;
  final String type;
  final bool read;
  final String createdAt;
  final String createdBy;

  const Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    required this.read,
    required this.createdAt,
    required this.createdBy,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      type: json['type'] ?? 'REGULAR',
      read: json['read'] ?? false,
      createdAt: json['createdAt'] ?? '',
      createdBy: json['createdBy'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'type': type,
      'read': read,
      'createdAt': createdAt,
      'createdBy': createdBy,
    };
  }

  Announcement copyWith({
    String? id,
    String? title,
    String? content,
    String? type,
    bool? read,
    String? createdAt,
    String? createdBy,
  }) {
    return Announcement(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      type: type ?? this.type,
      read: read ?? this.read,
      createdAt: createdAt ?? this.createdAt,
      createdBy: createdBy ?? this.createdBy,
    );
  }
}
