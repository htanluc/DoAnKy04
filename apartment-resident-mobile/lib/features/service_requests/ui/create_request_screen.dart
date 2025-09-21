import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../models/request.dart';
import '../providers/requests_providers.dart';
import '../data/upload_api.dart';
import 'widgets/image_gallery.dart';

class CreateRequestScreen extends ConsumerStatefulWidget {
  final String? editRequestId;

  const CreateRequestScreen({Key? key, this.editRequestId}) : super(key: key);

  @override
  ConsumerState<CreateRequestScreen> createState() =>
      _CreateRequestScreenState();
}

class _CreateRequestScreenState extends ConsumerState<CreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final ImagePicker _imagePicker = ImagePicker();

  int _selectedCategoryId = 0;
  String _selectedPriority = 'MEDIUM';
  final List<File> _selectedFiles = [];

  @override
  void initState() {
    super.initState();
    // Set token from auth state
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // TODO: Get token from auth provider
      // final token = ref.read(authProvider).token;
      // ref.read(serviceRequestsRepositoryProvider).setToken(token);
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final createState = ref.watch(createRequestProvider);
    final categoriesAsync = ref.watch(serviceCategoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tạo yêu cầu mới'),
        actions: [
          TextButton(
            onPressed: createState.canSubmit ? _submitRequest : null,
            child: Text(
              'Tạo',
              style: TextStyle(
                color: createState.canSubmit ? Colors.blue : Colors.grey,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title field
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Tiêu đề *',
                  hintText: 'Nhập tiêu đề yêu cầu...',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập tiêu đề';
                  }
                  return null;
                },
                onChanged: (value) {
                  ref.read(createRequestProvider.notifier).setTitle(value);
                },
              ),
              const SizedBox(height: 16),

              // Description field
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Mô tả *',
                  hintText: 'Mô tả chi tiết yêu cầu...',
                  border: OutlineInputBorder(),
                ),
                maxLines: 4,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập mô tả';
                  }
                  return null;
                },
                onChanged: (value) {
                  ref
                      .read(createRequestProvider.notifier)
                      .setDescription(value);
                },
              ),
              const SizedBox(height: 16),

              // Category selection
              categoriesAsync.when(
                data: (categories) {
                  // Debug: Categories loaded: ${categories.length}
                  if (categories.isEmpty) {
                    // Fallback to hardcoded categories if API returns empty
                    return _buildCategoryDropdown(_getFallbackCategories());
                  }
                  return _buildCategoryDropdown(categories);
                },
                loading: () => const Column(
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 8),
                    Text('Đang tải danh mục...'),
                  ],
                ),
                error: (error, stack) => Column(
                  children: [
                    Text('Lỗi tải danh mục: $error'),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () {
                        ref.invalidate(serviceCategoriesProvider);
                      },
                      child: const Text('Thử lại'),
                    ),
                    const SizedBox(height: 8),
                    const Text('Sử dụng danh mục mặc định:'),
                    const SizedBox(height: 8),
                    _buildCategoryDropdown(_getFallbackCategories()),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Priority selection
              DropdownButtonFormField<String>(
                value: _selectedPriority,
                decoration: const InputDecoration(
                  labelText: 'Mức độ ưu tiên',
                  border: OutlineInputBorder(),
                ),
                items: PriorityLevel.values.map((priority) {
                  return DropdownMenuItem<String>(
                    value: priority.value,
                    child: Text(priority.displayName),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedPriority = value!;
                  });
                  ref.read(createRequestProvider.notifier).setPriority(value!);
                },
              ),
              const SizedBox(height: 16),

              // Image upload section
              ImageUploadPreview(
                imageUrls: createState.attachmentUrls,
                selectedFiles: _selectedFiles,
                onAddImages: _pickImages,
                onRemoveImage: _removeImage,
                maxImages: 5,
              ),
              const SizedBox(height: 24),

              // Submit button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: createState.isLoading ? null : _submitRequest,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: createState.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Tạo yêu cầu'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickImages() async {
    try {
      print('CreateRequestScreen: Starting image picker...');
      final List<XFile> images = await _imagePicker.pickMultiImage(
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      print('CreateRequestScreen: Picked ${images.length} images');

      if (images.isNotEmpty) {
        final files = images.map((image) => File(image.path)).toList();
        print('CreateRequestScreen: Converted to ${files.length} files');

        // Validate files
        for (final file in files) {
          if (!UploadApi.validateFile(file)) {
            print('CreateRequestScreen: File validation failed: ${file.path}');
            _showErrorDialog(
              'File ${file.path} không hợp lệ hoặc quá lớn (tối đa 5MB)',
            );
            return;
          }
        }

        print('CreateRequestScreen: All files validated successfully');
        setState(() {
          _selectedFiles.addAll(files);
        });

        print(
          'CreateRequestScreen: _selectedFiles now has ${_selectedFiles.length} files',
        );
        print('CreateRequestScreen: Setting files in provider...');

        // Set files in provider and upload images
        ref
            .read(createRequestProvider.notifier)
            .setSelectedFiles(_selectedFiles);
        print('CreateRequestScreen: Calling uploadImages...');
        await ref.read(createRequestProvider.notifier).uploadImages();
        print('CreateRequestScreen: Upload completed');
      } else {
        print('CreateRequestScreen: No images selected');
      }
    } catch (e) {
      print('CreateRequestScreen: Error in _pickImages: $e');
      _showErrorDialog('Lỗi khi chọn hình ảnh: $e');
    }
  }

  void _removeImage(int index) {
    setState(() {
      if (index < _selectedFiles.length) {
        _selectedFiles.removeAt(index);
      } else {
        // Remove from uploaded URLs
        final urlIndex = index - _selectedFiles.length;
        ref
            .read(createRequestProvider.notifier)
            .removeAttachmentUrl(
              ref.read(createRequestProvider).attachmentUrls[urlIndex],
            );
      }
    });
  }

  Future<void> _submitRequest() async {
    print('CreateRequestScreen: _submitRequest called');

    if (!_formKey.currentState!.validate()) {
      print('CreateRequestScreen: Form validation failed');
      return;
    }

    if (_selectedCategoryId == 0) {
      print('CreateRequestScreen: No category selected');
      _showErrorDialog('Vui lòng chọn danh mục');
      return;
    }

    print(
      'CreateRequestScreen: _selectedFiles has ${_selectedFiles.length} files',
    );
    print('CreateRequestScreen: Setting files in provider before upload...');

    // Set files in provider first
    ref.read(createRequestProvider.notifier).setSelectedFiles(_selectedFiles);

    // Upload images if any
    if (_selectedFiles.isNotEmpty) {
      print('CreateRequestScreen: Uploading ${_selectedFiles.length} files...');
      await ref.read(createRequestProvider.notifier).uploadImages();
      print('CreateRequestScreen: Upload completed');
    } else {
      print('CreateRequestScreen: No files to upload');
    }

    print('CreateRequestScreen: Creating request...');
    // Create request
    await ref.read(createRequestProvider.notifier).createRequest();
    print('CreateRequestScreen: Request creation completed');

    // Check result
    final state = ref.read(createRequestProvider);
    if (state.success != null) {
      print('CreateRequestScreen: Request created successfully');
      _showSuccessDialog(state.success!);
    } else if (state.error != null) {
      print('CreateRequestScreen: Request creation failed: ${state.error}');
      _showErrorDialog(state.error!);
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Lỗi'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Thành công'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop();
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  // Fallback categories if API fails
  List<ServiceCategory> _getFallbackCategories() {
    return [
      const ServiceCategory(
        id: 1,
        categoryCode: 'ELECTRICITY',
        categoryName: 'Điện',
        description: 'Sửa chữa điện, hệ thống điện',
      ),
      const ServiceCategory(
        id: 2,
        categoryCode: 'WATER',
        categoryName: 'Nước',
        description: 'Hệ thống nước, đường ống',
      ),
      const ServiceCategory(
        id: 3,
        categoryCode: 'CLEANING',
        categoryName: 'Vệ sinh',
        description: 'Dọn dẹp, vệ sinh',
      ),
      const ServiceCategory(
        id: 4,
        categoryCode: 'SECURITY',
        categoryName: 'An ninh',
        description: 'Bảo vệ, an ninh',
      ),
      const ServiceCategory(
        id: 5,
        categoryCode: 'HVAC',
        categoryName: 'Điều hòa',
        description: 'Hệ thống điều hòa không khí',
      ),
      const ServiceCategory(
        id: 6,
        categoryCode: 'ELEVATOR',
        categoryName: 'Thang máy',
        description: 'Bảo trì, sửa chữa thang máy',
      ),
      const ServiceCategory(
        id: 7,
        categoryCode: 'GARDENING',
        categoryName: 'Cây xanh',
        description: 'Chăm sóc cây xanh, cảnh quan',
      ),
      const ServiceCategory(
        id: 8,
        categoryCode: 'IT',
        categoryName: 'Internet & IT',
        description: 'Hệ thống mạng, công nghệ thông tin',
      ),
      const ServiceCategory(
        id: 9,
        categoryCode: 'OTHER',
        categoryName: 'Khác',
        description: 'Các yêu cầu khác',
      ),
    ];
  }

  // Build category dropdown widget
  Widget _buildCategoryDropdown(List<ServiceCategory> categories) {
    return DropdownButtonFormField<int>(
      value: _selectedCategoryId == 0 ? null : _selectedCategoryId,
      decoration: const InputDecoration(
        labelText: 'Danh mục *',
        border: OutlineInputBorder(),
      ),
      items: categories.map((category) {
        return DropdownMenuItem<int>(
          value: category.id,
          child: Text(category.displayName),
        );
      }).toList(),
      onChanged: (value) {
        setState(() {
          _selectedCategoryId = value ?? 0;
        });
        ref.read(createRequestProvider.notifier).setCategoryId(value ?? 0);
      },
      validator: (value) {
        if (value == null || value == 0) {
          return 'Vui lòng chọn danh mục';
        }
        return null;
      },
    );
  }
}
