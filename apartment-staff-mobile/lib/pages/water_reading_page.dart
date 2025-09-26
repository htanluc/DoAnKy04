import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import 'qr_scan_page.dart';

class WaterReadingPage extends StatefulWidget {
  const WaterReadingPage({super.key});

  @override
  State<WaterReadingPage> createState() => _WaterReadingPageState();
}

class _WaterReadingPageState extends State<WaterReadingPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _apartmentCtrl = TextEditingController();
  final TextEditingController _readingCtrl = TextEditingController();
  final TextEditingController _prevCtrl = TextEditingController();
  // Bỏ theo ngày, chỉ dùng tháng (không cần biến ngày)
  bool _submitting = false;
  bool _lookupLoading = false;
  Map<String, dynamic>? _lookupData;
  double? _lastReading;
  DateTime? _lastReadingAt;
  static const int _largeDeltaThreshold = 200;

  // Tháng hiện tại được chọn (yyyy-MM)
  String? _selectedMonth; // ví dụ: "2025-09"
  Map<String, dynamic>? _monthReading; // bản ghi tháng hiện tại
  bool _monthLoading = false;

  @override
  void dispose() {
    _apartmentCtrl.dispose();
    _readingCtrl.dispose();
    _prevCtrl.dispose();
    super.dispose();
  }

  // (đã gộp vào _lookupCurrentMonth)

  // Gộp: Tra cứu + đặt tháng hiện tại rồi tải dữ liệu tháng
  Future<void> _lookupCurrentMonth() async {
    final code = _apartmentCtrl.text.trim();
    if (code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Enter apartment code first')));
      return;
    }
    final now = DateTime.now();
    setState(() {
      _selectedMonth = '${now.year}-${now.month.toString().padLeft(2, '0')}';
    });
    await _lookup();
  }

  Future<void> _loadMonthReading() async {
    final code = _apartmentCtrl.text.trim();
    if (code.isEmpty || _selectedMonth == null) return;
    setState(() => _monthLoading = true);
    try {
      final m = await ApiService.getMonthlyLatestReading(
          apartmentCode: code, month: _selectedMonth!);
      setState(() {
        _monthReading = m;
        if (m != null) {
          final prev = m['currentReading'] ?? m['meterReading'];
          final when = (m['readingDate'] ?? m['readingMonth'])?.toString();
          if (prev is num) {
            _lastReading = prev.toDouble();
            _prevCtrl.text = _lastReading!.toString();
            // Gợi ý chỉ số mới nếu đang trống hoặc nhỏ hơn chỉ số cũ
            final cur = double.tryParse(_readingCtrl.text.trim());
            if (cur == null || cur < _lastReading!) {
              _readingCtrl.text = (_lastReading! + 1).toString();
            }
          }
          // Cập nhật ngày hiển thị - ưu tiên recordedAt (thời gian ghi cuối)
          DateTime? dt;
          final recordedAt = m['recordedAt'] ?? m['createdAt'];
          if (recordedAt != null) {
            dt = DateTime.tryParse(recordedAt.toString());
          } else if (when != null) {
            // Fallback to readingDate/readingMonth if no recordedAt
            dt = DateTime.tryParse(when);
            dt ??= DateTime.tryParse(
                when.length >= 10 ? when.substring(0, 10) : when);
          }
          _lastReadingAt = dt;
        }
      });
    } catch (e) {
      setState(() => _monthReading = null);
    } finally {
      if (mounted) setState(() => _monthLoading = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      // Đảm bảo người dùng đã nhập mã căn hộ
      if (_apartmentCtrl.text.trim().isEmpty) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Enter apartment code before saving')));
        setState(() => _submitting = false);
        return;
      }
      final reading = double.parse(_readingCtrl.text.trim());

      if (_selectedMonth == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('No month selected')));
        setState(() => _submitting = false);
        return;
      }

      // Đảm bảo chỉ số mới không nhỏ hơn chỉ số trước
      if (_lastReading != null && reading < _lastReading!) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(
                'New reading must be ≥ previous reading (${_lastReading!})')));
        return;
      }

      // Cảnh báo nếu tăng bất thường
      final double? delta =
          _lastReading != null ? (reading - _lastReading!) : null;
      if (delta != null && delta >= _largeDeltaThreshold) {
        final confirm = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Confirm'),
            content: Text(
                'The new reading increased by $delta compared to the previous period. Are you sure to save?'),
            actions: [
              TextButton(
                  onPressed: () => Navigator.of(ctx).pop(false),
                  child: const Text('Cancel')),
              FilledButton(
                  onPressed: () => Navigator.of(ctx).pop(true),
                  child: const Text('Continue')),
            ],
          ),
        );
        if (confirm != true) return;
      }

      // Cập nhật nếu có id, còn không sẽ tạo mới với readingMonth đã chọn
      final readingId =
          (_monthReading?['id'] ?? _monthReading?['readingId']) as int?;
      if (readingId == null) {
        await ApiService.submitWaterReading(
          apartmentCode: _apartmentCtrl.text.trim(),
          currentReading: reading.toInt(),
          readingAt: null,
          readingMonth: _selectedMonth,
        );
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Reading created successfully')));
      } else {
        await ApiService.updateWaterReadingById(
            id: readingId, currentReading: reading.toInt());
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Reading updated successfully')));
      }
      // Ở lại trang và cập nhật lại dữ liệu tháng đang chọn
      setState(() {
        _lastReading = reading;
        _prevCtrl.text = reading.toString();
      });
      // Làm mới bản ghi tháng hiện tại
      await _loadMonthReading();
      // Giữ nguyên tháng đã chọn để người dùng có thể nhập tiếp nếu cần
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _lookup() async {
    final code = _apartmentCtrl.text.trim();
    if (code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Enter apartment code first')));
      return;
    }
    setState(() {
      _lookupLoading = true;
      _lookupData = null;
      _lastReading = null;
      _lastReadingAt = null;
      _prevCtrl.text = '';
    });
    try {
      final res = await ApiService.lookupWaterReading(code);
      if (!mounted) return;
      if (res == null || res.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Apartment not found or no data')),
        );
        setState(() {
          _lookupData = null;
          _lastReading = null;
          _lastReadingAt = null;
        });
      } else {
        setState(() {
          _lookupData = res;
          // Đoán trường chỉ số gần nhất ở một số tên phổ biến
          final last = res['lastReading'] ??
              res['last']?['value'] ??
              res['latest']?['reading'];
          if (last is num) {
            _lastReading = last.toDouble();
            _prevCtrl.text = _lastReading!.toString();
            // Gợi ý chỉ số mới = cũ + 1 nếu chưa nhập
            if (_readingCtrl.text.trim().isEmpty) {
              _readingCtrl.text = (_lastReading! + 1).toString();
            }
          }
          final lastAt = res['lastReadingAt'] ??
              res['last']?['recordedAt'] ??
              res['last']?['createdAt'] ??
              res['latest']?['recordedAt'] ??
              res['latest']?['createdAt'];
          if (lastAt is String) {
            _lastReadingAt = DateTime.tryParse(lastAt);
          }
        });
        // After lookup, if month is selected then load month reading
        if (_selectedMonth != null) await _loadMonthReading();
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Lookup error: $e')));
    } finally {
      if (mounted) setState(() => _lookupLoading = false);
    }
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return '-';
    final d = dt;
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    // final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Water readings')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _apartmentCtrl,
                decoration: InputDecoration(
                  labelText: 'Apartment code',
                  prefixIcon: Icon(Icons.home_outlined),
                  suffixIcon: _QrScanButton(),
                ),
                validator: (v) => v == null || v.trim().isEmpty
                    ? 'Please enter apartment code'
                    : null,
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: _lookupLoading ? null : _lookupCurrentMonth,
                icon: _lookupLoading
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.search),
                label: const Text('Lookup current month'),
              ),
              if (_lookupData != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: Theme.of(context)
                            .colorScheme
                            .outlineVariant
                            .withOpacity(0.5)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.apartment, size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              (_lookupData?['apartmentName'] ??
                                      _lookupData?['apartment']?['name'] ??
                                      _lookupData?['apartmentCode'] ??
                                      '-')
                                  .toString(),
                              style: const TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Builder(builder: (context) {
                        final resident = (_lookupData?['residentName'] ??
                                _lookupData?['resident']?['name'] ??
                                _lookupData?['owner']?['name'] ??
                                '')
                            .toString()
                            .trim();
                        if (resident.isEmpty || resident == '-') {
                          return const SizedBox.shrink();
                        }
                        return Column(
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.person_outline, size: 18),
                                const SizedBox(width: 8),
                                Expanded(child: Text(resident)),
                              ],
                            ),
                            const SizedBox(height: 8),
                          ],
                        );
                      }),
                      Builder(builder: (context) {
                        final address = (_lookupData?['address'] ??
                                _lookupData?['apartment']?['address'] ??
                                _lookupData?['location'] ??
                                '')
                            .toString()
                            .trim();
                        if (address.isEmpty || address == '-') {
                          return const SizedBox.shrink();
                        }
                        return Column(
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.pin_drop_outlined, size: 18),
                                const SizedBox(width: 8),
                                Expanded(child: Text(address)),
                              ],
                            ),
                            const SizedBox(height: 8),
                          ],
                        );
                      }),
                      const Divider(height: 20),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.history, size: 18),
                              const SizedBox(width: 8),
                              Text('Previous reading: '),
                              Text(
                                _lastReading?.toString() ?? '-',
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Padding(
                            padding: const EdgeInsets.only(left: 26),
                            child: Text(
                              'Last reading time: ${_formatDate(_lastReadingAt)}',
                              softWrap: true,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
              // Tóm tắt tháng hiện tại
              if (_selectedMonth != null) ...[
                const SizedBox(height: 8),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_month_outlined),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _monthLoading
                              ? const Text('Loading current month reading...')
                              : Text(_monthReading == null
                                  ? 'Month ${_selectedMonth!}: no record yet'
                                  : 'Month ${_selectedMonth!}: reading = ${_monthReading!['currentReading'] ?? _monthReading!['meterReading'] ?? '-'}'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 12),
              // Ô chỉ số cũ - không cho sửa
              TextFormField(
                controller: _prevCtrl,
                enabled: false,
                decoration: const InputDecoration(
                  labelText: 'Previous reading',
                  prefixIcon: Icon(Icons.history),
                ),
              ),
              const SizedBox(height: 12),
              // Ô chỉ số mới - có thể nhập
              TextFormField(
                controller: _readingCtrl,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*$')),
                ],
                decoration: const InputDecoration(
                  labelText: 'New reading',
                  helperText:
                      'Must not be less than previous reading (supports decimals like 19.36)',
                  prefixIcon: Icon(Icons.water_drop_outlined),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) {
                    return 'Please enter the reading';
                  }
                  final n = double.tryParse(v.trim());
                  if (n == null || n < 0) return 'Invalid reading';
                  if (_lastReading != null && n < _lastReading!) {
                    return 'Must be ≥ previous reading (${_lastReading!})';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              const SizedBox(height: 20),
              FilledButton.icon(
                onPressed: _submitting ? null : _submit,
                icon: _submitting
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.save_outlined),
                label: const Text('Save reading'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QrScanButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.qr_code_scanner),
      onPressed: () async {
        // Mở trang scan và nhận kết quả
        final code = await Navigator.of(context).push<String>(
          MaterialPageRoute(builder: (_) => const QrScanPage()),
        );
        if (code == null || code.trim().isEmpty) return;
        // Trích xuất mã căn hộ từ QR. Hỗ trợ: trực tiếp "C01-01" hoặc URL có ?apartment= / unit=
        String value = code.trim();
        try {
          final uri = Uri.parse(value);
          final apt = uri.queryParameters['apartment'] ??
              uri.queryParameters['unit'] ??
              uri.queryParameters['apartmentCode'];
          if (apt != null && apt.trim().isNotEmpty) value = apt.trim();
        } catch (_) {}

        // Gán vào field và gọi tra cứu tháng hiện tại
        final state = context.findAncestorStateOfType<_WaterReadingPageState>();
        if (state != null) {
          state._apartmentCtrl.text = value;
          await state._lookupCurrentMonth();
        }
      },
    );
  }
}
