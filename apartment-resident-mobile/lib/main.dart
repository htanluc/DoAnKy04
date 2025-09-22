import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'features/auth/login_page.dart';
import 'features/dashboard/ui/dashboard_screen.dart';
import 'features/invoices/ui/invoices_screen.dart';
import 'features/facility_bookings/facility_bookings_page.dart';
import 'features/events/ui/events_screen.dart';
import 'features/announcements/ui/announcements_screen.dart';
import 'features/service_requests/ui/requests_screen.dart';
import 'features/service_requests/debug_image_test.dart';
import 'features/profile/ui/profile_screen.dart';
import 'features/auth/auth_gate.dart';
import 'features/vehicles/ui/vehicles_screen.dart';
import 'features/facilities/ui/facilities_screen.dart';

void main() {
  runApp(ProviderScope(child: const MainApp()));
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData(
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF0066CC), // FPT brand-esque primary
        primary: const Color(0xFF0066CC),
        secondary: const Color(0xFF009966),
      ),
      useMaterial3: true,
      scaffoldBackgroundColor: const Color(0xFFF7FAFC),
    );

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Apartment Resident',
      theme: theme,
      locale: const Locale('vi'),
      supportedLocales: const [Locale('vi'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      initialRoute: '/',
      routes: {
        '/': (context) => const AuthGate(),
        '/login': (context) => const LoginPage(),
        '/dashboard': (context) => const DashboardScreen(),
        '/invoices': (context) => const InvoicesScreen(),
        '/facility-bookings': (context) => const FacilityBookingsPage(),
        '/events': (context) => const EventsScreen(),
        '/announcements': (context) => const AnnouncementsScreen(),
        '/service-requests': (context) => const ServiceRequestsScreen(),
        '/debug-image-test': (context) => const DebugImageTest(),
        '/profile': (context) => const ProfileScreen(),
        '/vehicles': (context) => const VehiclesScreen(),
        '/facilities': (context) => const FacilitiesScreen(),
      },
    );
  }
}
