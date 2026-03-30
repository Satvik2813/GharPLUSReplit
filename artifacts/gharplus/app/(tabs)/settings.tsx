import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { GharCard } from "@/components/GharCard";
import { GharButton } from "@/components/GharButton";
import { useApp } from "@/contexts/AppContext";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";

interface SettingRowProps {
  icon: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingRow({ icon, iconColor, label, value, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${iconColor}20` }]}>
        <Feather name={icon as Parameters<typeof Feather>[0]["name"]} size={16} color={iconColor} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {onPress && <Feather name="chevron-right" size={16} color={Colors.textMuted} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { family, setIsSetupComplete, setFamily, setPantryItems, setGroceryItems, setMealPlan } = useApp();

  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsSetupComplete(false);
    setFamily({
      name: "",
      memberName: "",
      region: "",
      dietaryPreference: "",
      monthlyBudget: 0,
      budgetUsed: 0,
    });
    setPantryItems([]);
    setGroceryItems([]);
    setMealPlan([]);
    router.replace("/setup");
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            // Auth state change in _layout.tsx handles redirect to login
          },
        },
      ]
    );
  };

  const handleResetBudget = () => {
    if (!family) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFamily({ ...family, budgetUsed: 0 });
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Profile Card */}
        <GharCard elevated style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {(family?.memberName?.[0] || "G").toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.profileName}>
              {family?.memberName || "Your Name"}
            </Text>
            <Text style={styles.profileFamily}>
              {family?.name || "Your Family"}
            </Text>
          </View>
        </GharCard>

        {/* Family Settings */}
        <Text style={styles.section}>Family Profile</Text>
        <GharCard style={styles.settingGroup}>
          <SettingRow
            icon="map-pin"
            iconColor={Colors.info}
            label="Region"
            value={family?.region || "Not set"}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="heart"
            iconColor={Colors.danger}
            label="Dietary Preference"
            value={family?.dietaryPreference || "Not set"}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="users"
            iconColor={Colors.success}
            label="Family Name"
            value={family?.name || "Not set"}
          />
        </GharCard>

        {/* Budget Settings */}
        <Text style={styles.section}>Budget</Text>
        <GharCard style={styles.settingGroup}>
          <SettingRow
            icon="dollar-sign"
            iconColor={Colors.primary}
            label="Monthly Budget"
            value={`₹${(family?.monthlyBudget || 0).toLocaleString("en-IN")}`}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="refresh-cw"
            iconColor={Colors.warning}
            label="Reset Monthly Spend"
            onPress={handleResetBudget}
          />
        </GharCard>

        {/* App Info */}
        <Text style={styles.section}>App</Text>
        <GharCard style={styles.settingGroup}>
          <SettingRow
            icon="info"
            iconColor={Colors.info}
            label="Version"
            value="1.0.0"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="zap"
            iconColor={Colors.primary}
            label="AI Powered by"
            value="Google Gemini"
          />
        </GharCard>

        {/* Account */}
        <Text style={styles.section}>Account</Text>
        <GharCard style={styles.settingGroup}>
          <SettingRow
            icon="log-out"
            iconColor={Colors.danger}
            label="Sign Out"
            onPress={handleSignOut}
          />
        </GharCard>

        {/* Danger Zone */}
        <Text style={styles.section}>Data</Text>
        <GharButton
          title="Reset & Start Over"
          onPress={handleReset}
          variant="danger"
        />
        <Text style={styles.resetWarning}>
          This will clear all your data including pantry, grocery list, and meal plans.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },
  title: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: "700" as const,
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700" as const,
  },
  profileName: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700" as const,
  },
  profileFamily: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "700" as const,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  settingGroup: {
    padding: 0,
    overflow: "hidden",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "500" as const,
  },
  settingValue: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 66,
  },
  resetWarning: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 10,
  },
});
