import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";
import { GharCard } from "@/components/GharCard";
import { GharButton } from "@/components/GharButton";
import { useApp, PantryItem } from "@/contexts/AppContext";
import { analyzePantryImage } from "@/services/gemini";
import * as Haptics from "expo-haptics";

const STATUS_COLORS: Record<PantryItem["status"], string> = {
  Good: Colors.success,
  Low: Colors.warning,
  Out: Colors.danger,
};

const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Grains",
  "Spices",
  "Pulses",
  "Oils",
  "Snacks",
  "Beverages",
  "Other",
];

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function PantryScreen() {
  const insets = useSafeAreaInsets();
  const { pantryItems, addPantryItem, removePantryItem, updatePantryItem } =
    useApp();
  const [filter, setFilter] = useState<"All" | PantryItem["status"]>("All");
  const [scanning, setScanning] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newCat, setNewCat] = useState(CATEGORIES[0]);
  const [newStatus, setNewStatus] = useState<PantryItem["status"]>("Good");
  const [search, setSearch] = useState("");

  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const filtered = pantryItems.filter((item) => {
    const matchesFilter = filter === "All" || item.status === filter;
    const matchesSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleFridgeScan = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need access to your photos to scan your fridge."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (!asset.base64) return;
      setScanning(true);
      try {
        const items = await analyzePantryImage(
          asset.base64,
          asset.mimeType || "image/jpeg"
        );
        items.forEach((item) => {
          addPantryItem({
            name: item.name,
            quantity: item.quantity,
            category: "Other",
            status: "Good",
          });
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Scan Complete",
          `Added ${items.length} items from your fridge!`
        );
      } catch {
        Alert.alert("Scan Failed", "Could not analyze the image. Please try again.");
      } finally {
        setScanning(false);
      }
    }
  };

  const handleAddItem = () => {
    if (!newName.trim()) return;
    addPantryItem({
      name: newName.trim(),
      quantity: newQty || "1 unit",
      category: newCat,
      status: newStatus,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNewName("");
    setNewQty("");
    setNewCat(CATEGORIES[0]);
    setNewStatus("Good");
    setAddModalVisible(false);
  };

  const counts = {
    All: pantryItems.length,
    Good: pantryItems.filter((i) => i.status === "Good").length,
    Low: pantryItems.filter((i) => i.status === "Low").length,
    Out: pantryItems.filter((i) => i.status === "Out").length,
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pantry</Text>
          <Text style={styles.subtitle}>{pantryItems.length} items tracked</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionIcon}
            onPress={handleFridgeScan}
            disabled={scanning}
          >
            {scanning ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Feather name="camera" size={18} color={Colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionIcon, { backgroundColor: Colors.primary }]}
            onPress={() => setAddModalVisible(true)}
          >
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pantry..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(["All", "Good", "Low", "Out"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f}{" "}
              <Text style={styles.filterCount}>{counts[f]}</Text>
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scan Banner */}
      {scanning && (
        <GharCard style={styles.scanBanner}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.scanText}>
            AI is analyzing your fridge...
          </Text>
        </GharCard>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptyText}>
              {pantryItems.length === 0
                ? "Add items manually or scan your fridge"
                : "Try a different filter or search"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <GharCard style={styles.itemCard} elevated>
            <View style={styles.itemRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: STATUS_COLORS[item.status] },
                ]}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} • {item.category}
                </Text>
              </View>
              <View style={styles.itemRight}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${STATUS_COLORS[item.status]}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[item.status] },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  {(["Good", "Low", "Out"] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusBtn,
                        item.status === s && {
                          backgroundColor: STATUS_COLORS[s],
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updatePantryItem(item.id, { status: s });
                      }}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          item.status === s && { color: "#fff" },
                        ]}
                      >
                        {s[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      removePantryItem(item.id);
                    }}
                  >
                    <Feather name="trash-2" size={16} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </GharCard>
        )}
      />

      {/* Add Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setAddModalVisible(false)}
        />
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
        >
          <Text style={styles.sheetTitle}>Add Pantry Item</Text>
          <TextInput
            style={styles.input}
            placeholder="Item name (e.g. Tomatoes)"
            placeholderTextColor={Colors.textMuted}
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Quantity (e.g. 1 kg)"
            placeholderTextColor={Colors.textMuted}
            value={newQty}
            onChangeText={setNewQty}
          />
          <Text style={styles.sheetLabel}>Category</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.catBtn,
                  newCat === c && styles.catBtnSelected,
                ]}
                onPress={() => setNewCat(c)}
              >
                <Text
                  style={[
                    styles.catText,
                    newCat === c && styles.catTextSelected,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sheetLabel}>Status</Text>
          <View style={styles.statusRow}>
            {(["Good", "Low", "Out"] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusPickBtn,
                  newStatus === s && {
                    backgroundColor: STATUS_COLORS[s],
                    borderColor: STATUS_COLORS[s],
                  },
                ]}
                onPress={() => setNewStatus(s)}
              >
                <Text
                  style={[
                    styles.statusPickText,
                    newStatus === s && { color: "#fff" },
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <GharButton
            title="Add Item"
            onPress={handleAddItem}
            disabled={!newName.trim()}
            style={{ marginTop: 16 }}
          />
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
  title: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: "700" as const,
  },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 10 },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    paddingVertical: 12,
  },
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
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "500" as const,
  },
  filterTextActive: { color: "#fff" },
  filterCount: { fontWeight: "700" as const },
  scanBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    borderColor: Colors.primary,
    backgroundColor: "rgba(230,126,34,0.08)",
  },
  scanText: { color: Colors.primary, fontSize: 14 },
  list: { padding: 20, gap: 10, paddingBottom: 120 },
  itemCard: { padding: 14 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  itemInfo: { flex: 1 },
  itemName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600" as const,
  },
  itemMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  itemRight: { alignItems: "flex-end", gap: 8 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: "600" as const },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusBtnText: { color: Colors.textMuted, fontSize: 10, fontWeight: "700" as const },
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
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
  input: {
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600" as const,
    marginTop: 14,
    marginBottom: 8,
  },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catText: { color: Colors.textMuted, fontSize: 13 },
  catTextSelected: { color: "#fff" },
  statusRow: { flexDirection: "row", gap: 10 },
  statusPickBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusPickText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "600" as const },
});
