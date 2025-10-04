import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import CategoriaTable from "./CategoriaTable";
import CategoriaModal from "./CategoriaModal";
import type { Categoria, Lembrete } from "../../../types";
import { confirmarExclusao } from "../../common/helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "./categorias.css";

type Props = {
  show: boolean;
  onClose: () => void;

  categorias: Categoria[];
  onAdicionar: (categoria: Categoria) => void;
  onAtualizar: (id: string, dados: Partial<Categoria>) => void;
  onRemover: (id: string) => void;

  lembretes: Lembrete[];
};

export default function CategoriaManager({
  show,
  onClose,
  categorias,
  onAdicionar,
  onAtualizar,
  onRemover,
  lembretes,
}: Props) {
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaParaEditar, setCategoriaParaEditar] =
    useState<Categoria | null>(null);

  const categoriasFiltradas = categorias.filter((c) =>
    c.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSalvar = (categoria: Categoria) => {
    if (categoriaParaEditar) {
      onAtualizar(categoriaParaEditar.id, categoria);
    } else {
      onAdicionar(categoria);
    }
    setModalAberto(false);
    setCategoriaParaEditar(null);
  };

  const handleExcluir = (id: string) => {
    confirmarExclusao(() => onRemover(id));
  };

  return (
    <>
      <Modal show={show} onHide={onClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Gerenciar Categorias</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="cat-header">
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="cat-input"
            />
            <div className="cat-header-actions">
              <button
                className="btn btn-sm btn-outline text-secondary"
                onClick={() => setModalAberto(true)}
              >
                <FontAwesomeIcon icon={faPlus} /> Nova
              </button>
            </div>
          </div>

          {categoriasFiltradas.length > 0 ? (
            <CategoriaTable
              categorias={categoriasFiltradas}
              onEditar={(cat) => {
                setCategoriaParaEditar(cat);
                setModalAberto(true);
              }}
              onExcluir={handleExcluir}
              lembretes={lembretes}
            />
          ) : (
            <p className="text-muted text-center mt-3">
              Nenhuma categoria criada.
            </p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <CategoriaModal
        show={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setCategoriaParaEditar(null);
        }}
        onSalvar={handleSalvar}
        categoriaParaEditar={categoriaParaEditar}
        categoriasExistentes={categorias}
      />
    </>
  );
}
