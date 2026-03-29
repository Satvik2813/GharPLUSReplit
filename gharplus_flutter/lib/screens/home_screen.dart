import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme.dart';
import '../widgets/gharplus_header.dart';
import '../widgets/minani_fab.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final today = DateFormat('EEEE, d MMMM').format(DateTime.now());
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const GharPlusHeader(),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text(today, style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                            const SizedBox(height: 16),
                            // Weekly Budget Card (Red)
                            _WeeklyBudgetCard(),
                            const SizedBox(height: 16),
                            // Events Carousel
                            _EventsRow(),
                            const SizedBox(height: 24),
                            // This Week
                            const Text(
                              'This Week',
                              style: TextStyle(color: AppColors.textPrimary, fontSize: 20, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 12),
                            _WeekStatsRow(),
                            const SizedBox(height: 100),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            // Order Now Bottom Bar
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _OrderNowBar(),
            ),
            // Minani FAB
            const Positioned(
              bottom: 80,
              right: 16,
              child: MinaniFab(),
            ),
          ],
        ),
      ),
    );
  }
}

class _WeeklyBudgetCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFC62828), Color(0xFFB71C1C)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('WEEKLY BUDGET', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1)),
              Text('USED', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: const [
                  Text('₹215', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w800)),
                  SizedBox(width: 6),
                  Padding(
                    padding: EdgeInsets.only(bottom: 6),
                    child: Text('left', style: TextStyle(color: Colors.white60, fontSize: 14)),
                  ),
                ],
              ),
              const Text('₹285', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 14),
          // Progress bar
          Stack(
            children: [
              Container(height: 6, decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(3))),
              FractionallySizedBox(
                widthFactor: 0.57,
                child: Container(
                  height: 6,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EventsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _EventCard(
            icon: Icons.calendar_today,
            title: 'Ugadi in 5 days!',
            subtitle: 'Tap to sync with Google',
            color: const Color(0xFF8B4513),
          ),
          const SizedBox(width: 12),
          _EventCard(
            icon: Icons.star_outline,
            title: 'Smart Swap saved ₹85',
            subtitle: 'View this week\'s savings',
            color: const Color(0xFF1A3A1A),
          ),
        ],
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;

  const _EventCard({required this.icon, required this.title, required this.subtitle, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 240,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primary, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WeekStatsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        Expanded(child: _StatCard(number: '12', label: 'VEGETABLES', color: AppColors.primary)),
        SizedBox(width: 10),
        Expanded(child: _StatCard(number: '4', label: 'DAIRY', color: AppColors.primary)),
        SizedBox(width: 10),
        Expanded(child: _StatCard(number: '8', label: 'STAPLES', color: AppColors.primary)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String number;
  final String label;
  final Color color;

  const _StatCard({required this.number, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Text(number, style: TextStyle(color: color, fontSize: 28, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.8)),
        ],
      ),
    );
  }
}

class _OrderNowBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(12),
      child: ElevatedButton(
        onPressed: () {},
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Text('Order Now — ₹285', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
            SizedBox(width: 10),
            Icon(Icons.auto_awesome, color: Colors.white, size: 20),
          ],
        ),
      ),
    );
  }
}
