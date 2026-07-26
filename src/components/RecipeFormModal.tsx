import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Ingredient, Recipe } from "../types";
import { RECIPE_EMOJIS, UNIT_OPTIONS } from "../utils/food";
import { generateId } from "../utils/id";

interface IngredientRow {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface RecipeFormModalProps {
  initial?: Recipe;
  onClose: () => void;
  onSave: (data: { name: string; emoji: string; servings: number; ingredients: Ingredient[] }) => void;
  onDelete?: () => void;
}

function toRows(ingredients?: Ingredient[]): IngredientRow[] {
  if (!ingredients || ingredients.length === 0) {
    return [{ id: generateId(), name: "", quantity: "", unit: UNIT_OPTIONS[0] }];
  }
  return ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity.toString(),
    unit: i.unit,
  }));
}

export default function RecipeFormModal({ initial, onClose, onSave, onDelete }: RecipeFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? RECIPE_EMOJIS[0]);
  const [servings, setServings] = useState(initial?.servings?.toString() ?? "2");
  const [rows, setRows] = useState<IngredientRow[]>(toRows(initial?.ingredients));

  const validRows = rows.filter((r) => r.name.trim().length > 0);
  const canSave = name.trim().length > 0 && Number(servings) > 0 && validRows.length > 0;

  function updateRow(id: string, patch: Partial<IngredientRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { id: generateId(), name: "", quantity: "", unit: UNIT_OPTIONS[0] }]);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      emoji,
      servings: Number(servings),
      ingredients: validRows.map((r) => ({
        id: r.id,
        name: r.name.trim(),
        quantity: Number(r.quantity) || 0,
        unit: r.unit.trim() || "un",
      })),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-duo-text">
            {initial ? "Editar receita" : "Nova receita"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
          >
            <X size={20} />
          </button>
        </div>

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
          Nome da receita
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Frango grelado com legumes"
          maxLength={60}
          className="mb-4 w-full rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
        />

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">Ícone</label>
        <div className="mb-4 grid grid-cols-8 gap-2">
          {RECIPE_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`grid aspect-square place-items-center rounded-xl border-2 text-lg ${
                emoji === e ? "border-duo-blue bg-duo-blue/10" : "border-transparent bg-duo-gray/40"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-bold uppercase text-duo-gray-dark">
          Rende quantas porções
        </label>
        <input
          type="number"
          min={1}
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          className="mb-4 w-24 rounded-xl border-2 border-duo-gray bg-white px-4 py-3 font-bold text-duo-text outline-none focus:border-duo-blue"
        />

        <label className="mb-2 block text-xs font-bold uppercase text-duo-gray-dark">
          Ingredientes
        </label>
        <div className="mb-3 space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex gap-1.5">
              <input
                value={row.name}
                onChange={(e) => updateRow(row.id, { name: e.target.value })}
                placeholder="Ingrediente"
                className="min-w-0 flex-1 rounded-lg border-2 border-duo-gray bg-white px-2.5 py-2 text-sm font-bold text-duo-text outline-none focus:border-duo-blue"
              />
              <input
                type="number"
                min={0}
                step="any"
                value={row.quantity}
                onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                placeholder="Qtd"
                className="w-16 rounded-lg border-2 border-duo-gray bg-white px-2 py-2 text-sm font-bold text-duo-text outline-none focus:border-duo-blue"
              />
              <select
                value={row.unit}
                onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                className="w-24 rounded-lg border-2 border-duo-gray bg-white px-1 py-2 text-sm font-bold text-duo-text outline-none focus:border-duo-blue"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeRow(row.id)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-duo-gray-dark hover:bg-duo-gray"
                aria-label="Remover ingrediente"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="mb-5 flex items-center gap-1.5 text-sm font-extrabold text-duo-blue-dark"
        >
          <Plus size={16} />
          Adicionar ingrediente
        </button>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="duo-btn w-full rounded-2xl border-duo-green-dark bg-duo-green py-3.5 text-center font-extrabold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:border-duo-gray-dark disabled:bg-duo-gray disabled:text-duo-gray-dark"
        >
          {initial ? "Salvar alterações" : "Criar receita"}
        </button>

        {initial && onDelete && (
          <button
            onClick={onDelete}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-extrabold uppercase tracking-wide text-duo-red-dark"
          >
            <Trash2 size={18} />
            Excluir receita
          </button>
        )}
      </div>
    </div>
  );
}
