import 'package:flutter/foundation.dart';
import '../models/dashboard_stats.dart';
import '../models/activity.dart';
import '../data/dashboard_repository.dart';

class DashboardProvider extends ChangeNotifier {
  final DashboardRepository _repository;

  DashboardProvider({DashboardRepository? repository})
    : _repository = repository ?? DashboardRepository();

  // State variables
  DashboardStats _stats = const DashboardStats(
    totalInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalAmount: 0,
    unreadAnnouncements: 0,
    upcomingEvents: 0,
    activeBookings: 0,
    supportRequests: 0,
  );

  List<RecentActivity> _recentActivities = [];
  ApartmentInfo _apartmentInfo = const ApartmentInfo();
  List<Activity> _activityLogs = [];

  bool _isLoading = false;
  bool _isRefreshing = false;
  String? _error;

  // Getters
  DashboardStats get stats => _stats;
  List<RecentActivity> get recentActivities => _recentActivities;
  ApartmentInfo get apartmentInfo => _apartmentInfo;
  List<Activity> get activityLogs => _activityLogs;
  bool get isLoading => _isLoading;
  bool get isRefreshing => _isRefreshing;
  String? get error => _error;

  // Load dashboard data
  Future<void> loadDashboardData() async {
    _setLoading(true);
    _clearError();

    try {
      final data = await _repository.getAllDashboardData();

      _stats = data['stats'] as DashboardStats;
      _recentActivities = data['activities'] as List<RecentActivity>;
      _apartmentInfo = data['apartment'] as ApartmentInfo;

      notifyListeners();
    } catch (e) {
      _setError('Không thể tải dữ liệu dashboard: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Refresh dashboard data
  Future<void> refreshDashboardData() async {
    _setRefreshing(true);
    _clearError();

    try {
      final data = await _repository.getAllDashboardData();

      _stats = data['stats'] as DashboardStats;
      _recentActivities = data['activities'] as List<RecentActivity>;
      _apartmentInfo = data['apartment'] as ApartmentInfo;

      notifyListeners();
    } catch (e) {
      _setError('Không thể làm mới dữ liệu: $e');
    } finally {
      _setRefreshing(false);
    }
  }

  // Load activity logs
  Future<void> loadActivityLogs({
    int page = 0,
    int size = 20,
    String? actionType,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final logs = await _repository.getActivityLogs(
        page: page,
        size: size,
        actionType: actionType,
        startDate: startDate,
        endDate: endDate,
      );

      if (page == 0) {
        _activityLogs = logs;
      } else {
        _activityLogs.addAll(logs);
      }

      notifyListeners();
    } catch (e) {
      _setError('Không thể tải nhật ký hoạt động: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Export activity logs
  Future<Uint8List?> exportActivityLogs({
    String? actionType,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      return await _repository.exportActivityLogs(
        actionType: actionType,
        startDate: startDate,
        endDate: endDate,
      );
    } catch (e) {
      _setError('Không thể xuất nhật ký hoạt động: $e');
      return null;
    }
  }

  // Clear error
  void clearError() {
    _clearError();
    notifyListeners();
  }

  // Private methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setRefreshing(bool refreshing) {
    _isRefreshing = refreshing;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }
}

// Provider cho stats cards
class StatsProvider extends ChangeNotifier {
  DashboardStats _stats = const DashboardStats(
    totalInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalAmount: 0,
    unreadAnnouncements: 0,
    upcomingEvents: 0,
    activeBookings: 0,
    supportRequests: 0,
  );

  bool _isLoading = false;

  DashboardStats get stats => _stats;
  bool get isLoading => _isLoading;

  void updateStats(DashboardStats stats) {
    _stats = stats;
    notifyListeners();
  }

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
}

// Provider cho activities
class ActivitiesProvider extends ChangeNotifier {
  List<RecentActivity> _activities = [];
  bool _isLoading = false;

  List<RecentActivity> get activities => _activities;
  bool get isLoading => _isLoading;

  void updateActivities(List<RecentActivity> activities) {
    _activities = activities;
    notifyListeners();
  }

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void addActivity(RecentActivity activity) {
    _activities.insert(0, activity);
    notifyListeners();
  }

  void removeActivity(String id) {
    _activities.removeWhere((activity) => activity.id == id);
    notifyListeners();
  }
}

// Provider cho apartment info
class ApartmentProvider extends ChangeNotifier {
  ApartmentInfo _apartmentInfo = const ApartmentInfo();
  bool _isLoading = false;

  ApartmentInfo get apartmentInfo => _apartmentInfo;
  bool get isLoading => _isLoading;

  void updateApartmentInfo(ApartmentInfo apartmentInfo) {
    _apartmentInfo = apartmentInfo;
    notifyListeners();
  }

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
}
