import 'package:flutter/material.dart';
import '../theme.dart';

class GharPlusHeader extends StatelessWidget {
  const GharPlusHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Logo
          Image.asset('assets/images/logo.png', width: 32, height: 32),
          const SizedBox(width: 10),
          const Text(
            'GHARPLUS',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
            ),
          ),
          const Spacer(),
          _HeaderIconBtn(icon: Icons.light_mode_outlined),
          const SizedBox(width: 8),
          _HeaderIconBtn(icon: Icons.people_outline),
          const SizedBox(width: 8),
          _HeaderIconBtnWithBadge(icon: Icons.notifications_outlined),
          const SizedBox(width: 8),
          _HeaderIconBtn(icon: Icons.settings_outlined),
        ],
      ),
    );
  }
}

class _HeaderIconBtn extends StatelessWidget {
  final IconData icon;
  const _HeaderIconBtn({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: AppColors.surface,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.border),
      ),
      child: Icon(icon, color: AppColors.textSecondary, size: 18),
    );
  }
}

class _HeaderIconBtnWithBadge extends StatelessWidget {
  final IconData icon;
  const _HeaderIconBtnWithBadge({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.surface,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.border),
          ),
          child: Icon(icon, color: AppColors.textSecondary, size: 18),
        ),
        Positioned(
          top: 4,
          right: 4,
          child: Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
            ),
          ),
        ),
      ],
    );
  }
}
