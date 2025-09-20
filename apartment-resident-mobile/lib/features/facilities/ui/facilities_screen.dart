import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/facility.dart';
import '../providers/facilities_providers.dart';
import 'facility_detail_screen.dart';
import 'widgets/facility_card.dart';
import 'widgets/facility_search_bar.dart';
import 'widgets/facility_filter_sheet.dart';

class FacilitiesScreen extends ConsumerStatefulWidget {
  const FacilitiesScreen({super.key});

  @override
  ConsumerState<FacilitiesScreen> createState() => _FacilitiesScreenState();
}

class _FacilitiesScreenState extends ConsumerState<FacilitiesScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  int _minCapacity = 0;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text;
      });
      ref.read(facilitiesSearchQueryProvider.notifier).state = _searchQuery;
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final facilitiesAsync = ref.watch(facilitiesProvider);
    final searchQuery = ref.watch(facilitiesSearchQueryProvider);
    final minCapacity = ref.watch(minCapacityProvider);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Đặt tiện ích',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1976D2), // FPT Blue
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () => _showFilterSheet(context),
            icon: const Icon(Icons.filter_list, color: Colors.white),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            color: const Color(0xFF1976D2),
            padding: const EdgeInsets.all(16),
            child: FacilitySearchBar(
              controller: _searchController,
              onChanged: (query) {
                ref.read(facilitiesSearchQueryProvider.notifier).state = query;
              },
            ),
          ),

          // Filter Chips
          if (searchQuery.isNotEmpty || minCapacity > 0)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  if (searchQuery.isNotEmpty)
                    Chip(
                      label: Text('Tìm: $searchQuery'),
                      deleteIcon: const Icon(Icons.close, size: 18),
                      onDeleted: () {
                        _searchController.clear();
                        ref.read(facilitiesSearchQueryProvider.notifier).state =
                            '';
                      },
                    ),
                  if (minCapacity > 0) ...[
                    const SizedBox(width: 8),
                    Chip(
                      label: Text('Sức chứa: ≥ $minCapacity'),
                      deleteIcon: const Icon(Icons.close, size: 18),
                      onDeleted: () {
                        ref.read(minCapacityProvider.notifier).state = 0;
                      },
                    ),
                  ],
                ],
              ),
            ),

          // Facilities List
          Expanded(
            child: facilitiesAsync.when(
              loading: () => _buildLoadingState(),
              error: (error, stackTrace) => _buildErrorState(error.toString()),
              data: (facilities) {
                final filteredFacilities = _filterFacilities(facilities);
                return _buildFacilitiesList(filteredFacilities);
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showMyBookings(context),
        icon: const Icon(Icons.calendar_today, color: Colors.white),
        label: const Text(
          'Đặt chỗ của tôi',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1976D2),
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF1976D2)),
          ),
          SizedBox(height: 16),
          Text(
            'Đang tải danh sách tiện ích...',
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Lỗi tải dữ liệu',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                ref.invalidate(facilitiesProvider);
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Thử lại'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1976D2),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFacilitiesList(List<Facility> facilities) {
    if (facilities.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.location_off, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text(
              'Không tìm thấy tiện ích nào',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(facilitiesProvider);
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: facilities.length,
        itemBuilder: (context, index) {
          final facility = facilities[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: FacilityCard(
              facility: facility,
              onTap: () => _navigateToFacilityDetail(context, facility),
            ),
          );
        },
      ),
    );
  }

  List<Facility> _filterFacilities(List<Facility> facilities) {
    List<Facility> filtered = facilities;

    // Filter by search query
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered.where((facility) {
        return facility.name.toLowerCase().contains(query) ||
            facility.description.toLowerCase().contains(query) ||
            facility.location.toLowerCase().contains(query);
      }).toList();
    }

    // Filter by capacity
    if (_minCapacity > 0) {
      filtered = filtered.where((facility) {
        return facility.capacity >= _minCapacity;
      }).toList();
    }

    return filtered;
  }

  void _navigateToFacilityDetail(BuildContext context, Facility facility) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FacilityDetailScreen(facility: facility),
      ),
    );
  }

  void _showFilterSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FacilityFilterSheet(
        onCapacityChanged: (capacity) {
          setState(() {
            _minCapacity = capacity;
          });
          ref.read(minCapacityProvider.notifier).state = capacity;
        },
        currentCapacity: _minCapacity,
      ),
    );
  }

  void _showMyBookings(BuildContext context) {
    // TODO: Navigate to my bookings screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tính năng đang được phát triển'),
        backgroundColor: Color(0xFF1976D2),
      ),
    );
  }
}
