import 'package:flutter/material.dart';
import '../../models/facility.dart';

class FacilityCard extends StatelessWidget {
  final Facility facility;
  final VoidCallback? onTap;

  const FacilityCard({super.key, required this.facility, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header với tên và badge
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          facility.name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          facility.description,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildCapacityBadge(facility),
                ],
              ),

              const SizedBox(height: 12),

              // Thông tin chi tiết
              Row(
                children: [
                  _buildInfoItem(
                    icon: Icons.location_on,
                    text: facility.location,
                    color: Colors.red,
                  ),
                  const SizedBox(width: 16),
                  _buildInfoItem(
                    icon: Icons.people,
                    text: facility.capacityType == 'GROUP'
                        ? '${facility.capacity} nhóm (${facility.groupSize} người/nhóm)'
                        : '${facility.capacity} người',
                    color: Colors.blue,
                  ),
                ],
              ),

              const SizedBox(height: 8),
              _buildInfoItem(
                icon: Icons.attach_money,
                text: facility.usageFee > 0
                    ? '${facility.usageFee.toStringAsFixed(0)} VNĐ/giờ'
                    : 'Miễn phí',
                color: facility.usageFee > 0 ? Colors.green : Colors.blue,
              ),

              const SizedBox(height: 16),

              // Action button
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: onTap,
                      icon: const Icon(Icons.calendar_today, size: 18),
                      label: const Text('Đặt chỗ'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1976D2),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCapacityBadge(Facility facility) {
    final capacity = facility.capacity;
    final capacityType = facility.capacityType ?? 'INDIVIDUAL';
    final groupSize = facility.groupSize;

    Color badgeColor;
    String label;

    if (capacityType == 'GROUP') {
      // Logic cho nhóm người
      if (capacity <= 5) {
        badgeColor = Colors.green;
        label = 'Nhỏ';
      } else if (capacity <= 10) {
        badgeColor = Colors.orange;
        label = 'Trung bình';
      } else {
        badgeColor = Colors.blue;
        label = 'Lớn';
      }
    } else {
      // Logic cho cá nhân
      if (capacity <= 20) {
        badgeColor = Colors.green;
        label = 'Nhỏ';
      } else if (capacity <= 50) {
        badgeColor = Colors.orange;
        label = 'Trung bình';
      } else {
        badgeColor = Colors.blue;
        label = 'Lớn';
      }
    }

    final displayText = capacityType == 'GROUP'
        ? '$label ($capacity nhóm)'
        : '$label ($capacity người)';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: badgeColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: badgeColor.withOpacity(0.3)),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: badgeColor,
        ),
      ),
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String text,
    required Color color,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            text,
            style: TextStyle(fontSize: 14, color: Colors.grey[700]),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
