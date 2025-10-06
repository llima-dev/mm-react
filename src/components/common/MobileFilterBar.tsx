import type { Categoria } from "../../types";

interface MobileFilterBarProps {
  categorias: Categoria[];
  filtroAtual: string | null;
  setFiltroAtual: (id: string | null) => void;
}

export default function MobileFilterBar({
  categorias,
  filtroAtual,
  setFiltroAtual,
}: MobileFilterBarProps) {
  return (
    <div className="md:hidden sticky top-[50px] z-20 border-t border-[var(--border)] bg-[var(--app-bg)] flex gap-2 overflow-x-auto px-3 py-1 shadow-sm">
      {/* Botão padrão "Todos" */}
      <button
        onClick={() => setFiltroAtual(null)}
        className={`px-1 py-1 rounded-full text-sm whitespace-nowrap transition-colors duration-200 ${
          !filtroAtual
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)]"
        }`}
      >
        Todos
      </button>

      {/* Mapeia as categorias existentes */}
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setFiltroAtual(cat.id)}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors duration-200 ${
            filtroAtual === cat.id
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)]"
          }`}
        >
          {cat.titulo}
        </button>
      ))}
    </div>
  );
}
