import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import type { Snippet } from "../../types";

type Props = {
  show: boolean;
  onClose: () => void;
  onSalvar: (snip: Snippet) => void;
  snippet?: Snippet | null;
};

export default function SnippetModal({ show, onClose, onSalvar, snippet }: Props) {
  const [titulo, setTitulo] = useState(snippet?.titulo ?? "");
  const [codigo, setCodigo] = useState(snippet?.codigo ?? "");
  const [linguagem, setLinguagem] = useState(snippet?.linguagem ?? "javascript");

  // Atualiza estados quando modal abre com snippet diferente
  React.useEffect(() => {
    setTitulo(snippet?.titulo ?? "");
    setCodigo(snippet?.codigo ?? "");
    setLinguagem(snippet?.linguagem ?? "javascript");
  }, [snippet, show]);

  const handleSalvar = () => {
    if (!codigo.trim()) return;
    onSalvar({
      id: snippet?.id || crypto.randomUUID(),
      titulo: titulo.trim() || "Sem título",
      linguagem,
      codigo,
    });
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{snippet ? "Editar Snippet" : "Novo Snippet"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-2">
          <Form.Label>Título</Form.Label>
          <Form.Control
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Título"
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Linguagem</Form.Label>
          <Form.Select
            value={linguagem}
            onChange={e => setLinguagem(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="bash">Bash</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
            <option value="css">CSS</option>
            <option value="php">PHP</option>
            <option value="sql">SQL</option>
            <option value="typescript">TypeScript</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Código</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            placeholder="Código"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSalvar}>Salvar</Button>
      </Modal.Footer>
    </Modal>
  );
}
