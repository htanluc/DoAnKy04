import 'package:flutter/material.dart';
import 'ui/requests_screen.dart';

/// Demo screen để test Service Requests module
/// Có thể sử dụng để test riêng module này
class DemoServiceRequestsScreen extends StatelessWidget {
  const DemoServiceRequestsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Service Requests Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0066CC),
          primary: const Color(0xFF0066CC),
          secondary: const Color(0xFF009966),
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF7FAFC),
      ),
      home: const ServiceRequestsScreen(),
    );
  }
}

/// Main function để chạy demo
void main() {
  runApp(const DemoServiceRequestsScreen());
}
