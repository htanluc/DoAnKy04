# Announcements Feature

## Overview
The Announcements feature provides a complete implementation for managing and displaying announcements in the apartment management system.

## Structure
```
lib/features/announcements/
├── data/
│   ├── announcements_api.dart      # API layer for announcements
│   └── announcements_repository.dart # Repository pattern implementation
├── models/
│   └── announcement.dart           # Freezed model with JSON serialization
├── providers/
│   └── announcements_providers.dart # Riverpod state management
└── ui/
    └── announcements_screen.dart   # Main UI screen
```

## Features
- ✅ **List Announcements**: Display all announcements with proper formatting
- ✅ **Filter by Type**: Filter announcements by type (NEWS, REGULAR, URGENT, EVENT)
- ✅ **Search**: Search announcements by title and content
- ✅ **Mark as Read**: Mark individual announcements as read
- ✅ **Mark All as Read**: Mark all announcements as read at once
- ✅ **Pull to Refresh**: Refresh announcements list
- ✅ **Error Handling**: Comprehensive error handling with retry functionality
- ✅ **Loading States**: Proper loading indicators and states

## API Endpoints
- `GET /api/announcements` - Fetch all announcements
- `PUT /api/announcements/{id}/read` - Mark announcement as read
- `PUT /api/announcements/read-all` - Mark multiple announcements as read
- `GET /api/announcements?search={query}` - Search announcements
- `GET /api/announcements?type={type}` - Filter by type

## Usage
```dart
// Access announcements provider
final announcementsState = ref.watch(announcementsProvider);

// Load announcements
ref.read(announcementsProvider.notifier).loadAnnouncements();

// Search announcements
ref.read(announcementsProvider.notifier).searchAnnouncements('query');

// Filter by type
ref.read(announcementsProvider.notifier).filterByType(AnnouncementType.urgent);

// Mark as read
ref.read(announcementsProvider.notifier).markAsRead('announcement_id');

// Mark all as read
ref.read(announcementsProvider.notifier).markAllAsRead();
```

## Dependencies
- `flutter_riverpod` - State management
- `freezed` - Immutable data classes
- `json_annotation` - JSON serialization
- `intl` - Date/time formatting
- `pull_to_refresh` - Pull to refresh functionality
