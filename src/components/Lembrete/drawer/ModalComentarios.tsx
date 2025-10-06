import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { Comentario } from "../../../types";

type Props = {
  show: boolean;
  onClose: () => void;
  comentarios: Comentario[];
  onSalvar: (comentarios: Comentario[]) => void;
};

export default function ModalComentarios({
  show,
  onClose,
  comentarios,
  onSalvar,
}: Props) {
  const [novo, setNovo] = useState("");

  const adicionar = () => {
    if (!novo.trim()) return;
    const novoComentario: Comentario = {
      id: crypto.randomUUID(),
      texto: novo.trim(),
      data: new Date().toISOString(),
    };
    onSalvar([...comentarios, novoComentario]);
    setNovo("");
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Comentários</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column gap-3">
        <div className="comentarios-lista flex-grow-1 overflow-auto" style={{ maxHeight: "60vh" }}>
          {comentarios.length === 0 && (
            <p className="text-muted">Nenhum comentário ainda.</p>
          )}
          {comentarios.map((c) => (
            <div key={c.id} className="border-bottom pb-2 mb-2 small">
              <div className="text-muted">
                {new Date(c.data).toLocaleString()}
              </div>
              <div>{c.texto}</div>
            </div>
          ))}
        </div>

        <div className="input-group">
          <textarea
            className="form-control"
            value={novo}
            placeholder="Escreva um comentário..."
            onChange={(e) => setNovo(e.target.value)}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                adicionar();
              }
            }}
          />
          <Button
            variant="outline-primary"
            onClick={adicionar}
            disabled={!novo.trim()}
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
