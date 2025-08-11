import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_state.dart';
import '../../shared/services/api_client.dart';

class WaterReadingItem {
  final int? id;
  final int apartmentId;
  final String? apartmentName;
  final String? readingMonth;
  final double? previousReading;
  final double? currentReading;
  final double? consumption;
  final double? unitPrice;
  final double? totalAmount;

  const WaterReadingItem({
    this.id,
    required this.apartmentId,
    this.apartmentName,
    this.readingMonth,
    this.previousReading,
    this.currentReading,
    this.consumption,
    this.unitPrice,
    this.totalAmount,
  });

  factory WaterReadingItem.fromJson(Map<String, dynamic> j) => WaterReadingItem(
    id: j['id'] as int?,
    apartmentId: (j['apartmentId'] ?? 0) as int,
    apartmentName: j['apartmentName'] as String?,
    readingMonth: j['readingMonth'] as String?,
    previousReading: (j['previousReading'] as num?)?.toDouble(),
    currentReading: (j['currentReading'] as num?)?.toDouble(),
    consumption: (j['consumption'] as num?)?.toDouble(),
    unitPrice: (j['unitPrice'] as num?)?.toDouble(),
    totalAmount: (j['totalAmount'] as num?)?.toDouble(),
  );
}

class WaterReadingsNotifier
    extends StateNotifier<AsyncValue<List<WaterReadingItem>>> {
  WaterReadingsNotifier(this._api) : super(const AsyncLoading()) {
    refresh();
  }

  final ApiClient _api;

  Future<void> refresh() async {
    try {
      state = const AsyncLoading();
      final res = await _api.get('/api/admin/water-readings');
      final list = (res as List)
          .map((e) => WaterReadingItem.fromJson(e as Map<String, dynamic>))
          .toList();
      state = AsyncData(list);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<void> saveReading({
    int? id,
    required String readingMonth,
    required double currentReading,
    int? apartmentId,
  }) async {
    final payload = <String, dynamic>{
      if (id != null) 'id': id,
      if (apartmentId != null) 'apartmentId': apartmentId,
      'readingMonth': readingMonth,
      'currentReading': currentReading,
    };
    await _api.post('/api/admin/water-readings', data: payload);
    await refresh();
  }
}

final waterReadingsProvider =
    StateNotifierProvider<
      WaterReadingsNotifier,
      AsyncValue<List<WaterReadingItem>>
    >((ref) {
      final api = ref.watch(apiClientProvider);
      return WaterReadingsNotifier(api);
    });
