# Dashboard Feature

## Tổng quan

Dashboard feature cung cấp giao diện tổng quan cho cư dân căn hộ với các thống kê, hoạt động gần đây và thao tác nhanh.

## Cấu trúc

```
lib/features/dashboard/
├── data/
│   ├── dashboard_api.dart          # API client
│   └── dashboard_repository.dart   # Repository pattern
├── models/
│   ├── dashboard_stats.dart        # Models cho stats và activities
│   └── activity.dart              # Models cho activity logs
├── providers/
│   └── dashboard_providers.dart   # State management
├── ui/
│   ├── dashboard_screen.dart      # Màn hình chính
│   └── widgets/
│       ├── stats_grid.dart        # Grid hiển thị thống kê
│       ├── activity_list.dart     # Danh sách hoạt động
│       └── quick_actions.dart     # Thao tác nhanh
└── dashboard.dart                 # Export file
```

## API Endpoints

- `GET /dashboard/stats` - Lấy thống kê dashboard
- `GET /dashboard/activities` - Lấy hoạt động gần đây
- `GET /apartments/my` - Lấy thông tin căn hộ
- `GET /activity-logs/my` - Lấy nhật ký hoạt động chi tiết
- `GET /activity-logs/my/export` - Xuất nhật ký hoạt động

## Models

### DashboardStats
```dart
class DashboardStats {
  final int totalInvoices;           // Tổng hóa đơn
  final int pendingInvoices;         // Hóa đơn chờ thanh toán
  final int overdueInvoices;         // Hóa đơn quá hạn
  final double totalAmount;          // Tổng số tiền
  final int unreadAnnouncements;     // Thông báo chưa đọc
  final int upcomingEvents;          // Sự kiện sắp tới
  final int activeBookings;          // Đặt chỗ đang hoạt động
  final int supportRequests;         // Yêu cầu hỗ trợ
}
```

### RecentActivity
```dart
class RecentActivity {
  final String id;
  final ActivityType type;           // Loại hoạt động
  final String title;                // Tiêu đề
  final String description;          // Mô tả
  final String timestamp;            // Thời gian
  final String? status;              // Trạng thái
}
```

### ApartmentInfo
```dart
class ApartmentInfo {
  final String? apartmentNumber;     // Số căn hộ
  final String? buildingName;        // Tên tòa nhà
  final double? area;                // Diện tích
  final int? bedrooms;               // Số phòng ngủ
  final int? floor;                  // Tầng
}
```

## Sử dụng

### 1. Thêm Provider vào app
```dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => DashboardProvider()),
  ],
  child: MyApp(),
)
```

### 2. Sử dụng Dashboard Screen
```dart
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DashboardScreen(),
    );
  }
}
```

### 3. Sử dụng các widgets riêng lẻ
```dart
// Stats Grid
StatsGrid(
  stats: dashboardStats,
  isLoading: false,
)

// Activity List
ActivityList(
  activities: recentActivities,
  isLoading: false,
  onViewAll: () => Navigator.pushNamed(context, '/activity-logs'),
  onActivityTap: (activity) => handleActivityTap(activity),
)

// Quick Actions
QuickActions(
  onActionTap: (action) => handleQuickAction(action),
)
```

## State Management

### DashboardProvider
- `loadDashboardData()` - Tải tất cả dữ liệu dashboard
- `refreshDashboardData()` - Làm mới dữ liệu
- `loadActivityLogs()` - Tải nhật ký hoạt động
- `exportActivityLogs()` - Xuất nhật ký hoạt động

### Các Provider khác
- `StatsProvider` - Quản lý thống kê
- `ActivitiesProvider` - Quản lý hoạt động
- `ApartmentProvider` - Quản lý thông tin căn hộ

## Tính năng

### 1. Stats Cards
- Hiển thị thống kê với gradient background
- Animation hover và scale
- Loading skeleton

### 2. Activity Feed
- Danh sách hoạt động gần đây
- Icons theo loại hoạt động
- Status badges
- Pull-to-refresh

### 3. Quick Actions
- 4 thao tác chính: Hóa đơn, Đặt tiện ích, Yêu cầu dịch vụ, Thông báo
- Navigation đến các màn hình tương ứng

### 4. Apartment Info
- Thông tin căn hộ chi tiết
- Layout responsive

## Styling

- Sử dụng Material Design 3
- Gradient backgrounds
- Card elevation và shadows
- Responsive layout
- Animation và transitions

## Error Handling

- Fallback data khi API lỗi
- Error states với retry button
- Loading states với skeleton
- Toast notifications cho actions

## Testing

```dart
// Test DashboardProvider
testWidgets('Dashboard loads data correctly', (tester) async {
  await tester.pumpWidget(
    ChangeNotifierProvider(
      create: (_) => DashboardProvider(),
      child: MaterialApp(home: DashboardScreen()),
    ),
  );
  
  expect(find.byType(CircularProgressIndicator), findsOneWidget);
  await tester.pumpAndSettle();
  expect(find.byType(StatsGrid), findsOneWidget);
});
```
