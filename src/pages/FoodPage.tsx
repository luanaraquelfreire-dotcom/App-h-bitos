import { Check, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";
import MealPlanFormModal from "../components/MealPlanFormModal";
import RecipeFormModal from "../components/RecipeFormModal";
import SegmentedControl from "../components/SegmentedControl";
import { useHabitStore } from "../store/useHabitStore";
import type { Ingredient, MealPlanEntry, Recipe } from "../types";
import { DAY_LABELS, formatMonthYear, monthKey, nextMonth, prevMonth } from "../utils/date";
import { MEAL_TYPE_LABELS, formatQuantity, monthlyShoppingList } from "../utils/food";

type SubView = "recipes" | "plan" | "list";

const SUB_TABS: { id: SubView; label: string }[] = [
  { id: "recipes", label: "Receitas" },
  { id: "plan", label: "Planejamento" },
  { id: "list", label: "Lista de compras" },
];

export default function FoodPage() {
  const recipes = useHabitStore((s) => s.recipes);
  const mealPlans = useHabitStore((s) => s.mealPlans);
  const peopleCount = useHabitStore((s) => s.peopleCount);
  const shoppingChecked = useHabitStore((s) => s.shoppingChecked);
  const addRecipe = useHabitStore((s) => s.addRecipe);
  const updateRecipe = useHabitStore((s) => s.updateRecipe);
  const removeRecipe = useHabitStore((s) => s.removeRecipe);
  const addMealPlan = useHabitStore((s) => s.addMealPlan);
  const updateMealPlan = useHabitStore((s) => s.updateMealPlan);
  const removeMealPlan = useHabitStore((s) => s.removeMealPlan);
  const setPeopleCount = useHabitStore((s) => s.setPeopleCount);
  const toggleShoppingChecked = useHabitStore((s) => s.toggleShoppingChecked);

  const [subView, setSubView] = useState<SubView>("recipes");
  const [showRecipeAdd, setShowRecipeAdd] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showPlanAdd, setShowPlanAdd] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlanEntry | null>(null);
  const [reference, setReference] = useState(new Date());

  function createRecipeAndGetId(data: {
    name: string;
    emoji: string;
    servings: number;
    ingredients: Ingredient[];
  }): string {
    addRecipe(data);
    const latest = useHabitStore.getState().recipes;
    return latest[latest.length - 1].id;
  }

  const currentMonthKey = monthKey(reference);
  const checkedItems = new Set(shoppingChecked[currentMonthKey] ?? []);
  const shoppingList = monthlyShoppingList(recipes, mealPlans, peopleCount, reference);

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-2xl font-extrabold text-duo-text">Alimentação</h1>

      <SegmentedControl options={SUB_TABS} value={subView} onChange={setSubView} className="mb-5" />

      {subView === "recipes" && (
        <>
          {recipes.length === 0 ? (
            <EmptyState
              title="Nenhuma receita cadastrada"
              description="Cadastre suas receitas com os ingredientes para poder planejar as refeições."
            />
          ) : (
            <div className="mb-5 space-y-2.5">
              {recipes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setEditingRecipe(r)}
                  className="duo-card flex w-full items-center gap-3 rounded-2xl border-duo-gray bg-white px-4 py-3 text-left"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-duo-yellow/15 text-xl">
                    {r.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold text-duo-text">{r.name}</span>
                    <span className="block text-xs font-semibold text-duo-gray-dark">
                      {r.servings} porções · {r.ingredients.length} ingredientes
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowRecipeAdd(true)}
            className="duo-btn flex w-full items-center justify-center gap-2 rounded-2xl border-duo-blue-dark bg-duo-blue py-3.5 font-extrabold uppercase tracking-wide text-white"
          >
            <Plus size={20} strokeWidth={3} />
            Nova receita
          </button>
        </>
      )}

      {subView === "plan" && (
        <>
          <div className="mb-4 flex items-center justify-between rounded-2xl border-2 border-duo-gray bg-white px-4 py-3">
            <span className="text-sm font-bold text-duo-text">Pessoas na casa</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPeopleCount(peopleCount - 1)}
                className="grid h-8 w-8 place-items-center rounded-full border-2 border-duo-gray text-duo-gray-dark"
              >
                <Minus size={16} />
              </button>
              <span className="w-4 text-center font-extrabold text-duo-text">{peopleCount}</span>
              <button
                onClick={() => setPeopleCount(peopleCount + 1)}
                className="grid h-8 w-8 place-items-center rounded-full border-2 border-duo-gray text-duo-gray-dark"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {mealPlans.length === 0 ? (
            <EmptyState
              title="Nenhuma refeição planejada"
              description="Escolha uma receita e os dias da semana em que ela se repete."
            />
          ) : (
            <div className="mb-5 space-y-2.5">
              {mealPlans.map((p) => {
                const recipe = recipes.find((r) => r.id === p.recipeId);
                const daysLabel =
                  p.daysOfWeek.length === 7
                    ? "Todos os dias"
                    : p.daysOfWeek.map((d) => DAY_LABELS[d]).join(" ");
                return (
                  <button
                    key={p.id}
                    onClick={() => setEditingPlan(p)}
                    className="duo-card flex w-full items-center gap-3 rounded-2xl border-duo-gray bg-white px-4 py-3 text-left"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-duo-yellow/15 text-xl">
                      {recipe?.emoji ?? "🍽️"}
                    </span>
                    <span className="flex-1">
                      <span className="block font-bold text-duo-text">
                        {recipe?.name ?? "Receita removida"}
                      </span>
                      <span className="block text-xs font-semibold text-duo-gray-dark">
                        {MEAL_TYPE_LABELS[p.mealType]} · {daysLabel}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setShowPlanAdd(true)}
            className="duo-btn flex w-full items-center justify-center gap-2 rounded-2xl border-duo-blue-dark bg-duo-blue py-3.5 font-extrabold uppercase tracking-wide text-white"
          >
            <Plus size={20} strokeWidth={3} />
            Planejar refeição
          </button>
        </>
      )}

      {subView === "list" && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setReference((r) => prevMonth(r))}
              className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-extrabold text-duo-text">{formatMonthYear(reference)}</span>
            <button
              onClick={() => setReference((r) => nextMonth(r))}
              className="grid h-9 w-9 place-items-center rounded-full bg-duo-gray/60 text-duo-text"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {shoppingList.length === 0 ? (
            <EmptyState
              title="Nada para comprar ainda"
              description='Planeje refeições na aba "Planejamento" para gerar a lista deste mês.'
            />
          ) : (
            <>
              <p className="mb-3 text-xs font-semibold text-duo-gray-dark">
                Baseado no seu planejamento, para {peopleCount} pessoa{peopleCount !== 1 ? "s" : ""},
                ao longo de {formatMonthYear(reference).toLowerCase()}.
              </p>
              <div className="space-y-2">
                {shoppingList.map((item) => {
                  const done = checkedItems.has(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleShoppingChecked(currentMonthKey, item.key)}
                      className="duo-card flex w-full items-center gap-3 rounded-2xl border-duo-gray bg-white px-4 py-3 text-left"
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${
                          done
                            ? "border-duo-green-dark bg-duo-green text-white"
                            : "border-duo-gray bg-white text-duo-gray"
                        }`}
                      >
                        <Check size={16} strokeWidth={3} />
                      </span>
                      <span
                        className={`flex-1 font-bold ${
                          done ? "text-duo-gray-dark line-through" : "text-duo-text"
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="shrink-0 text-sm font-extrabold text-duo-purple-dark">
                        {formatQuantity(item.quantity)} {item.unit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {showRecipeAdd && (
        <RecipeFormModal
          onClose={() => setShowRecipeAdd(false)}
          onSave={(data) => {
            addRecipe(data);
            setShowRecipeAdd(false);
          }}
        />
      )}

      {editingRecipe && (
        <RecipeFormModal
          initial={editingRecipe}
          onClose={() => setEditingRecipe(null)}
          onSave={(data) => {
            updateRecipe(editingRecipe.id, data);
            setEditingRecipe(null);
          }}
          onDelete={() => {
            removeRecipe(editingRecipe.id);
            setEditingRecipe(null);
          }}
        />
      )}

      {showPlanAdd && (
        <MealPlanFormModal
          recipes={recipes}
          onClose={() => setShowPlanAdd(false)}
          onSave={(data) => {
            addMealPlan(data);
            setShowPlanAdd(false);
          }}
          onCreateRecipe={createRecipeAndGetId}
        />
      )}

      {editingPlan && (
        <MealPlanFormModal
          initial={editingPlan}
          recipes={recipes}
          onClose={() => setEditingPlan(null)}
          onSave={(data) => {
            updateMealPlan(editingPlan.id, data);
            setEditingPlan(null);
          }}
          onDelete={() => {
            removeMealPlan(editingPlan.id);
            setEditingPlan(null);
          }}
          onCreateRecipe={createRecipeAndGetId}
        />
      )}
    </div>
  );
}
