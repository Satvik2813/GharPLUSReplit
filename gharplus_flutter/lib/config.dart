class AppConfig {
  static const String supabaseUrl = 'https://xoskumzhbvazqaazgfyt.supabase.co';

  static const String googleClientId =
      '597295922512-pbjefe7ngm74ouqli0skhurvhlv405fu.apps.googleusercontent.com';

  // Loaded at runtime from secure storage / build config
  // Set via --dart-define=SUPABASE_ANON_KEY=... when building
  static const String supabaseAnonKey =
      String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

  static const String appScheme = 'gharplus';
  static const String appDeepLink = '$appScheme://login-callback';
}
