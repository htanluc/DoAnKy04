import 'package:freezed_annotation/freezed_annotation.dart';

part 'announcement.freezed.dart';
part 'announcement.g.dart';

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

@JsonEnum()
enum AnnouncementType {
  @JsonValue('NEWS')
  news,
  @JsonValue('REGULAR')
  regular,
  @JsonValue('URGENT')
  urgent,
  @JsonValue('EVENT')
  event;

  String get displayName {
    switch (this) {
      case AnnouncementType.news:
        return 'Tin tức';
      case AnnouncementType.regular:
        return 'Thông báo thường';
      case AnnouncementType.urgent:
        return 'Khẩn cấp';
      case AnnouncementType.event:
        return 'Sự kiện';
    }
  }

  String get icon {
    switch (this) {
      case AnnouncementType.news:
        return '📢';
      case AnnouncementType.regular:
        return 'ℹ️';
      case AnnouncementType.urgent:
        return '⚠️';
      case AnnouncementType.event:
        return '🎉';
    }
  }
}
