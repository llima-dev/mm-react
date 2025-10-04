import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import {
  DataGrid,
  GridToolbar,
  type GridColDef,
} from "@mui/x-data-grid";
import type { Lembrete, Categoria } from "../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";
import { IconButton, Tooltip } from "@mui/material";
import { confirmarExclusao } from "../common/helper";

type Props = {
  arquivados: Lembrete[];
  categorias: Categoria[];
  onFechar: () => void;
  onDesarquivar: (id: string) => void;
  onExcluir: (id: string) => void;
  show: boolean;
};

type ArquivadoRow = {
  id: string;
  titulo: string;
  descricao: string;
  prazo?: string;
  categoria?: string;
};

export default function ModalArquivados({
  arquivados,
  categorias,
  onFechar,
  onDesarquivar,
  onExcluir,
  show,
}: Props) {
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const rows: ArquivadoRow[] = arquivados.map((l) => {
    const categoria = categorias.find((c) => c.id === l.categoriaId);
    return {
      id: l.id,
      titulo: l.titulo,
      descricao: l.descricao ?? "",
      prazo: l.prazo ?? "",
      categoria: categoria ? categoria.titulo : "Sem categoria",
    };
  });

  const toggleSelecionado = (id: string) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleExclusao = (id: string) => {
    confirmarExclusao(() => {
      onExcluir(id);
    }, "Excluir permanentemente?");
  };

  const columns: GridColDef<ArquivadoRow>[] = [
    {
      field: "check",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <input
          type="checkbox"
          checked={selecionados.includes(row.id)}
          onChange={() => toggleSelecionado(row.id)}
          style={{ cursor: "pointer" }}
        />
      ),
    },
    {
      field: "categoria",
      headerName: "Categoria",
      flex: 1,
      renderCell: ({ row }) =>
        row?.categoria && row.categoria !== "Sem categoria" ? (
          <span>{row.categoria}</span>
        ) : (
          <span className="text-muted fst-italic">Sem categoria</span>
        ),
    },
    { field: "titulo", headerName: "Título", flex: 1 },
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 2,
      renderCell: ({ row }) => {
        const textoLimpo = (row.descricao || "")
          .replace(/#[\wÀ-ú-]+/g, "")
          .trim();
        return textoLimpo ? (
          <span>{textoLimpo}</span>
        ) : (
          <span className="text-muted fst-italic">Sem descrição</span>
        );
      },
    },
    {
      field: "prazo",
      headerName: "Prazo",
      flex: 1,
      align: "left",
      renderCell: ({ row }) =>
        row?.prazo ? (
          row.prazo.split("-").reverse().join("/")
        ) : (
          <span className="text-muted fst-italic">Não preenchido</span>
        ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params) => {
        const id = params.row.id;
        return (
          <div style={{ display: "flex", gap: 6 }}>
            <Tooltip title="Desarquivar">
              <IconButton size="small" onClick={() => onDesarquivar(id)}>
                <FontAwesomeIcon icon={faArrowUpFromBracket} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleExclusao(id)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </IconButton>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const handleDesarquivarSelecionados = () => {
    selecionados.forEach(onDesarquivar);
    setSelecionados([]); // limpa seleção
  };

  const handleExcluirSelecionados = () => {
    confirmarExclusao(() => {
      selecionados.forEach(onExcluir);
      setSelecionados([]); // limpa seleção
    }, "Excluir os lembretes selecionados?");
  };

  return (
    <Modal
      show={show}
      onHide={onFechar}
      size="lg"
      centered
      backdrop="static"
      enforceFocus={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Arquivados</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {selecionados.length > 0 && (
          <div className="d-flex justify-content-end mb-3 gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleDesarquivarSelecionados}
            >
              <i className="fa-solid fa-rotate-left me-1" /> Desarquivar
              Selecionados
            </Button>

            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleExcluirSelecionados}
            >
              <i className="fa-solid fa-trash me-1" /> Excluir Selecionados
            </Button>
          </div>
        )}

        {arquivados.length === 0 ? (
          <p className="text-muted mb-0">Nenhum lembrete arquivado.</p>
        ) : (
          <div style={{ height: "65vh" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[5, 10]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5, page: 0 } },
              }}
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
            />
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onFechar}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
