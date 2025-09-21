// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'request.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

ServiceRequest _$ServiceRequestFromJson(Map<String, dynamic> json) {
  return _ServiceRequest.fromJson(json);
}

/// @nodoc
mixin _$ServiceRequest {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get category => throw _privateConstructorUsedError;
  String get priority => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  String? get assignedTo => throw _privateConstructorUsedError;
  int? get assignedToId => throw _privateConstructorUsedError;
  String? get assignedToPhone => throw _privateConstructorUsedError;
  DateTime? get assignedAt => throw _privateConstructorUsedError;
  DateTime? get completedAt => throw _privateConstructorUsedError;
  DateTime? get estimatedCompletion => throw _privateConstructorUsedError;
  DateTime? get actualCompletion => throw _privateConstructorUsedError;
  String? get staffPhone => throw _privateConstructorUsedError;
  String? get resolutionNotes => throw _privateConstructorUsedError;
  List<String> get imageUrls => throw _privateConstructorUsedError;
  List<String> get attachmentUrls => throw _privateConstructorUsedError;
  List<Comment> get comments => throw _privateConstructorUsedError;

  /// Serializes this ServiceRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ServiceRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ServiceRequestCopyWith<ServiceRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ServiceRequestCopyWith<$Res> {
  factory $ServiceRequestCopyWith(
    ServiceRequest value,
    $Res Function(ServiceRequest) then,
  ) = _$ServiceRequestCopyWithImpl<$Res, ServiceRequest>;
  @useResult
  $Res call({
    String id,
    String title,
    String description,
    String category,
    String priority,
    String status,
    DateTime createdAt,
    DateTime updatedAt,
    String? assignedTo,
    int? assignedToId,
    String? assignedToPhone,
    DateTime? assignedAt,
    DateTime? completedAt,
    DateTime? estimatedCompletion,
    DateTime? actualCompletion,
    String? staffPhone,
    String? resolutionNotes,
    List<String> imageUrls,
    List<String> attachmentUrls,
    List<Comment> comments,
  });
}

/// @nodoc
class _$ServiceRequestCopyWithImpl<$Res, $Val extends ServiceRequest>
    implements $ServiceRequestCopyWith<$Res> {
  _$ServiceRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ServiceRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? description = null,
    Object? category = null,
    Object? priority = null,
    Object? status = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? assignedTo = freezed,
    Object? assignedToId = freezed,
    Object? assignedToPhone = freezed,
    Object? assignedAt = freezed,
    Object? completedAt = freezed,
    Object? estimatedCompletion = freezed,
    Object? actualCompletion = freezed,
    Object? staffPhone = freezed,
    Object? resolutionNotes = freezed,
    Object? imageUrls = null,
    Object? attachmentUrls = null,
    Object? comments = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            category: null == category
                ? _value.category
                : category // ignore: cast_nullable_to_non_nullable
                      as String,
            priority: null == priority
                ? _value.priority
                : priority // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            updatedAt: null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            assignedTo: freezed == assignedTo
                ? _value.assignedTo
                : assignedTo // ignore: cast_nullable_to_non_nullable
                      as String?,
            assignedToId: freezed == assignedToId
                ? _value.assignedToId
                : assignedToId // ignore: cast_nullable_to_non_nullable
                      as int?,
            assignedToPhone: freezed == assignedToPhone
                ? _value.assignedToPhone
                : assignedToPhone // ignore: cast_nullable_to_non_nullable
                      as String?,
            assignedAt: freezed == assignedAt
                ? _value.assignedAt
                : assignedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            completedAt: freezed == completedAt
                ? _value.completedAt
                : completedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            estimatedCompletion: freezed == estimatedCompletion
                ? _value.estimatedCompletion
                : estimatedCompletion // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            actualCompletion: freezed == actualCompletion
                ? _value.actualCompletion
                : actualCompletion // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            staffPhone: freezed == staffPhone
                ? _value.staffPhone
                : staffPhone // ignore: cast_nullable_to_non_nullable
                      as String?,
            resolutionNotes: freezed == resolutionNotes
                ? _value.resolutionNotes
                : resolutionNotes // ignore: cast_nullable_to_non_nullable
                      as String?,
            imageUrls: null == imageUrls
                ? _value.imageUrls
                : imageUrls // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            attachmentUrls: null == attachmentUrls
                ? _value.attachmentUrls
                : attachmentUrls // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            comments: null == comments
                ? _value.comments
                : comments // ignore: cast_nullable_to_non_nullable
                      as List<Comment>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ServiceRequestImplCopyWith<$Res>
    implements $ServiceRequestCopyWith<$Res> {
  factory _$$ServiceRequestImplCopyWith(
    _$ServiceRequestImpl value,
    $Res Function(_$ServiceRequestImpl) then,
  ) = __$$ServiceRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String title,
    String description,
    String category,
    String priority,
    String status,
    DateTime createdAt,
    DateTime updatedAt,
    String? assignedTo,
    int? assignedToId,
    String? assignedToPhone,
    DateTime? assignedAt,
    DateTime? completedAt,
    DateTime? estimatedCompletion,
    DateTime? actualCompletion,
    String? staffPhone,
    String? resolutionNotes,
    List<String> imageUrls,
    List<String> attachmentUrls,
    List<Comment> comments,
  });
}

/// @nodoc
class __$$ServiceRequestImplCopyWithImpl<$Res>
    extends _$ServiceRequestCopyWithImpl<$Res, _$ServiceRequestImpl>
    implements _$$ServiceRequestImplCopyWith<$Res> {
  __$$ServiceRequestImplCopyWithImpl(
    _$ServiceRequestImpl _value,
    $Res Function(_$ServiceRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ServiceRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? description = null,
    Object? category = null,
    Object? priority = null,
    Object? status = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? assignedTo = freezed,
    Object? assignedToId = freezed,
    Object? assignedToPhone = freezed,
    Object? assignedAt = freezed,
    Object? completedAt = freezed,
    Object? estimatedCompletion = freezed,
    Object? actualCompletion = freezed,
    Object? staffPhone = freezed,
    Object? resolutionNotes = freezed,
    Object? imageUrls = null,
    Object? attachmentUrls = null,
    Object? comments = null,
  }) {
    return _then(
      _$ServiceRequestImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        category: null == category
            ? _value.category
            : category // ignore: cast_nullable_to_non_nullable
                  as String,
        priority: null == priority
            ? _value.priority
            : priority // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        updatedAt: null == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        assignedTo: freezed == assignedTo
            ? _value.assignedTo
            : assignedTo // ignore: cast_nullable_to_non_nullable
                  as String?,
        assignedToId: freezed == assignedToId
            ? _value.assignedToId
            : assignedToId // ignore: cast_nullable_to_non_nullable
                  as int?,
        assignedToPhone: freezed == assignedToPhone
            ? _value.assignedToPhone
            : assignedToPhone // ignore: cast_nullable_to_non_nullable
                  as String?,
        assignedAt: freezed == assignedAt
            ? _value.assignedAt
            : assignedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        completedAt: freezed == completedAt
            ? _value.completedAt
            : completedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        estimatedCompletion: freezed == estimatedCompletion
            ? _value.estimatedCompletion
            : estimatedCompletion // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        actualCompletion: freezed == actualCompletion
            ? _value.actualCompletion
            : actualCompletion // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        staffPhone: freezed == staffPhone
            ? _value.staffPhone
            : staffPhone // ignore: cast_nullable_to_non_nullable
                  as String?,
        resolutionNotes: freezed == resolutionNotes
            ? _value.resolutionNotes
            : resolutionNotes // ignore: cast_nullable_to_non_nullable
                  as String?,
        imageUrls: null == imageUrls
            ? _value._imageUrls
            : imageUrls // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        attachmentUrls: null == attachmentUrls
            ? _value._attachmentUrls
            : attachmentUrls // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        comments: null == comments
            ? _value._comments
            : comments // ignore: cast_nullable_to_non_nullable
                  as List<Comment>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ServiceRequestImpl implements _ServiceRequest {
  const _$ServiceRequestImpl({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.assignedTo,
    this.assignedToId,
    this.assignedToPhone,
    this.assignedAt,
    this.completedAt,
    this.estimatedCompletion,
    this.actualCompletion,
    this.staffPhone,
    this.resolutionNotes,
    final List<String> imageUrls = const [],
    final List<String> attachmentUrls = const [],
    final List<Comment> comments = const [],
  }) : _imageUrls = imageUrls,
       _attachmentUrls = attachmentUrls,
       _comments = comments;

  factory _$ServiceRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$ServiceRequestImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final String description;
  @override
  final String category;
  @override
  final String priority;
  @override
  final String status;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final String? assignedTo;
  @override
  final int? assignedToId;
  @override
  final String? assignedToPhone;
  @override
  final DateTime? assignedAt;
  @override
  final DateTime? completedAt;
  @override
  final DateTime? estimatedCompletion;
  @override
  final DateTime? actualCompletion;
  @override
  final String? staffPhone;
  @override
  final String? resolutionNotes;
  final List<String> _imageUrls;
  @override
  @JsonKey()
  List<String> get imageUrls {
    if (_imageUrls is EqualUnmodifiableListView) return _imageUrls;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_imageUrls);
  }

  final List<String> _attachmentUrls;
  @override
  @JsonKey()
  List<String> get attachmentUrls {
    if (_attachmentUrls is EqualUnmodifiableListView) return _attachmentUrls;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_attachmentUrls);
  }

  final List<Comment> _comments;
  @override
  @JsonKey()
  List<Comment> get comments {
    if (_comments is EqualUnmodifiableListView) return _comments;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_comments);
  }

  @override
  String toString() {
    return 'ServiceRequest(id: $id, title: $title, description: $description, category: $category, priority: $priority, status: $status, createdAt: $createdAt, updatedAt: $updatedAt, assignedTo: $assignedTo, assignedToId: $assignedToId, assignedToPhone: $assignedToPhone, assignedAt: $assignedAt, completedAt: $completedAt, estimatedCompletion: $estimatedCompletion, actualCompletion: $actualCompletion, staffPhone: $staffPhone, resolutionNotes: $resolutionNotes, imageUrls: $imageUrls, attachmentUrls: $attachmentUrls, comments: $comments)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ServiceRequestImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.priority, priority) ||
                other.priority == priority) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.assignedTo, assignedTo) ||
                other.assignedTo == assignedTo) &&
            (identical(other.assignedToId, assignedToId) ||
                other.assignedToId == assignedToId) &&
            (identical(other.assignedToPhone, assignedToPhone) ||
                other.assignedToPhone == assignedToPhone) &&
            (identical(other.assignedAt, assignedAt) ||
                other.assignedAt == assignedAt) &&
            (identical(other.completedAt, completedAt) ||
                other.completedAt == completedAt) &&
            (identical(other.estimatedCompletion, estimatedCompletion) ||
                other.estimatedCompletion == estimatedCompletion) &&
            (identical(other.actualCompletion, actualCompletion) ||
                other.actualCompletion == actualCompletion) &&
            (identical(other.staffPhone, staffPhone) ||
                other.staffPhone == staffPhone) &&
            (identical(other.resolutionNotes, resolutionNotes) ||
                other.resolutionNotes == resolutionNotes) &&
            const DeepCollectionEquality().equals(
              other._imageUrls,
              _imageUrls,
            ) &&
            const DeepCollectionEquality().equals(
              other._attachmentUrls,
              _attachmentUrls,
            ) &&
            const DeepCollectionEquality().equals(other._comments, _comments));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    title,
    description,
    category,
    priority,
    status,
    createdAt,
    updatedAt,
    assignedTo,
    assignedToId,
    assignedToPhone,
    assignedAt,
    completedAt,
    estimatedCompletion,
    actualCompletion,
    staffPhone,
    resolutionNotes,
    const DeepCollectionEquality().hash(_imageUrls),
    const DeepCollectionEquality().hash(_attachmentUrls),
    const DeepCollectionEquality().hash(_comments),
  ]);

  /// Create a copy of ServiceRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ServiceRequestImplCopyWith<_$ServiceRequestImpl> get copyWith =>
      __$$ServiceRequestImplCopyWithImpl<_$ServiceRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ServiceRequestImplToJson(this);
  }
}

abstract class _ServiceRequest implements ServiceRequest {
  const factory _ServiceRequest({
    required final String id,
    required final String title,
    required final String description,
    required final String category,
    required final String priority,
    required final String status,
    required final DateTime createdAt,
    required final DateTime updatedAt,
    final String? assignedTo,
    final int? assignedToId,
    final String? assignedToPhone,
    final DateTime? assignedAt,
    final DateTime? completedAt,
    final DateTime? estimatedCompletion,
    final DateTime? actualCompletion,
    final String? staffPhone,
    final String? resolutionNotes,
    final List<String> imageUrls,
    final List<String> attachmentUrls,
    final List<Comment> comments,
  }) = _$ServiceRequestImpl;

  factory _ServiceRequest.fromJson(Map<String, dynamic> json) =
      _$ServiceRequestImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  String get description;
  @override
  String get category;
  @override
  String get priority;
  @override
  String get status;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  String? get assignedTo;
  @override
  int? get assignedToId;
  @override
  String? get assignedToPhone;
  @override
  DateTime? get assignedAt;
  @override
  DateTime? get completedAt;
  @override
  DateTime? get estimatedCompletion;
  @override
  DateTime? get actualCompletion;
  @override
  String? get staffPhone;
  @override
  String? get resolutionNotes;
  @override
  List<String> get imageUrls;
  @override
  List<String> get attachmentUrls;
  @override
  List<Comment> get comments;

  /// Create a copy of ServiceRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ServiceRequestImplCopyWith<_$ServiceRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

Comment _$CommentFromJson(Map<String, dynamic> json) {
  return _Comment.fromJson(json);
}

/// @nodoc
mixin _$Comment {
  String get id => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  String get author => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  bool get isStaff => throw _privateConstructorUsedError;
  List<String> get imageUrls => throw _privateConstructorUsedError;

  /// Serializes this Comment to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Comment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CommentCopyWith<Comment> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CommentCopyWith<$Res> {
  factory $CommentCopyWith(Comment value, $Res Function(Comment) then) =
      _$CommentCopyWithImpl<$Res, Comment>;
  @useResult
  $Res call({
    String id,
    String content,
    String author,
    DateTime createdAt,
    bool isStaff,
    List<String> imageUrls,
  });
}

/// @nodoc
class _$CommentCopyWithImpl<$Res, $Val extends Comment>
    implements $CommentCopyWith<$Res> {
  _$CommentCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Comment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? content = null,
    Object? author = null,
    Object? createdAt = null,
    Object? isStaff = null,
    Object? imageUrls = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            content: null == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String,
            author: null == author
                ? _value.author
                : author // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            isStaff: null == isStaff
                ? _value.isStaff
                : isStaff // ignore: cast_nullable_to_non_nullable
                      as bool,
            imageUrls: null == imageUrls
                ? _value.imageUrls
                : imageUrls // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CommentImplCopyWith<$Res> implements $CommentCopyWith<$Res> {
  factory _$$CommentImplCopyWith(
    _$CommentImpl value,
    $Res Function(_$CommentImpl) then,
  ) = __$$CommentImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String content,
    String author,
    DateTime createdAt,
    bool isStaff,
    List<String> imageUrls,
  });
}

/// @nodoc
class __$$CommentImplCopyWithImpl<$Res>
    extends _$CommentCopyWithImpl<$Res, _$CommentImpl>
    implements _$$CommentImplCopyWith<$Res> {
  __$$CommentImplCopyWithImpl(
    _$CommentImpl _value,
    $Res Function(_$CommentImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Comment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? content = null,
    Object? author = null,
    Object? createdAt = null,
    Object? isStaff = null,
    Object? imageUrls = null,
  }) {
    return _then(
      _$CommentImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        content: null == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String,
        author: null == author
            ? _value.author
            : author // ignore: cast_nullable_to_non_nullable
                  as String,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        isStaff: null == isStaff
            ? _value.isStaff
            : isStaff // ignore: cast_nullable_to_non_nullable
                  as bool,
        imageUrls: null == imageUrls
            ? _value._imageUrls
            : imageUrls // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CommentImpl implements _Comment {
  const _$CommentImpl({
    required this.id,
    required this.content,
    required this.author,
    required this.createdAt,
    required this.isStaff,
    final List<String> imageUrls = const [],
  }) : _imageUrls = imageUrls;

  factory _$CommentImpl.fromJson(Map<String, dynamic> json) =>
      _$$CommentImplFromJson(json);

  @override
  final String id;
  @override
  final String content;
  @override
  final String author;
  @override
  final DateTime createdAt;
  @override
  final bool isStaff;
  final List<String> _imageUrls;
  @override
  @JsonKey()
  List<String> get imageUrls {
    if (_imageUrls is EqualUnmodifiableListView) return _imageUrls;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_imageUrls);
  }

  @override
  String toString() {
    return 'Comment(id: $id, content: $content, author: $author, createdAt: $createdAt, isStaff: $isStaff, imageUrls: $imageUrls)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CommentImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.author, author) || other.author == author) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.isStaff, isStaff) || other.isStaff == isStaff) &&
            const DeepCollectionEquality().equals(
              other._imageUrls,
              _imageUrls,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    content,
    author,
    createdAt,
    isStaff,
    const DeepCollectionEquality().hash(_imageUrls),
  );

  /// Create a copy of Comment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CommentImplCopyWith<_$CommentImpl> get copyWith =>
      __$$CommentImplCopyWithImpl<_$CommentImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CommentImplToJson(this);
  }
}

abstract class _Comment implements Comment {
  const factory _Comment({
    required final String id,
    required final String content,
    required final String author,
    required final DateTime createdAt,
    required final bool isStaff,
    final List<String> imageUrls,
  }) = _$CommentImpl;

  factory _Comment.fromJson(Map<String, dynamic> json) = _$CommentImpl.fromJson;

  @override
  String get id;
  @override
  String get content;
  @override
  String get author;
  @override
  DateTime get createdAt;
  @override
  bool get isStaff;
  @override
  List<String> get imageUrls;

  /// Create a copy of Comment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CommentImplCopyWith<_$CommentImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ServiceCategory _$ServiceCategoryFromJson(Map<String, dynamic> json) {
  return _ServiceCategory.fromJson(json);
}

/// @nodoc
mixin _$ServiceCategory {
  int get id => throw _privateConstructorUsedError;
  String get categoryCode => throw _privateConstructorUsedError;
  String get categoryName => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;

  /// Serializes this ServiceCategory to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ServiceCategory
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ServiceCategoryCopyWith<ServiceCategory> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ServiceCategoryCopyWith<$Res> {
  factory $ServiceCategoryCopyWith(
    ServiceCategory value,
    $Res Function(ServiceCategory) then,
  ) = _$ServiceCategoryCopyWithImpl<$Res, ServiceCategory>;
  @useResult
  $Res call({
    int id,
    String categoryCode,
    String categoryName,
    String? description,
  });
}

/// @nodoc
class _$ServiceCategoryCopyWithImpl<$Res, $Val extends ServiceCategory>
    implements $ServiceCategoryCopyWith<$Res> {
  _$ServiceCategoryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ServiceCategory
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? categoryCode = null,
    Object? categoryName = null,
    Object? description = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            categoryCode: null == categoryCode
                ? _value.categoryCode
                : categoryCode // ignore: cast_nullable_to_non_nullable
                      as String,
            categoryName: null == categoryName
                ? _value.categoryName
                : categoryName // ignore: cast_nullable_to_non_nullable
                      as String,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ServiceCategoryImplCopyWith<$Res>
    implements $ServiceCategoryCopyWith<$Res> {
  factory _$$ServiceCategoryImplCopyWith(
    _$ServiceCategoryImpl value,
    $Res Function(_$ServiceCategoryImpl) then,
  ) = __$$ServiceCategoryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String categoryCode,
    String categoryName,
    String? description,
  });
}

/// @nodoc
class __$$ServiceCategoryImplCopyWithImpl<$Res>
    extends _$ServiceCategoryCopyWithImpl<$Res, _$ServiceCategoryImpl>
    implements _$$ServiceCategoryImplCopyWith<$Res> {
  __$$ServiceCategoryImplCopyWithImpl(
    _$ServiceCategoryImpl _value,
    $Res Function(_$ServiceCategoryImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ServiceCategory
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? categoryCode = null,
    Object? categoryName = null,
    Object? description = freezed,
  }) {
    return _then(
      _$ServiceCategoryImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        categoryCode: null == categoryCode
            ? _value.categoryCode
            : categoryCode // ignore: cast_nullable_to_non_nullable
                  as String,
        categoryName: null == categoryName
            ? _value.categoryName
            : categoryName // ignore: cast_nullable_to_non_nullable
                  as String,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ServiceCategoryImpl implements _ServiceCategory {
  const _$ServiceCategoryImpl({
    required this.id,
    required this.categoryCode,
    required this.categoryName,
    this.description,
  });

  factory _$ServiceCategoryImpl.fromJson(Map<String, dynamic> json) =>
      _$$ServiceCategoryImplFromJson(json);

  @override
  final int id;
  @override
  final String categoryCode;
  @override
  final String categoryName;
  @override
  final String? description;

  @override
  String toString() {
    return 'ServiceCategory(id: $id, categoryCode: $categoryCode, categoryName: $categoryName, description: $description)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ServiceCategoryImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.categoryCode, categoryCode) ||
                other.categoryCode == categoryCode) &&
            (identical(other.categoryName, categoryName) ||
                other.categoryName == categoryName) &&
            (identical(other.description, description) ||
                other.description == description));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, categoryCode, categoryName, description);

  /// Create a copy of ServiceCategory
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ServiceCategoryImplCopyWith<_$ServiceCategoryImpl> get copyWith =>
      __$$ServiceCategoryImplCopyWithImpl<_$ServiceCategoryImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ServiceCategoryImplToJson(this);
  }
}

abstract class _ServiceCategory implements ServiceCategory {
  const factory _ServiceCategory({
    required final int id,
    required final String categoryCode,
    required final String categoryName,
    final String? description,
  }) = _$ServiceCategoryImpl;

  factory _ServiceCategory.fromJson(Map<String, dynamic> json) =
      _$ServiceCategoryImpl.fromJson;

  @override
  int get id;
  @override
  String get categoryCode;
  @override
  String get categoryName;
  @override
  String? get description;

  /// Create a copy of ServiceCategory
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ServiceCategoryImplCopyWith<_$ServiceCategoryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateServiceRequest _$CreateServiceRequestFromJson(Map<String, dynamic> json) {
  return _CreateServiceRequest.fromJson(json);
}

/// @nodoc
mixin _$CreateServiceRequest {
  String get title => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  int get categoryId => throw _privateConstructorUsedError;
  String get priority => throw _privateConstructorUsedError;
  List<String> get attachmentUrls => throw _privateConstructorUsedError;
  List<String> get imageAttachment => throw _privateConstructorUsedError;

  /// Serializes this CreateServiceRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateServiceRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateServiceRequestCopyWith<CreateServiceRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateServiceRequestCopyWith<$Res> {
  factory $CreateServiceRequestCopyWith(
    CreateServiceRequest value,
    $Res Function(CreateServiceRequest) then,
  ) = _$CreateServiceRequestCopyWithImpl<$Res, CreateServiceRequest>;
  @useResult
  $Res call({
    String title,
    String description,
    int categoryId,
    String priority,
    List<String> attachmentUrls,
    List<String> imageAttachment,
  });
}

/// @nodoc
class _$CreateServiceRequestCopyWithImpl<
  $Res,
  $Val extends CreateServiceRequest
>
    implements $CreateServiceRequestCopyWith<$Res> {
  _$CreateServiceRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateServiceRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = null,
    Object? description = null,
    Object? categoryId = null,
    Object? priority = null,
    Object? attachmentUrls = null,
    Object? imageAttachment = null,
  }) {
    return _then(
      _value.copyWith(
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            categoryId: null == categoryId
                ? _value.categoryId
                : categoryId // ignore: cast_nullable_to_non_nullable
                      as int,
            priority: null == priority
                ? _value.priority
                : priority // ignore: cast_nullable_to_non_nullable
                      as String,
            attachmentUrls: null == attachmentUrls
                ? _value.attachmentUrls
                : attachmentUrls // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            imageAttachment: null == imageAttachment
                ? _value.imageAttachment
                : imageAttachment // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateServiceRequestImplCopyWith<$Res>
    implements $CreateServiceRequestCopyWith<$Res> {
  factory _$$CreateServiceRequestImplCopyWith(
    _$CreateServiceRequestImpl value,
    $Res Function(_$CreateServiceRequestImpl) then,
  ) = __$$CreateServiceRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String title,
    String description,
    int categoryId,
    String priority,
    List<String> attachmentUrls,
    List<String> imageAttachment,
  });
}

/// @nodoc
class __$$CreateServiceRequestImplCopyWithImpl<$Res>
    extends _$CreateServiceRequestCopyWithImpl<$Res, _$CreateServiceRequestImpl>
    implements _$$CreateServiceRequestImplCopyWith<$Res> {
  __$$CreateServiceRequestImplCopyWithImpl(
    _$CreateServiceRequestImpl _value,
    $Res Function(_$CreateServiceRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateServiceRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = null,
    Object? description = null,
    Object? categoryId = null,
    Object? priority = null,
    Object? attachmentUrls = null,
    Object? imageAttachment = null,
  }) {
    return _then(
      _$CreateServiceRequestImpl(
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        categoryId: null == categoryId
            ? _value.categoryId
            : categoryId // ignore: cast_nullable_to_non_nullable
                  as int,
        priority: null == priority
            ? _value.priority
            : priority // ignore: cast_nullable_to_non_nullable
                  as String,
        attachmentUrls: null == attachmentUrls
            ? _value._attachmentUrls
            : attachmentUrls // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        imageAttachment: null == imageAttachment
            ? _value._imageAttachment
            : imageAttachment // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateServiceRequestImpl implements _CreateServiceRequest {
  const _$CreateServiceRequestImpl({
    required this.title,
    required this.description,
    required this.categoryId,
    required this.priority,
    final List<String> attachmentUrls = const [],
    final List<String> imageAttachment = const [],
  }) : _attachmentUrls = attachmentUrls,
       _imageAttachment = imageAttachment;

  factory _$CreateServiceRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateServiceRequestImplFromJson(json);

  @override
  final String title;
  @override
  final String description;
  @override
  final int categoryId;
  @override
  final String priority;
  final List<String> _attachmentUrls;
  @override
  @JsonKey()
  List<String> get attachmentUrls {
    if (_attachmentUrls is EqualUnmodifiableListView) return _attachmentUrls;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_attachmentUrls);
  }

  final List<String> _imageAttachment;
  @override
  @JsonKey()
  List<String> get imageAttachment {
    if (_imageAttachment is EqualUnmodifiableListView) return _imageAttachment;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_imageAttachment);
  }

  @override
  String toString() {
    return 'CreateServiceRequest(title: $title, description: $description, categoryId: $categoryId, priority: $priority, attachmentUrls: $attachmentUrls, imageAttachment: $imageAttachment)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateServiceRequestImpl &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            (identical(other.priority, priority) ||
                other.priority == priority) &&
            const DeepCollectionEquality().equals(
              other._attachmentUrls,
              _attachmentUrls,
            ) &&
            const DeepCollectionEquality().equals(
              other._imageAttachment,
              _imageAttachment,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    title,
    description,
    categoryId,
    priority,
    const DeepCollectionEquality().hash(_attachmentUrls),
    const DeepCollectionEquality().hash(_imageAttachment),
  );

  /// Create a copy of CreateServiceRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateServiceRequestImplCopyWith<_$CreateServiceRequestImpl>
  get copyWith =>
      __$$CreateServiceRequestImplCopyWithImpl<_$CreateServiceRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateServiceRequestImplToJson(this);
  }
}

abstract class _CreateServiceRequest implements CreateServiceRequest {
  const factory _CreateServiceRequest({
    required final String title,
    required final String description,
    required final int categoryId,
    required final String priority,
    final List<String> attachmentUrls,
    final List<String> imageAttachment,
  }) = _$CreateServiceRequestImpl;

  factory _CreateServiceRequest.fromJson(Map<String, dynamic> json) =
      _$CreateServiceRequestImpl.fromJson;

  @override
  String get title;
  @override
  String get description;
  @override
  int get categoryId;
  @override
  String get priority;
  @override
  List<String> get attachmentUrls;
  @override
  List<String> get imageAttachment;

  /// Create a copy of CreateServiceRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateServiceRequestImplCopyWith<_$CreateServiceRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}
