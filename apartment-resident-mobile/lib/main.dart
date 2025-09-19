import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'features/auth/login_page.dart';
import 'features/dashboard/dashboard_page.dart';
import 'features/invoices/invoices_page.dart';
import 'features/facility_bookings/facility_bookings_page.dart';
import 'features/events/events_page.dart';
import 'features/announcements/announcements_page.dart';
import 'features/service_requests/service_requests_page.dart';
import 'features/profile/profile_page.dart';
import 'features/auth/auth_gate.dart';
import 'features/vehicles/ui/vehicles_screen.dart';

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
        '/dashboard': (context) => const DashboardPage(),
        '/invoices': (context) => const InvoicesPage(),
        '/facility-bookings': (context) => const FacilityBookingsPage(),
        '/events': (context) => const EventsPage(),
        '/announcements': (context) => const AnnouncementsPage(),
        '/service-requests': (context) => const ServiceRequestsPage(),
        '/profile': (context) => const ProfilePage(),
        '/vehicles': (context) => const VehiclesScreen(),
      },
    );
  }
}
