import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'login_page.dart';
import 'requests_list_page.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final token = await AuthService.getToken();
    if (!mounted) return;
    if (token != null && token.isNotEmpty) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const RequestsListPage()),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: cs.primaryContainer.withOpacity(0.2),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 68,
              width: 68,
              decoration: BoxDecoration(
                color: cs.primaryContainer,
                borderRadius: BorderRadius.circular(16),
              ),
              child:
                  Icon(Icons.apartment, color: cs.onPrimaryContainer, size: 36),
            ),
            const SizedBox(height: 16),
            Text(
              'Apartment Staff',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: cs.primary,
                letterSpacing: 0.2,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 4,
              width: 120,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  color: cs.primary,
                  backgroundColor: cs.primary.withOpacity(0.2),
                  minHeight: 4,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
