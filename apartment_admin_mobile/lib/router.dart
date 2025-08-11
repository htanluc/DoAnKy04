import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'src/features/auth/presentation/login_screen.dart';
import 'src/features/home/presentation/dashboard_screen.dart';
import 'src/features/water/presentation/water_readings_screen.dart';
import 'src/shared/providers/auth_state.dart';
import 'src/shared/widgets/app_shell.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);
  final authController = ref.read(authStateProvider);
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: GoRouterRefreshStream(authController.stream),
    redirect: (context, state) {
      final loggedIn = authState.isAuthenticated;
      final loggingIn = state.matchedLocation == '/login';
      if (!loggedIn) return loggingIn ? null : '/login';
      if (loggingIn) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/water-readings',
            builder: (context, state) => const WaterReadingsScreen(),
          ),
        ],
      ),
    ],
  );
});

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListener = () => notifyListeners();
    subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final void Function() notifyListener;
  late final StreamSubscription<dynamic> subscription;

  @override
  void dispose() {
    subscription.cancel();
    super.dispose();
  }
}
