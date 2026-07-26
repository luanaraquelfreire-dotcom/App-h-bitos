import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { Ingredient, MealPlanEntry, MealType, Recipe } from "../types";
import { DAY_LABELS } from "../utils/date";
import { MEAL_TYPE_LABELS } from "../utils/food";
import ModalShell from "./ModalShell";
import RecipeFormModal from "./RecipeFormModal";

const MEAL_TYPES: MealType[] = ["cafe", "almoco", "janta", "lanche"];

interface MealPlanFormModalProps {
  initial?: MealPlanEntry;
  recipes: Recipe[];
  onClose: () => void;
  onSave: (data: { recipeId: string; mealType: MealType; daysOfWeek: number[] }) => void;
  onDelete?: () => void;
  onCreateRecipe: (data: {
    name: string;
    emoji: string;
    servings: number;
    ingredients: Ingredient[];
  }) => string;
}

export default function MealPlanFormModal({
  initial,
  recipes,
  onClose,
  onSave,
  onDelete,
  onCreateRecipe,
}: MealPlanFormModalProps) {
  const [recipeId, setRecipeId] = useState(initial?.recipeId ?? recipes[0]?.id ?? "");
  const [mealType, setMealType] = useState<MealType>(initial?.mealType ?? "janta");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initial?.daysOfWeek ?? []);
  const [showRecipeCreator, setShowRecipeCreator] = useState(false);

  const canSave = recipeId.length > 0 && daysOfWeek.length > 0;

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function handleSave() {
    if (!canSave) return;
    onSave({ recipeId, mealType, daysOfWeek });
  }

  return (
    <>
      <ModalShell title={initial ? "Editar planejamento" : "Planejar refeição"} onClose={onClose}>
          <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">Receita</label>
          {recipes.length > 0 && (
            <select
              value={recipeId}
              onChange={(e) => setRecipeId(e.target.value)}
              className="mb-2 w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
            >
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.emoji} {r.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowRecipeCreator(true)}
            className="mb-4 text-sm font-extrabold text-duo-blue-dark"
          >
            + Criar nova receita
          </button>

          <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
            Tipo de refeição
          </label>
          <div className="mb-4 grid grid-cols-4 gap-1.5">
            {MEAL_TYPES.map((mt) => (
              <button
                key={mt}
                onClick={() => setMealType(mt)}
                className={`rounded-xl border-2 px-1 py-2 text-xs font-extrabold ${
                  mealType === mt
                    ? "border-duo-green-dark bg-duo-green/10 text-duo-green-dark"
                    : "border-duo-gray text-duo-gray-dark"
                }`}
              >
                {MEAL_TYPE_LABELS[mt]}
              </button>
            ))}
          </div>

          <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
            Repetir nos dias
          </label>
          <div className="mb-6 flex gap-1.5">
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-extrabold ${
                  daysOfWeek.includes(i)
                    ? "border-duo-green-dark bg-duo-green text-white"
                    : "border-duo-gray bg-white text-duo-gray-dark"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="duo-btn w-full rounded-2xl border-duo-green-dark bg-duo-green py-3.5 text-center font-extrabold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:border-duo-gray-dark disabled:bg-duo-gray disabled:text-duo-gray-dark"
          >
            {initial ? "Salvar alterações" : "Adicionar ao planejamento"}
          </button>

          {initial && onDelete && (
            <button
              onClick={onDelete}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-extrabold uppercase tracking-wide text-duo-red-dark"
            >
              <Trash2 size={18} />
              Remover do planejamento
            </button>
          )}
      </ModalShell>

      {showRecipeCreator && (
        <RecipeFormModal
          onClose={() => setShowRecipeCreator(false)}
          onSave={(data) => {
            const id = onCreateRecipe(data);
            setRecipeId(id);
            setShowRecipeCreator(false);
          }}
        />
      )}
    </>
  );
}
