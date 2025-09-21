// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'announcements_providers.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$AnnouncementsState {
  List<Announcement> get announcements => throw _privateConstructorUsedError;
  List<Announcement> get filteredAnnouncements =>
      throw _privateConstructorUsedError;
  bool get isLoading => throw _privateConstructorUsedError;
  bool get isSearching => throw _privateConstructorUsedError;
  String? get error => throw _privateConstructorUsedError;
  String? get searchQuery => throw _privateConstructorUsedError;
  AnnouncementType? get selectedType => throw _privateConstructorUsedError;
  bool get isMarkingAsRead => throw _privateConstructorUsedError;

  /// Create a copy of AnnouncementsState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AnnouncementsStateCopyWith<AnnouncementsState> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AnnouncementsStateCopyWith<$Res> {
  factory $AnnouncementsStateCopyWith(
    AnnouncementsState value,
    $Res Function(AnnouncementsState) then,
  ) = _$AnnouncementsStateCopyWithImpl<$Res, AnnouncementsState>;
  @useResult
  $Res call({
    List<Announcement> announcements,
    List<Announcement> filteredAnnouncements,
    bool isLoading,
    bool isSearching,
    String? error,
    String? searchQuery,
    AnnouncementType? selectedType,
    bool isMarkingAsRead,
  });
}

/// @nodoc
class _$AnnouncementsStateCopyWithImpl<$Res, $Val extends AnnouncementsState>
    implements $AnnouncementsStateCopyWith<$Res> {
  _$AnnouncementsStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AnnouncementsState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? announcements = null,
    Object? filteredAnnouncements = null,
    Object? isLoading = null,
    Object? isSearching = null,
    Object? error = freezed,
    Object? searchQuery = freezed,
    Object? selectedType = freezed,
    Object? isMarkingAsRead = null,
  }) {
    return _then(
      _value.copyWith(
            announcements: null == announcements
                ? _value.announcements
                : announcements // ignore: cast_nullable_to_non_nullable
                      as List<Announcement>,
            filteredAnnouncements: null == filteredAnnouncements
                ? _value.filteredAnnouncements
                : filteredAnnouncements // ignore: cast_nullable_to_non_nullable
                      as List<Announcement>,
            isLoading: null == isLoading
                ? _value.isLoading
                : isLoading // ignore: cast_nullable_to_non_nullable
                      as bool,
            isSearching: null == isSearching
                ? _value.isSearching
                : isSearching // ignore: cast_nullable_to_non_nullable
                      as bool,
            error: freezed == error
                ? _value.error
                : error // ignore: cast_nullable_to_non_nullable
                      as String?,
            searchQuery: freezed == searchQuery
                ? _value.searchQuery
                : searchQuery // ignore: cast_nullable_to_non_nullable
                      as String?,
            selectedType: freezed == selectedType
                ? _value.selectedType
                : selectedType // ignore: cast_nullable_to_non_nullable
                      as AnnouncementType?,
            isMarkingAsRead: null == isMarkingAsRead
                ? _value.isMarkingAsRead
                : isMarkingAsRead // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AnnouncementsStateImplCopyWith<$Res>
    implements $AnnouncementsStateCopyWith<$Res> {
  factory _$$AnnouncementsStateImplCopyWith(
    _$AnnouncementsStateImpl value,
    $Res Function(_$AnnouncementsStateImpl) then,
  ) = __$$AnnouncementsStateImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    List<Announcement> announcements,
    List<Announcement> filteredAnnouncements,
    bool isLoading,
    bool isSearching,
    String? error,
    String? searchQuery,
    AnnouncementType? selectedType,
    bool isMarkingAsRead,
  });
}

/// @nodoc
class __$$AnnouncementsStateImplCopyWithImpl<$Res>
    extends _$AnnouncementsStateCopyWithImpl<$Res, _$AnnouncementsStateImpl>
    implements _$$AnnouncementsStateImplCopyWith<$Res> {
  __$$AnnouncementsStateImplCopyWithImpl(
    _$AnnouncementsStateImpl _value,
    $Res Function(_$AnnouncementsStateImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AnnouncementsState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? announcements = null,
    Object? filteredAnnouncements = null,
    Object? isLoading = null,
    Object? isSearching = null,
    Object? error = freezed,
    Object? searchQuery = freezed,
    Object? selectedType = freezed,
    Object? isMarkingAsRead = null,
  }) {
    return _then(
      _$AnnouncementsStateImpl(
        announcements: null == announcements
            ? _value._announcements
            : announcements // ignore: cast_nullable_to_non_nullable
                  as List<Announcement>,
        filteredAnnouncements: null == filteredAnnouncements
            ? _value._filteredAnnouncements
            : filteredAnnouncements // ignore: cast_nullable_to_non_nullable
                  as List<Announcement>,
        isLoading: null == isLoading
            ? _value.isLoading
            : isLoading // ignore: cast_nullable_to_non_nullable
                  as bool,
        isSearching: null == isSearching
            ? _value.isSearching
            : isSearching // ignore: cast_nullable_to_non_nullable
                  as bool,
        error: freezed == error
            ? _value.error
            : error // ignore: cast_nullable_to_non_nullable
                  as String?,
        searchQuery: freezed == searchQuery
            ? _value.searchQuery
            : searchQuery // ignore: cast_nullable_to_non_nullable
                  as String?,
        selectedType: freezed == selectedType
            ? _value.selectedType
            : selectedType // ignore: cast_nullable_to_non_nullable
                  as AnnouncementType?,
        isMarkingAsRead: null == isMarkingAsRead
            ? _value.isMarkingAsRead
            : isMarkingAsRead // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc

class _$AnnouncementsStateImpl implements _AnnouncementsState {
  const _$AnnouncementsStateImpl({
    final List<Announcement> announcements = const [],
    final List<Announcement> filteredAnnouncements = const [],
    this.isLoading = false,
    this.isSearching = false,
    this.error,
    this.searchQuery,
    this.selectedType,
    this.isMarkingAsRead = false,
  }) : _announcements = announcements,
       _filteredAnnouncements = filteredAnnouncements;

  final List<Announcement> _announcements;
  @override
  @JsonKey()
  List<Announcement> get announcements {
    if (_announcements is EqualUnmodifiableListView) return _announcements;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_announcements);
  }

  final List<Announcement> _filteredAnnouncements;
  @override
  @JsonKey()
  List<Announcement> get filteredAnnouncements {
    if (_filteredAnnouncements is EqualUnmodifiableListView)
      return _filteredAnnouncements;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_filteredAnnouncements);
  }

  @override
  @JsonKey()
  final bool isLoading;
  @override
  @JsonKey()
  final bool isSearching;
  @override
  final String? error;
  @override
  final String? searchQuery;
  @override
  final AnnouncementType? selectedType;
  @override
  @JsonKey()
  final bool isMarkingAsRead;

  @override
  String toString() {
    return 'AnnouncementsState(announcements: $announcements, filteredAnnouncements: $filteredAnnouncements, isLoading: $isLoading, isSearching: $isSearching, error: $error, searchQuery: $searchQuery, selectedType: $selectedType, isMarkingAsRead: $isMarkingAsRead)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AnnouncementsStateImpl &&
            const DeepCollectionEquality().equals(
              other._announcements,
              _announcements,
            ) &&
            const DeepCollectionEquality().equals(
              other._filteredAnnouncements,
              _filteredAnnouncements,
            ) &&
            (identical(other.isLoading, isLoading) ||
                other.isLoading == isLoading) &&
            (identical(other.isSearching, isSearching) ||
                other.isSearching == isSearching) &&
            (identical(other.error, error) || other.error == error) &&
            (identical(other.searchQuery, searchQuery) ||
                other.searchQuery == searchQuery) &&
            (identical(other.selectedType, selectedType) ||
                other.selectedType == selectedType) &&
            (identical(other.isMarkingAsRead, isMarkingAsRead) ||
                other.isMarkingAsRead == isMarkingAsRead));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_announcements),
    const DeepCollectionEquality().hash(_filteredAnnouncements),
    isLoading,
    isSearching,
    error,
    searchQuery,
    selectedType,
    isMarkingAsRead,
  );

  /// Create a copy of AnnouncementsState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AnnouncementsStateImplCopyWith<_$AnnouncementsStateImpl> get copyWith =>
      __$$AnnouncementsStateImplCopyWithImpl<_$AnnouncementsStateImpl>(
        this,
        _$identity,
      );
}

abstract class _AnnouncementsState implements AnnouncementsState {
  const factory _AnnouncementsState({
    final List<Announcement> announcements,
    final List<Announcement> filteredAnnouncements,
    final bool isLoading,
    final bool isSearching,
    final String? error,
    final String? searchQuery,
    final AnnouncementType? selectedType,
    final bool isMarkingAsRead,
  }) = _$AnnouncementsStateImpl;

  @override
  List<Announcement> get announcements;
  @override
  List<Announcement> get filteredAnnouncements;
  @override
  bool get isLoading;
  @override
  bool get isSearching;
  @override
  String? get error;
  @override
  String? get searchQuery;
  @override
  AnnouncementType? get selectedType;
  @override
  bool get isMarkingAsRead;

  /// Create a copy of AnnouncementsState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AnnouncementsStateImplCopyWith<_$AnnouncementsStateImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
