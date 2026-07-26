interface ProgressBarProps {
  value: number; // 0 to 1
  colorClass?: string;
  heightClass?: string;
}

export default function ProgressBar({
  value,
  colorClass = "bg-duo-green",
  heightClass = "h-3",
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`w-full overflow-hidden rounded-full bg-duo-gray ${heightClass}`}>
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-300`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
