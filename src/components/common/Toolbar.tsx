import {
  faGear,
  faExpand,
  faMoon,
  faSun,
  faPlus,
  faDownload,
  faUpload,
  faInfo,
  faBroom,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ToolbarProps {
  modoEscuro: boolean;
  onToggleModoEscuro: () => void;
  onFullScreen: () => void;
  nomeProjeto: string;
  setNomeProjeto: (nome: string) => void;
  onNovoLembrete: () => void;
  onCategorias: () => void;
  onExportar: () => void;
  onImportar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onManual: () => void;
  onLimpar: () => void;
}

export default function Toolbar({
  modoEscuro,
  onToggleModoEscuro,
  onFullScreen,
  nomeProjeto,
  setNomeProjeto,
  onNovoLembrete,
  onCategorias,
  onExportar,
  onImportar,
  onManual,
  onLimpar,
}: ToolbarProps) {
  const baseButton =
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ring-offset-background";

  const solidButton =
    baseButton + " px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-500";

  const ghostButton =
    baseButton +
    " px-3 py-2 bg-transparent text-foreground " +
    "hover:bg-neutral-200 dark:hover:bg-neutral-800";

  const iconButton =
    "inline-flex items-center justify-center w-9 h-9 leading-none rounded-md " +
    "text-foreground/90 transition-colors " +
    "hover:bg-neutral-200 dark:hover:bg-neutral-800";

  return (
    <div className="w-full border-b backdrop-blur-md px-4 py-2 flex justify-between items-center">
      {/* Esquerda */}
      <div className="flex items-center gap-2">
        {/* Tela cheia (ícone correto) */}
        <button onClick={onFullScreen} title="Tela cheia" className={iconButton}>
          <FontAwesomeIcon icon={faExpand} />
        </button>

        {/* Tema claro/escuro */}
        <button
          onClick={onToggleModoEscuro}
          title={modoEscuro ? "Tema claro" : "Tema escuro"}
          className={iconButton}
        >
          <FontAwesomeIcon icon={modoEscuro ? faSun : faMoon} />
        </button>

        {/* Nome do mural */}
        <input
          type="text"
          placeholder="Nome do mural"
          maxLength={20}
          value={nomeProjeto}
          onChange={(e) => setNomeProjeto(e.target.value)}
          className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
        />

        {/* Ações principais */}
        <button onClick={onNovoLembrete} className={solidButton} title="Novo lembrete (Ctrl + A)">
          <FontAwesomeIcon icon={faPlus} /> Lembrete
        </button>

        <button onClick={onCategorias} className={ghostButton} title="Gerenciar categorias (Ctrl + G)">
          <FontAwesomeIcon icon={faGear} /> Categorias
        </button>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-2">
        <button title="Exportar" onClick={onExportar} className={iconButton}>
          <FontAwesomeIcon icon={faDownload} />
        </button>

        {/* Importar (alinhado como os demais) */}
        <label
          htmlFor="inputImportarJson"
          title="Importar mural"
          className={`${iconButton} cursor-pointer d-flex`}
        >
          <FontAwesomeIcon icon={faUpload} />
        </label>
        <input
          id="inputImportarJson"
          type="file"
          accept=".json"
          className="hidden"
          onChange={onImportar}
        />

        <button title="Manual do Usuário" onClick={onManual} className={iconButton}>
          <FontAwesomeIcon icon={faInfo} />
        </button>

        <button
          title="Limpar mural"
          onClick={onLimpar}
          className={`${iconButton} text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40`}
        >
          <FontAwesomeIcon icon={faBroom} />
        </button>
      </div>
    </div>
  );
}
