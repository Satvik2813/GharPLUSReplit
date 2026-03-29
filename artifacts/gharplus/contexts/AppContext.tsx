import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface FamilyProfile {
  name: string;
  region: string;
  dietaryPreference: string;
  monthlyBudget: number;
  budgetUsed: number;
  memberName: string;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  status: "Good" | "Low" | "Out";
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  quantity: string;
}

export interface MealPlan {
  day: number;
  dayName: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

interface AppContextType {
  family: FamilyProfile | null;
  setFamily: (f: FamilyProfile) => void;
  pantryItems: PantryItem[];
  setPantryItems: (items: PantryItem[]) => void;
  addPantryItem: (item: Omit<PantryItem, "id">) => void;
  removePantryItem: (id: string) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  groceryItems: GroceryItem[];
  setGroceryItems: (items: GroceryItem[]) => void;
  addGroceryItem: (item: Omit<GroceryItem, "id">) => void;
  toggleGroceryItem: (id: string) => void;
  removeGroceryItem: (id: string) => void;
  mealPlan: MealPlan[];
  setMealPlan: (plan: MealPlan[]) => void;
  isSetupComplete: boolean;
  setIsSetupComplete: (v: boolean) => void;
  addBudgetSpend: (amount: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  FAMILY: "@gharplus_family",
  PANTRY: "@gharplus_pantry",
  GROCERY: "@gharplus_grocery",
  MEAL_PLAN: "@gharplus_meal_plan",
  SETUP_DONE: "@gharplus_setup_done",
};

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [family, setFamilyState] = useState<FamilyProfile | null>(null);
  const [pantryItems, setPantryItemsState] = useState<PantryItem[]>([]);
  const [groceryItems, setGroceryItemsState] = useState<GroceryItem[]>([]);
  const [mealPlan, setMealPlanState] = useState<MealPlan[]>([]);
  const [isSetupComplete, setIsSetupCompleteState] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [familyRaw, pantryRaw, groceryRaw, mealRaw, setupRaw] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.FAMILY),
          AsyncStorage.getItem(STORAGE_KEYS.PANTRY),
          AsyncStorage.getItem(STORAGE_KEYS.GROCERY),
          AsyncStorage.getItem(STORAGE_KEYS.MEAL_PLAN),
          AsyncStorage.getItem(STORAGE_KEYS.SETUP_DONE),
        ]);
      if (familyRaw) setFamilyState(JSON.parse(familyRaw));
      if (pantryRaw) setPantryItemsState(JSON.parse(pantryRaw));
      if (groceryRaw) setGroceryItemsState(JSON.parse(groceryRaw));
      if (mealRaw) setMealPlanState(JSON.parse(mealRaw));
      if (setupRaw === "true") setIsSetupCompleteState(true);
    } catch (e) {
      // ignore
    }
  }

  function setFamily(f: FamilyProfile) {
    setFamilyState(f);
    AsyncStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(f));
  }

  function setPantryItems(items: PantryItem[]) {
    setPantryItemsState(items);
    AsyncStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(items));
  }

  function addPantryItem(item: Omit<PantryItem, "id">) {
    const newItem = { ...item, id: generateId() };
    const updated = [...pantryItems, newItem];
    setPantryItems(updated);
  }

  function removePantryItem(id: string) {
    const updated = pantryItems.filter((i) => i.id !== id);
    setPantryItems(updated);
  }

  function updatePantryItem(id: string, updates: Partial<PantryItem>) {
    const updated = pantryItems.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );
    setPantryItems(updated);
  }

  function setGroceryItems(items: GroceryItem[]) {
    setGroceryItemsState(items);
    AsyncStorage.setItem(STORAGE_KEYS.GROCERY, JSON.stringify(items));
  }

  function addGroceryItem(item: Omit<GroceryItem, "id">) {
    const newItem = { ...item, id: generateId() };
    const updated = [...groceryItems, newItem];
    setGroceryItems(updated);
  }

  function toggleGroceryItem(id: string) {
    const updated = groceryItems.map((i) =>
      i.id === id ? { ...i, checked: !i.checked } : i
    );
    setGroceryItems(updated);
  }

  function removeGroceryItem(id: string) {
    const updated = groceryItems.filter((i) => i.id !== id);
    setGroceryItems(updated);
  }

  function setMealPlan(plan: MealPlan[]) {
    setMealPlanState(plan);
    AsyncStorage.setItem(STORAGE_KEYS.MEAL_PLAN, JSON.stringify(plan));
  }

  function setIsSetupComplete(v: boolean) {
    setIsSetupCompleteState(v);
    AsyncStorage.setItem(STORAGE_KEYS.SETUP_DONE, v ? "true" : "false");
  }

  function addBudgetSpend(amount: number) {
    if (!family) return;
    const updated = { ...family, budgetUsed: family.budgetUsed + amount };
    setFamily(updated);
  }

  return (
    <AppContext.Provider
      value={{
        family,
        setFamily,
        pantryItems,
        setPantryItems,
        addPantryItem,
        removePantryItem,
        updatePantryItem,
        groceryItems,
        setGroceryItems,
        addGroceryItem,
        toggleGroceryItem,
        removeGroceryItem,
        mealPlan,
        setMealPlan,
        isSetupComplete,
        setIsSetupComplete,
        addBudgetSpend,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
