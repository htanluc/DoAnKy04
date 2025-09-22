import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class DashboardBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const DashboardBottomNavigation({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                icon: FontAwesomeIcons.house,
                label: 'Trang chủ',
                index: 0,
                isActive: currentIndex == 0,
              ),
              _buildNavItem(
                icon: FontAwesomeIcons.receipt,
                label: 'Hóa đơn',
                index: 1,
                isActive: currentIndex == 1,
              ),
              _buildNavItem(
                icon: FontAwesomeIcons.calendarAlt,
                label: 'Sự kiện',
                index: 2,
                isActive: currentIndex == 2,
              ),
              _buildNavItem(
                icon: FontAwesomeIcons.building,
                label: 'Tiện ích',
                index: 3,
                isActive: currentIndex == 3,
              ),
              _buildNavItem(
                icon: FontAwesomeIcons.car,
                label: 'Xe',
                index: 4,
                isActive: currentIndex == 4,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required int index,
    required bool isActive,
  }) {
    return GestureDetector(
      onTap: () => onTap(index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive
              ? const Color(0xFF3B82F6).withOpacity(0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            FaIcon(
              icon,
              color: isActive
                  ? const Color(0xFF3B82F6)
                  : const Color(0xFF64748B),
              size: 20,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isActive
                    ? const Color(0xFF3B82F6)
                    : const Color(0xFF64748B),
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Floating Action Button cho thao tác nhanh
class DashboardFloatingActionButton extends StatelessWidget {
  final VoidCallback onPressed;

  const DashboardFloatingActionButton({Key? key, required this.onPressed})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: onPressed,
      backgroundColor: const Color(0xFF3B82F6),
      foregroundColor: Colors.white,
      elevation: 4,
      child: const FaIcon(FontAwesomeIcons.plus, size: 20),
    );
  }
}
