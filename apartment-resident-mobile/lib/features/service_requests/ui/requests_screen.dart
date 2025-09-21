import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/request.dart';
import '../providers/requests_providers.dart';
import 'create_request_screen.dart';
import 'request_detail_screen.dart';
import 'widgets/status_progress.dart';

class ServiceRequestsScreen extends ConsumerStatefulWidget {
  const ServiceRequestsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ServiceRequestsScreen> createState() =>
      _ServiceRequestsScreenState();
}

class _ServiceRequestsScreenState extends ConsumerState<ServiceRequestsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedStatus = 'all';
  String _selectedCategory = 'all';
  String _sortBy = 'date';

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
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final requestsAsync = ref.watch(serviceRequestsProvider);
    final filterState = ref.watch(serviceRequestsFilterProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Yêu cầu dịch vụ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(serviceRequestsProvider);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildStatsCard(),
          _buildFiltersCard(),
          Expanded(
            child: requestsAsync.when(
              data: (requests) => _buildRequestsList(requests, filterState),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => _buildErrorWidget(error),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _navigateToCreateRequest(),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildStatsCard() {
    return Consumer(
      builder: (context, ref, child) {
        final requestsAsync = ref.watch(filteredServiceRequestsProvider);

        return requestsAsync.when(
          data: (requests) {
            final stats = _getRequestStatistics(requests);
            return Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStatItem('Tổng', stats['total']!, Icons.list),
                  ),
                  Expanded(
                    child: _buildStatItem(
                      'Chờ xử lý',
                      stats['pending']!,
                      Icons.access_time,
                    ),
                  ),
                  Expanded(
                    child: _buildStatItem(
                      'Đang xử lý',
                      stats['inProgress']!,
                      Icons.build,
                    ),
                  ),
                  Expanded(
                    child: _buildStatItem(
                      'Hoàn thành',
                      stats['completed']!,
                      Icons.check_circle,
                    ),
                  ),
                ],
              ),
            );
          },
          loading: () => const SizedBox(height: 80),
          error: (_, __) => const SizedBox(height: 80),
        );
      },
    );
  }

  Widget _buildStatItem(String label, int count, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 24),
        const SizedBox(height: 4),
        Text(
          count.toString(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildFiltersCard() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            // Search bar
            TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Tìm kiếm...',
                prefixIcon: Icon(Icons.search, size: 20),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
              ),
              onChanged: (value) {
                ref
                    .read(serviceRequestsFilterProvider.notifier)
                    .setSearchTerm(value);
              },
            ),
            const SizedBox(height: 8),
            // Filter dropdowns - responsive layout
            LayoutBuilder(
              builder: (context, constraints) {
                final isWideScreen = constraints.maxWidth > 400;

                if (isWideScreen) {
                  // Wide screen: horizontal layout
                  return Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedStatus,
                          decoration: const InputDecoration(
                            labelText: 'Trạng thái',
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                          ),
                          isDense: true,
                          items: const [
                            DropdownMenuItem(
                              value: 'all',
                              child: Text('Tất cả'),
                            ),
                            DropdownMenuItem(
                              value: 'PENDING',
                              child: Text('Chờ xử lý'),
                            ),
                            DropdownMenuItem(
                              value: 'IN_PROGRESS',
                              child: Text('Đang xử lý'),
                            ),
                            DropdownMenuItem(
                              value: 'COMPLETED',
                              child: Text('Hoàn thành'),
                            ),
                            DropdownMenuItem(
                              value: 'CANCELLED',
                              child: Text('Đã hủy'),
                            ),
                          ],
                          onChanged: (value) {
                            setState(() {
                              _selectedStatus = value!;
                            });
                            ref
                                .read(serviceRequestsFilterProvider.notifier)
                                .setStatusFilter(value!);
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedCategory,
                          decoration: const InputDecoration(
                            labelText: 'Danh mục',
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                          ),
                          isDense: true,
                          items: const [
                            DropdownMenuItem(
                              value: 'all',
                              child: Text('Tất cả'),
                            ),
                            DropdownMenuItem(
                              value: 'ELECTRICITY',
                              child: Text('Điện'),
                            ),
                            DropdownMenuItem(
                              value: 'WATER',
                              child: Text('Nước'),
                            ),
                            DropdownMenuItem(
                              value: 'CLEANING',
                              child: Text('Vệ sinh'),
                            ),
                            DropdownMenuItem(
                              value: 'SECURITY',
                              child: Text('An ninh'),
                            ),
                            DropdownMenuItem(
                              value: 'HVAC',
                              child: Text('Điều hòa'),
                            ),
                            DropdownMenuItem(
                              value: 'ELEVATOR',
                              child: Text('Thang máy'),
                            ),
                            DropdownMenuItem(
                              value: 'GARDENING',
                              child: Text('Cây xanh'),
                            ),
                            DropdownMenuItem(
                              value: 'IT',
                              child: Text('Internet & IT'),
                            ),
                            DropdownMenuItem(
                              value: 'OTHER',
                              child: Text('Khác'),
                            ),
                          ],
                          onChanged: (value) {
                            setState(() {
                              _selectedCategory = value!;
                            });
                            ref
                                .read(serviceRequestsFilterProvider.notifier)
                                .setCategoryFilter(value!);
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _sortBy,
                          decoration: const InputDecoration(
                            labelText: 'Sắp xếp',
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                          ),
                          isDense: true,
                          items: const [
                            DropdownMenuItem(
                              value: 'date',
                              child: Text('Ngày'),
                            ),
                            DropdownMenuItem(
                              value: 'priority',
                              child: Text('Ưu tiên'),
                            ),
                          ],
                          onChanged: (value) {
                            setState(() {
                              _sortBy = value!;
                            });
                            ref
                                .read(serviceRequestsFilterProvider.notifier)
                                .setSortBy(value!);
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: _clearFilters,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                        ),
                        child: const Text(
                          'Xóa',
                          style: TextStyle(fontSize: 12),
                        ),
                      ),
                    ],
                  );
                } else {
                  // Narrow screen: vertical layout
                  return Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _selectedStatus,
                              decoration: const InputDecoration(
                                labelText: 'Trạng thái',
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                              ),
                              isDense: true,
                              items: const [
                                DropdownMenuItem(
                                  value: 'all',
                                  child: Text('Tất cả'),
                                ),
                                DropdownMenuItem(
                                  value: 'PENDING',
                                  child: Text('Chờ xử lý'),
                                ),
                                DropdownMenuItem(
                                  value: 'IN_PROGRESS',
                                  child: Text('Đang xử lý'),
                                ),
                                DropdownMenuItem(
                                  value: 'COMPLETED',
                                  child: Text('Hoàn thành'),
                                ),
                                DropdownMenuItem(
                                  value: 'CANCELLED',
                                  child: Text('Đã hủy'),
                                ),
                              ],
                              onChanged: (value) {
                                setState(() {
                                  _selectedStatus = value!;
                                });
                                ref
                                    .read(
                                      serviceRequestsFilterProvider.notifier,
                                    )
                                    .setStatusFilter(value!);
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _selectedCategory,
                              decoration: const InputDecoration(
                                labelText: 'Danh mục',
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                              ),
                              isDense: true,
                              items: const [
                                DropdownMenuItem(
                                  value: 'all',
                                  child: Text('Tất cả'),
                                ),
                                DropdownMenuItem(
                                  value: 'ELECTRICITY',
                                  child: Text('Điện'),
                                ),
                                DropdownMenuItem(
                                  value: 'WATER',
                                  child: Text('Nước'),
                                ),
                                DropdownMenuItem(
                                  value: 'CLEANING',
                                  child: Text('Vệ sinh'),
                                ),
                                DropdownMenuItem(
                                  value: 'SECURITY',
                                  child: Text('An ninh'),
                                ),
                                DropdownMenuItem(
                                  value: 'HVAC',
                                  child: Text('Điều hòa'),
                                ),
                                DropdownMenuItem(
                                  value: 'ELEVATOR',
                                  child: Text('Thang máy'),
                                ),
                                DropdownMenuItem(
                                  value: 'GARDENING',
                                  child: Text('Cây xanh'),
                                ),
                                DropdownMenuItem(
                                  value: 'IT',
                                  child: Text('Internet & IT'),
                                ),
                                DropdownMenuItem(
                                  value: 'OTHER',
                                  child: Text('Khác'),
                                ),
                              ],
                              onChanged: (value) {
                                setState(() {
                                  _selectedCategory = value!;
                                });
                                ref
                                    .read(
                                      serviceRequestsFilterProvider.notifier,
                                    )
                                    .setCategoryFilter(value!);
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _sortBy,
                              decoration: const InputDecoration(
                                labelText: 'Sắp xếp',
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                              ),
                              isDense: true,
                              items: const [
                                DropdownMenuItem(
                                  value: 'date',
                                  child: Text('Ngày'),
                                ),
                                DropdownMenuItem(
                                  value: 'priority',
                                  child: Text('Ưu tiên'),
                                ),
                              ],
                              onChanged: (value) {
                                setState(() {
                                  _sortBy = value!;
                                });
                                ref
                                    .read(
                                      serviceRequestsFilterProvider.notifier,
                                    )
                                    .setSortBy(value!);
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          TextButton(
                            onPressed: _clearFilters,
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                            ),
                            child: const Text(
                              'Xóa',
                              style: TextStyle(fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ],
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestsList(
    List<ServiceRequest> requests,
    ServiceRequestsFilterState filterState,
  ) {
    final filteredRequests = _applyFilters(requests, filterState);

    if (filteredRequests.isEmpty) {
      return _buildEmptyState();
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(serviceRequestsProvider);
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: filteredRequests.length,
        itemBuilder: (context, index) {
          final request = filteredRequests[index];
          return _buildRequestCard(request);
        },
      ),
    );
  }

  Widget _buildRequestCard(ServiceRequest request) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _navigateToRequestDetail(request.id),
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _getCategoryColor(request.category),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _getCategoryIcon(request.category),
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          request.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          '${request.categoryDisplayName} • ${_formatDate(request.createdAt)}',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _buildStatusBadge(request.status),
                ],
              ),
              const SizedBox(height: 12),
              // Description
              Text(
                request.description,
                style: TextStyle(color: Colors.grey[700], fontSize: 14),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              // Priority and images
              Row(
                children: [
                  _buildPriorityBadge(request.priority),
                  const Spacer(),
                  if (request.allImages.isNotEmpty)
                    Row(
                      children: [
                        const Icon(Icons.image, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          '${request.allImages.length} ảnh',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
              const SizedBox(height: 12),
              // Status progress (compact version)
              StatusProgressWidget(request: request, height: 80),
              // Action buttons for pending requests
              if (request.canBeCancelled) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _cancelRequest(request.id),
                        icon: const Icon(Icons.cancel, size: 16),
                        label: const Text('Hủy yêu cầu'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _editRequest(request.id),
                        icon: const Icon(Icons.edit, size: 16),
                        label: const Text('Chỉnh sửa'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.blue,
                          side: const BorderSide(color: Colors.blue),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
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
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
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
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'Không có yêu cầu nào',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tạo yêu cầu mới để bắt đầu',
            style: TextStyle(color: Colors.grey[500]),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _navigateToCreateRequest,
            icon: const Icon(Icons.add),
            label: const Text('Tạo yêu cầu mới'),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorWidget(Object error) {
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
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              ref.invalidate(serviceRequestsProvider);
            },
            icon: const Icon(Icons.refresh),
            label: const Text('Thử lại'),
          ),
        ],
      ),
    );
  }

  List<ServiceRequest> _applyFilters(
    List<ServiceRequest> requests,
    ServiceRequestsFilterState filterState,
  ) {
    var filtered = requests;

    // Search filter
    if (filterState.searchTerm.isNotEmpty) {
      filtered = filtered.where((request) {
        return request.title.toLowerCase().contains(
              filterState.searchTerm.toLowerCase(),
            ) ||
            request.description.toLowerCase().contains(
              filterState.searchTerm.toLowerCase(),
            );
      }).toList();
    }

    // Status filter
    if (filterState.statusFilter != 'all') {
      filtered = filtered
          .where((request) => request.status == filterState.statusFilter)
          .toList();
    }

    // Category filter
    if (filterState.categoryFilter != 'all') {
      filtered = filtered
          .where((request) => request.category == filterState.categoryFilter)
          .toList();
    }

    // Sort
    if (filterState.sortBy == 'date') {
      filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    } else if (filterState.sortBy == 'priority') {
      final priorityOrder = {'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1};
      filtered.sort((a, b) {
        final aPriority = priorityOrder[a.priority] ?? 0;
        final bPriority = priorityOrder[b.priority] ?? 0;
        return bPriority.compareTo(aPriority);
      });
    }

    return filtered;
  }

  Map<String, int> _getRequestStatistics(List<ServiceRequest> requests) {
    return {
      'total': requests.length,
      'pending': requests.where((r) => r.status == 'PENDING').length,
      'inProgress': requests.where((r) => r.status == 'IN_PROGRESS').length,
      'completed': requests.where((r) => r.status == 'COMPLETED').length,
      'cancelled': requests.where((r) => r.status == 'CANCELLED').length,
    };
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'ELECTRICITY':
        return Colors.amber;
      case 'WATER':
        return Colors.blue;
      case 'CLEANING':
        return Colors.green;
      case 'SECURITY':
        return Colors.red;
      case 'HVAC':
        return Colors.cyan;
      case 'ELEVATOR':
        return Colors.orange;
      case 'GARDENING':
        return Colors.lightGreen;
      case 'IT':
        return Colors.purple;
      case 'OTHER':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'ELECTRICITY':
        return Icons.electrical_services;
      case 'WATER':
        return Icons.water_drop;
      case 'CLEANING':
        return Icons.cleaning_services;
      case 'SECURITY':
        return Icons.security;
      case 'HVAC':
        return Icons.ac_unit;
      case 'ELEVATOR':
        return Icons.elevator;
      case 'GARDENING':
        return Icons.local_florist;
      case 'IT':
        return Icons.computer;
      case 'OTHER':
        return Icons.more_horiz;
      default:
        return Icons.settings;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  void _clearFilters() {
    setState(() {
      _selectedStatus = 'all';
      _selectedCategory = 'all';
      _sortBy = 'date';
    });
    _searchController.clear();
    ref.read(serviceRequestsFilterProvider.notifier).clearFilters();
  }

  void _navigateToCreateRequest() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const CreateRequestScreen()),
    );
  }

  void _navigateToRequestDetail(String requestId) {
    Navigator.of(context)
        .push(
          MaterialPageRoute(
            builder: (context) => RequestDetailScreen(requestId: requestId),
          ),
        )
        .then((_) {
          // Refresh the list when returning from detail screen
          ref.invalidate(filteredServiceRequestsProvider);
        });
  }

  Future<void> _cancelRequest(String requestId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận hủy'),
        content: const Text('Bạn có chắc chắn muốn hủy yêu cầu này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Không'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Có'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final repository = await ref.read(
          serviceRequestsRepositoryProvider.future,
        );
        await repository.cancelRequest(requestId);

        // Refresh the list
        ref.invalidate(filteredServiceRequestsProvider);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Hủy yêu cầu thành công')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Lỗi khi hủy yêu cầu: $e')));
        }
      }
    }
  }

  void _editRequest(String requestId) {
    // Navigate to edit screen (for now, navigate to create screen with pre-filled data)
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CreateRequestScreen(editRequestId: requestId),
      ),
    );
  }
}
