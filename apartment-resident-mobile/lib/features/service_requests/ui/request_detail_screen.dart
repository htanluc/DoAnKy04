import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/request.dart';
import '../providers/requests_providers.dart';
import 'widgets/status_progress.dart';
import 'widgets/image_gallery.dart';

class RequestDetailScreen extends ConsumerStatefulWidget {
  final String requestId;

  const RequestDetailScreen({Key? key, required this.requestId})
    : super(key: key);

  @override
  ConsumerState<RequestDetailScreen> createState() =>
      _RequestDetailScreenState();
}

class _RequestDetailScreenState extends ConsumerState<RequestDetailScreen> {
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
  Widget build(BuildContext context) {
    final requestAsync = ref.watch(serviceRequestProvider(widget.requestId));
    final requestsAsync = ref.watch(serviceRequestsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết yêu cầu'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(serviceRequestProvider(widget.requestId));
            },
          ),
        ],
      ),
      body: requestAsync.when(
        data: (request) => _buildRequestDetail(request),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => requestsAsync.when(
          data: (requests) {
            // Try to find request in the list as fallback
            final fallbackRequest = requests.firstWhere(
              (r) => r.id == widget.requestId,
              orElse: () => _createFallbackRequest(),
            );
            return _buildRequestDetail(fallbackRequest);
          },
          loading: () => _buildErrorWidget(error, widget.requestId),
          error: (_, __) => _buildErrorWidget(error, widget.requestId),
        ),
      ),
    );
  }

  ServiceRequest _createFallbackRequest() {
    return ServiceRequest(
      id: widget.requestId,
      title: 'Yêu cầu dịch vụ',
      description: 'Không thể tải chi tiết từ server',
      category: 'OTHER',
      priority: 'MEDIUM',
      status: 'PENDING',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }

  Widget _buildRequestDetail(ServiceRequest request) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _getCategoryColor(request.category),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          _getCategoryIcon(request.category),
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              request.title,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              request.categoryDisplayName,
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Tạo lúc: ${_formatDateTime(request.createdAt)}',
                              style: TextStyle(
                                color: Colors.grey[500],
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      _buildStatusBadge(request.status),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Priority
                  Row(
                    children: [
                      _buildPriorityBadge(request.priority),
                      const Spacer(),
                      if (request.canBeCancelled)
                        TextButton.icon(
                          onPressed: () => _showCancelDialog(request),
                          icon: const Icon(Icons.cancel, size: 16),
                          label: const Text('Hủy yêu cầu'),
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.red,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Description
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Mô tả',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    request.description,
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Customer Images (Hình ảnh khách gửi)
          if (request.imageUrls.isNotEmpty) ...[
            Builder(
              builder: (context) {
                print(
                  'RequestDetailScreen: Displaying customer images: ${request.imageUrls.length}',
                );
                print(
                  'RequestDetailScreen: Customer image URLs: ${request.imageUrls}',
                );
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.camera_alt,
                              size: 20,
                              color: Colors.blue,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Hình ảnh khách gửi (${request.imageUrls.length})',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Hình ảnh đính kèm khi tạo yêu cầu',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 12),
                        ImageGridWidget(
                          imageUrls: request.imageUrls,
                          crossAxisCount: 3,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
          ],

          // Staff Images (Hình ảnh nhân viên xử lý)
          if (request.attachmentUrls.isNotEmpty) ...[
            Builder(
              builder: (context) {
                print(
                  'RequestDetailScreen: Displaying staff images: ${request.attachmentUrls.length}',
                );
                print(
                  'RequestDetailScreen: Staff image URLs: ${request.attachmentUrls}',
                );
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.work,
                              size: 20,
                              color: Colors.green,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Hình ảnh nhân viên xử lý (${request.attachmentUrls.length})',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Hình ảnh sau khi xử lý xong',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 12),
                        ImageGridWidget(
                          imageUrls: request.attachmentUrls,
                          crossAxisCount: 3,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
          ],

          // All Images (Tất cả hình ảnh) - fallback
          if (request.imageUrls.isEmpty &&
              request.attachmentUrls.isEmpty &&
              request.allImages.isNotEmpty) ...[
            Builder(
              builder: (context) {
                print(
                  'RequestDetailScreen: Displaying all images fallback: ${request.allImages.length}',
                );
                print(
                  'RequestDetailScreen: All image URLs: ${request.allImages}',
                );
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.image, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'Hình ảnh đính kèm (${request.allImages.length})',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ImageGridWidget(
                          imageUrls: request.allImages,
                          crossAxisCount: 3,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
          ],

          // Status progress
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Trạng thái xử lý',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  StatusProgressWidget(request: request),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Staff information
          if (request.assignedTo != null) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Thông tin nhân viên',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.person, size: 20, color: Colors.blue),
                        const SizedBox(width: 8),
                        Text(
                          request.assignedTo!,
                          style: const TextStyle(fontSize: 14),
                        ),
                      ],
                    ),
                    if (request.effectiveStaffPhone.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(
                            Icons.phone,
                            size: 20,
                            color: Colors.green,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            request.effectiveStaffPhone,
                            style: const TextStyle(fontSize: 14),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            onPressed: () =>
                                _callStaff(request.effectiveStaffPhone),
                            icon: const Icon(Icons.call, size: 16),
                            style: IconButton.styleFrom(
                              backgroundColor: Colors.green[100],
                              foregroundColor: Colors.green[700],
                            ),
                          ),
                        ],
                      ),
                    ],
                    if (request.assignedAt != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(
                            Icons.schedule,
                            size: 20,
                            color: Colors.orange,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Giao lúc: ${_formatDateTime(request.assignedAt!)}',
                            style: const TextStyle(fontSize: 14),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Comments
          if (request.comments.isNotEmpty) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Bình luận',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...request.comments.map(
                      (comment) => _buildComment(comment),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Resolution notes
          if (request.resolutionNotes != null &&
              request.resolutionNotes!.isNotEmpty) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Ghi chú giải quyết',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      request.resolutionNotes!,
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String label;

    switch (status) {
      case 'PENDING':
        color = Colors.orange;
        label = 'Chờ xử lý';
        break;
      case 'ASSIGNED':
        color = Colors.purple;
        label = 'Đã giao';
        break;
      case 'IN_PROGRESS':
        color = Colors.blue;
        label = 'Đang xử lý';
        break;
      case 'COMPLETED':
        color = Colors.green;
        label = 'Hoàn thành';
        break;
      case 'CANCELLED':
        color = Colors.red;
        label = 'Đã hủy';
        break;
      default:
        color = Colors.grey;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildPriorityBadge(String priority) {
    Color color;
    String label;

    switch (priority) {
      case 'LOW':
        color = Colors.grey;
        label = 'Thấp';
        break;
      case 'MEDIUM':
        color = Colors.blue;
        label = 'Trung bình';
        break;
      case 'HIGH':
        color = Colors.orange;
        label = 'Cao';
        break;
      case 'URGENT':
        color = Colors.red;
        label = 'Khẩn cấp';
        break;
      default:
        color = Colors.grey;
        label = priority;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildComment(Comment comment) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: comment.isStaff ? Colors.blue[50] : Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: comment.isStaff ? Colors.blue[200]! : Colors.grey[200]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                comment.isStaff ? Icons.person : Icons.account_circle,
                size: 16,
                color: comment.isStaff ? Colors.blue[700] : Colors.grey[700],
              ),
              const SizedBox(width: 8),
              Text(
                comment.isStaff ? 'Nhân viên' : 'Bạn',
                style: TextStyle(
                  fontWeight: FontWeight.w500,
                  color: comment.isStaff ? Colors.blue[700] : Colors.grey[700],
                  fontSize: 12,
                ),
              ),
              const Spacer(),
              Text(
                _formatDateTime(comment.createdAt),
                style: TextStyle(color: Colors.grey[500], fontSize: 10),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            comment.content,
            style: TextStyle(
              color: comment.isStaff ? Colors.blue[800] : Colors.grey[800],
              fontSize: 14,
            ),
          ),
          // Hiển thị hình ảnh trong comment nếu có
          if (comment.imageUrls.isNotEmpty) ...[
            Builder(
              builder: (context) {
                print(
                  'RequestDetailScreen: Displaying comment images: ${comment.imageUrls.length}',
                );
                print(
                  'RequestDetailScreen: Comment image URLs: ${comment.imageUrls}',
                );
                return Column(
                  children: [
                    const SizedBox(height: 8),
                    Text(
                      'Hình ảnh đính kèm:',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: comment.isStaff
                            ? Colors.blue[600]
                            : Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 4),
                    ImageGridWidget(
                      imageUrls: comment.imageUrls,
                      crossAxisCount: 2,
                    ),
                  ],
                );
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildErrorWidget(Object error, String requestId) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
          const SizedBox(height: 16),
          Text(
            'Có lỗi xảy ra',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            error.toString(),
            style: TextStyle(color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          // Show fallback data if available
          if (requestId.isNotEmpty) ...[
            Card(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text(
                      'Thông tin yêu cầu (ID: $requestId)',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Không thể tải chi tiết từ server. Có thể do:',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '• Server đang bảo trì\n• Yêu cầu không tồn tại\n• Lỗi kết nối mạng',
                      style: TextStyle(color: Colors.grey[500], fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton.icon(
                onPressed: () {
                  ref.invalidate(serviceRequestProvider(requestId));
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Thử lại'),
              ),
              const SizedBox(width: 16),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                icon: const Icon(Icons.arrow_back),
                label: const Text('Quay lại'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey[300],
                  foregroundColor: Colors.grey[700],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showCancelDialog(ServiceRequest request) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hủy yêu cầu'),
        content: const Text('Bạn có chắc muốn hủy yêu cầu này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Không'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              await _cancelRequest(request.id);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Có'),
          ),
        ],
      ),
    );
  }

  Future<void> _cancelRequest(String requestId) async {
    try {
      final repository = await ref.read(
        serviceRequestsRepositoryProvider.future,
      );
      await repository.cancelRequest(requestId);
      ref.invalidate(serviceRequestProvider(requestId));
      ref.invalidate(serviceRequestsProvider);

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Hủy yêu cầu thành công')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi khi hủy yêu cầu: $e')));
      }
    }
  }

  Future<void> _callStaff(String phoneNumber) async {
    final uri = Uri.parse('tel:$phoneNumber');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể gọi số điện thoại này')),
        );
      }
    }
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'MAINTENANCE':
        return Colors.blue;
      case 'CLEANING':
        return Colors.green;
      case 'SECURITY':
        return Colors.red;
      case 'UTILITY':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'MAINTENANCE':
        return Icons.build;
      case 'CLEANING':
        return Icons.cleaning_services;
      case 'SECURITY':
        return Icons.security;
      case 'UTILITY':
        return Icons.electrical_services;
      default:
        return Icons.settings;
    }
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')}/${dateTime.year} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
