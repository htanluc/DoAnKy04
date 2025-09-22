import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/dashboard_stats.dart';
import '../data/dashboard_repository.dart';

// Repository provider
final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository();
});

// Dashboard stats provider
final dashboardStatsProvider = FutureProvider<DashboardStats>((ref) async {
  final repository = ref.read(dashboardRepositoryProvider);
  return await repository.getDashboardStats();
});

// Recent activities provider
final recentActivitiesProvider = FutureProvider<List<RecentActivity>>((
  ref,
) async {
  final repository = ref.read(dashboardRepositoryProvider);
  return await repository.getRecentActivities();
});

// Apartment info provider
final apartmentInfoProvider = FutureProvider<ApartmentInfo>((ref) async {
  final repository = ref.read(dashboardRepositoryProvider);
  return await repository.getMyApartment();
});

// Combined dashboard data provider
final dashboardDataProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final stats = await ref.watch(dashboardStatsProvider.future);
  final activities = await ref.watch(recentActivitiesProvider.future);
  final apartmentInfo = await ref.watch(apartmentInfoProvider.future);

  return {
    'stats': stats,
    'activities': activities,
    'apartmentInfo': apartmentInfo,
  };
});
