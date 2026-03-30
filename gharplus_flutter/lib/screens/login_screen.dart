import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme.dart';
import '../config.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _supabase = Supabase.instance.client;
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  bool _isLoading = false;
  bool _otpSent = false;

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);
    try {
      final res = await _supabase.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: '${AppConfig.appScheme}://login-callback',
        authScreenLaunchMode: LaunchMode.externalApplication,
      );
      if (!res) throw Exception('Google Sign-In was cancelled');
      // Auth state listener in main.dart handles navigation
    } on AuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppColors.danger),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid 10-digit number')),
      );
      return;
    }
    setState(() => _isLoading = true);
    try {
      await _supabase.auth.signInWithOtp(phone: '+91$phone');
      if (mounted) setState(() => _otpSent = true);
    } on AuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _verifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter the OTP you received')),
      );
      return;
    }
    setState(() => _isLoading = true);
    try {
      await _supabase.auth.verifyOTP(
        phone: '+91${_phoneController.text.trim()}',
        token: otp,
        type: OtpType.sms,
      );
      // Auth state listener in main.dart handles navigation
    } on AuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(flex: 2),
              // App Logo
              Image.asset('assets/images/logo.png', width: 88, height: 88, fit: BoxFit.contain),
              const SizedBox(height: 32),
              const Text(
                'GHARPLUS',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 3.0,
                ),
              ),
              const Spacer(flex: 2),
              // Google Sign In
              GestureDetector(
                onTap: _isLoading ? null : _signInWithGoogle,
                child: Container(
                  width: double.infinity,
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('G', style: TextStyle(color: Color(0xFF4285F4), fontSize: 22, fontWeight: FontWeight.w800)),
                      const SizedBox(width: 10),
                      const Text(
                        'Continue with Google',
                        style: TextStyle(color: Color(0xFF333333), fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                      if (_isLoading && !_otpSent) ...[
                        const SizedBox(width: 10),
                        const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF4285F4))),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // OR divider
              Row(
                children: const [
                  Expanded(child: Divider(color: AppColors.border, thickness: 1)),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child: Text('OR', style: TextStyle(color: AppColors.textMuted, fontSize: 12, fontWeight: FontWeight.w600)),
                  ),
                  Expanded(child: Divider(color: AppColors.border, thickness: 1)),
                ],
              ),
              const SizedBox(height: 24),
              // Phone / OTP
              if (!_otpSent) ...[
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                        decoration: const BoxDecoration(
                          border: Border(right: BorderSide(color: AppColors.border)),
                        ),
                        child: const Text('+91', style: TextStyle(color: AppColors.textSecondary, fontSize: 16, fontWeight: FontWeight.w600)),
                      ),
                      Expanded(
                        child: TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          maxLength: 10,
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 16),
                          decoration: const InputDecoration(
                            hintText: 'Phone Number',
                            hintStyle: TextStyle(color: AppColors.textMuted),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(horizontal: 16),
                            counterText: '',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _sendOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF8B4513),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Send OTP via SMS', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                  ),
                ),
              ] else ...[
                Text(
                  'OTP sent to +91 ${_phoneController.text}',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 24, letterSpacing: 8),
                  decoration: InputDecoration(
                    hintText: '• • • • • •',
                    hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 20, letterSpacing: 8),
                    filled: true,
                    fillColor: AppColors.surface,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
                    counterText: '',
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _verifyOtp,
                    child: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Verify OTP', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  ),
                ),
                TextButton(
                  onPressed: () => setState(() { _otpSent = false; _otpController.clear(); }),
                  child: const Text('← Change number', style: TextStyle(color: AppColors.textMuted)),
                ),
              ],
              const Spacer(),
              const Text.rich(
                TextSpan(
                  text: 'By continuing, you agree to our ',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                  children: [
                    TextSpan(text: 'Terms of Service', style: TextStyle(color: AppColors.textPrimary, decoration: TextDecoration.underline)),
                    TextSpan(text: ' and '),
                    TextSpan(text: 'Privacy Policy', style: TextStyle(color: AppColors.textPrimary, decoration: TextDecoration.underline)),
                    TextSpan(text: '.'),
                  ],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
