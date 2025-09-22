import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'bottom_navigation.dart';

class MainScaffold extends StatefulWidget {
  final Widget body;
  final String title;
  final List<Widget>? actions;
  final bool showAppBar;
  final bool showBottomNav;
  final int currentBottomNavIndex;
  final Function(int)? onBottomNavTap;
  final FloatingActionButton? floatingActionButton;
  final FloatingActionButtonLocation? floatingActionButtonLocation;

  const MainScaffold({
    Key? key,
    required this.body,
    this.title = 'Trải Nghiệm Căn Hộ',
    this.actions,
    this.showAppBar = true,
    this.showBottomNav = true,
    this.currentBottomNavIndex = 0,
    this.onBottomNavTap,
    this.floatingActionButton,
    this.floatingActionButtonLocation,
  }) : super(key: key);

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: widget.showAppBar
          ? AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              title: Text(
                widget.title,
                style: const TextStyle(
                  color: Color(0xFF1E293B),
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back, color: Color(0xFF1E293B)),
                onPressed: () => Navigator.pop(context),
              ),
              actions:
                  widget.actions ??
                  [
                    // Thông báo
                    IconButton(
                      onPressed: () async {
                        final result = await Navigator.pushNamed(
                          context,
                          '/announcements',
                        );
                        // Refresh unread count when returning from announcements
                        if (result == true) {
                          // Trigger refresh if needed
                        }
                      },
                      icon: Stack(
                        children: [
                          const FaIcon(
                            FontAwesomeIcons.bell,
                            color: Color(0xFF64748B),
                            size: 22,
                          ),
                          // Unread count badge - you can add state management for this
                          // Positioned(
                          //   right: 0,
                          //   top: 0,
                          //   child: Container(
                          //     padding: const EdgeInsets.all(2),
                          //     decoration: const BoxDecoration(
                          //       color: Color(0xFFEF4444),
                          //       shape: BoxShape.circle,
                          //     ),
                          //     constraints: const BoxConstraints(
                          //       minWidth: 16,
                          //       minHeight: 16,
                          //     ),
                          //     child: Text(
                          //       '0', // Replace with actual unread count
                          //       style: const TextStyle(
                          //         color: Colors.white,
                          //         fontSize: 10,
                          //         fontWeight: FontWeight.bold,
                          //       ),
                          //       textAlign: TextAlign.center,
                          //     ),
                          //   ),
                          // ),
                        ],
                      ),
                      tooltip: 'Thông báo',
                    ),
                    // Hồ sơ
                    IconButton(
                      onPressed: () => Navigator.pushNamed(context, '/profile'),
                      icon: const FaIcon(
                        FontAwesomeIcons.user,
                        color: Color(0xFF64748B),
                        size: 22,
                      ),
                      tooltip: 'Hồ sơ',
                    ),
                    const SizedBox(width: 8),
                  ],
            )
          : null,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFF8FAFC), Color(0xFFF1F5F9)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: widget.body,
      ),
      bottomNavigationBar: widget.showBottomNav
          ? DashboardBottomNavigation(
              currentIndex: widget.currentBottomNavIndex,
              onTap: widget.onBottomNavTap ?? _defaultBottomNavTap,
            )
          : null,
      floatingActionButton: widget.floatingActionButton,
      floatingActionButtonLocation: widget.floatingActionButtonLocation,
    );
  }

  void _defaultBottomNavTap(int index) {
    switch (index) {
      case 0:
        Navigator.pushNamedAndRemoveUntil(
          context,
          '/dashboard',
          (route) => false,
        );
        break;
      case 1:
        Navigator.pushNamed(context, '/invoices');
        break;
      case 2:
        Navigator.pushNamed(context, '/events');
        break;
      case 3:
        Navigator.pushNamed(context, '/facility-bookings');
        break;
      case 4:
        Navigator.pushNamed(context, '/vehicles');
        break;
    }
  }
}
