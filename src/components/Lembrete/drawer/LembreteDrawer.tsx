import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import EditorAnotacoes from "../EditorAnotacoes";
import AbaSnippets from "../AbaSnippets";

import type { Lembrete, Comentario, Snippet } from "../../../types";

import { extrairHashtags, formatarData } from '../../common/helper';

import "../LembreteCard.css";
import "./LembreteDrawer.css";

type Props = {
  lembrete: Lembrete;
  onFechar: () => void;
  onSalvarComentario?: (comentarios: Comentario[]) => void;
  onSalvarAnotacoes?: (texto: string) => void;
  onSalvarSnippets?: (snips: Snippet[]) => void;
};

export default function LembreteDrawer({ lembrete, onFechar, onSalvarComentario, onSalvarAnotacoes, onSalvarSnippets }: Props) {
  const [comentarioNovo, setComentarioNovo] = useState("");
  const [anotacoes] = useState(lembrete.anotacoes || '');

  const [aba, setAba] = useState<"detalhes" | "comentarios" | "anotacoes" | "snippets">("detalhes");

  const adicionarComentario = () => {
    if (!comentarioNovo.trim()) return;
    const novo: Comentario = {
      id: crypto.randomUUID(),
      texto: comentarioNovo.trim(),
      data: new Date().toISOString(),
    };
    const atualizados = [...(lembrete.comentarios || []), novo];
    onSalvarComentario?.(atualizados);
    setComentarioNovo("");
  };

  const hashtags = extrairHashtags(lembrete.descricao);

  return createPortal(
    <div className="drawer aberto">
      <button className="drawer-fechar" onClick={onFechar} title="Fechar">
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <h5>{lembrete.titulo}</h5>

      <div className="abas">
        <button
          className={aba === "detalhes" ? "ativo" : ""}
          onClick={() => setAba("detalhes")}
        >
          Detalhes
        </button>
        <button
          className={aba === "comentarios" ? "ativo" : ""}
          onClick={() => setAba("comentarios")}
        >
          Comentários
        </button>
        <button
          className={aba === "anotacoes" ? "ativo" : ""}
          onClick={() => setAba("anotacoes")}
        >
          Anotações
        </button>
        <button
          className={aba === "snippets" ? "ativo" : ""}
          onClick={() => setAba("snippets")}
        >
          Snippets
        </button>
      </div>

      <div className="conteudo">
        {aba === "detalhes" && (
          <>
            <div className="campo">
              <label>Descrição</label>
              <div>{lembrete.descricao.replace(/#\w+/g, "").trim()}</div>
              {hashtags.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-1">
                  {hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="badge rounded-pill"
                      style={{ backgroundColor: "#e2e8f0", color: "#1e293b" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="campo">
              <label>Prazo</label>
              <div>{lembrete.prazo ? formatarData(lembrete.prazo) : "—"}</div>
            </div>
            <hr />
            {Array.isArray(lembrete.checklist) &&
              lembrete.checklist.length > 0 && (
                <div className="campo mt-3">
                  <label>Checklist</label>
                  <div className="tabela-scroll-limitada">
                  <table className="table-checklist align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Item</th>
                        <th>Status</th>
                        <th>Concluído em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lembrete.checklist.map((item) => (
                        <tr key={item.id}>
                          <td>{item.texto}</td>
                          <td>
                            {item.feito ? (
                              <span className="text-success">Concluído</span>
                            ) : (
                              <span className="text-muted">Pendente</span>
                            )}
                          </td>
                          <td>
                            {item.feito && item.concluidoEm
                              ? new Date(item.concluidoEm).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
          </>
        )}

        {aba === "comentarios" && (
          <>
            <textarea
              className="form-control mb-2"
              value={comentarioNovo}
              onChange={(e) => setComentarioNovo(e.target.value)}
              placeholder="Escreva um comentário..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  adicionarComentario();
                }
              }}
            />

            <Button
              variant="outline-primary btn-sm"
              size="sm"
              disabled={!comentarioNovo.trim()}
              onClick={adicionarComentario}
            >
              Adicionar
            </Button>

            <hr />

            {!lembrete.comentarios?.length ? (
              <p className="text-muted">Nenhum comentário ainda.</p>
            ) : (
              <ul className="list-unstyled small mt-3">
                {lembrete.comentarios.map((c) => (
                  <li key={c.id} className="mb-2 border-bottom pb-2">
                    <div className="text-muted">
                      {new Date(c.data).toLocaleString()}
                    </div>
                    <div>{c.texto}</div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {aba === "anotacoes" && (
          <EditorAnotacoes
            valorInicial={anotacoes}
            onSalvar={(html) => onSalvarAnotacoes?.(html)}
          />
        )}

        {aba === "snippets" && (
          <AbaSnippets
            snippets={lembrete.snippets || []}
            onSalvar={(snips) => onSalvarSnippets?.(snips)}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
