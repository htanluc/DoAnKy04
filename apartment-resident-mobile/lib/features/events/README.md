# Events Feature

## Overview
The Events feature provides a complete implementation for managing and displaying events in the apartment management system.

## Structure
```
lib/features/events/
├── data/
│   ├── events_api.dart              # API layer for events
│   └── events_repository.dart       # Repository pattern implementation
├── models/
│   └── event.dart                   # Freezed model with JSON serialization
├── providers/
│   └── events_providers.dart        # Riverpod state management
└── ui/
    ├── events_screen.dart           # Main events list screen
    ├── event_detail_screen.dart     # Event detail screen
    └── widgets/
        └── event_status_badge.dart  # Status badge widgets
```

## Features
- ✅ **List Events**: Display all events with proper formatting
- ✅ **Filter by Status**: Filter events by status (UPCOMING, ONGOING, COMPLETED)
- ✅ **Search**: Search events by title and description
- ✅ **Event Registration**: Register for events
- ✅ **Cancel Registration**: Cancel event registration
- ✅ **Event Details**: Detailed event view with all information
- ✅ **Participant Count**: Display number of participants
- ✅ **Status Tracking**: Real-time status updates based on time
- ✅ **Pull to Refresh**: Refresh events list
- ✅ **Error Handling**: Comprehensive error handling with retry functionality
- ✅ **Loading States**: Proper loading indicators and states
- ✅ **Internationalization**: Date/time formatting with Vietnamese locale

## API Endpoints
- `GET /api/events` - Fetch all events
- `POST /api/event-registrations/register` - Register for an event
- `DELETE /api/event-registrations/cancel/{eventId}` - Cancel event registration
- `GET /api/events/{eventId}` - Get event details
- `GET /api/events?search={query}` - Search events
- `GET /api/events?status={status}` - Filter by status
- `GET /api/event-registrations/my` - Get user's registered events

## Usage
```dart
// Access events provider
final eventsState = ref.watch(eventsProvider);

// Load events
ref.read(eventsProvider.notifier).loadEvents();

// Search events
ref.read(eventsProvider.notifier).searchEvents('query');

// Filter by status
ref.read(eventsProvider.notifier).filterByStatus(EventStatus.upcoming);

// Register for event
ref.read(eventsProvider.notifier).registerEvent('event_id');

// Cancel registration
ref.read(eventsProvider.notifier).cancelRegistration('event_id');

// Get event statistics
final stats = ref.watch(eventsStatsProvider);
```

## Event Status Logic
Events automatically determine their status based on current time:
- **UPCOMING**: Current time is before event start time
- **ONGOING**: Current time is between start and end time
- **COMPLETED**: Current time is after event end time

## Dependencies
- `flutter_riverpod` - State management
- `freezed` - Immutable data classes
- `json_annotation` - JSON serialization
- `intl` - Date/time formatting
- `pull_to_refresh` - Pull to refresh functionality
