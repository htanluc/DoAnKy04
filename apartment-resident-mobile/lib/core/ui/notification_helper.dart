import 'package:flutter/material.dart';

class AppNotify {
  AppNotify._();

  static void success(BuildContext context, String message) {
    _show(
      context,
      icon: Icons.check_circle,
      color: Colors.green,
      title: 'Thành công',
      message: message,
    );
  }

  static void error(BuildContext context, String message) {
    _show(
      context,
      icon: Icons.error_outline,
      color: Colors.red,
      title: 'Có lỗi xảy ra',
      message: message,
    );
  }

  static void info(BuildContext context, String message) {
    _show(
      context,
      icon: Icons.info_outline,
      color: Colors.blue,
      title: 'Thông báo',
      message: message,
    );
  }

  static void _show(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    required String message,
  }) {
    final theme = Theme.of(context);
    final snack = SnackBar(
      behavior: SnackBarBehavior.floating,
      backgroundColor: Colors.transparent,
      elevation: 0,
      margin: const EdgeInsets.all(16),
      content: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
          border: Border(left: BorderSide(color: color, width: 4)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(message, style: theme.textTheme.bodyMedium),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close, size: 18),
              onPressed: () =>
                  ScaffoldMessenger.of(context).hideCurrentSnackBar(),
            ),
          ],
        ),
      ),
      duration: const Duration(seconds: 3),
    );
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(snack);
  }
}
