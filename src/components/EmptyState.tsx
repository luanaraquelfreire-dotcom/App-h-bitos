interface EmptyStateProps {
  title: string;
  description: string;
}

/** Bloco de "nada aqui ainda" usado quando uma lista está vazia. */
export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-duo-gray px-4 py-8 text-center">
      <p className="mb-1 font-semibold text-duo-text">{title}</p>
      <p className="text-sm text-duo-gray-dark">{description}</p>
    </div>
  );
}
