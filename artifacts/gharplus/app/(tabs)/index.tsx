import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { GharCard } from "@/components/GharCard";
import { MinaniChat } from "@/components/MinaniChat";
import { useApp } from "@/contexts/AppContext";

const { width } = Dimensions.get("window");

const QUICK_ACTIONS = [
  { icon: "mic", label: "Voice Add", color: "#9B59B6", route: "/(tabs)/pantry" },
  { icon: "camera", label: "Fridge Scan", color: "#3498DB", route: "/(tabs)/pantry" },
  { icon: "calendar", label: "Plan Week", color: "#27AE60", route: "/(tabs)/plan" },
  { icon: "shopping-cart", label: "Order Now", color: "#E67E22", route: "/(tabs)/order" },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { family, pantryItems, groceryItems, mealPlan } = useApp();

  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPadding =
    Platform.OS === "web" ? 34 : insets.bottom;

  const budgetPercent = family
    ? Math.min((family.budgetUsed / family.monthlyBudget) * 100, 100)
    : 0;
  const budgetRemaining = family
    ? family.monthlyBudget - family.budgetUsed
    : 0;

  const lowItems = pantryItems.filter(
    (i) => i.status === "Low" || i.status === "Out"
  ).length;
  const pendingGroceries = groceryItems.filter((i) => !i.checked).length;
  const hasMealPlan = mealPlan.length > 0;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: bottomPadding + 100 },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>
              Namaste,{" "}
              <Text style={styles.name}>
                {family?.memberName || "Welcome"}
              </Text>{" "}
              👋
            </Text>
            <Text style={styles.subGreeting}>
              {family?.name ? `${family.name} • ` : ""}
              {family?.region || "Set up your profile"}
            </Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Feather name="bell" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Budget Card */}
        <LinearGradient
          colors={["#E67E22", "#D35400"]}
          style={styles.budgetCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.budgetTop}>
            <View>
              <Text style={styles.budgetLabel}>Monthly Budget</Text>
              <Text style={styles.budgetAmount}>
                ₹{(family?.monthlyBudget || 0).toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.budgetRemaining}>
              <Text style={styles.remainingLabel}>Remaining</Text>
              <Text style={styles.remainingAmount}>
                ₹{budgetRemaining.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${budgetPercent}%` }]}
            />
          </View>
          <Text style={styles.budgetUsedText}>
            ₹{(family?.budgetUsed || 0).toLocaleString("en-IN")} spent of ₹
            {(family?.monthlyBudget || 0).toLocaleString("en-IN")}
          </Text>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <GharCard style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Feather name="package" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.statNum}>{pantryItems.length}</Text>
            <Text style={styles.statLabel}>Pantry Items</Text>
            {lowItems > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{lowItems} low</Text>
              </View>
            )}
          </GharCard>
          <GharCard style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: "rgba(52,152,219,0.1)" }]}>
              <Feather name="shopping-bag" size={18} color={Colors.info} />
            </View>
            <Text style={styles.statNum}>{pendingGroceries}</Text>
            <Text style={styles.statLabel}>To Buy</Text>
          </GharCard>
          <GharCard style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: "rgba(39,174,96,0.1)" }]}>
              <Feather name="calendar" size={18} color={Colors.success} />
            </View>
            <Text style={styles.statNum}>{hasMealPlan ? "7" : "0"}</Text>
            <Text style={styles.statLabel}>Meals Planned</Text>
          </GharCard>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionBtn}
              onPress={() => router.push(action.route as Parameters<typeof router.push>[0])}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: `${action.color}20` },
                ]}
              >
                <Feather name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Low Stock Alert */}
        {lowItems > 0 && (
          <GharCard style={styles.alertCard}>
            <View style={styles.alertRow}>
              <Feather name="alert-triangle" size={18} color={Colors.warning} />
              <Text style={styles.alertTitle}>
                {lowItems} item{lowItems > 1 ? "s" : ""} running low
              </Text>
            </View>
            <Text style={styles.alertSub}>
              Check your pantry and add to shopping list
            </Text>
            <TouchableOpacity
              style={styles.alertAction}
              onPress={() => router.push("/(tabs)/pantry")}
            >
              <Text style={styles.alertActionText}>View Pantry →</Text>
            </TouchableOpacity>
          </GharCard>
        )}

        {/* Today's Meal */}
        {hasMealPlan && (
          <>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <GharCard elevated>
              {["breakfast", "lunch", "dinner"].map((meal) => {
                const todayPlan = mealPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
                const mealName = todayPlan?.meals?.[meal as keyof typeof todayPlan.meals] || "Not planned";
                const icons: Record<string, string> = { breakfast: "☀️", lunch: "🌤️", dinner: "🌙" };
                return (
                  <View key={meal} style={styles.mealRow}>
                    <Text style={styles.mealIcon}>{icons[meal]}</Text>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealType}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                      <Text style={styles.mealName} numberOfLines={1}>{mealName}</Text>
                    </View>
                  </View>
                );
              })}
            </GharCard>
          </>
        )}
      </ScrollView>

      <MinaniChat />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  name: {
    color: Colors.textPrimary,
    fontWeight: "700" as const,
  },
  subGreeting: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  budgetCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  budgetTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  budgetLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 4,
  },
  budgetAmount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700" as const,
  },
  budgetRemaining: {
    alignItems: "flex-end",
  },
  remainingLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 4,
  },
  remainingAmount: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600" as const,
  },
  progressBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  budgetUsedText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(230,126,34,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statNum: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "700" as const,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
  alertBadge: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  alertBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600" as const,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    width: (width - 40 - 12) / 2 - 6,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500" as const,
  },
  alertCard: {
    borderColor: Colors.warning,
    backgroundColor: "rgba(243,156,18,0.08)",
    marginBottom: 24,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  alertTitle: {
    color: Colors.warning,
    fontSize: 15,
    fontWeight: "600" as const,
  },
  alertSub: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 12,
  },
  alertAction: {},
  alertActionText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mealIcon: {
    fontSize: 22,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    color: Colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  mealName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "500" as const,
    marginTop: 2,
  },
});
