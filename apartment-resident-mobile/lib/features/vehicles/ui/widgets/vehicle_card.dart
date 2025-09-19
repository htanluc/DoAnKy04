import 'package:flutter/material.dart';
import '../../models/vehicle.dart';
import 'vehicle_image_viewer.dart';
import '../../../../core/api/api_service.dart';

class VehicleCard extends StatelessWidget {
  const VehicleCard({super.key, required this.v, this.priority});

  final VehicleModel v;
  final int? priority;

  Color _statusColor(VehicleStatus s) {
    switch (s) {
      case VehicleStatus.PENDING:
        return const Color(0xFFF59E0B);
      case VehicleStatus.APPROVED:
      case VehicleStatus.ACTIVE:
        return const Color(0xFF10B981);
      case VehicleStatus.REJECTED:
      case VehicleStatus.EXPIRED:
        return const Color(0xFFEF4444);
      case VehicleStatus.INACTIVE:
        return const Color(0xFF6B7280);
    }
  }

  String _statusText(VehicleStatus s) {
    switch (s) {
      case VehicleStatus.PENDING:
        return 'Chờ duyệt';
      case VehicleStatus.APPROVED:
        return 'Đã duyệt';
      case VehicleStatus.REJECTED:
        return 'Từ chối';
      case VehicleStatus.ACTIVE:
        return 'Đang hoạt động';
      case VehicleStatus.INACTIVE:
        return 'Không hoạt động';
      case VehicleStatus.EXPIRED:
        return 'Hết hạn';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (priority != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE6F2FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Ưu tiên #$priority',
                      style: const TextStyle(color: Color(0xFF0066CC)),
                    ),
                  ),
                if (priority != null) const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    v.licensePlate,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: _statusColor(v.status),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _statusText(v.status),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('${v.brand ?? ''} ${v.model ?? ''} - ${v.color ?? ''}'.trim()),
            const SizedBox(height: 4),
            Text('Căn hộ: ${v.apartmentUnitNumber ?? v.apartmentId}'),
            const SizedBox(height: 8),
            Text('Phí tháng: ${v.monthlyFee.toString()} đ'),
            const SizedBox(height: 8),
            Text('Đăng ký: ${v.createdAt}'),
            const SizedBox(height: 8),
            if (v.imageUrls.isNotEmpty)
              SizedBox(
                height: 84,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemBuilder: (context, index) {
                    final originalUrl = v.imageUrls[index];
                    final url = ApiService.normalizeFileUrl(originalUrl);
                    // Debug logging
                    print('[VehicleCard] Original URL: $originalUrl');
                    print('[VehicleCard] Normalized URL: $url');
                    return GestureDetector(
                      onTap: () {
                        // Normalize all URLs for the image viewer
                        final normalizedUrls = v.imageUrls
                            .map((url) => ApiService.normalizeFileUrl(url))
                            .toList();
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => VehicleImageViewer(
                              images: normalizedUrls,
                              initialIndex: index,
                            ),
                          ),
                        );
                      },
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          url,
                          width: 120,
                          height: 84,
                          fit: BoxFit.cover,
                          errorBuilder: (c, e, s) => Container(
                            width: 120,
                            height: 84,
                            color: const Color(0xFFE5E7EB),
                            alignment: Alignment.center,
                            child: const Icon(Icons.broken_image),
                          ),
                        ),
                      ),
                    );
                  },
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemCount: v.imageUrls.length,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
