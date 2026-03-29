import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { GharCard } from "@/components/GharCard";
import { GharButton } from "@/components/GharButton";
import { useApp, GroceryItem } from "@/contexts/AppContext";
import { categorizeGroceries, getSmartSwap } from "@/services/gemini";
import * as Haptics from "expo-haptics";

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

interface SwapModal {
  item: GroceryItem;
  alternative: string;
  reason: string;
  savings: string;
}

export default function OrderScreen() {
  const insets = useSafeAreaInsets();
  const { groceryItems, addGroceryItem, toggleGroceryItem, removeGroceryItem, setGroceryItems, family } = useApp();
  const [newItem, setNewItem] = useState("");
  const [categorizing, setCategorizing] = useState(false);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [swapModal, setSwapModal] = useState<SwapModal | null>(null);
  const [filter, setFilter] = useState<"All" | "Pending" | "Done">("All");

  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const addItem = async () => {
    const text = newItem.trim();
    if (!text) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNewItem("");
    setCategorizing(true);
    try {
      const categorized = await categorizeGroceries([text]);
      addGroceryItem({
        name: categorized[0]?.name || text,
        category: categorized[0]?.category || "Other",
        checked: false,
        quantity: "1 unit",
      });
    } catch {
      addGroceryItem({
        name: text,
        category: "Other",
        checked: false,
        quantity: "1 unit",
      });
    } finally {
      setCategorizing(false);
    }
  };

  const handleSmartSwap = async (item: GroceryItem) => {
    setSwappingId(item.id);
    try {
      const swap = await getSmartSwap(item.name, family?.dietaryPreference || "Vegetarian");
      setSwapModal({ item, ...swap });
    } catch {
      // ignore
    } finally {
      setSwappingId(null);
    }
  };

  const applySwap = () => {
    if (!swapModal) return;
    const updated = groceryItems.map((g) =>
      g.id === swapModal.item.id ? { ...g, name: swapModal.alternative } : g
    );
    setGroceryItems(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSwapModal(null);
  };

  const clearDone = () => {
    const updated = groceryItems.filter((g) => !g.checked);
    setGroceryItems(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const filteredItems = groceryItems.filter((g) => {
    if (filter === "Pending") return !g.checked;
    if (filter === "Done") return g.checked;
    return true;
  });

  const groupedItems = filteredItems.reduce<Record<string, GroceryItem[]>>(
    (acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {}
  );

  const sections = Object.entries(groupedItems);

  const doneCount = groceryItems.filter((g) => g.checked).length;
  const totalCount = groceryItems.length;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Grocery List</Text>
          <Text style={styles.subtitle}>
            {doneCount}/{totalCount} items checked
          </Text>
        </View>
        {doneCount > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearDone}>
            <Text style={styles.clearText}>Clear done</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress */}
      {totalCount > 0 && (
        <View style={styles.progressWrapper}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${(doneCount / totalCount) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Add Item */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Add item (e.g. Onions 1kg)"
          placeholderTextColor={Colors.textMuted}
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addItem}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, (!newItem.trim() || categorizing) && styles.addBtnDisabled]}
          onPress={addItem}
          disabled={!newItem.trim() || categorizing}
        >
          {categorizing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="plus" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(["All", "Pending", "Done"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[styles.filterText, filter === f && styles.filterTextActive]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sections}
        keyExtractor={([cat]) => cat}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>
              {groceryItems.length === 0
                ? "Your list is empty"
                : "No items match filter"}
            </Text>
            <Text style={styles.emptyText}>
              {groceryItems.length === 0
                ? "Add items above or let AI suggest based on your pantry"
                : ""}
            </Text>
          </View>
        }
        renderItem={({ item: [category, items] }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            {items.map((grocery) => (
              <GharCard key={grocery.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      grocery.checked && styles.checkboxChecked,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleGroceryItem(grocery.id);
                    }}
                  >
                    {grocery.checked && (
                      <Feather name="check" size={12} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text
                      style={[
                        styles.itemName,
                        grocery.checked && styles.itemNameDone,
                      ]}
                    >
                      {grocery.name}
                    </Text>
                    <Text style={styles.itemQty}>{grocery.quantity}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.swapBtn}
                      onPress={() => handleSmartSwap(grocery)}
                      disabled={swappingId === grocery.id}
                    >
                      {swappingId === grocery.id ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <>
                          <Feather name="refresh-cw" size={12} color={Colors.primary} />
                          <Text style={styles.swapText}>Swap</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        removeGroceryItem(grocery.id);
                      }}
                    >
                      <Feather name="x" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </GharCard>
            ))}
          </View>
        )}
      />

      {/* Smart Swap Modal */}
      <Modal
        visible={!!swapModal}
        animationType="slide"
        transparent
        onRequestClose={() => setSwapModal(null)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSwapModal(null)}
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.sheetTitle}>Smart Swap Suggestion</Text>
          {swapModal && (
            <>
              <View style={styles.swapCard}>
                <View style={styles.swapRow}>
                  <View style={styles.swapFrom}>
                    <Text style={styles.swapLabel}>Current</Text>
                    <Text style={styles.swapItemName}>{swapModal.item.name}</Text>
                  </View>
                  <Feather name="arrow-right" size={20} color={Colors.primary} />
                  <View style={styles.swapTo}>
                    <Text style={styles.swapLabel}>Suggested</Text>
                    <Text style={[styles.swapItemName, { color: Colors.primary }]}>
                      {swapModal.alternative}
                    </Text>
                  </View>
                </View>
                <View style={styles.swapDivider} />
                <Text style={styles.swapReason}>{swapModal.reason}</Text>
                <View style={styles.savingsRow}>
                  <Feather name="trending-up" size={14} color={Colors.success} />
                  <Text style={styles.savingsText}>{swapModal.savings}</Text>
                </View>
              </View>
              <View style={styles.swapBtns}>
                <GharButton
                  title="Keep Original"
                  onPress={() => setSwapModal(null)}
                  variant="outline"
                  style={{ flex: 1 }}
                />
                <GharButton
                  title="Apply Swap"
                  onPress={applySwap}
                  style={{ flex: 1 }}
                />
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 12,
  },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: "700" as const },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  clearText: { color: Colors.danger, fontSize: 13, fontWeight: "500" as const },
  progressWrapper: { paddingHorizontal: 20, marginBottom: 14 },
  progressBg: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: Colors.success, borderRadius: 2 },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  addInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: { opacity: 0.5 },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textMuted, fontSize: 13, fontWeight: "500" as const },
  filterTextActive: { color: "#fff" },
  list: { padding: 20, paddingBottom: 120 },
  section: { marginBottom: 20 },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "700" as const,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  itemCard: { padding: 14, marginBottom: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: Colors.success, borderColor: Colors.success },
  itemInfo: { flex: 1 },
  itemName: { color: Colors.textPrimary, fontSize: 15, fontWeight: "500" as const },
  itemNameDone: { color: Colors.textMuted, textDecorationLine: "line-through" },
  itemQty: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  swapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  swapText: { color: Colors.primary, fontSize: 11, fontWeight: "600" as const },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 16,
  },
  swapCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  swapFrom: { flex: 1 },
  swapTo: { flex: 1, alignItems: "flex-end" },
  swapLabel: { color: Colors.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  swapItemName: { color: Colors.textPrimary, fontSize: 16, fontWeight: "700" as const },
  swapDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  swapReason: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  savingsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  savingsText: { color: Colors.success, fontSize: 13, fontWeight: "600" as const },
  swapBtns: { flexDirection: "row", gap: 10 },
});
