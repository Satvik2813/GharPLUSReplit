import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { GharButton } from "@/components/GharButton";
import { useApp } from "@/contexts/AppContext";
import * as Haptics from "expo-haptics";

const REGIONS = [
  "Andhra Pradesh",
  "Maharashtra",
  "Punjab",
  "Tamil Nadu",
  "Gujarat",
  "Karnataka",
  "West Bengal",
  "Rajasthan",
  "Kerala",
  "Delhi",
];

const DIETS = [
  "Vegetarian",
  "Non-Vegetarian",
  "Vegan",
  "Eggetarian",
  "Jain Vegetarian",
];

const STEPS = ["Welcome", "Family", "Region", "Diet", "Budget"];

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setFamily, setIsSetupComplete } = useApp();

  const [step, setStep] = useState(0);
  const [memberName, setMemberName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");
  const [budget, setBudget] = useState("15000");

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    setFamily({
      name: familyName || "My Family",
      memberName: memberName || "Member",
      region: selectedRegion || "Maharashtra",
      dietaryPreference: selectedDiet || "Vegetarian",
      monthlyBudget: parseFloat(budget) || 15000,
      budgetUsed: 0,
    });
    setIsSetupComplete(true);
    router.replace("/(tabs)");
  };

  const canProceed = () => {
    if (step === 1) return memberName.length > 0;
    if (step === 2) return selectedRegion.length > 0;
    if (step === 3) return selectedDiet.length > 0;
    return true;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {step === 0 && (
          <View style={styles.section}>
            <Text style={styles.emoji}>🏠</Text>
            <Text style={styles.title}>Welcome to GharPlus</Text>
            <Text style={styles.subtitle}>
              Your smart Indian household manager. Let's set up your family
              profile in just a few steps.
            </Text>
            <View style={styles.featureList}>
              {[
                "🍽️  AI-powered weekly meal plans",
                "🛒  Smart grocery & pantry tracking",
                "💰  Monthly budget management",
                "🤖  Minani AI household assistant",
              ].map((f) => (
                <Text key={f} style={styles.feature}>
                  {f}
                </Text>
              ))}
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.emoji}>👤</Text>
            <Text style={styles.title}>Your Name</Text>
            <Text style={styles.subtitle}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              value={memberName}
              onChangeText={setMemberName}
              autoFocus
            />
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Family name (optional)"
              placeholderTextColor={Colors.textMuted}
              value={familyName}
              onChangeText={setFamilyName}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.emoji}>🗺️</Text>
            <Text style={styles.title}>Your Region</Text>
            <Text style={styles.subtitle}>
              This helps us suggest regional recipes
            </Text>
            <View style={styles.optionGrid}>
              {REGIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.option,
                    selectedRegion === r && styles.optionSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedRegion(r);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedRegion === r && styles.optionTextSelected,
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.emoji}>🥗</Text>
            <Text style={styles.title}>Dietary Preference</Text>
            <Text style={styles.subtitle}>
              We'll plan meals that match your diet
            </Text>
            <View style={styles.optionList}>
              {DIETS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.optionRow,
                    selectedDiet === d && styles.optionRowSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDiet(d);
                  }}
                >
                  <Text
                    style={[
                      styles.optionRowText,
                      selectedDiet === d && styles.optionTextSelected,
                    ]}
                  >
                    {d}
                  </Text>
                  {selectedDiet === d && (
                    <View style={styles.checkCircle}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.section}>
            <Text style={styles.emoji}>💰</Text>
            <Text style={styles.title}>Monthly Grocery Budget</Text>
            <Text style={styles.subtitle}>
              We'll help you track and stay within budget
            </Text>
            <View style={styles.budgetRow}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                style={styles.budgetInput}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <Text style={styles.budgetHint}>
              Average Indian family spends ₹10,000–₹25,000/month
            </Text>
          </View>
        )}

        <GharButton
          title={step === STEPS.length - 1 ? "Get Started" : "Continue"}
          onPress={handleNext}
          disabled={!canProceed()}
          style={styles.btn}
        />
        {step > 0 && (
          <TouchableOpacity
            onPress={() => setStep((s) => s - 1)}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  section: {
    marginBottom: 40,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  featureList: {
    gap: 14,
  },
  feature: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "600" as const,
  },
  optionList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(230,126,34,0.1)",
  },
  optionRowText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700" as const,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  rupee: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: "700" as const,
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "700" as const,
    padding: 16,
  },
  budgetHint: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  btn: {
    marginBottom: 16,
  },
  backBtn: {
    alignItems: "center",
    padding: 12,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
});
