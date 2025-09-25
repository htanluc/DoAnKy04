import 'package:freezed_annotation/freezed_annotation.dart';

part 'announcement.freezed.dart';
part 'announcement.g.dart';

enum AnnouncementType { news, regular, urgent, event }

@freezed
class Announcement with _$Announcement {
  const factory Announcement({
    required String id,
    required String title,
    required String content,
    required AnnouncementType type,
    required bool read,
    required DateTime createdAt,
    required String createdBy,
  }) = _Announcement;

  factory Announcement.fromJson(Map<String, dynamic> json) =>
      _$AnnouncementFromJson(json);
}
