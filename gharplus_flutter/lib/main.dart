import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/login_screen.dart';
import 'screens/main_nav.dart';
import 'theme.dart';
import 'config.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabaseAnonKey.isNotEmpty
        ? AppConfig.supabaseAnonKey
        : const String.fromEnvironment('SUPABASE_ANON_KEY'),
  );

  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const GharPlusApp());
}

final supabase = Supabase.instance.client;

class GharPlusApp extends StatelessWidget {
  const GharPlusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GharPlus',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const _AuthGate(),
    );
  }
}

class _AuthGate extends StatefulWidget {
  const _AuthGate();

  @override
  State<_AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<_AuthGate> {
  @override
  void initState() {
    super.initState();
    supabase.auth.onAuthStateChange.listen((data) {
      if (mounted) setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    final session = supabase.auth.currentSession;
    if (session != null) {
      return const MainNav();
    }
    return const LoginScreen();
  }
}
