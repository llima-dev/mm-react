import { useState } from "react";
import type { Snippet } from "../../types";
import hljs from "highlight.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { copiarCodigoComAlerta  } from '../common/helper';

import {
    faCopy,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  snippets: Snippet[];
  onSalvar: (snippets: Snippet[]) => void;
};

export default function AbaSnippets({ snippets, onSalvar }: Props) {
  const [titulo, setTitulo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [linguagem, setLinguagem] = useState("javascript");

  const adicionarSnippet = () => {
    if (!codigo.trim()) return;
    const novo: Snippet = {
      id: crypto.randomUUID(),
      titulo: titulo.trim() || "Sem título",
      linguagem,
      codigo,
    };
    onSalvar([...snippets, novo]);
    setTitulo("");
    setCodigo("");
    setLinguagem("javascript");
  };

  const remover = (id: string) => {
    onSalvar(snippets.filter((s) => s.id !== id));
  };

  const copiarCodigo = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo);
      alert("Código copiado!"); // ou use um toast se quiser ficar chique
    } catch (err) {
      alert("Erro ao copiar.");
    }
  };

  return (
    <div className="campo">
      <label className="form-label">Novo Snippet</label>
      <input
        className="form-control mb-2"
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <select
        className="form-select mb-2"
        value={linguagem}
        onChange={(e) => setLinguagem(e.target.value)}
      >
        <option value="javascript">JavaScript</option>
        <option value="bash">Bash</option>
        <option value="html">HTML</option>
        <option value="json">JSON</option>
        <option value="css">CSS</option>
        <option value="typescript">TypeScript</option>
      </select>
      <textarea
        className="form-control mb-2"
        rows={4}
        placeholder="Código"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />
      <button
        className="btn btn-sm btn-primary mb-3"
        onClick={adicionarSnippet}
      >
        Adicionar
      </button>

      <div className="snippets-container">
        <ul className="list-unstyled">
          {snippets.map((s) => (
            <div className="snippet-card mb-3 position-relative">
            <div className="snippet-title">{s.titulo}</div>
          
            <div className="snippet-actions position-absolute top-0 end-0 m-2 d-flex gap-1">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => copiarCodigoComAlerta(s.codigo)}
                title="Copiar"
              >
                <FontAwesomeIcon icon={faCopy} />
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => remover(s.id)}
                title="Remover"
              >
                <FontAwesomeIcon icon={faXmark} />
              </Button>
            </div>
          
            <pre className="mt-2">
              <code
                dangerouslySetInnerHTML={{
                  __html: hljs.highlight(s.codigo, { language: s.linguagem }).value,
                }}
              />
            </pre>
          </div>          
          ))}
        </ul>
      </div>
    </div>
  );
}
