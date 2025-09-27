import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/facility_booking.dart';
import '../models/event_registration.dart';

class CheckinListPage extends StatefulWidget {
  const CheckinListPage({super.key});

  @override
  State<CheckinListPage> createState() => _CheckinListPageState();
}

class _CheckinListPageState extends State<CheckinListPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<FacilityBookingModel> _facilityBookings = [];
  List<EventRegistrationModel> _eventRegistrations = [];
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      print('[CheckinListPage] Loading data...');
      
      // Load both facility bookings and event registrations in parallel
      final results = await Future.wait([
        ApiService.getFacilityBookingsForCheckIn(),
        ApiService.getEventRegistrationsForCheckIn(),
      ]);

      print('[CheckinListPage] Raw results: $results');

      final facilityBookingsData =
          (results[0] as List).cast<Map<String, dynamic>>();
      final eventRegistrationsData =
          (results[1] as List).cast<Map<String, dynamic>>();

      print('[CheckinListPage] Facility bookings count: ${facilityBookingsData.length}');
      print('[CheckinListPage] Event registrations count: ${eventRegistrationsData.length}');

      setState(() {
        _facilityBookings = facilityBookingsData
            .map((data) => FacilityBookingModel.fromJson(data))
            .toList();
        _eventRegistrations = eventRegistrationsData
            .map((data) => EventRegistrationModel.fromJson(data))
            .toList();
        _loading = false;
      });
      
      print('[CheckinListPage] Final counts - Facilities: ${_facilityBookings.length}, Events: ${_eventRegistrations.length}');
    } catch (e) {
      print('[CheckinListPage] Error loading data: $e');
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _checkInFacility(int bookingId) async {
    try {
      final result = await ApiService.checkInFacility(bookingId);
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result), backgroundColor: Colors.green),
      );

      // Refresh data
      await _loadData();
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _checkInEvent(int registrationId) async {
    try {
      final result = await ApiService.checkInEvent(registrationId);
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result), backgroundColor: Colors.green),
      );

      // Refresh data
      await _loadData();
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Check-in'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.business), text: 'Tiện ích'),
            Tab(icon: Icon(Icons.event), text: 'Sự kiện'),
          ],
        ),
        actions: [
          IconButton(onPressed: _loadData, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error, size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      Text('Lỗi: $_error'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadData,
                        child: const Text('Thử lại'),
                      ),
                    ],
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildFacilityBookingsTab(),
                    _buildEventRegistrationsTab(),
                  ],
                ),
    );
  }

  Widget _buildFacilityBookingsTab() {
    print('[CheckinListPage] Building facility bookings tab. Count: ${_facilityBookings.length}');
    if (_facilityBookings.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.business, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Không có tiện ích nào cần check-in'),
            SizedBox(height: 8),
            Text('(Backend trả về danh sách rỗng)', style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: _facilityBookings.length,
      itemBuilder: (context, index) {
        final booking = _facilityBookings[index];
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 4),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: booking.canCheckIn ? Colors.green : Colors.grey,
              child: Icon(Icons.business, color: Colors.white),
            ),
            title: Text(booking.facilityName),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Cư dân: ${booking.userName ?? 'N/A'}'),
                Text('Thời gian: ${_formatDateTime(booking.startTime)}'),
                Text('Trạng thái: ${_getStatusText(booking.status)}'),
                if (booking.checkedInCount > 0)
                  Text(
                    'Đã check-in: ${booking.checkedInCount}/${booking.maxCheckins}',
                  ),
              ],
            ),
            trailing: booking.canCheckIn
                ? ElevatedButton(
                    onPressed: () => _checkInFacility(booking.id),
                    child: const Text('Check-in'),
                  )
                : const Text(
                    'Không thể check-in',
                    style: TextStyle(color: Colors.grey),
                  ),
            isThreeLine: true,
          ),
        );
      },
    );
  }

  Widget _buildEventRegistrationsTab() {
    if (_eventRegistrations.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Không có sự kiện nào cần check-in'),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: _eventRegistrations.length,
      itemBuilder: (context, index) {
        final registration = _eventRegistrations[index];
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 4),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: registration.checkedIn
                  ? Colors.green
                  : registration.canCheckIn
                      ? Colors.blue
                      : Colors.grey,
              child: Icon(
                registration.checkedIn ? Icons.check : Icons.event,
                color: Colors.white,
              ),
            ),
            title: Text(registration.eventTitle),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Cư dân: ${registration.userName ?? 'N/A'}'),
                Text('Thời gian: ${_formatDateTime(registration.startTime)}'),
                Text('Địa điểm: ${registration.eventLocation ?? 'N/A'}'),
                Text(
                  'Trạng thái: ${registration.checkedIn ? 'Đã check-in' : _getStatusText(registration.status)}',
                ),
                if (registration.checkedIn && registration.checkedInAt != null)
                  Text(
                    'Check-in lúc: ${_formatDateTime(registration.checkedInAt!)}',
                  ),
              ],
            ),
            trailing: registration.checkedIn
                ? const Text(
                    'Đã check-in',
                    style: TextStyle(color: Colors.green),
                  )
                : registration.canCheckIn
                    ? ElevatedButton(
                        onPressed: () => _checkInEvent(registration.id),
                        child: const Text('Check-in'),
                      )
                    : const Text(
                        'Không thể check-in',
                        style: TextStyle(color: Colors.grey),
                      ),
            isThreeLine: true,
          ),
        );
      },
    );
  }

  String _formatDateTime(String dateTimeString) {
    try {
      final dateTime = DateTime.parse(dateTimeString);
      return '${dateTime.day}/${dateTime.month}/${dateTime.year} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateTimeString;
    }
  }

  String _getStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'REGISTERED':
        return 'Đã đăng ký';
      default:
        return status;
    }
  }
}
