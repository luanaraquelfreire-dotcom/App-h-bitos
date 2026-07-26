interface SegmentedControlOption<T extends string> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Toggle de abas em pílula, usado para alternar entre sub-visões dentro de uma página. */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`flex gap-1 overflow-x-auto rounded-2xl bg-duo-gray/40 p-1 backdrop-blur-md ${className ?? "mb-4"}`}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`flex-1 whitespace-nowrap rounded-xl px-2 py-2 text-xs font-semibold ${
            value === opt.id ? "bg-white/70 text-duo-blue-dark shadow-sm backdrop-blur-md" : "text-duo-gray-dark"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
