import 'package:flutter/material.dart';

class FacilityFilterSheet extends StatefulWidget {
  final Function(int) onCapacityChanged;
  final int currentCapacity;

  const FacilityFilterSheet({
    super.key,
    required this.onCapacityChanged,
    required this.currentCapacity,
  });

  @override
  State<FacilityFilterSheet> createState() => _FacilityFilterSheetState();
}

class _FacilityFilterSheetState extends State<FacilityFilterSheet> {
  late int _selectedCapacity;

  @override
  void initState() {
    super.initState();
    _selectedCapacity = widget.currentCapacity;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text(
                  'Bộ lọc',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _selectedCapacity = 0;
                    });
                    widget.onCapacityChanged(0);
                  },
                  child: const Text('Xóa tất cả'),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Capacity Filter
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Sức chứa tối thiểu',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 16),

                // Capacity options
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _buildCapacityChip('Tất cả', 0),
                    _buildCapacityChip('1-10 người', 1),
                    _buildCapacityChip('11-20 người', 11),
                    _buildCapacityChip('21-50 người', 21),
                    _buildCapacityChip('51-100 người', 51),
                    _buildCapacityChip('Trên 100 người', 101),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Apply Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  widget.onCapacityChanged(_selectedCapacity);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1976D2),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Áp dụng bộ lọc',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ),

          // Safe area padding
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }

  Widget _buildCapacityChip(String label, int capacity) {
    final isSelected = _selectedCapacity == capacity;

    return InkWell(
      onTap: () {
        setState(() {
          _selectedCapacity = capacity;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1976D2) : Colors.grey[100],
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF1976D2) : Colors.grey[300]!,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey[700],
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
