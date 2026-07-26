import { eachDayOfInterval, endOfMonth, startOfMonth } from "date-fns";
import type { MealPlanEntry, MealType, Recipe } from "../types";

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  cafe: "Café da manhã",
  almoco: "Almoço",
  janta: "Janta",
  lanche: "Lanche",
};

export const RECIPE_EMOJIS = [
  "🍗", "🥗", "🍝", "🍲", "🍚", "🥘", "🍛", "🥩",
  "🐟", "🍳", "🥞", "🥪", "🌮", "🍜", "🍤", "🥙",
];

export const UNIT_OPTIONS = ["g", "kg", "ml", "L", "un", "colher(es)", "xícara(s)", "dente(s)"];

export interface ShoppingItem {
  key: string;
  name: string;
  unit: string;
  quantity: number;
}

export function weekdayCountsInMonth(reference: Date): number[] {
  const days = eachDayOfInterval({ start: startOfMonth(reference), end: endOfMonth(reference) });
  const counts = [0, 0, 0, 0, 0, 0, 0];
  days.forEach((d) => {
    counts[d.getDay()] += 1;
  });
  return counts;
}

export function monthlyShoppingList(
  recipes: Recipe[],
  mealPlans: MealPlanEntry[],
  peopleCount: number,
  reference: Date,
): ShoppingItem[] {
  const weekdayCounts = weekdayCountsInMonth(reference);
  const totals = new Map<string, ShoppingItem>();

  for (const plan of mealPlans) {
    const recipe = recipes.find((r) => r.id === plan.recipeId);
    if (!recipe) continue;
    const scale = peopleCount / (recipe.servings || peopleCount);

    for (const day of plan.daysOfWeek) {
      const occurrences = weekdayCounts[day];
      if (!occurrences) continue;

      for (const ing of recipe.ingredients) {
        const name = ing.name.trim();
        const unit = ing.unit.trim();
        if (!name) continue;
        const key = `${name.toLowerCase()}|${unit.toLowerCase()}`;
        const addQty = ing.quantity * scale * occurrences;
        const existing = totals.get(key);
        if (existing) {
          existing.quantity += addQty;
        } else {
          totals.set(key, { key, name, unit, quantity: addQty });
        }
      }
    }
  }

  return Array.from(totals.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function formatQuantity(quantity: number): string {
  const rounded = Math.round(quantity * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
