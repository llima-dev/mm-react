import { useState, useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import type { Snippet } from "../../types";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { sql } from "@codemirror/lang-sql";
import { php } from "@codemirror/lang-php";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { python } from "@codemirror/lang-python";

type Props = {
  show: boolean;
  onClose: () => void;
  onSalvar: (snip: Snippet) => void;
  snippet?: Snippet | null;
};

export default function SnippetModal({
  show,
  onClose,
  onSalvar,
  snippet,
}: Props) {
  const [titulo, setTitulo] = useState(snippet?.titulo ?? "");
  const [codigo, setCodigo] = useState(snippet?.codigo ?? "");
  const [linguagem, setLinguagem] = useState(snippet?.linguagem ?? "sql");
  const [status, setStatus] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Atualiza estados quando abre o modal com snippet novo
  useEffect(() => {
    setTitulo(snippet?.titulo ?? "");
    setCodigo(snippet?.codigo ?? "");
    setLinguagem(snippet?.linguagem ?? "sql");
    setStatus("");
  }, [snippet, show]);

  // 🔹 Função principal de salvar
  const salvarSnippet = () => {
    if (!codigo.trim() && !titulo.trim()) return;
    const novoSnippet = {
      id: snippet?.id || crypto.randomUUID(),
      titulo: titulo.trim() || "Sem título",
      linguagem,
      codigo,
    };
    onSalvar(novoSnippet);
    setStatus("🔹 Salvo");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus(""), 2000);
  };

  // 🔹 Gatilho do blur (título e editor)
  const handleBlur = () => salvarSnippet();

  // 🔹 Extensões de linguagem
  const getExtensions = () => {
    switch (linguagem) {
      case "javascript":
      case "typescript":
        return [javascript({ jsx: true })];
      case "sql":
        return [sql()];
      case "php":
        return [php()];
      case "json":
        return [json()];
      case "html":
        return [html()];
      case "css":
        return [css()];
      case "python":
        return [python()];
      default:
        return [];
    }
  };

  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {snippet ? "Editar Snippet": "Novo Snippet"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-2">
          <Form.Label>Título</Form.Label>
          <Form.Control
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={handleBlur}
            placeholder="Título"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Linguagem</Form.Label>
          <Form.Select
            value={linguagem}
            onChange={(e) => {
              setLinguagem(e.target.value);
              salvarSnippet();
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="sql">SQL</option>
            <option value="php">PHP</option>
            <option value="json">JSON</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
          </Form.Select>
        </Form.Group>

        <div
          style={{
            border: isDark ? "1px solid #333" : "1px solid #ddd",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <CodeMirror
            value={codigo}
            height="50vh"
            theme={vscodeDark}
            extensions={getExtensions()}
            onChange={(value) => setCodigo(value)}
            onBlur={handleBlur}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              foldGutter: true,
              autocompletion: true,
            }}
          />
        </div>

        {status && (
          <div
            style={{
              marginTop: "6px",
              fontSize: "0.85rem",
              color: "#7FB77E",
              textAlign: "right",
            }}
          >
            {status}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button size="sm" variant="outline-secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button size="sm" variant="outline-primary" onClick={() => salvarSnippet()}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
