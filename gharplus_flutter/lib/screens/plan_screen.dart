import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/gharplus_header.dart';
import '../widgets/minani_fab.dart';

class PlanScreen extends StatefulWidget {
  const PlanScreen({super.key});

  @override
  State<PlanScreen> createState() => _PlanScreenState();
}

class _PlanScreenState extends State<PlanScreen> {
  int _selectedDay = 0;
  bool _hasplan = false;
  bool _generating = false;

  final List<String> _dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  Future<void> _generatePlan() async {
    setState(() => _generating = true);
    await Future.delayed(const Duration(seconds: 2));
    setState(() {
      _generating = false;
      _hasplan = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                const GharPlusHeader(),
                // Day selector
                _DaySelector(
                  selectedDay: _selectedDay,
                  dayNames: _dayNames,
                  onDaySelected: (i) => setState(() => _selectedDay = i),
                ),
                const Divider(color: AppColors.border, height: 1),
                Expanded(
                  child: _hasplan
                      ? _MealPlanContent(selectedDay: _selectedDay, dayNames: _dayNames)
                      : _EmptyPlanContent(generating: _generating, onGenerate: _generatePlan),
                ),
              ],
            ),
            // Generate Shopping List bottom bar
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
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
                      Text('Generate Shopping List', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                      SizedBox(width: 10),
                      Icon(Icons.auto_awesome, color: Colors.white, size: 20),
                    ],
                  ),
                ),
              ),
            ),
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

class _DaySelector extends StatelessWidget {
  final int selectedDay;
  final List<String> dayNames;
  final ValueChanged<int> onDaySelected;

  const _DaySelector({required this.selectedDay, required this.dayNames, required this.onDaySelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 90,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: dayNames.length,
        itemBuilder: (_, i) {
          final isSelected = selectedDay == i;
          return GestureDetector(
            onTap: () => onDaySelected(i),
            child: Container(
              width: 64,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    dayNames[i],
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textMuted,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${i + 1}',
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    width: 5,
                    height: 5,
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.white : AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _EmptyPlanContent extends StatelessWidget {
  final bool generating;
  final VoidCallback onGenerate;

  const _EmptyPlanContent({required this.generating, required this.onGenerate});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(
                color: AppColors.surface,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.calendar_today, color: AppColors.textSecondary, size: 32),
            ),
            const SizedBox(height: 20),
            const Text(
              'No plan generated yet. Tap\nAI Generate to start.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textSecondary, fontSize: 16, height: 1.6),
            ),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: generating ? null : onGenerate,
                child: generating
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                          SizedBox(width: 12),
                          Text('Generating...', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                        ],
                      )
                    : const Text('Generate Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MealPlanContent extends StatelessWidget {
  final int selectedDay;
  final List<String> dayNames;

  const _MealPlanContent({required this.selectedDay, required this.dayNames});

  @override
  Widget build(BuildContext context) {
    const meals = {
      'Breakfast': 'Idli with Sambar & Coconut Chutney',
      'Lunch': 'Dal Tadka with Jeera Rice & Raita',
      'Dinner': 'Roti with Paneer Butter Masala',
    };

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          dayNames[selectedDay],
          style: const TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 16),
        ...meals.entries.map((e) => _MealCard(mealType: e.key, mealName: e.value)),
        const SizedBox(height: 100),
      ],
    );
  }
}

class _MealCard extends StatelessWidget {
  final String mealType;
  final String mealName;

  const _MealCard({required this.mealType, required this.mealName});

  static const icons = {
    'Breakfast': '☀️',
    'Lunch': '🌤️',
    'Dinner': '🌙',
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Text(icons[mealType] ?? '🍽️', style: const TextStyle(fontSize: 28)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(mealType, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, letterSpacing: 1, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(mealName, style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
