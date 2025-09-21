import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../data/events_api.dart';
import '../data/events_repository.dart';
import '../models/event.dart';

part 'events_providers.freezed.dart';

// API Provider
final eventsApiProvider = Provider<EventsApi>((ref) {
  return EventsApi();
});

// Repository Provider
final eventsRepositoryProvider = Provider<EventsRepository>((ref) {
  final api = ref.watch(eventsApiProvider);
  return EventsRepository(api);
});

// Events State
@freezed
class EventsState with _$EventsState {
  const factory EventsState({
    @Default([]) List<Event> events,
    @Default([]) List<Event> filteredEvents,
    @Default([]) List<Event> registeredEvents,
    @Default(false) bool isLoading,
    @Default(false) bool isSearching,
    @Default(false) bool isRegistering,
    String? error,
    String? searchQuery,
    EventStatus? selectedStatus,
    Event? selectedEvent,
  }) = _EventsState;
}

// Notifier
class EventsNotifier extends StateNotifier<EventsState> {
  final EventsRepository _repository;

  EventsNotifier(this._repository) : super(const EventsState()) {
    loadEvents();
  }

  /// Load all events
  Future<void> loadEvents({bool forceRefresh = false}) async {
    if (state.isLoading && !forceRefresh) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final events = await _repository.getEvents(forceRefresh: forceRefresh);
      final registeredEvents = await _repository.getRegisteredEvents();

      // Generate QR codes for registered events that don't have them
      final updatedEvents = await _ensureQrCodesForRegisteredEvents(events);
      final updatedRegisteredEvents = await _ensureQrCodesForRegisteredEvents(
        registeredEvents,
      );

      state = state.copyWith(
        events: updatedEvents,
        filteredEvents: updatedEvents,
        registeredEvents: updatedRegisteredEvents,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Ensure QR codes are generated for registered events that don't have them
  Future<List<Event>> _ensureQrCodesForRegisteredEvents(
    List<Event> events,
  ) async {
    final List<Event> updatedEvents = [];

    for (final event in events) {
      if (event.registered &&
          (event.qrCode == null || event.qrCodeExpiresAt == null)) {
        try {
          // Generate QR code for registered event
          final qrCode = await _repository.generateQrCode(event.id);
          final qrCodeExpiresAt = DateTime.now().add(const Duration(hours: 24));

          updatedEvents.add(
            event.copyWith(qrCode: qrCode, qrCodeExpiresAt: qrCodeExpiresAt),
          );
        } catch (e) {
          // If QR code generation fails, keep the original event
          updatedEvents.add(event);
        }
      } else {
        updatedEvents.add(event);
      }
    }

    return updatedEvents;
  }

  /// Search events
  Future<void> searchEvents(String query) async {
    if (query.trim().isEmpty) {
      state = state.copyWith(searchQuery: null, filteredEvents: state.events);
      return;
    }

    state = state.copyWith(isSearching: true, searchQuery: query);

    try {
      final results = await _repository.searchEvents(query);
      state = state.copyWith(filteredEvents: results, isSearching: false);
    } catch (e) {
      state = state.copyWith(isSearching: false, error: e.toString());
    }
  }

  /// Filter events by status
  Future<void> filterByStatus(EventStatus? status) async {
    if (status == null) {
      state = state.copyWith(
        selectedStatus: null,
        filteredEvents: state.events,
      );
      return;
    }

    state = state.copyWith(isLoading: true, selectedStatus: status);

    try {
      final filtered = await _repository.filterByStatus(status);
      state = state.copyWith(filteredEvents: filtered, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Register for an event
  Future<void> registerEvent(String eventId) async {
    if (state.isRegistering) return;

    // Check if event can still be registered
    final event = state.events.firstWhere((e) => e.id == eventId);
    if (!event.canStillRegister) {
      state = state.copyWith(
        error:
            'Không thể đăng ký sự kiện này. Sự kiện đã kết thúc hoặc đã bắt đầu.',
      );
      return;
    }

    state = state.copyWith(isRegistering: true, error: null);

    try {
      await _repository.registerEvent(eventId);

      // Refresh events to get updated data from backend
      await loadEvents(forceRefresh: true);

      state = state.copyWith(isRegistering: false);
    } catch (e) {
      state = state.copyWith(isRegistering: false, error: e.toString());
    }
  }

  /// Cancel event registration
  Future<void> cancelRegistration(String eventId) async {
    state = state.copyWith(isRegistering: true);

    try {
      await _repository.cancelRegistration(eventId);

      // Update local state
      final updatedEvents = state.events.map((event) {
        if (event.id == eventId) {
          return event.copyWith(
            registered: false,
            participantCount: event.participantCount - 1,
          );
        }
        return event;
      }).toList();

      final updatedFiltered = state.filteredEvents.map((event) {
        if (event.id == eventId) {
          return event.copyWith(
            registered: false,
            participantCount: event.participantCount - 1,
          );
        }
        return event;
      }).toList();

      final updatedRegisteredEvents = state.registeredEvents
          .where((e) => e.id != eventId)
          .toList();

      state = state.copyWith(
        events: updatedEvents,
        filteredEvents: updatedFiltered,
        registeredEvents: updatedRegisteredEvents,
        isRegistering: false,
      );
    } catch (e) {
      state = state.copyWith(isRegistering: false, error: e.toString());
    }
  }

  /// Check-in to event using QR code
  Future<void> checkInWithQrCode(String qrCode) async {
    state = state.copyWith(isRegistering: true, error: null);

    try {
      final result = await _repository.checkInWithQrCode(qrCode);

      // Update local state with check-in information
      final eventId = result['eventId'] as String;
      final checkedInAt = DateTime.parse(result['checkedInAt'] as String);

      final updatedEvents = state.events.map((event) {
        if (event.id == eventId) {
          return event.copyWith(checkedIn: true, checkedInAt: checkedInAt);
        }
        return event;
      }).toList();

      final updatedFiltered = state.filteredEvents.map((event) {
        if (event.id == eventId) {
          return event.copyWith(checkedIn: true, checkedInAt: checkedInAt);
        }
        return event;
      }).toList();

      final updatedRegisteredEvents = state.registeredEvents.map((event) {
        if (event.id == eventId) {
          return event.copyWith(checkedIn: true, checkedInAt: checkedInAt);
        }
        return event;
      }).toList();

      state = state.copyWith(
        events: updatedEvents,
        filteredEvents: updatedFiltered,
        registeredEvents: updatedRegisteredEvents,
        isRegistering: false,
      );
    } catch (e) {
      state = state.copyWith(isRegistering: false, error: e.toString());
    }
  }

  /// Manual check-in by event ID
  Future<void> manualCheckIn(String eventId) async {
    state = state.copyWith(isRegistering: true, error: null);

    try {
      final result = await _repository.manualCheckIn(eventId);
      final checkedInAt = DateTime.parse(result['checkedInAt'] as String);

      // Update local state
      final updatedEvents = state.events.map((event) {
        if (event.id == eventId) {
          return event.copyWith(checkedIn: true, checkedInAt: checkedInAt);
        }
        return event;
      }).toList();

      final updatedFiltered = state.filteredEvents.map((event) {
        if (event.id == eventId) {
          return event.copyWith(checkedIn: true, checkedInAt: checkedInAt);
        }
        return event;
      }).toList();

      final updatedRegisteredEvents = state.registeredEvents.map((event) {
        if (event.id == eventId) {
          return event.copyWith(checkedIn: true, checkedInAt: checkedInAt);
        }
        return event;
      }).toList();

      state = state.copyWith(
        events: updatedEvents,
        filteredEvents: updatedFiltered,
        registeredEvents: updatedRegisteredEvents,
        isRegistering: false,
      );
    } catch (e) {
      state = state.copyWith(isRegistering: false, error: e.toString());
    }
  }

  /// Generate new QR code for an event
  Future<void> regenerateQrCode(String eventId) async {
    state = state.copyWith(isRegistering: true, error: null);

    try {
      final qrCode = await _repository.generateQrCode(eventId);
      final qrCodeExpiresAt = DateTime.now().add(const Duration(hours: 24));

      // Update local state
      final updatedEvents = state.events.map((event) {
        if (event.id == eventId) {
          return event.copyWith(
            qrCode: qrCode,
            qrCodeExpiresAt: qrCodeExpiresAt,
          );
        }
        return event;
      }).toList();

      final updatedFiltered = state.filteredEvents.map((event) {
        if (event.id == eventId) {
          return event.copyWith(
            qrCode: qrCode,
            qrCodeExpiresAt: qrCodeExpiresAt,
          );
        }
        return event;
      }).toList();

      final updatedRegisteredEvents = state.registeredEvents.map((event) {
        if (event.id == eventId) {
          return event.copyWith(
            qrCode: qrCode,
            qrCodeExpiresAt: qrCodeExpiresAt,
          );
        }
        return event;
      }).toList();

      state = state.copyWith(
        events: updatedEvents,
        filteredEvents: updatedFiltered,
        registeredEvents: updatedRegisteredEvents,
        isRegistering: false,
      );
    } catch (e) {
      state = state.copyWith(isRegistering: false, error: e.toString());
    }
  }

  /// Select event for detail view
  void selectEvent(Event event) {
    state = state.copyWith(selectedEvent: event);
  }

  /// Clear selected event
  void clearSelectedEvent() {
    state = state.copyWith(selectedEvent: null);
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  /// Get events statistics
  EventsStats get eventsStats {
    final events = state.events;
    return EventsStats(
      totalEvents: events.length,
      registeredCount: state.registeredEvents.length,
      upcomingCount: events.where((e) => e.isUpcoming).length,
      ongoingCount: events.where((e) => e.isOngoing).length,
      completedCount: events.where((e) => e.isCompleted).length,
    );
  }

  /// Get events by status
  Map<EventStatus, int> get eventsByStatus {
    final Map<EventStatus, int> counts = {};
    for (final status in EventStatus.values) {
      counts[status] = state.events.where((e) => e.status == status).length;
    }
    return counts;
  }
}

// State Notifier Provider
final eventsProvider = StateNotifierProvider<EventsNotifier, EventsState>((
  ref,
) {
  final repository = ref.watch(eventsRepositoryProvider);
  return EventsNotifier(repository);
});

// Computed providers
final eventsStatsProvider = Provider<EventsStats>((ref) {
  final state = ref.watch(eventsProvider);
  final events = state.events;
  return EventsStats(
    totalEvents: events.length,
    registeredCount: state.registeredEvents.length,
    upcomingCount: events.where((e) => e.isUpcoming).length,
    ongoingCount: events.where((e) => e.isOngoing).length,
    completedCount: events.where((e) => e.isCompleted).length,
  );
});

final eventsByStatusProvider = Provider<Map<EventStatus, int>>((ref) {
  final events = ref.watch(eventsProvider.select((state) => state.events));
  final Map<EventStatus, int> counts = {};
  for (final status in EventStatus.values) {
    counts[status] = events.where((e) => e.status == status).length;
  }
  return counts;
});

final registeredEventsProvider = Provider<List<Event>>((ref) {
  return ref.watch(eventsProvider.select((state) => state.registeredEvents));
});
