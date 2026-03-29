import 'package:flutter/material.dart';
import '../theme.dart';
import '../screens/minani_chat_screen.dart';

class MinaniFab extends StatelessWidget {
  const MinaniFab({super.key});

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => const MinaniChatSheet(),
        );
      },
      backgroundColor: AppColors.primary,
      elevation: 6,
      child: const Icon(Icons.auto_awesome, color: Colors.white, size: 24),
    );
  }
}
