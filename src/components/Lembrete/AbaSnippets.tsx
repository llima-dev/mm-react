import { useState } from "react";
import type { Snippet } from "../../types";
import hljs from "highlight.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { copiarCodigoComAlerta } from '../common/helper';

import {
    faGripVertical,
    faEdit,
    faCopy,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

import { DndContext, closestCenter, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SnippetModal from "./SnippetModal";

import "./AbaSnippets.css";

type Props = {
  snippets: Snippet[];
  onSalvar: (snippets: Snippet[]) => void;
};

type SortableSnippetCardProps = {
  snippet: Snippet;
  onCopy: () => void;
  onEdit: () => void;
  onRemove: () => void;
};

function SortableSnippetCard({ snippet, onCopy, onEdit, onRemove }: SortableSnippetCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: snippet.id });

  return (
    <div
      ref={setNodeRef}
      className="snippet-card mb-3 position-relative d-flex align-items-start"
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        minHeight: 80,
      }}
    >
      <span
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab",
          color: "#888",
          marginRight: 12,
          marginLeft: 4,
          marginTop: 16,
          fontSize: 14,
          userSelect: "none"
        }}
        tabIndex={0}
        title="Arrastar para ordenar"
      >
        <FontAwesomeIcon icon={faGripVertical} />
      </span>
      <div className="w-100" style={{ overflow: "hidden" }}>
        <div className="snippet-title d-flex gap-1">
          {snippet.titulo}
          <span className="badge bg-warning text-dark d-flex align-items-center p-1">{snippet.linguagem}</span>
        </div>
        <div className="snippet-actions position-absolute top-0 end-0 m-2 d-flex gap-1">
          <Button variant="outline-secondary btn-sm no-border" size="sm" onClick={onCopy} title="Copiar">
            <FontAwesomeIcon icon={faCopy} />
          </Button>
          <Button variant="outline-primary btn-sm no-border" size="sm" onClick={onEdit} title="Editar">
            <FontAwesomeIcon icon={faEdit} />
          </Button>
          <Button variant="outline-danger btn-sm no-border" size="sm" onClick={onRemove} title="Remover">
            <FontAwesomeIcon icon={faXmark} />
          </Button>
        </div>
        <pre className="mt-2" style={{ background: "#23272e", color: "#fff", borderRadius: "0.4em", padding: "0.5em" }}>
          <code
            dangerouslySetInnerHTML={{
              __html: hljs.highlight(snippet.codigo, { language: snippet.linguagem }).value,
            }}
          />
        </pre>
      </div>
    </div>
  );
}

export default function AbaSnippets({ snippets, onSalvar }: Props) {
  const [titulo, setTitulo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [linguagem, setLinguagem] = useState("javascript");
  const [snips, setSnips] = useState<Snippet[]>(snippets);

  const [modalAberto, setModalAberto] = useState(false);
  const [snippetParaEditar, setSnippetParaEditar] = useState<Snippet | null>(null);

  const [busca, setBusca] = useState("");

  // Atualiza snips se vier coisa nova do pai
  if (snips !== snippets && snippets.length !== snips.length) {
    setSnips(snippets);
  }

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = snips.findIndex(s => s.id === active.id);
    const newIndex = snips.findIndex(s => s.id === over.id);
    const novaOrdem = arrayMove(snips, oldIndex, newIndex);
    setSnips(novaOrdem);
    onSalvar(novaOrdem);
  }

  const adicionarSnippet = () => {
    if (!codigo.trim()) return;
    const novo: Snippet = {
      id: crypto.randomUUID(),
      titulo: titulo.trim() || "Sem título",
      linguagem,
      codigo,
    };
    const atualizados = [...snips, novo];
    setSnips(atualizados);
    onSalvar(atualizados);
    setTitulo("");
    setCodigo("");
    setLinguagem("javascript");
  };

  const remover = (id: string) => {
    const atualizados = snips.filter((s) => s.id !== id);
    setSnips(atualizados);
    onSalvar(atualizados);
  };

  const editarSnippet = (s: Snippet) => {
    setSnippetParaEditar(s);
    setModalAberto(true);
  };

  const handleSalvarSnippetEditado = (snipEditado: Snippet) => {
    const atualizados = snips.map(s =>
      s.id === snipEditado.id ? snipEditado : s
    );
    setSnips(atualizados);
    onSalvar(atualizados);
  };


  const snipsFiltrados = snips.filter(
    (s) =>
      s.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      s.codigo.toLowerCase().includes(busca.toLowerCase())
      || s.linguagem.toLowerCase().includes(busca.toLowerCase())
  );

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
        <option value="php">PHP</option>
        <option value="sql">SQL</option>
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
        className="btn btn-sm btn-outline-primary mb-3"
        onClick={adicionarSnippet}
      >
        Adicionar
      </button>

      <hr/>

      <div className="snippets-container">
        <input
          className="form-control mb-3"
          placeholder="Buscar snippet por título ou código..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ position: "sticky", top: 0, zIndex: 2, background: "#fff" }} // sticky para mobile/dark
        />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={snips.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="list-unstyled snippets-list">
              {snipsFiltrados.map((s) => (
                <SortableSnippetCard
                  key={s.id}
                  snippet={s}
                  onCopy={() => copiarCodigoComAlerta(s.codigo)}
                  onEdit={() => editarSnippet(s)}
                  onRemove={() => remover(s.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      <SnippetModal
        show={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarSnippetEditado}
        snippet={snippetParaEditar}
      />
    </div>
  );
}
