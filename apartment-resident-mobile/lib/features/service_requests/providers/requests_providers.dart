import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/storage/secure_storage.dart';
import '../data/requests_api.dart';
import '../data/upload_api.dart';
import '../data/requests_repository.dart';
import '../models/request.dart';

// Token provider
final authTokenProvider = FutureProvider<String?>((ref) async {
  return await TokenStorage.instance.getToken();
});

// API providers
final serviceRequestsApiProvider = FutureProvider<ServiceRequestsApi>((
  ref,
) async {
  final api = ServiceRequestsApi();
  final token = await ref.watch(authTokenProvider.future);
  api.setToken(token);
  return api;
});

final uploadApiProvider = FutureProvider<UploadApi>((ref) async {
  final api = UploadApi();
  final token = await ref.watch(authTokenProvider.future);
  api.setToken(token);
  return api;
});

// Repository provider
final serviceRequestsRepositoryProvider =
    FutureProvider<ServiceRequestsRepository>((ref) async {
      final api = await ref.watch(serviceRequestsApiProvider.future);
      final uploadApi = await ref.watch(uploadApiProvider.future);
      return ServiceRequestsRepository(api: api, uploadApi: uploadApi);
    });

// Service requests list provider
final serviceRequestsProvider = FutureProvider<List<ServiceRequest>>((
  ref,
) async {
  final repository = await ref.watch(serviceRequestsRepositoryProvider.future);
  return await repository.getMyRequests();
});

// Filtered service requests provider
final filteredServiceRequestsProvider = FutureProvider<List<ServiceRequest>>((
  ref,
) async {
  final allRequests = await ref.watch(serviceRequestsProvider.future);
  final filterState = ref.watch(serviceRequestsFilterProvider);
  final repository = await ref.watch(serviceRequestsRepositoryProvider.future);

  // Apply filters
  List<ServiceRequest> filtered = allRequests;

  // Filter by status
  if (filterState.statusFilter != 'all') {
    filtered = repository.filterByStatus(filtered, filterState.statusFilter);
  }

  // Filter by category
  if (filterState.categoryFilter != 'all') {
    filtered = repository.filterByCategory(
      filtered,
      filterState.categoryFilter,
    );
  }

  // Search filter
  if (filterState.searchTerm.isNotEmpty) {
    filtered = repository.searchRequests(filtered, filterState.searchTerm);
  }

  // Sort
  if (filterState.sortBy == 'date') {
    filtered = repository.sortByDate(filtered);
  } else if (filterState.sortBy == 'priority') {
    filtered = repository.sortByPriority(filtered);
  }

  return filtered;
});

// Service request by ID provider
final serviceRequestProvider = FutureProvider.family<ServiceRequest, String>((
  ref,
  id,
) async {
  final repository = await ref.watch(serviceRequestsRepositoryProvider.future);
  return await repository.getRequestById(id);
});

// Service categories provider
final serviceCategoriesProvider = FutureProvider<List<ServiceCategory>>((
  ref,
) async {
  final repository = await ref.watch(serviceRequestsRepositoryProvider.future);
  return await repository.getServiceCategories();
});

// Filter state provider
final serviceRequestsFilterProvider =
    StateNotifierProvider<
      ServiceRequestsFilterNotifier,
      ServiceRequestsFilterState
    >((ref) {
      return ServiceRequestsFilterNotifier();
    });

// Create request state provider
final createRequestProvider =
    StateNotifierProvider<CreateRequestNotifier, CreateRequestState>((ref) {
      return CreateRequestNotifier(ref);
    });

// Upload state provider
final uploadProvider = StateNotifierProvider<UploadNotifier, UploadState>((
  ref,
) {
  return UploadNotifier(ref);
});

// Filter state
class ServiceRequestsFilterState {
  final String searchTerm;
  final String statusFilter;
  final String categoryFilter;
  final String sortBy;

  const ServiceRequestsFilterState({
    this.searchTerm = '',
    this.statusFilter = 'all',
    this.categoryFilter = 'all',
    this.sortBy = 'date',
  });

  ServiceRequestsFilterState copyWith({
    String? searchTerm,
    String? statusFilter,
    String? categoryFilter,
    String? sortBy,
  }) {
    return ServiceRequestsFilterState(
      searchTerm: searchTerm ?? this.searchTerm,
      statusFilter: statusFilter ?? this.statusFilter,
      categoryFilter: categoryFilter ?? this.categoryFilter,
      sortBy: sortBy ?? this.sortBy,
    );
  }
}

// Filter notifier
class ServiceRequestsFilterNotifier
    extends StateNotifier<ServiceRequestsFilterState> {
  ServiceRequestsFilterNotifier() : super(const ServiceRequestsFilterState());

  void setSearchTerm(String term) {
    state = state.copyWith(searchTerm: term);
  }

  void setStatusFilter(String status) {
    state = state.copyWith(statusFilter: status);
  }

  void setCategoryFilter(String category) {
    state = state.copyWith(categoryFilter: category);
  }

  void setSortBy(String sortBy) {
    state = state.copyWith(sortBy: sortBy);
  }

  void clearFilters() {
    state = const ServiceRequestsFilterState();
  }
}

// Create request state
class CreateRequestState {
  final bool isLoading;
  final String? error;
  final String? success;
  final String title;
  final String description;
  final int categoryId;
  final String priority;
  final List<String> attachmentUrls;
  final List<String> imageAttachment;
  final List<File> selectedFiles;

  const CreateRequestState({
    this.isLoading = false,
    this.error,
    this.success,
    this.title = '',
    this.description = '',
    this.categoryId = 0,
    this.priority = 'MEDIUM',
    this.attachmentUrls = const [],
    this.imageAttachment = const [],
    this.selectedFiles = const [],
  });

  CreateRequestState copyWith({
    bool? isLoading,
    String? error,
    String? success,
    String? title,
    String? description,
    int? categoryId,
    String? priority,
    List<String>? attachmentUrls,
    List<String>? imageAttachment,
    List<File>? selectedFiles,
  }) {
    return CreateRequestState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      success: success,
      title: title ?? this.title,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      priority: priority ?? this.priority,
      attachmentUrls: attachmentUrls ?? this.attachmentUrls,
      imageAttachment: imageAttachment ?? this.imageAttachment,
      selectedFiles: selectedFiles ?? this.selectedFiles,
    );
  }

  bool get canSubmit {
    return title.isNotEmpty &&
        description.isNotEmpty &&
        categoryId > 0 &&
        !isLoading;
  }
}

// Create request notifier
class CreateRequestNotifier extends StateNotifier<CreateRequestState> {
  final Ref _ref;

  CreateRequestNotifier(this._ref) : super(const CreateRequestState());

  void setTitle(String title) {
    state = state.copyWith(title: title, error: null);
  }

  void setDescription(String description) {
    state = state.copyWith(description: description, error: null);
  }

  void setCategoryId(int categoryId) {
    state = state.copyWith(categoryId: categoryId, error: null);
  }

  void setPriority(String priority) {
    state = state.copyWith(priority: priority, error: null);
  }

  void setSelectedFiles(List<File> files) {
    state = state.copyWith(selectedFiles: files, error: null);
  }

  void addAttachmentUrl(String url) {
    final urls = List<String>.from(state.attachmentUrls)..add(url);
    state = state.copyWith(attachmentUrls: urls);
  }

  void removeAttachmentUrl(String url) {
    final urls = List<String>.from(state.attachmentUrls)..remove(url);
    state = state.copyWith(attachmentUrls: urls);
  }

  void addImageAttachment(String url) {
    final urls = List<String>.from(state.imageAttachment)..add(url);
    state = state.copyWith(imageAttachment: urls);
  }

  void removeImageAttachment(String url) {
    final urls = List<String>.from(state.imageAttachment)..remove(url);
    state = state.copyWith(imageAttachment: urls);
  }

  Future<void> uploadImages() async {
    if (state.selectedFiles.isEmpty) {
      print('CreateRequestNotifier: No files to upload');
      return;
    }

    try {
      print(
        'CreateRequestNotifier: Starting upload of ${state.selectedFiles.length} files',
      );
      state = state.copyWith(isLoading: true, error: null);

      final repository = await _ref.read(
        serviceRequestsRepositoryProvider.future,
      );
      print('CreateRequestNotifier: Repository obtained, uploading files...');
      final urls = await repository.uploadImages(state.selectedFiles);
      print(
        'CreateRequestNotifier: Upload completed, got ${urls.length} URLs: $urls',
      );

      // Phân biệt images và attachments
      final imageUrls = <String>[];
      final attachmentUrls = <String>[];

      for (final url in urls) {
        if (_isImageUrl(url)) {
          imageUrls.add(url);
          print('CreateRequestNotifier: Detected image: $url');
        } else {
          attachmentUrls.add(url);
          print('CreateRequestNotifier: Detected attachment: $url');
        }
      }

      print('CreateRequestNotifier: Final imageUrls: $imageUrls');
      print('CreateRequestNotifier: Final attachmentUrls: $attachmentUrls');

      state = state.copyWith(
        imageAttachment: imageUrls,
        attachmentUrls: attachmentUrls,
        selectedFiles: [],
        isLoading: false,
      );

      print('CreateRequestNotifier: State updated successfully');
    } catch (e) {
      print('CreateRequestNotifier: Upload error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  bool _isImageUrl(String url) {
    final lowerUrl = url.toLowerCase();
    return lowerUrl.contains('.jpg') ||
        lowerUrl.contains('.jpeg') ||
        lowerUrl.contains('.png') ||
        lowerUrl.contains('.gif') ||
        lowerUrl.contains('.webp');
  }

  Future<void> createRequest() async {
    if (!state.canSubmit) {
      print('CreateRequestNotifier: Cannot submit - missing required fields');
      state = state.copyWith(error: 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      print('CreateRequestNotifier: Creating request with state:');
      print('CreateRequestNotifier: Title: ${state.title}');
      print('CreateRequestNotifier: Description: ${state.description}');
      print('CreateRequestNotifier: CategoryId: ${state.categoryId}');
      print('CreateRequestNotifier: Priority: ${state.priority}');
      print('CreateRequestNotifier: AttachmentUrls: ${state.attachmentUrls}');
      print('CreateRequestNotifier: ImageAttachment: ${state.imageAttachment}');

      state = state.copyWith(isLoading: true, error: null);

      final repository = await _ref.read(
        serviceRequestsRepositoryProvider.future,
      );
      final request = CreateServiceRequest(
        title: state.title,
        description: state.description,
        categoryId: state.categoryId,
        priority: state.priority,
        attachmentUrls: state.attachmentUrls,
        imageAttachment: state.imageAttachment,
      );

      print('CreateRequestNotifier: Sending request to repository...');
      await repository.createRequest(request);
      print('CreateRequestNotifier: Request created successfully!');

      state = state.copyWith(
        isLoading: false,
        success: 'Tạo yêu cầu thành công!',
        title: '',
        description: '',
        categoryId: 0,
        priority: 'MEDIUM',
        attachmentUrls: [],
        imageAttachment: [],
        selectedFiles: [],
      );
    } catch (e) {
      print('CreateRequestNotifier: Create request error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  void clearSuccess() {
    state = state.copyWith(success: null);
  }

  void reset() {
    state = const CreateRequestState();
  }
}

// Upload state
class UploadState {
  final bool isUploading;
  final String? error;
  final List<String> uploadedUrls;

  const UploadState({
    this.isUploading = false,
    this.error,
    this.uploadedUrls = const [],
  });

  UploadState copyWith({
    bool? isUploading,
    String? error,
    List<String>? uploadedUrls,
  }) {
    return UploadState(
      isUploading: isUploading ?? this.isUploading,
      error: error,
      uploadedUrls: uploadedUrls ?? this.uploadedUrls,
    );
  }
}

// Upload notifier
class UploadNotifier extends StateNotifier<UploadState> {
  final Ref _ref;

  UploadNotifier(this._ref) : super(const UploadState());

  Future<void> uploadImages(List<File> files) async {
    try {
      state = state.copyWith(isUploading: true, error: null);

      final repository = await _ref.read(
        serviceRequestsRepositoryProvider.future,
      );
      final urls = await repository.uploadImages(files);

      state = state.copyWith(uploadedUrls: urls, isUploading: false);
    } catch (e) {
      state = state.copyWith(isUploading: false, error: e.toString());
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  void clearUrls() {
    state = state.copyWith(uploadedUrls: []);
  }
}
