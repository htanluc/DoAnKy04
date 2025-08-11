import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/providers/water_readings_provider.dart';

class WaterReadingsScreen extends ConsumerWidget {
  const WaterReadingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(waterReadingsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chỉ số nước'),
        actions: [
          IconButton(
            onPressed: () => ref.read(waterReadingsProvider.notifier).refresh(),
            icon: const Icon(Icons.refresh),
            tooltip: 'Tải lại',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openCreateDialog(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Thêm'),
      ),
      body: state.when(
        data: (items) => ListView.separated(
          itemCount: items.length,
          separatorBuilder: (_, __) => const Divider(height: 1),
          itemBuilder: (context, index) {
            final item = items[index];
            return ListTile(
              leading: const Icon(Icons.water_drop_outlined),
              title: Text(item.apartmentName ?? 'Căn hộ #${item.apartmentId}'),
              subtitle: Text(
                '${item.readingMonth ?? ''} | ${item.currentReading ?? 0} m³',
              ),
              trailing: Text('${item.totalAmount ?? 0} đ'),
              onTap: () => _openEditDialog(context, ref, item),
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Lỗi: $e')),
      ),
    );
  }

  void _openCreateDialog(BuildContext context, WidgetRef ref) {
    _openEditDialog(context, ref, null);
  }

  void _openEditDialog(BuildContext context, WidgetRef ref, dynamic item) {
    final monthController = TextEditingController(
      text: item?.readingMonth ?? '',
    );
    final currentController = TextEditingController(
      text: (item?.currentReading ?? '').toString(),
    );
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            bottom: MediaQuery.of(context).viewInsets.bottom + 16,
            top: 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                item == null ? 'Thêm chỉ số' : 'Cập nhật chỉ số',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: monthController,
                decoration: const InputDecoration(labelText: 'Tháng (yyyy-MM)'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: currentController,
                decoration: const InputDecoration(
                  labelText: 'Chỉ số hiện tại (m³)',
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    Navigator.of(context).pop();
                    await ref
                        .read(waterReadingsProvider.notifier)
                        .saveReading(
                          id: item?.id,
                          readingMonth: monthController.text.trim(),
                          currentReading:
                              double.tryParse(currentController.text.trim()) ??
                              0,
                          apartmentId: item?.apartmentId,
                        );
                  },
                  child: const Text('Lưu'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
