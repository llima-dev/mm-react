import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { Categoria, Lembrete } from "../../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconButton, Tooltip } from "@mui/material";

type Props = {
  categorias: Categoria[];
  onEditar: (cat: Categoria) => void;
  onExcluir: (id: string) => void;
  lembretes?: Lembrete[];
};

export default function CategoriaTable({ categorias, onEditar, onExcluir, lembretes = [] }: Props) {
  const rows = categorias.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao ?? "",
  }));

  const columns: GridColDef[] = [
    { field: "titulo", headerName: "Título", flex: 1 },
    { field: "descricao", headerName: "Descrição", flex: 2 },
    {
      field: "acoes",
      headerName: "Ações",
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params) => {
        const categoriaId = params.row.id;

        const possuiLembretes = lembretes.some(
          (l) => l.categoriaId === categoriaId
        );

        return (
          <>
            <IconButton
              size="small"
              onClick={() =>
                onEditar(categorias.find((c) => c.id === categoriaId)!)
              }
            >
              <FontAwesomeIcon icon={faPen} />
            </IconButton>

            <Tooltip
              title={
                possuiLembretes
                  ? "Não é possível excluir: há lembretes associados."
                  : "Excluir categoria"
              }
            >
              <span>
                <IconButton
                  className="btn-delete"
                  size="small"
                  color={possuiLembretes ? "default" : "error"}
                  onClick={() => !possuiLembretes && onExcluir(categoriaId)}
                  disabled={possuiLembretes}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </span>
            </Tooltip>
          </>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "60vh" }}>
      <div className="cat-table-wrapper" style={{ flex: 1 }}>
        <DataGrid
          className="cat-table"
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
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
          onRowDoubleClick={(params) => {
            const cat = categorias.find((c) => c.id === params.row.id);
            if (cat) onEditar(cat);
          }}
        />
      </div>
    </div>
  );
}
