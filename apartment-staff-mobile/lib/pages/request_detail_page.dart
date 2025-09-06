import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/service_request.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import 'image_viewer_page.dart';
// Chat đã được loại bỏ theo yêu cầu

class RequestDetailPage extends StatefulWidget {
  final ServiceRequestModel request;
  const RequestDetailPage({super.key, required this.request});

  @override
  State<RequestDetailPage> createState() => _RequestDetailPageState();
}

class _RequestDetailPageState extends State<RequestDetailPage> {
  late ServiceRequestModel _req;
  // Đã bỏ ghi chú và chat theo yêu cầu
  String _status = 'OPEN';

  @override
  void initState() {
    super.initState();
    _req = widget.request;
    _status = (_req.status ?? 'OPEN').toUpperCase();
    // Thử đồng bộ lại chi tiết từ API để có imageUrls đầy đủ
    _syncLatest();
  }

  Future<void> _syncLatest() async {
    try {
      final user = await AuthService.getUser();
      final staffId = (user?['id'] as num?)?.toInt();
      if (staffId == null) return;
      final latest = await ApiService.getAssignedRequestById(staffId, _req.id);
      if (!mounted || latest == null) return;
      final updated = ServiceRequestModel.fromJson(latest);
      if (updated.imageUrls.isNotEmpty || updated.attachmentUrls.isNotEmpty) {
        setState(() {
          _req = updated;
        });
      }
    } catch (_) {
      // ignore network errors silently here
    }
  }

  @override
  void dispose() {
    // Chat đã được loại bỏ
    super.dispose();
  }

  Future<void> _saveStatus() async {
    try {
      await ApiService.updateStatus(_req.id, _status);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cập nhật trạng thái thành công')),
      );
      setState(() {});
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: $e')),
      );
    }
  }

  Future<void> _setStatusSequential(String target) async {
    const order = ['OPEN', 'IN_PROGRESS', 'COMPLETED'];
    final currentIdx = order.indexOf(_status);
    final targetIdx = order.indexOf(target);

    // Chỉ cho phép chuyển bước tiếp theo (không nhảy bước)
    if (targetIdx == -1 || targetIdx != currentIdx + 1) return;

    // Hiển thị dialog xác nhận
    final confirmed = await _showConfirmDialog(target);
    if (!confirmed) return;

    setState(() => _status = target);
    await _saveStatus();
  }

  Future<bool> _showConfirmDialog(String target) async {
    final statusNames = {
      'IN_PROGRESS': 'Đang xử lý',
      'COMPLETED': 'Hoàn thành'
    };

    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Xác nhận'),
            content: Text(
                'Bạn có chắc chắn muốn chuyển trạng thái sang "${statusNames[target]}"?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Hủy'),
              ),
              FilledButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Xác nhận'),
              ),
            ],
          ),
        ) ??
        false;
  }

  Future<void> _makePhoneCall() async {
    final phoneNumber = _req.residentPhone ?? '';
    if (phoneNumber.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không có số điện thoại')),
      );
      return;
    }

    // Làm sạch số điện thoại (bỏ khoảng trắng, dấu gạch ngang)
    final cleanNumber = phoneNumber.replaceAll(RegExp(r'[^\d+]'), '');

    final Uri phoneUri = Uri(scheme: 'tel', path: cleanNumber);
    try {
      // Sử dụng ACTION_DIAL thay vì ACTION_CALL để tương thích với emulator
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(
          phoneUri,
          mode: LaunchMode.externalApplication,
          webOnlyWindowName: '_self',
        );
      } else {
        throw Exception('Không thể mở ứng dụng gọi điện');
      }
    } catch (e) {
      if (!mounted) return;
      // Thử quay số trực tiếp, không hiển thị số cư dân
      final Uri dialUri = Uri.parse('tel:$cleanNumber');
      if (await canLaunchUrl(dialUri)) {
        await launchUrl(dialUri);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể mở ứng dụng gọi điện')),
        );
      }
    }
  }

  Widget _buildImagesGrid() {
    final urls = _req.imageUrls.map(ApiService.normalizeFileUrl).toList();
    if (urls.isEmpty) {
      return Text(
        'Không có hình ảnh đính kèm',
        style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
      );
    }
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1,
      ),
      itemCount: urls.length,
      itemBuilder: (context, index) {
        final url = urls[index];
        return GestureDetector(
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ImageViewerPage(
                  imageUrls: urls,
                  initialIndex: index,
                ),
              ),
            );
          },
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(
              url,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                color: Colors.grey.shade200,
                alignment: Alignment.center,
                child: const Icon(Icons.broken_image_outlined),
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: Text('Yêu cầu #${_req.id}'),
        elevation: 0,
        backgroundColor: cs.surface,
      ),
      backgroundColor: cs.surface,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _makePhoneCall,
        backgroundColor: const Color(0xFF5CB034),
        foregroundColor: Colors.white,
        elevation: 4,
        icon: const Icon(Icons.phone, size: 22),
        label: const Text('Liên hệ cư dân'),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header với tiến trình
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20.0),
              decoration: BoxDecoration(
                color: cs.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: cs.shadow.withOpacity(0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Thanh tiến trình
                  _StatusProgress(
                    current: _status,
                    onStepTap: (index) async {
                      const mapping = ['OPEN', 'IN_PROGRESS', 'COMPLETED'];
                      await _setStatusSequential(mapping[index]);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Bỏ thẻ nhân viên phụ trách theo yêu cầu

            // Thông tin yêu cầu
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20.0),
              decoration: BoxDecoration(
                color: cs.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: cs.shadow.withOpacity(0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tiêu đề section
                  Row(
                    children: [
                      Container(
                        width: 4,
                        height: 20,
                        decoration: BoxDecoration(
                          color: cs.primary,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Chi tiết yêu cầu',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: cs.onSurface,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Mô tả yêu cầu
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: cs.primaryContainer.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: cs.primary.withOpacity(0.2),
                        width: 1,
                      ),
                    ),
                    child: Text(
                      _req.description ?? 'Không có mô tả',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: cs.onSurface,
                        height: 1.4,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Thông tin cư dân
                  _InfoRow(
                    icon: Icons.person,
                    label: 'Tên cư dân',
                    value: _req.residentName ?? '-',
                  ),
                  const SizedBox(height: 16),

                  // Thông tin yêu cầu
                  _InfoSection(
                    title: 'Thông tin yêu cầu',
                    icon: Icons.info_outline,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _InfoRow(
                              icon: Icons.category,
                              label: 'Danh mục',
                              value: _req.categoryName ?? '-',
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _InfoRow(
                              icon: Icons.priority_high,
                              label: 'Mức độ ưu tiên',
                              value: _req.priority ?? '-',
                              valueColor: _getPriorityColor(_req.priority),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Bỏ phần Nhân viên phụ trách theo yêu cầu
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Hình ảnh đính kèm (nếu có)
            if ((_req.imageUrls).isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20.0),
                decoration: BoxDecoration(
                  color: cs.surface,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: cs.shadow.withOpacity(0.08),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.image_outlined, size: 18, color: cs.primary),
                        const SizedBox(width: 8),
                        Text(
                          'Hình ảnh',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: cs.onSurface,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildImagesGrid(),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Color _getPriorityColor(String? priority) {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
      case 'HIGH':
        return const Color(0xFFE53935);
      case 'MEDIUM':
        return const Color(0xFFF37021);
      case 'LOW':
        return const Color(0xFF5CB034);
      default:
        return Colors.grey;
    }
  }
}

// _InfoChip đã được thay thế bằng _InfoRow cho bố cục tốt hơn

// _StatusBadge đã được loại bỏ vì không còn sử dụng

class _InfoSection extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<Widget> children;

  const _InfoSection({
    required this.title,
    required this.icon,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 18, color: cs.primary),
            const SizedBox(width: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: cs.onSurface,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...children,
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: cs.surfaceVariant.withOpacity(0.5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              size: 16,
              color: cs.onSurfaceVariant,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: cs.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 14,
                    color: valueColor ?? cs.onSurface,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusProgress extends StatelessWidget {
  final String current;
  final void Function(int stepIndex)? onStepTap;
  const _StatusProgress({required this.current, this.onStepTap});

  int _index(String s) {
    switch (s.toUpperCase()) {
      case 'OPEN':
        return 0;
      case 'IN_PROGRESS':
        return 1;
      case 'COMPLETED':
        return 2;
      default:
        return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final step = _index(current);
    final titles = const ['Nhận yêu cầu', 'Đang xử lý', 'Hoàn thành'];
    final icons = const [
      Icons.check_circle_outline,
      Icons.handyman_outlined,
      Icons.verified_outlined,
    ];

    return LayoutBuilder(
      builder: (context, c) {
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: List.generate(3, (i) {
            final active = i <= step;
            return Expanded(
              child: GestureDetector(
                onTap: onStepTap == null ? null : () => onStepTap!(i),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      height: 60,
                      width: 60,
                      decoration: BoxDecoration(
                        color: active
                            ? const Color(0xFF5CB034).withOpacity(0.15)
                            : Colors.grey.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                            color: active
                                ? const Color(0xFF5CB034)
                                : Colors.grey.shade300),
                      ),
                      child: Icon(
                        icons[i],
                        size: 28,
                        color: active ? const Color(0xFF5CB034) : Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      titles[i],
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12.5,
                        height: 1.2,
                        fontWeight:
                            i == step ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        );
      },
    );
  }
}
