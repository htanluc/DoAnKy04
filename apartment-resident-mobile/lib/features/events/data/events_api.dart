import 'dart:convert';
import 'package:apartment_resident_mobile/core/api/api_helper.dart';
import '../models/event.dart';

class EventsApi {
  /// Fetch all events
  Future<List<Event>> getEvents() async {
    try {
      print('[EventsApi] Fetching events from /api/events');
      final response = await ApiHelper.get('/api/events');
      print('[EventsApi] Response status: ${response.statusCode}');
      print('[EventsApi] Response body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        print('[EventsApi] Parsed data length: ${data.length}');

        final List<Event> events = [];
        for (int i = 0; i < data.length; i++) {
          try {
            print('[EventsApi] Parsing event $i: ${data[i]}');
            final event = Event.fromJson(data[i]);
            events.add(event);
            print('[EventsApi] Successfully parsed event $i: ${event.title}');
          } catch (e) {
            print('[EventsApi] Error parsing event $i: $e');
            print('[EventsApi] Event data: ${data[i]}');
            rethrow;
          }
        }

        return events;
      } else {
        throw Exception(
          'Failed to fetch events: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      print('[EventsApi] Error in getEvents: $e');
      throw Exception('Failed to fetch events: $e');
    }
  }

  /// Register for an event
  Future<void> registerEvent(String eventId) async {
    try {
      print('[EventsApi] Registering for event: $eventId');
      final response = await ApiHelper.post(
        '/api/event-registrations/register',
        data: {
          'eventId': int.parse(eventId),
        }, // Send as object, not JSON string
      );
      print('[EventsApi] Registration response status: ${response.statusCode}');
      print('[EventsApi] Registration response body: ${response.body}');

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception(
          'Failed to register for event: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      print('[EventsApi] Registration error: $e');
      throw Exception('Failed to register for event: $e');
    }
  }

  /// Cancel event registration
  Future<void> cancelRegistration(String eventId) async {
    try {
      final response = await ApiHelper.delete(
        '/api/event-registrations/cancel/$eventId',
      );
      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception(
          'Failed to cancel event registration: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Failed to cancel event registration: $e');
    }
  }

  /// Get event details by ID
  Future<Event> getEventById(String eventId) async {
    try {
      final response = await ApiHelper.get('/api/events/$eventId');
      if (response.statusCode == 200) {
        return Event.fromJson(jsonDecode(response.body));
      } else {
        throw Exception(
          'Failed to fetch event details: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Failed to fetch event details: $e');
    }
  }

  /// Search events by title or description
  Future<List<Event>> searchEvents(String query) async {
    try {
      final response = await ApiHelper.get(
        '/api/events',
        query: {'search': query},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Event.fromJson(json)).toList();
      } else {
        throw Exception('Failed to search events: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to search events: $e');
    }
  }

  /// Filter events by status
  Future<List<Event>> filterByStatus(EventStatus status) async {
    try {
      final response = await ApiHelper.get(
        '/api/events',
        query: {'status': status.name},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Event.fromJson(json)).toList();
      } else {
        throw Exception('Failed to filter events: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to filter events: $e');
    }
  }

  /// Get user's registered events
  Future<List<Event>> getRegisteredEvents() async {
    try {
      final response = await ApiHelper.get('/api/event-registrations/my');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Event.fromJson(json)).toList();
      } else {
        throw Exception(
          'Failed to fetch registered events: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Failed to fetch registered events: $e');
    }
  }

  /// Generate QR code for event registration
  Future<String> generateQrCode(String eventId) async {
    try {
      final response = await ApiHelper.post(
        '/api/event-registrations/$eventId/qr-code',
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['qrCode'] as String;
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(
          'Failed to generate QR code: ${errorData['error'] ?? response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Failed to generate QR code: $e');
    }
  }

  /// Check-in to event using QR code
  Future<Map<String, dynamic>> checkInWithQrCode(String qrCode) async {
    try {
      print('[EventsApi] Check-in with QR code: $qrCode');
      final response = await ApiHelper.post(
        '/api/event-registrations/check-in',
        data: {'qrCode': qrCode}, // Send as object, not JSON string
      );
      print('[EventsApi] Check-in response status: ${response.statusCode}');
      print('[EventsApi] Check-in response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception(
          'Failed to check-in: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      print('[EventsApi] Check-in error: $e');
      throw Exception('Failed to check-in: $e');
    }
  }

  /// Manual check-in by event ID (for staff)
  Future<Map<String, dynamic>> manualCheckIn(String eventId) async {
    try {
      final response = await ApiHelper.post(
        '/api/event-registrations/$eventId/check-in',
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to check-in: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to check-in: $e');
    }
  }

  /// Get check-in status for an event
  Future<Map<String, dynamic>> getCheckInStatus(String eventId) async {
    try {
      final response = await ApiHelper.get(
        '/api/event-registrations/$eventId/check-in-status',
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception(
          'Failed to get check-in status: ${response.statusCode}',
        );
      }
    } catch (e) {
      throw Exception('Failed to get check-in status: $e');
    }
  }
}
