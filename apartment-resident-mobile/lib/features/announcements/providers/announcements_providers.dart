import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../data/announcements_api.dart';
import '../data/announcements_repository.dart';
import '../models/announcement.dart';

part 'announcements_providers.freezed.dart';

// API Provider
final announcementsApiProvider = Provider<AnnouncementsApi>((ref) {
  return AnnouncementsApi();
});

// Repository Provider
final announcementsRepositoryProvider = Provider<AnnouncementsRepository>((
  ref,
) {
  final api = ref.watch(announcementsApiProvider);
  return AnnouncementsRepository(api);
});

// Announcements State
@freezed
class AnnouncementsState with _$AnnouncementsState {
  const factory AnnouncementsState({
    @Default([]) List<Announcement> announcements,
    @Default([]) List<Announcement> filteredAnnouncements,
    @Default(false) bool isLoading,
    @Default(false) bool isSearching,
    String? error,
    String? searchQuery,
    AnnouncementType? selectedType,
    @Default(false) bool isMarkingAsRead,
  }) = _AnnouncementsState;
}

// Notifier
class AnnouncementsNotifier extends StateNotifier<AnnouncementsState> {
  final AnnouncementsRepository _repository;

  AnnouncementsNotifier(this._repository) : super(const AnnouncementsState()) {
    loadAnnouncements();
  }

  /// Load all announcements
  Future<void> loadAnnouncements({bool forceRefresh = false}) async {
    if (state.isLoading && !forceRefresh) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final announcements = await _repository.getAnnouncements(
        forceRefresh: forceRefresh,
      );
      state = state.copyWith(
        announcements: announcements,
        filteredAnnouncements: announcements,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Search announcements
  Future<void> searchAnnouncements(String query) async {
    if (query.trim().isEmpty) {
      state = state.copyWith(
        searchQuery: null,
        filteredAnnouncements: state.announcements,
      );
      return;
    }

    state = state.copyWith(isSearching: true, searchQuery: query);

    try {
      final results = await _repository.searchAnnouncements(query);
      state = state.copyWith(
        filteredAnnouncements: results,
        isSearching: false,
      );
    } catch (e) {
      state = state.copyWith(isSearching: false, error: e.toString());
    }
  }

  /// Filter announcements by type
  Future<void> filterByType(AnnouncementType? type) async {
    if (type == null) {
      state = state.copyWith(
        selectedType: null,
        filteredAnnouncements: state.announcements,
      );
      return;
    }

    state = state.copyWith(isLoading: true, selectedType: type);

    try {
      final filtered = await _repository.filterByType(type);
      state = state.copyWith(filteredAnnouncements: filtered, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Mark announcement as read
  Future<void> markAsRead(String announcementId) async {
    state = state.copyWith(isMarkingAsRead: true);

    try {
      await _repository.markAsRead(announcementId);

      // Update local state
      final updatedAnnouncements = state.announcements.map((announcement) {
        if (announcement.id == announcementId) {
          return announcement.copyWith(read: true);
        }
        return announcement;
      }).toList();

      final updatedFiltered = state.filteredAnnouncements.map((announcement) {
        if (announcement.id == announcementId) {
          return announcement.copyWith(read: true);
        }
        return announcement;
      }).toList();

      state = state.copyWith(
        announcements: updatedAnnouncements,
        filteredAnnouncements: updatedFiltered,
        isMarkingAsRead: false,
      );
    } catch (e) {
      state = state.copyWith(isMarkingAsRead: false, error: e.toString());
    }
  }

  /// Mark all unread announcements as read
  Future<void> markAllAsRead() async {
    final unreadIds = state.announcements
        .where((a) => !a.read)
        .map((a) => a.id)
        .toList();

    if (unreadIds.isEmpty) return;

    state = state.copyWith(isMarkingAsRead: true);

    try {
      await _repository.markAllAsRead(unreadIds);

      // Update local state
      final updatedAnnouncements = state.announcements.map((announcement) {
        return announcement.copyWith(read: true);
      }).toList();

      final updatedFiltered = state.filteredAnnouncements.map((announcement) {
        return announcement.copyWith(read: true);
      }).toList();

      state = state.copyWith(
        announcements: updatedAnnouncements,
        filteredAnnouncements: updatedFiltered,
        isMarkingAsRead: false,
      );
    } catch (e) {
      state = state.copyWith(isMarkingAsRead: false, error: e.toString());
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  /// Get unread count
  int get unreadCount => state.announcements.where((a) => !a.read).length;

  /// Get announcements by type
  Map<AnnouncementType, int> get announcementsByType {
    final Map<AnnouncementType, int> counts = {};
    for (final type in AnnouncementType.values) {
      counts[type] = state.announcements.where((a) => a.type == type).length;
    }
    return counts;
  }
}

// State Notifier Provider
final announcementsProvider =
    StateNotifierProvider<AnnouncementsNotifier, AnnouncementsState>((ref) {
      final repository = ref.watch(announcementsRepositoryProvider);
      return AnnouncementsNotifier(repository);
    });

// Computed providers
final unreadCountProvider = Provider<int>((ref) {
  return ref.watch(
    announcementsProvider.select(
      (state) => state.announcements.where((a) => !a.read).length,
    ),
  );
});

final announcementsByTypeProvider = Provider<Map<AnnouncementType, int>>((ref) {
  final announcements = ref.watch(
    announcementsProvider.select((state) => state.announcements),
  );
  final Map<AnnouncementType, int> counts = {};
  for (final type in AnnouncementType.values) {
    counts[type] = announcements.where((a) => a.type == type).length;
  }
  return counts;
});
