import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { GharCard } from "@/components/GharCard";
import { GharButton } from "@/components/GharButton";
import { useApp } from "@/contexts/AppContext";
import { generateMealPlan } from "@/services/gemini";
import * as Haptics from "expo-haptics";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const { family, mealPlan, setMealPlan } = useApp();
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const handleGenerate = async () => {
    if (!family) return;
    setLoading(true);
    setError("");
    try {
      const plan = await generateMealPlan(
        family.region,
        family.dietaryPreference
      );
      setMealPlan(plan);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError("Failed to generate meal plan. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const currentDayPlan = mealPlan[selectedDay];
  const MEALS = [
    { key: "breakfast", label: "Breakfast", icon: "☀️", time: "7:00 AM" },
    { key: "lunch", label: "Lunch", icon: "🌤️", time: "1:00 PM" },
    { key: "dinner", label: "Dinner", icon: "🌙", time: "8:00 PM" },
  ] as const;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Weekly Meal Plan</Text>
            <Text style={styles.subtitle}>
              {family?.region} • {family?.dietaryPreference}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Feather name="refresh-cw" size={18} color={Colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Generate CTA */}
        {mealPlan.length === 0 && !loading && (
          <GharCard style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No Meal Plan Yet</Text>
            <Text style={styles.emptyText}>
              Let AI generate a personalized 7-day Indian meal plan based on
              your family's region and diet preferences.
            </Text>
            <GharButton
              title="Generate AI Meal Plan"
              onPress={handleGenerate}
              icon={
                <Feather name="zap" size={16} color="#fff" />
              }
            />
          </GharCard>
        )}

        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              Minani is crafting your perfect meal plan...
            </Text>
            <Text style={styles.loadingSubText}>
              Considering {family?.region} cuisine & {family?.dietaryPreference}{" "}
              diet
            </Text>
          </View>
        )}

        {error ? (
          <GharCard style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <GharButton title="Try Again" onPress={handleGenerate} />
          </GharCard>
        ) : null}

        {mealPlan.length > 0 && (
          <>
            {/* Day Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayScroll}
            >
              {mealPlan.map((day, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayBtn,
                    selectedDay === i && styles.dayBtnSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDay(i);
                  }}
                >
                  <Text
                    style={[
                      styles.dayName,
                      selectedDay === i && styles.dayNameSelected,
                    ]}
                  >
                    {DAY_NAMES[i]}
                  </Text>
                  <Text
                    style={[
                      styles.dayNum,
                      selectedDay === i && styles.dayNumSelected,
                    ]}
                  >
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Day Title */}
            <Text style={styles.selectedDayTitle}>
              {currentDayPlan?.dayName || `Day ${selectedDay + 1}`}
            </Text>

            {/* Meals */}
            <View style={styles.mealsList}>
              {MEALS.map((meal) => (
                <GharCard key={meal.key} style={styles.mealCard} elevated>
                  <View style={styles.mealCardTop}>
                    <Text style={styles.mealEmoji}>{meal.icon}</Text>
                    <View>
                      <Text style={styles.mealLabel}>{meal.label}</Text>
                      <Text style={styles.mealTime}>{meal.time}</Text>
                    </View>
                  </View>
                  <Text style={styles.mealName}>
                    {currentDayPlan?.meals?.[meal.key] || "Not planned"}
                  </Text>
                  <View style={styles.mealActions}>
                    <TouchableOpacity style={styles.mealAction}>
                      <Feather name="book-open" size={14} color={Colors.textMuted} />
                      <Text style={styles.mealActionText}>Recipe</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mealAction}>
                      <Feather name="plus" size={14} color={Colors.textMuted} />
                      <Text style={styles.mealActionText}>Add to List</Text>
                    </TouchableOpacity>
                  </View>
                </GharCard>
              ))}
            </View>

            {/* Week Regenerate */}
            <GharButton
              title="Regenerate Week"
              onPress={handleGenerate}
              variant="outline"
              loading={loading}
              icon={<Feather name="refresh-cw" size={15} color={Colors.primary} />}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: "700" as const,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  refreshBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCard: {
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700" as const,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  loadingCard: {
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  loadingText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  loadingSubText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  errorCard: {
    borderColor: Colors.danger,
    gap: 12,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
  },
  dayScroll: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 20,
  },
  dayBtn: {
    width: 52,
    height: 64,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  dayBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayName: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "500" as const,
    textTransform: "uppercase",
  },
  dayNameSelected: { color: "#fff" },
  dayNum: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700" as const,
  },
  dayNumSelected: { color: "#fff" },
  selectedDayTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 16,
  },
  mealsList: { gap: 12, marginBottom: 20 },
  mealCard: { gap: 10 },
  mealCardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  mealEmoji: { fontSize: 28 },
  mealLabel: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  mealTime: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  mealName: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  mealActions: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  mealAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mealActionText: { color: Colors.textMuted, fontSize: 13 },
});
