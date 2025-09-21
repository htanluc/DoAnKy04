import '../models/event.dart';
import 'events_api.dart';

class EventsRepository {
  final EventsApi _api;

  EventsRepository(this._api);

  /// Get all events with caching
  Future<List<Event>> getEvents({bool forceRefresh = false}) async {
    return await _api.getEvents();
  }

  /// Register for an event
  Future<void> registerEvent(String eventId) async {
    await _api.registerEvent(eventId);
  }

  /// Cancel event registration
  Future<void> cancelRegistration(String eventId) async {
    await _api.cancelRegistration(eventId);
  }

  /// Get event details by ID
  Future<Event> getEventById(String eventId) async {
    return await _api.getEventById(eventId);
  }

  /// Search events
  Future<List<Event>> searchEvents(String query) async {
    if (query.trim().isEmpty) {
      return await getEvents();
    }
    return await _api.searchEvents(query);
  }

  /// Filter events by status
  Future<List<Event>> filterByStatus(EventStatus status) async {
    return await _api.filterByStatus(status);
  }

  /// Get user's registered events
  Future<List<Event>> getRegisteredEvents() async {
    return await _api.getRegisteredEvents();
  }

  /// Generate QR code for event registration
  Future<String> generateQrCode(String eventId) async {
    return await _api.generateQrCode(eventId);
  }

  /// Check-in to event using QR code
  Future<Map<String, dynamic>> checkInWithQrCode(String qrCode) async {
    return await _api.checkInWithQrCode(qrCode);
  }

  /// Manual check-in by event ID (for staff)
  Future<Map<String, dynamic>> manualCheckIn(String eventId) async {
    return await _api.manualCheckIn(eventId);
  }

  /// Get check-in status for an event
  Future<Map<String, dynamic>> getCheckInStatus(String eventId) async {
    return await _api.getCheckInStatus(eventId);
  }

  /// Get events statistics
  Future<EventsStats> getEventsStats() async {
    final events = await getEvents();
    final registeredEvents = await getRegisteredEvents();

    return EventsStats(
      totalEvents: events.length,
      registeredCount: registeredEvents.length,
      upcomingCount: events.where((e) => e.isUpcoming).length,
      ongoingCount: events.where((e) => e.isOngoing).length,
      completedCount: events.where((e) => e.isCompleted).length,
    );
  }

  /// Get events by status with count
  Future<Map<EventStatus, int>> getEventsByStatus() async {
    final events = await getEvents();
    final Map<EventStatus, int> counts = {};

    for (final status in EventStatus.values) {
      counts[status] = events.where((e) => e.status == status).length;
    }

    return counts;
  }
}

class EventsStats {
  final int totalEvents;
  final int registeredCount;
  final int upcomingCount;
  final int ongoingCount;
  final int completedCount;

  EventsStats({
    required this.totalEvents,
    required this.registeredCount,
    required this.upcomingCount,
    required this.ongoingCount,
    required this.completedCount,
  });
}
