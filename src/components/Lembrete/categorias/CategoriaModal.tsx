import { useState, useEffect } from "react";
import { Modal, Button, Tabs, Tab } from "react-bootstrap";
import type { Categoria } from "../../../types";

type Props = {
  show: boolean;
  onClose: () => void;
  onSalvar: (categoria: Categoria) => void;
  categoriaParaEditar?: Categoria | null;
};

export default function CategoriaModal({
  show,
  onClose,
  onSalvar,
  categoriaParaEditar,
}: Props) {
  const [activeKey, setActiveKey] = useState("dados");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [mascaraTitulo, setMascaraTitulo] = useState("");
  const [mascaraDescricao, setMascaraDescricao] = useState("");
  const [novoChecklist, setNovoChecklist] = useState("");

  useEffect(() => {
    if (categoriaParaEditar) {
      setTitulo(categoriaParaEditar.titulo);
      setDescricao(categoriaParaEditar.descricao ?? "");
      setHashtags(categoriaParaEditar.hashtags ?? []);
      setChecklist(categoriaParaEditar.checklist ?? []);
      setMascaraTitulo(categoriaParaEditar.mascaraTitulo ?? "");
      setMascaraDescricao(categoriaParaEditar.mascaraDescricao ?? "");
    } else {
      setTitulo("");
      setDescricao("");
      setHashtags([]);
      setChecklist([]);
      setMascaraTitulo("");
      setMascaraDescricao("");
    }
  }, [categoriaParaEditar]);

  const salvar = () => {
    if (!titulo.trim()) return;

    const novaCategoria: Categoria = {
      id: categoriaParaEditar?.id ?? crypto.randomUUID(),
      titulo,
      descricao,
      hashtags,
      checklist,
      mascaraTitulo,
      mascaraDescricao,
    };

    onSalvar(novaCategoria);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {categoriaParaEditar ? "Editar" : "Nova"} Categoria
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          id="categoria-tabs"
          activeKey={activeKey}
          onSelect={(k) => setActiveKey(k || "dados")}
          className="mb-3"
        >
          {/* Aba 1 - Dados gerais */}
          <Tab eventKey="dados" title="Dados Gerais">
            <input
              className="form-control mb-2"
              placeholder="Título da categoria *"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <textarea
              className="form-control mb-3"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={6}
              maxLength={4000}
            />
          </Tab>

          {/* Aba 3 - Checklist */}
          <Tab eventKey="checklist" title="Checklist">
            <div className="d-flex mb-2 gap-2">
              <input
                className="form-control"
                placeholder="Novo item"
                value={novoChecklist}
                onChange={(e) => setNovoChecklist(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && novoChecklist.trim()) {
                    setChecklist([...checklist, novoChecklist.trim()]);
                    setNovoChecklist("");
                    e.preventDefault();
                  }
                }}
              />
              <Button
                variant="outline-primary"
                onClick={() => {
                  if (novoChecklist.trim()) {
                    setChecklist([...checklist, novoChecklist.trim()]);
                    setNovoChecklist("");
                  }
                }}
              >
                +
              </Button>
            </div>

            <div className="checklist-scroll-container">
              {checklist.map((item, i) => (
                <div key={i} className="checklist-linha">
                  <div className="checklist-esquerda">
                    <input type="checkbox" disabled />
                    <span className="checklist-texto">{item}</span>
                  </div>
                  <div className="checklist-acoes">
                    <button
                      className="btn-acao"
                      onClick={() =>
                        setChecklist(checklist.filter((_, idx) => idx !== i))
                      }
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Tab>

          {/* Aba 4 - Máscaras */}
          <Tab eventKey="mascaras" title="Máscaras">
            <input
              className="form-control mb-2"
              placeholder="Máscara do título"
              value={mascaraTitulo}
              onChange={(e) => setMascaraTitulo(e.target.value)}
            />
            <textarea
              className="form-control mb-2"
              placeholder="Máscara da descrição"
              value={mascaraDescricao}
              onChange={(e) => setMascaraDescricao(e.target.value)}
              rows={6}
              maxLength={4000}
            />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={salvar}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
