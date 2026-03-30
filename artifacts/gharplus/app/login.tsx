import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

WebBrowser.maybeCompleteAuthSession();

type Step = "landing" | "phone" | "otp";

export default function LoginScreen() {
  const [step, setStep] = useState<Step>("landing");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectUri = makeRedirectUri({ scheme: "gharplus", path: "login" });

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
      if (data?.url) {
        await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      }
    } catch (err: any) {
      Alert.alert("Sign-in failed", err.message || "Try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    if (phone.trim().length < 10) {
      Alert.alert("Invalid number", "Enter a valid 10-digit number");
      return;
    }
    setLoading(true);
    try {
      const fullPhone = `+91${phone.trim()}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) throw error;
      setStep("otp");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.trim().length < 4) {
      Alert.alert("Invalid OTP", "Enter the OTP you received");
      return;
    }
    setLoading(true);
    try {
      const fullPhone = `+91${phone.trim()}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp.trim(),
        type: "sms",
      });
      if (error) throw error;
      // Auth state change in _layout.tsx will handle navigation
    } catch (err: any) {
      Alert.alert("Invalid OTP", err.message || "Please check the OTP and retry");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* App Name */}
          <Text style={styles.appName}>GHARPLUS</Text>

          <View style={styles.spacer} />

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#333" />
            ) : (
              <>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* OR divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {/* Phone / OTP input */}
          {step === "landing" || step === "phone" ? (
            <>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone Number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                  autoFocus={step === "phone"}
                />
              </View>

              <TouchableOpacity
                style={[styles.otpBtn, loading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.otpBtnText}>Send OTP via SMS</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.otpHint}>
                OTP sent to +91 {phone}
              </Text>
              <TextInput
                style={styles.otpInput}
                placeholder="Enter OTP"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                autoFocus
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.otpBtn, loading && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.otpBtnText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => { setStep("phone"); setOtp(""); }}
              >
                <Text style={styles.backBtnText}>← Change number</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.spacer} />

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {" "}and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
  },
  logoWrap: { alignItems: "center", marginBottom: 16 },
  logo: { width: 88, height: 88 },
  appName: {
    textAlign: "center",
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 3,
    fontFamily: "Inter_700Bold",
  },
  spacer: { flex: 1, minHeight: 40 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    height: 56,
    gap: 10,
    marginBottom: 24,
  },
  googleG: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4285F4",
  },
  googleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  phoneRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: "hidden",
  },
  countryCode: {
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  countryCodeText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  otpBtn: {
    backgroundColor: "#8B4513",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.6 },
  otpBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  otpHint: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
  otpInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 64,
    color: Colors.textPrimary,
    fontSize: 28,
    letterSpacing: 12,
    marginBottom: 16,
  },
  backBtn: { alignItems: "center", marginTop: 12 },
  backBtnText: { color: Colors.textMuted, fontSize: 14 },
  terms: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.textPrimary,
    textDecorationLine: "underline",
  },
});
