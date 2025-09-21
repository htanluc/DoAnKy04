import 'package:flutter/material.dart';
import '../../models/request.dart';
import '../../models/request_status.dart';

class StatusProgressWidget extends StatelessWidget {
  final ServiceRequest request;
  final double? width;
  final double? height;

  const StatusProgressWidget({
    Key? key,
    required this.request,
    this.width,
    this.height,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final status = request.requestStatus;

    return Container(
      width: width,
      height: height,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.white, Color(0xFFF8FBFF)],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _getBorderColor(status), width: 1),
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildHeader(context, status),
            const SizedBox(height: 12),
            _buildProgressSteps(context, status),
            if (request.completedAt != null) ...[
              const SizedBox(height: 12),
              _buildCompletionInfo(context),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, RequestStatus status) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Theo dõi trạng thái xử lý yêu cầu của bạn',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[900],
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(status),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      'Trạng thái hiện tại: ${status.displayName}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: _getStatusTextColor(status),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        Text(
          'Bước ${status.step}/4',
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: Colors.grey[500]),
        ),
      ],
    );
  }

  Widget _buildProgressSteps(BuildContext context, RequestStatus status) {
    final steps = _getProgressSteps();

    return Column(
      children: [
        // Progress line
        Container(
          height: 2,
          margin: const EdgeInsets.symmetric(horizontal: 24),
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(1),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: (status.step - 1) / (steps.length - 1),
            child: Container(
              decoration: BoxDecoration(
                color: status.isCancelled ? Colors.red : Colors.blue,
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        // Steps - Responsive layout with SingleChildScrollView
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final isWideScreen = constraints.maxWidth > 600;

              if (isWideScreen) {
                // Wide screen: horizontal layout
                return Row(
                  children: steps.asMap().entries.map((entry) {
                    final index = entry.key;
                    final step = entry.value;
                    final isActive = step['step'] <= status.step;
                    final isCompleted = step['step'] < status.step;
                    final isCancelled = status.isCancelled;

                    return Row(
                      children: [
                        _buildStepCard(
                          context,
                          step,
                          isActive,
                          isCompleted,
                          isCancelled,
                        ),
                        if (index < steps.length - 1)
                          _buildArrow(
                            context,
                            isActive,
                            isCompleted,
                            isCancelled,
                          ),
                      ],
                    );
                  }).toList(),
                );
              } else {
                // Narrow screen: vertical layout
                return Column(
                  children: steps.asMap().entries.map((entry) {
                    final index = entry.key;
                    final step = entry.value;
                    final isActive = step['step'] <= status.step;
                    final isCompleted = step['step'] < status.step;
                    final isCancelled = status.isCancelled;

                    return Column(
                      children: [
                        _buildStepCard(
                          context,
                          step,
                          isActive,
                          isCompleted,
                          isCancelled,
                        ),
                        if (index < steps.length - 1)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: _buildVerticalArrow(
                              context,
                              isActive,
                              isCompleted,
                              isCancelled,
                            ),
                          ),
                      ],
                    );
                  }).toList(),
                );
              }
            },
          ),
        ),
      ],
    );
  }

  Widget _buildStepCard(
    BuildContext context,
    Map<String, dynamic> step,
    bool isActive,
    bool isCompleted,
    bool isCancelled,
  ) {
    final theme = Theme.of(context);
    final stepNumber = step['step'] as int;
    final label = step['label'] as String;
    final description = step['description'] as String;
    final icon = step['icon'] as IconData;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWideScreen = constraints.maxWidth > 600;
        final cardWidth = isWideScreen ? 120.0 : double.infinity;
        final cardHeight = isWideScreen ? 120.0 : 100.0;

        return Container(
          width: cardWidth,
          height: cardHeight,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: _getStepCardColor(isActive, isCompleted, isCancelled),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: _getStepBorderColor(isActive, isCompleted, isCancelled),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Icon
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: _getIconColor(isActive, isCompleted, isCancelled),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isCancelled || isCompleted ? Icons.check : icon,
                  color: Colors.white,
                  size: 16,
                ),
              ),
              const SizedBox(height: 8),
              // Label
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w500,
                  color: _getStepTextColor(isActive, isCompleted, isCancelled),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              // Description
              Text(
                description,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontSize: 10,
                  color: _getStepDescriptionColor(
                    isActive,
                    isCompleted,
                    isCancelled,
                  ),
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              // Staff phone for assigned step
              if (stepNumber == 2 &&
                  request.assignedTo != null &&
                  request.effectiveStaffPhone.isNotEmpty) ...[
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.phone, size: 12, color: Colors.blue[600]),
                    const SizedBox(width: 4),
                    Text(
                      request.effectiveStaffPhone,
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontSize: 10,
                        color: Colors.blue[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildVerticalArrow(
    BuildContext context,
    bool isActive,
    bool isCompleted,
    bool isCancelled,
  ) {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        color: _getArrowColor(isActive, isCompleted, isCancelled),
        shape: BoxShape.circle,
      ),
      child: Icon(
        Icons.arrow_downward,
        size: 12,
        color: _getArrowIconColor(isActive, isCompleted, isCancelled),
      ),
    );
  }

  Widget _buildArrow(
    BuildContext context,
    bool isActive,
    bool isCompleted,
    bool isCancelled,
  ) {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        color: _getArrowColor(isActive, isCompleted, isCancelled),
        shape: BoxShape.circle,
      ),
      child: Icon(
        Icons.arrow_forward,
        size: 12,
        color: _getArrowIconColor(isActive, isCompleted, isCancelled),
      ),
    );
  }

  Widget _buildCompletionInfo(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.green[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.green[200]!),
      ),
      child: Row(
        children: [
          Icon(Icons.check_circle, color: Colors.green[600], size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hoàn thành',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                    color: Colors.green[900],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Yêu cầu đã được hoàn thành lúc: ${_formatDateTime(request.completedAt!)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.green[700],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getProgressSteps() {
    return [
      {
        'step': 1,
        'label': 'Nhận Yêu Cầu',
        'description': 'Yêu cầu đã được tiếp nhận',
        'icon': Icons.access_time,
      },
      {
        'step': 2,
        'label': 'Đã giao',
        'description': request.assignedTo != null
            ? 'Đã giao cho ${request.assignedTo}'
            : 'Chờ gán nhân viên',
        'icon': Icons.person,
      },
      {
        'step': 3,
        'label': 'Đang xử lý',
        'description': 'Nhân viên đang xử lý yêu cầu',
        'icon': Icons.build,
      },
      {
        'step': 4,
        'label': 'Hoàn thành',
        'description': 'Yêu cầu đã hoàn thành',
        'icon': Icons.check_circle,
      },
    ];
  }

  Color _getStatusColor(RequestStatus status) {
    if (status.isCancelled) return Colors.red[100]!;
    if (status.isCompleted) return Colors.green[100]!;
    return Colors.blue[100]!;
  }

  Color _getStatusTextColor(RequestStatus status) {
    if (status.isCancelled) return Colors.red[800]!;
    if (status.isCompleted) return Colors.green[800]!;
    return Colors.blue[800]!;
  }

  Color _getBorderColor(RequestStatus status) {
    if (status.isCancelled) return Colors.red[300]!;
    if (status.isCompleted) return Colors.green[300]!;
    return Colors.blue[300]!;
  }

  Color _getStepCardColor(bool isActive, bool isCompleted, bool isCancelled) {
    if (isCancelled) return Colors.red[100]!;
    if (isCompleted) return Colors.green[100]!;
    if (isActive) return Colors.blue[100]!;
    return Colors.grey[100]!;
  }

  Color _getStepBorderColor(bool isActive, bool isCompleted, bool isCancelled) {
    if (isCancelled) return Colors.red[300]!;
    if (isCompleted) return Colors.green[300]!;
    if (isActive) return Colors.blue[300]!;
    return Colors.grey[300]!;
  }

  Color _getIconColor(bool isActive, bool isCompleted, bool isCancelled) {
    if (isCancelled) return Colors.red[500]!;
    if (isCompleted) return Colors.green[500]!;
    if (isActive) return Colors.blue[500]!;
    return Colors.grey[400]!;
  }

  Color _getStepTextColor(bool isActive, bool isCompleted, bool isCancelled) {
    if (isCancelled) return Colors.red[900]!;
    if (isActive) return Colors.grey[900]!;
    return Colors.grey[400]!;
  }

  Color _getStepDescriptionColor(
    bool isActive,
    bool isCompleted,
    bool isCancelled,
  ) {
    if (isCancelled) return Colors.red[600]!;
    if (isActive) return Colors.grey[600]!;
    return Colors.grey[400]!;
  }

  Color _getArrowColor(bool isActive, bool isCompleted, bool isCancelled) {
    if (isCancelled) return Colors.red[100]!;
    if (isCompleted) return Colors.green[100]!;
    if (isActive) return Colors.blue[100]!;
    return Colors.grey[100]!;
  }

  Color _getArrowIconColor(bool isActive, bool isCompleted, bool isCancelled) {
    if (isCancelled) return Colors.red[500]!;
    if (isCompleted) return Colors.green[600]!;
    if (isActive) return Colors.blue[600]!;
    return Colors.grey[400]!;
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')}/${dateTime.year} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
