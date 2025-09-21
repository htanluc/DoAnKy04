// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'events_providers.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$EventsState {
  List<Event> get events => throw _privateConstructorUsedError;
  List<Event> get filteredEvents => throw _privateConstructorUsedError;
  List<Event> get registeredEvents => throw _privateConstructorUsedError;
  bool get isLoading => throw _privateConstructorUsedError;
  bool get isSearching => throw _privateConstructorUsedError;
  bool get isRegistering => throw _privateConstructorUsedError;
  String? get error => throw _privateConstructorUsedError;
  String? get searchQuery => throw _privateConstructorUsedError;
  EventStatus? get selectedStatus => throw _privateConstructorUsedError;
  Event? get selectedEvent => throw _privateConstructorUsedError;

  /// Create a copy of EventsState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $EventsStateCopyWith<EventsState> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $EventsStateCopyWith<$Res> {
  factory $EventsStateCopyWith(
    EventsState value,
    $Res Function(EventsState) then,
  ) = _$EventsStateCopyWithImpl<$Res, EventsState>;
  @useResult
  $Res call({
    List<Event> events,
    List<Event> filteredEvents,
    List<Event> registeredEvents,
    bool isLoading,
    bool isSearching,
    bool isRegistering,
    String? error,
    String? searchQuery,
    EventStatus? selectedStatus,
    Event? selectedEvent,
  });

  $EventCopyWith<$Res>? get selectedEvent;
}

/// @nodoc
class _$EventsStateCopyWithImpl<$Res, $Val extends EventsState>
    implements $EventsStateCopyWith<$Res> {
  _$EventsStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of EventsState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? events = null,
    Object? filteredEvents = null,
    Object? registeredEvents = null,
    Object? isLoading = null,
    Object? isSearching = null,
    Object? isRegistering = null,
    Object? error = freezed,
    Object? searchQuery = freezed,
    Object? selectedStatus = freezed,
    Object? selectedEvent = freezed,
  }) {
    return _then(
      _value.copyWith(
            events: null == events
                ? _value.events
                : events // ignore: cast_nullable_to_non_nullable
                      as List<Event>,
            filteredEvents: null == filteredEvents
                ? _value.filteredEvents
                : filteredEvents // ignore: cast_nullable_to_non_nullable
                      as List<Event>,
            registeredEvents: null == registeredEvents
                ? _value.registeredEvents
                : registeredEvents // ignore: cast_nullable_to_non_nullable
                      as List<Event>,
            isLoading: null == isLoading
                ? _value.isLoading
                : isLoading // ignore: cast_nullable_to_non_nullable
                      as bool,
            isSearching: null == isSearching
                ? _value.isSearching
                : isSearching // ignore: cast_nullable_to_non_nullable
                      as bool,
            isRegistering: null == isRegistering
                ? _value.isRegistering
                : isRegistering // ignore: cast_nullable_to_non_nullable
                      as bool,
            error: freezed == error
                ? _value.error
                : error // ignore: cast_nullable_to_non_nullable
                      as String?,
            searchQuery: freezed == searchQuery
                ? _value.searchQuery
                : searchQuery // ignore: cast_nullable_to_non_nullable
                      as String?,
            selectedStatus: freezed == selectedStatus
                ? _value.selectedStatus
                : selectedStatus // ignore: cast_nullable_to_non_nullable
                      as EventStatus?,
            selectedEvent: freezed == selectedEvent
                ? _value.selectedEvent
                : selectedEvent // ignore: cast_nullable_to_non_nullable
                      as Event?,
          )
          as $Val,
    );
  }

  /// Create a copy of EventsState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $EventCopyWith<$Res>? get selectedEvent {
    if (_value.selectedEvent == null) {
      return null;
    }

    return $EventCopyWith<$Res>(_value.selectedEvent!, (value) {
      return _then(_value.copyWith(selectedEvent: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$EventsStateImplCopyWith<$Res>
    implements $EventsStateCopyWith<$Res> {
  factory _$$EventsStateImplCopyWith(
    _$EventsStateImpl value,
    $Res Function(_$EventsStateImpl) then,
  ) = __$$EventsStateImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    List<Event> events,
    List<Event> filteredEvents,
    List<Event> registeredEvents,
    bool isLoading,
    bool isSearching,
    bool isRegistering,
    String? error,
    String? searchQuery,
    EventStatus? selectedStatus,
    Event? selectedEvent,
  });

  @override
  $EventCopyWith<$Res>? get selectedEvent;
}

/// @nodoc
class __$$EventsStateImplCopyWithImpl<$Res>
    extends _$EventsStateCopyWithImpl<$Res, _$EventsStateImpl>
    implements _$$EventsStateImplCopyWith<$Res> {
  __$$EventsStateImplCopyWithImpl(
    _$EventsStateImpl _value,
    $Res Function(_$EventsStateImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of EventsState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? events = null,
    Object? filteredEvents = null,
    Object? registeredEvents = null,
    Object? isLoading = null,
    Object? isSearching = null,
    Object? isRegistering = null,
    Object? error = freezed,
    Object? searchQuery = freezed,
    Object? selectedStatus = freezed,
    Object? selectedEvent = freezed,
  }) {
    return _then(
      _$EventsStateImpl(
        events: null == events
            ? _value._events
            : events // ignore: cast_nullable_to_non_nullable
                  as List<Event>,
        filteredEvents: null == filteredEvents
            ? _value._filteredEvents
            : filteredEvents // ignore: cast_nullable_to_non_nullable
                  as List<Event>,
        registeredEvents: null == registeredEvents
            ? _value._registeredEvents
            : registeredEvents // ignore: cast_nullable_to_non_nullable
                  as List<Event>,
        isLoading: null == isLoading
            ? _value.isLoading
            : isLoading // ignore: cast_nullable_to_non_nullable
                  as bool,
        isSearching: null == isSearching
            ? _value.isSearching
            : isSearching // ignore: cast_nullable_to_non_nullable
                  as bool,
        isRegistering: null == isRegistering
            ? _value.isRegistering
            : isRegistering // ignore: cast_nullable_to_non_nullable
                  as bool,
        error: freezed == error
            ? _value.error
            : error // ignore: cast_nullable_to_non_nullable
                  as String?,
        searchQuery: freezed == searchQuery
            ? _value.searchQuery
            : searchQuery // ignore: cast_nullable_to_non_nullable
                  as String?,
        selectedStatus: freezed == selectedStatus
            ? _value.selectedStatus
            : selectedStatus // ignore: cast_nullable_to_non_nullable
                  as EventStatus?,
        selectedEvent: freezed == selectedEvent
            ? _value.selectedEvent
            : selectedEvent // ignore: cast_nullable_to_non_nullable
                  as Event?,
      ),
    );
  }
}

/// @nodoc

class _$EventsStateImpl implements _EventsState {
  const _$EventsStateImpl({
    final List<Event> events = const [],
    final List<Event> filteredEvents = const [],
    final List<Event> registeredEvents = const [],
    this.isLoading = false,
    this.isSearching = false,
    this.isRegistering = false,
    this.error,
    this.searchQuery,
    this.selectedStatus,
    this.selectedEvent,
  }) : _events = events,
       _filteredEvents = filteredEvents,
       _registeredEvents = registeredEvents;

  final List<Event> _events;
  @override
  @JsonKey()
  List<Event> get events {
    if (_events is EqualUnmodifiableListView) return _events;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_events);
  }

  final List<Event> _filteredEvents;
  @override
  @JsonKey()
  List<Event> get filteredEvents {
    if (_filteredEvents is EqualUnmodifiableListView) return _filteredEvents;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_filteredEvents);
  }

  final List<Event> _registeredEvents;
  @override
  @JsonKey()
  List<Event> get registeredEvents {
    if (_registeredEvents is EqualUnmodifiableListView)
      return _registeredEvents;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_registeredEvents);
  }

  @override
  @JsonKey()
  final bool isLoading;
  @override
  @JsonKey()
  final bool isSearching;
  @override
  @JsonKey()
  final bool isRegistering;
  @override
  final String? error;
  @override
  final String? searchQuery;
  @override
  final EventStatus? selectedStatus;
  @override
  final Event? selectedEvent;

  @override
  String toString() {
    return 'EventsState(events: $events, filteredEvents: $filteredEvents, registeredEvents: $registeredEvents, isLoading: $isLoading, isSearching: $isSearching, isRegistering: $isRegistering, error: $error, searchQuery: $searchQuery, selectedStatus: $selectedStatus, selectedEvent: $selectedEvent)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$EventsStateImpl &&
            const DeepCollectionEquality().equals(other._events, _events) &&
            const DeepCollectionEquality().equals(
              other._filteredEvents,
              _filteredEvents,
            ) &&
            const DeepCollectionEquality().equals(
              other._registeredEvents,
              _registeredEvents,
            ) &&
            (identical(other.isLoading, isLoading) ||
                other.isLoading == isLoading) &&
            (identical(other.isSearching, isSearching) ||
                other.isSearching == isSearching) &&
            (identical(other.isRegistering, isRegistering) ||
                other.isRegistering == isRegistering) &&
            (identical(other.error, error) || other.error == error) &&
            (identical(other.searchQuery, searchQuery) ||
                other.searchQuery == searchQuery) &&
            (identical(other.selectedStatus, selectedStatus) ||
                other.selectedStatus == selectedStatus) &&
            (identical(other.selectedEvent, selectedEvent) ||
                other.selectedEvent == selectedEvent));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_events),
    const DeepCollectionEquality().hash(_filteredEvents),
    const DeepCollectionEquality().hash(_registeredEvents),
    isLoading,
    isSearching,
    isRegistering,
    error,
    searchQuery,
    selectedStatus,
    selectedEvent,
  );

  /// Create a copy of EventsState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$EventsStateImplCopyWith<_$EventsStateImpl> get copyWith =>
      __$$EventsStateImplCopyWithImpl<_$EventsStateImpl>(this, _$identity);
}

abstract class _EventsState implements EventsState {
  const factory _EventsState({
    final List<Event> events,
    final List<Event> filteredEvents,
    final List<Event> registeredEvents,
    final bool isLoading,
    final bool isSearching,
    final bool isRegistering,
    final String? error,
    final String? searchQuery,
    final EventStatus? selectedStatus,
    final Event? selectedEvent,
  }) = _$EventsStateImpl;

  @override
  List<Event> get events;
  @override
  List<Event> get filteredEvents;
  @override
  List<Event> get registeredEvents;
  @override
  bool get isLoading;
  @override
  bool get isSearching;
  @override
  bool get isRegistering;
  @override
  String? get error;
  @override
  String? get searchQuery;
  @override
  EventStatus? get selectedStatus;
  @override
  Event? get selectedEvent;

  /// Create a copy of EventsState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$EventsStateImplCopyWith<_$EventsStateImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
