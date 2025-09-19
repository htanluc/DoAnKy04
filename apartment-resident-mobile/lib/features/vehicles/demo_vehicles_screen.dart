import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'ui/vehicles_screen.dart';

/// Demo screen để test module Vehicles
/// Sử dụng: Navigator.push(context, MaterialPageRoute(builder: (_) => DemoVehiclesScreen()))
class DemoVehiclesScreen extends StatelessWidget {
  const DemoVehiclesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ProviderScope(child: const VehiclesScreen());
  }
}
