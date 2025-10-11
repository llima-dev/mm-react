import { useState } from "react";
import type { Snippet } from "../../types";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faCopy,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { IconButton, Button, Tooltip } from "@mui/material";
import SnippetModal from "./SnippetModal";
import hljs from "highlight.js";
import { copiarCodigoComAlerta } from "../common/helper";
import "highlight.js/styles/github-dark.css";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

type Props = {
  snippets: Snippet[];
  onSalvar: (snippets: Snippet[]) => void;
};

export default function AbaSnippets({ snippets, onSalvar }: Props) {
  const [snips, setSnips] = useState(snippets);
  const [modalAberto, setModalAberto] = useState(false);
  const [snippetParaEditar, setSnippetParaEditar] = useState<Snippet | null>(
    null
  );

  const adicionarNovo = () => {
    const novo: Snippet = {
      id: crypto.randomUUID(),
      titulo: "Novo snippet",
      linguagem: "javascript",
      codigo: "",
    };
    const atualizados = [...snips, novo];
    setSnips(atualizados);
    onSalvar(atualizados);
    setSnippetParaEditar(novo);
    setModalAberto(true);
  };

  const editarSnippet = (s: Snippet) => {
    setSnippetParaEditar(s);
    setModalAberto(true);
  };

  const removerSnippet = (id: string) => {
    const atualizados = snips.filter((s) => s.id !== id);
    setSnips(atualizados);
    onSalvar(atualizados);
  };

  const handleSalvarSnippetEditado = (snipEditado: Snippet) => {
    const atualizados = snips.map((s) =>
      s.id === snipEditado.id ? snipEditado : s
    );
    setSnips(atualizados);
    onSalvar(atualizados);
  };

  const rows = snips.map((s) => ({
    id: s.id,
    titulo: s.titulo,
    linguagem: s.linguagem,
    codigo: s.codigo,
  }));

  const columns: GridColDef[] = [
    {
      field: "titulo",
      headerName: "Título",
      flex: 1,
      renderCell: (params) => {
        const snippet = snips.find((s) => s.id === params.row.id);
        if (!snippet) return null;

        return (
          <div className="flex flex-col overflow-hidden leading-tight">
            {/* Badge da linguagem */}
            <span
              className="self-start px-1.5 py-[1px] mb-[2px] rounded text-[10px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor:
                  snippet.linguagem === "javascript"
                    ? "var(--badge-js-bg, rgba(247, 223, 30, 0.15))"
                    : snippet.linguagem === "sql"
                    ? "var(--badge-sql-bg, rgba(0, 117, 143, 0.2))"
                    : snippet.linguagem === "python"
                    ? "var(--badge-py-bg, rgba(53, 114, 165, 0.2))"
                    : "var(--badge-default-bg, rgba(0, 0, 0, 0.05))",
                color:
                  snippet.linguagem === "javascript"
                    ? "var(--badge-js-text, #b89a00)"
                    : snippet.linguagem === "sql"
                    ? "var(--badge-sql-text, #006780)"
                    : snippet.linguagem === "python"
                    ? "var(--badge-py-text, #2c5d9d)"
                    : "var(--text)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {snippet.linguagem?.toUpperCase() || "OUTRO"}
            </span>

            {/* Título quebrando linha */}
            <span
              className="text-sm break-words mt-1"
              title={snippet.titulo}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: "1.2em",
                maxHeight: "2.4em",
              }}
            >
              {snippet.titulo}
            </span>
          </div>
        );
      },
    },
    {
      field: "codigo",
      headerName: "Código (preview)",
      flex: 2,
      renderCell: (params) => {
        const snippet = snips.find((s) => s.id === params.row.id);
        if (!snippet) return null;

        const highlighted = hljs.highlight(snippet.codigo, {
          language: snippet.linguagem || "plaintext",
          ignoreIllegals: true,
        }).value;

        return (
          <HoverCard openDelay={100} closeDelay={150}>
            <HoverCardTrigger asChild>
              <span
                className="snippet-inline cursor-help text-xs text-ellipsis overflow-hidden whitespace-nowrap block"
                title="Passe o mouse para ver o código completo"
              >
                <code
                  dangerouslySetInnerHTML={{
                    __html:
                      highlighted.replace(/\s+/g, " ").slice(0, 160) +
                      (snippet.codigo.length > 160 ? "…" : ""),
                  }}
                />
              </span>
            </HoverCardTrigger>

            <HoverCardContent
              side="top"
              align="start"
              className="z-[9999] w-[600px] max-h-[400px] overflow-auto bg-[#1e1e1e] border border-neutral-700 shadow-xl rounded-lg p-3 relative"
            >
              <button
                onClick={() => copiarCodigoComAlerta(snippet.codigo)}
                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[#2a2a2a] transition-colors text-gray-300"
                title="Copiar código"
              >
                <FontAwesomeIcon icon={faCopy} size="sm" />
              </button>

              <pre className="text-xs font-mono text-gray-200 whitespace-pre-wrap leading-snug">
                <code
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(snippet.codigo, {
                      language: snippet.linguagem || "plaintext",
                    }).value,
                  }}
                />
              </pre>
            </HoverCardContent>
          </HoverCard>
        );
      },
    },
    {
      field: "acoes",
      headerName: "Ações",
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params) => {
        const snippet = snips.find((s) => s.id === params.row.id);
        if (!snippet) return null;

        return (
          <>
            <Tooltip title="Editar snippet">
              <IconButton
                size="small"
                color="primary"
                onClick={() => editarSnippet(snippet)}
              >
                <FontAwesomeIcon icon={faPen} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remover snippet">
              <IconButton
                size="small"
                color="error"
                onClick={() => removerSnippet(snippet.id)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </IconButton>
            </Tooltip>
          </>
        );
      },
    },
  ];

  return (
    <div style={{ height: "60vh", display: "flex", flexDirection: "column" }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6>Snippets</h6>
        <Button
          variant="text"
          color="inherit"
          size="small"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={adicionarNovo}
        >
          Novo
        </Button>
      </div>

      <DataGrid
        sx={{
          "& .MuiDataGrid-row": {
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
        }}
        rows={rows}
        columns={columns}
        pageSizeOptions={[10]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5, page: 0 } },
        }}
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 400 },
          },
        }}
        onRowDoubleClick={(params) => {
          const snippet = snips.find((s) => s.id === params.row.id);
          if (snippet) editarSnippet(snippet);
        }}
      />

      <SnippetModal
        show={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarSnippetEditado}
        snippet={snippetParaEditar}
      />
    </div>
  );
}
