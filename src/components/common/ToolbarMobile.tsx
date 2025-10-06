import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoon,
  faSun,
  faBoxArchive,
  faBars,
  faPlus,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

interface ToolbarMobileProps {
  modoEscuro: boolean;
  onToggleModoEscuro: () => void;
  onNovoLembrete: () => void;
  onCategorias: () => void;
  onExportar: () => void;
  onImportar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLimpar: () => void;
  onArquivados: () => void;
  arquivadosCount: number;
  nomeProjeto: string;
  setNomeProjeto: (nome: string) => void;
}

export default function ToolbarMobile({
  modoEscuro,
  onToggleModoEscuro,
  onNovoLembrete,
  onCategorias,
  onExportar,
  onImportar,
  onLimpar,
  onArquivados,
  arquivadosCount,
  nomeProjeto,
  setNomeProjeto,
}: ToolbarMobileProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="md:hidden w-full bg-[var(--card-bg)] border-b border-[var(--border)] shadow-sm">
      <div className="flex items-center justify-between px-3 py-2">
        <input
          type="text"
          className="text-sm px-2 py-1 border rounded-md w-full mr-2 bg-[var(--input-bg)] text-[var(--text)]"
          placeholder="Nome do mural"
          value={nomeProjeto}
          onChange={(e) => setNomeProjeto(e.target.value)}
        />
        <button
          className="p-2 rounded-md hover:bg-[var(--accent)] transition-colors"
          onClick={() => setAberto(!aberto)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      {aberto && (
        <div className="flex flex-col border-t border-[var(--border)] bg-[var(--app-bg)] animate-in fade-in slide-in-from-top-2">
          <button
            className="px-4 py-2 text-left hover:bg-[var(--accent)]"
            onClick={onNovoLembrete}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Novo Lembrete
          </button>

          <button
            className="px-4 py-2 text-left hover:bg-[var(--accent)]"
            onClick={onCategorias}
          >
            <FontAwesomeIcon icon={faList} className="mr-2" /> Categorias
          </button>

          <button
            className="px-4 py-2 text-left hover:bg-[var(--accent)]"
            onClick={onArquivados}
          >
            <FontAwesomeIcon icon={faBoxArchive} className="mr-2" /> Arquivados (
            {arquivadosCount})
          </button>

          <button
            className="px-4 py-2 text-left hover:bg-[var(--accent)]"
            onClick={onExportar}
          >
            Exportar dados
          </button>

          <label className="px-4 py-2 text-left hover:bg-[var(--accent)] cursor-pointer">
            Importar dados
            <input
              type="file"
              className="hidden"
              onChange={onImportar}
              accept=".json"
            />
          </label>

          <button
            className="px-4 py-2 text-left text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={onLimpar}
          >
            Limpar mural
          </button>

          <button
            className="px-4 py-2 text-left hover:bg-[var(--accent)]"
            onClick={onToggleModoEscuro}
          >
            <FontAwesomeIcon icon={modoEscuro ? faSun : faMoon} className="mr-2" />{" "}
            {modoEscuro ? "Modo Claro" : "Modo Escuro"}
          </button>
        </div>
      )}
    </div>
  );
}
