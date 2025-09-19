import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/vehicle_type.dart';
import '../../providers/vehicles_providers.dart';
import 'images_picker.dart';

class VehicleForm extends ConsumerStatefulWidget {
  const VehicleForm({super.key});

  @override
  ConsumerState<VehicleForm> createState() => _VehicleFormState();
}

class _VehicleFormState extends ConsumerState<VehicleForm> {
  final _formKey = GlobalKey<FormState>();
  final _license = TextEditingController();
  String? _vehicleType;
  int? _apartmentId;
  final _brand = TextEditingController();
  final _model = TextEditingController();
  final _color = TextEditingController();
  List<XFile> _images = const [];
  bool _submitting = false;

  @override
  void dispose() {
    _license.dispose();
    _brand.dispose();
    _model.dispose();
    _color.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final typesAsync = ref.watch(vehicleTypesProvider);
    final apartmentsAsync = ref.watch(myApartmentsProvider);
    final repo = ref.watch(vehiclesRepositoryProvider);

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _license,
            decoration: const InputDecoration(labelText: 'Biển số xe *'),
            validator: (v) =>
                (v == null || v.trim().isEmpty) ? 'Bắt buộc' : null,
          ),
          const SizedBox(height: 12),
          typesAsync.when(
            data: (types) => DropdownButtonFormField<String>(
              value: _vehicleType,
              items: [
                for (final VehicleTypeModel t in types)
                  DropdownMenuItem(
                    value: t.value,
                    child: Text('${t.displayName} - ${t.monthlyFee}/tháng'),
                  ),
              ],
              onChanged: (v) => setState(() => _vehicleType = v),
              decoration: const InputDecoration(
                labelText: 'Loại phương tiện *',
              ),
              validator: (v) => (v == null || v.isEmpty) ? 'Bắt buộc' : null,
            ),
            loading: () => const LinearProgressIndicator(minHeight: 2),
            error: (e, _) => Text('Lỗi tải loại xe: $e'),
          ),
          const SizedBox(height: 12),
          apartmentsAsync.when(
            data: (aps) => DropdownButtonFormField<int>(
              value: _apartmentId,
              items: [
                for (final a in aps)
                  DropdownMenuItem(
                    value: a['id'] as int,
                    child: Text('${a['unitNumber']} - Tòa ${a['buildingId']}'),
                  ),
              ],
              onChanged: (v) => setState(() => _apartmentId = v),
              decoration: const InputDecoration(labelText: 'Căn hộ *'),
              validator: (v) => (v == null) ? 'Bắt buộc' : null,
            ),
            loading: () => const LinearProgressIndicator(minHeight: 2),
            error: (e, _) => Text('Lỗi tải căn hộ: $e'),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _brand,
            decoration: const InputDecoration(labelText: 'Hãng xe'),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _model,
            decoration: const InputDecoration(labelText: 'Dòng xe'),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _color,
            decoration: const InputDecoration(labelText: 'Màu sắc'),
          ),
          const SizedBox(height: 12),
          const Text('Hình ảnh (1-5 ảnh, < 5MB)'),
          const SizedBox(height: 8),
          ImagesPicker(maxImages: 5, onPicked: (files) => _images = files),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _submitting
                ? null
                : () async {
                    if (!_formKey.currentState!.validate()) return;
                    if (_images.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Vui lòng chọn ít nhất 1 ảnh'),
                        ),
                      );
                      return;
                    }
                    // Size/Type validation basic (image_picker ensures image/*)
                    setState(() => _submitting = true);
                    try {
                      final urls = await repo.uploadImagesFromPicker(_images);
                      await repo.createVehicle(
                        licensePlate: _license.text.trim(),
                        vehicleType: _vehicleType!,
                        apartmentId: _apartmentId!,
                        brand: _brand.text.trim(),
                        model: _model.text.trim(),
                        color: _color.text.trim(),
                        imageUrls: urls,
                      );
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Đăng ký xe thành công')),
                      );
                    } catch (e) {
                      if (!mounted) return;
                      ScaffoldMessenger.of(
                        context,
                      ).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
                    } finally {
                      if (mounted) setState(() => _submitting = false);
                    }
                  },
            child: Text(_submitting ? 'Đang đăng ký...' : 'Đăng ký xe'),
          ),
        ],
      ),
    );
  }
}
