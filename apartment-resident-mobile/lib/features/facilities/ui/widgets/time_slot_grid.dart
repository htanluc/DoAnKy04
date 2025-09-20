import 'package:flutter/material.dart';
import '../../models/availability.dart';

class TimeSlotGrid extends StatefulWidget {
  final FacilityAvailability availability;
  final Function(List<TimeSlot>) onSlotsSelected;
  final List<TimeSlot>? selectedSlots;

  const TimeSlotGrid({
    super.key,
    required this.availability,
    required this.onSlotsSelected,
    this.selectedSlots,
  });

  @override
  State<TimeSlotGrid> createState() => _TimeSlotGridState();
}

class _TimeSlotGridState extends State<TimeSlotGrid> {
  List<TimeSlot> _selectedSlots = [];

  @override
  void initState() {
    super.initState();
    _selectedSlots = widget.selectedSlots ?? [];
  }

  void _toggleSlot(TimeSlot slot) {
    setState(() {
      if (_selectedSlots.contains(slot)) {
        _selectedSlots.remove(slot);
      } else {
        // Kiểm tra xem slot có liền kề với các slot đã chọn không
        if (_canAddSlot(slot)) {
          _selectedSlots.add(slot);
          _selectedSlots.sort((a, b) => a.startTime.compareTo(b.startTime));
        }
      }
      widget.onSlotsSelected(_selectedSlots);
    });
  }

  bool _canAddSlot(TimeSlot newSlot) {
    if (_selectedSlots.isEmpty) return true;

    // Kiểm tra xem có slot nào liền kề không
    for (final selectedSlot in _selectedSlots) {
      if (_areAdjacentSlots(selectedSlot, newSlot)) {
        return true;
      }
    }

    return false;
  }

  bool _areAdjacentSlots(TimeSlot slot1, TimeSlot slot2) {
    // Kiểm tra xem 2 slots có liền kề nhau không (cùng ngày và giờ liền nhau)
    final start1 = DateTime.parse(slot1.startTime);
    final end1 = DateTime.parse(slot1.endTime);
    final start2 = DateTime.parse(slot2.startTime);
    final end2 = DateTime.parse(slot2.endTime);

    // Slot1 kết thúc khi slot2 bắt đầu, hoặc ngược lại
    return end1.isAtSameMomentAs(start2) || end2.isAtSameMomentAs(start1);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.availability.timeSlots.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            children: [
              Icon(Icons.schedule, size: 48, color: Colors.grey),
              SizedBox(height: 8),
              Text(
                'Không có khung giờ nào',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Summary
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.blue[200]!),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: Colors.blue[700], size: 20),
              const SizedBox(width: 8),
              Text(
                '${widget.availability.availableSlots} / ${widget.availability.totalSlots} khung giờ còn trống',
                style: TextStyle(
                  color: Colors.blue[700],
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Hiển thị thông tin slots đã chọn
        if (_selectedSlots.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.blue.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Đã chọn ${_selectedSlots.length} khung giờ:',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.blue.shade700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${_formatTime(_selectedSlots.first.startTime)} - ${_formatTime(_selectedSlots.last.endTime)}',
                  style: TextStyle(color: Colors.blue.shade600),
                ),
                Text(
                  'Tổng thời gian: ${_selectedSlots.length} giờ',
                  style: TextStyle(color: Colors.blue.shade600),
                ),
              ],
            ),
          ),

        // Time slots grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            childAspectRatio: 2.5,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: widget.availability.timeSlots.length,
          itemBuilder: (context, index) {
            final slot = widget.availability.timeSlots[index];
            return _buildTimeSlotCard(slot);
          },
        ),
      ],
    );
  }

  Widget _buildTimeSlotCard(TimeSlot slot) {
    Color backgroundColor;
    Color textColor;
    Color borderColor;
    bool isEnabled = slot.isAvailable && !slot.isBooked;
    bool isSelected = _selectedSlots.contains(slot);

    if (slot.isBooked) {
      backgroundColor = Colors.red[50]!;
      textColor = Colors.red[700]!;
      borderColor = Colors.red[300]!;
    } else if (isSelected) {
      backgroundColor = Colors.blue[50]!;
      textColor = Colors.blue[700]!;
      borderColor = Colors.blue[500]!;
    } else if (slot.isAvailable) {
      backgroundColor = Colors.green[50]!;
      textColor = Colors.green[700]!;
      borderColor = Colors.green[300]!;
    } else {
      backgroundColor = Colors.grey[100]!;
      textColor = Colors.grey[600]!;
      borderColor = Colors.grey[300]!;
    }

    return InkWell(
      onTap: isEnabled ? () => _toggleSlot(slot) : null,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: borderColor, width: isSelected ? 2 : 1),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Flexible(
                child: Text(
                  _formatTime(slot.startTime),
                  style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Text('-', style: TextStyle(color: textColor, fontSize: 8)),
              Flexible(
                child: Text(
                  _formatTime(slot.endTime),
                  style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (slot.isBooked)
                Icon(Icons.lock, size: 8, color: textColor)
              else if (!slot.isAvailable)
                Icon(Icons.block, size: 8, color: textColor),
            ],
          ),
        ),
      ),
    );
  }

  String _formatTime(String timeString) {
    try {
      final time = DateTime.parse(timeString);
      return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return timeString;
    }
  }
}
