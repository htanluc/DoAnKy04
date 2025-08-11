import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/auth_state.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bảng điều khiển'),
        actions: [
          IconButton(
            onPressed: () => ref.read(authStateProvider).logout(),
            icon: const Icon(Icons.logout),
            tooltip: 'Đăng xuất',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.water_drop),
              title: const Text('Quản lý chỉ số nước'),
              subtitle: const Text('Tạo/chỉnh sửa chỉ số hàng tháng'),
              onTap: () => context.go('/water-readings'),
            ),
          ),
          const SizedBox(height: 8),
          Card(
            child: ListTile(
              leading: const Icon(Icons.receipt_long),
              title: const Text('Hoá đơn'),
              subtitle: const Text('Xem và quản lý hoá đơn'),
              onTap: () {},
            ),
          ),
          const SizedBox(height: 16),
          Text('Vai trò: ${auth.roles.join(', ')}'),
        ],
      ),
    );
  }
}
