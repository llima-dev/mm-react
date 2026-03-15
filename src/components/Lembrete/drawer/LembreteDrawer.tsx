import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes,
  faPlus,
  faCog,
  faInfoCircle,
  faCommentDots,
  faStickyNote,
  faCode,
  faTable,
  faPen
} from "@fortawesome/free-solid-svg-icons";

import EditorAnotacoes from "../EditorAnotacoes";
import AbaSnippets from "../AbaSnippets";
import PlanilhaEditor from "../PlanilhaEditor";

import type { 
  Lembrete,
  Comentario,
  Snippet,
  ChecklistItem,
  Categoria,
  Planilha
} from "../../../types";

import { extrairHashtags, formatarData } from '../../common/helper';

import {
  DndContext,
  closestCenter,
  MouseSensor,
  useSensor,
  TouchSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableChecklistItem from "../checklist/SortableChecklistItem"; 

import "../LembreteCard.css";
import "./LembreteDrawer.css";
import PlanilhaModal from "./PlanilhaModal";

type Props = {
  lembrete: Lembrete;
  onFechar: () => void;
  onSalvarComentario?: (comentarios: Comentario[]) => void;
  onSalvarAnotacoes?: (texto: string) => void;
  onSalvarSnippets?: (snips: Snippet[]) => void;
  onSalvarChecklist?: (novoChecklist: ChecklistItem[]) => void;
  onSalvarPlanilha?: (dados: Planilha) => void;
  categoria?: Categoria;
};

export default function LembreteDrawer({ 
  lembrete,
  onFechar,
  onSalvarComentario,
  onSalvarAnotacoes,
  onSalvarSnippets,
  onSalvarChecklist,
  onSalvarPlanilha,
  categoria
}: Props) {
  const [comentarioNovo, setComentarioNovo] = useState("");
  const [anotacoes, setAnotacoes] = useState(lembrete.anotacoes || '');
  const [novoItem, setNovoItem] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEditado, setTextoEditado] = useState("");
  const [planilhaFullscreen, setPlanilhaFullscreen] = useState(false);

  const [mostrarModalComentario, setMostrarModalComentario] = useState(false);

  const [mostrarConfig, setMostrarConfig] = useState(false);

  const [abasVisiveis, setAbasVisiveis] = useState(() => {
    const chave = `abasDrawer_${lembrete.id}`;
    const salvo = localStorage.getItem(chave);
    const parsed = salvo
      ? JSON.parse(salvo)
      : {
          detalhes: true,
          comentarios: true,
          anotacoes: true,
          snippets: true,
          planilha: true
        };
    return { ...parsed, detalhes: true };
  });

  useEffect(() => {
    const chave = `abasDrawer_${lembrete.id}`;
    localStorage.setItem(chave, JSON.stringify(abasVisiveis));
  }, [abasVisiveis, lembrete.id]);

  const abrirModalComentario = () => setMostrarModalComentario(true);
  const fecharModalComentario = () => setMostrarModalComentario(false);

  const handleSalvarComentarioMobile = () => {
    adicionarComentario();
    fecharModalComentario();
  };

  const [aba, setAba] = useState<
    "detalhes" | "comentarios" | "anotacoes" | "snippets" | "planilha"
  >("detalhes");

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  ); 

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

  const adicionarItem = () => {
    if (!novoItem.trim()) return;
    const atualizado = [
      ...(lembrete.checklist || []),
      { id: crypto.randomUUID(), texto: novoItem.trim(), feito: false },
    ];
    onSalvarChecklist?.(atualizado);
    setNovoItem("");
  };

  const editarItem = (id: string, texto: string) => {
    setEditandoId(id);
    setTextoEditado(texto);
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    const atualizado = (lembrete.checklist ?? []).map((item) =>
      item.id === editandoId ? { ...item, texto: textoEditado } : item
    );
    onSalvarChecklist?.(atualizado);
    setEditandoId(null);
    setTextoEditado("");
  };

  const salvarEdicaoComentario = (id: string) => {
    if (!textoEditado.trim()) return;

    const atualizado = (lembrete.comentarios ?? []).map((c) =>
      c.id === id
        ? {
            ...c,
            texto: textoEditado.trim(),
            editado: true,
            ultimaEdicao: new Date().toISOString(),
          }
        : c
    );

    onSalvarComentario?.(atualizado);
    setEditandoId(null);
    setTextoEditado("");
  };

  const hashtags = extrairHashtags(lembrete.descricao);

  const calcularRows = (texto: string) => {
    const linhas = Math.ceil(texto.length / 80);
    return Math.min(Math.max(linhas, 1), 10);
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return createPortal(
    <div className="drawer aberto">
      {categoria && (
        <div className="d-flex flex-column mb-2 pb-2">
          <span
            className="text-muted text-truncate"
            style={{
              fontSize: "0.8rem",
              maxWidth: "600px",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
            title={categoria.titulo}
          >
            {categoria.titulo}
          </span>
          <hr className="hr-fina" />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3 drawer-header">
        <h5 className="m-0 text-truncate">{lembrete.titulo}</h5>

        <div className="d-flex align-items-center">
          <button
            className="btn-sm icon-btn text-secondary p-1"
            onClick={() => setMostrarConfig(true)}
            title="Configurar abas"
          >
            <FontAwesomeIcon icon={faCog} />
          </button>

          <button
            className="btn-sm icon-btn text-danger p-1"
            onClick={onFechar}
            title="Fechar"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      <div className="abas">
        {/* 🔹 Botões de abas dinâmicos */}
        {abasVisiveis.detalhes && (
          <button
            className={aba === "detalhes" ? "ativo" : ""}
            onClick={() => setAba("detalhes")}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            Detalhes
          </button>
        )}

        {abasVisiveis.comentarios && (
          <button
            className={aba === "comentarios" ? "ativo" : ""}
            onClick={() => setAba("comentarios")}
          >
            <FontAwesomeIcon icon={faCommentDots} className="me-2" />
            Comentários
          </button>
        )}

        {/* Oculta no mobile se quiser */}
        {abasVisiveis.anotacoes && (
          <button
            className={aba === "anotacoes" ? "ativo" : ""}
            onClick={() => setAba("anotacoes")}
          >
            <FontAwesomeIcon icon={faStickyNote} className="me-2" />
            Anotações
          </button>
        )}

        {abasVisiveis.snippets && (
          <button
            className={aba === "snippets" ? "ativo" : ""}
            onClick={() => setAba("snippets")}
          >
            <FontAwesomeIcon icon={faCode} className="me-2" />
            Snippets
          </button>
        )}

        {abasVisiveis.planilha && (
          <button
            className={aba === "planilha" ? "ativo" : ""}
            onClick={() => setAba("planilha")}
          >
            <FontAwesomeIcon icon={faTable} className="me-2" />
            Planilha
          </button>
        )}

        {/* ⚙️ Modal de comentário (mantido igual) */}
        {isMobile && mostrarModalComentario && (
          <div className="modal-backdrop fade show"></div>
        )}

        {isMobile && (
          <div
            className={`modal fade ${
              mostrarModalComentario ? "show d-block" : ""
            }`}
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content p-3">
                <div className="modal-header">
                  <h5 className="modal-title">Novo comentário</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={fecharModalComentario}
                  />
                </div>
                <div className="modal-body">
                  <textarea
                    className="form-control"
                    autoFocus
                    value={comentarioNovo}
                    onChange={(e) => setComentarioNovo(e.target.value)}
                    placeholder="Escreva seu comentário..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSalvarComentarioMobile();
                      }
                    }}
                    rows={5}
                  />
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={fecharModalComentario}>
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!comentarioNovo.trim()}
                    onClick={handleSalvarComentarioMobile}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={"conteudo " + aba}>
        {aba === "detalhes" && (
          <>
            <div className="campo">
              <label>Descrição</label>
              <div>
                {lembrete.descricao.replace(/#\w+/g, "").trim().slice(0, 400)}
                {lembrete.descricao.length > 400 ? "..." : ""}
              </div>
              {hashtags.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-1">
                  {hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="badge rounded-pill hashtag-badge"
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
            {Array.isArray(lembrete.checklist) && (
              <div className="campo mt-3 checklist-container">
                <label>Checklist</label>

                {/* Campo fixo de adicionar item */}
                <div
                  className="checklist-input d-flex gap-2 mb-2 sticky-top checklist-input-themed"
                  style={{ zIndex: 1 }}
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Novo item"
                    value={novoItem}
                    onChange={(e) => setNovoItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        adicionarItem();
                      }
                    }}
                  />
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center gap-1"
                    onClick={adicionarItem}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>

                {/* Lista rolável */}
                <div className="checklist-list flex-grow-1 overflow-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={({ active, over }) => {
                      if (active.id !== over?.id) {
                        if (!over) return;
                        const atual = lembrete.checklist ?? [];
                        const oldIndex = atual.findIndex(
                          (i) => i.id === active.id
                        );
                        const newIndex = atual.findIndex(
                          (i) => i.id === over.id
                        );
                        const novoChecklist = arrayMove(
                          atual,
                          oldIndex,
                          newIndex
                        );
                        onSalvarChecklist?.(novoChecklist);
                      }
                    }}
                  >
                    <SortableContext
                      items={lembrete.checklist.map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="d-flex flex-column">
                        {lembrete.checklist.map((item) => (
                          <SortableChecklistItem key={item.id} id={item.id}>
                            <div className="checklist-linha">
                              <div className="checklist-esquerda">
                                <input
                                  type="checkbox"
                                  checked={item.feito}
                                  onChange={() => {
                                    const atualizado = (
                                      lembrete.checklist ?? []
                                    ).map((i) =>
                                      i.id === item.id
                                        ? {
                                            ...i,
                                            feito: !i.feito,
                                            concluidoEm: !i.feito
                                              ? new Date().toISOString()
                                              : undefined,
                                          }
                                        : i
                                    );
                                    onSalvarChecklist?.(atualizado);
                                  }}
                                />
                                {editandoId === item.id ? (
                                  <input
                                    value={textoEditado}
                                    onChange={(e) =>
                                      setTextoEditado(e.target.value)
                                    }
                                    onBlur={salvarEdicao}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") salvarEdicao();
                                    }}
                                    autoFocus
                                    className="form-control form-control-sm"
                                  />
                                ) : (
                                  <div className="d-flex flex-column">
                                    <span className={item.feito ? "feito" : ""}>
                                      {item.texto}
                                    </span>
                                    <small
                                      className={`mt-1 ${
                                        item.feito
                                          ? "text-success"
                                          : "text-muted fst-italic"
                                      }`}
                                    >
                                      {item.concluidoEm
                                        ? `concluído em ${new Date(
                                            item.concluidoEm
                                          ).toLocaleDateString()}`
                                        : "não concluído"}
                                    </small>
                                  </div>
                                )}
                              </div>
                              <div className="checklist-acoes">
                                <button
                                  className="btn-acao"
                                  onClick={() =>
                                    editarItem(item.id, item.texto)
                                  }
                                >
                                  Editar
                                </button>
                                <button
                                  className="btn-acao"
                                  onClick={() => {
                                    const atualizado = (
                                      lembrete.checklist ?? []
                                    ).filter((i) => i.id !== item.id);
                                    onSalvarChecklist?.(atualizado);
                                  }}
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          </SortableChecklistItem>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            )}
          </>
        )}

        {aba === "comentarios" && (
          <div className="comentarios-container">
            <div className="comentarios-list">
              {!lembrete.comentarios?.length ? (
                <p className="text-muted">Nenhum comentário ainda.</p>
              ) : (
                <ul className="list-unstyled small">
                  {lembrete.comentarios.map((c) => (
                    <li key={c.id} className="mb-2 border-bottom pb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">
                          {new Date(c.data).toLocaleString()}
                          {c.editado && (
                            <span className="fst-italic"> · editado</span>
                          )}
                        </span>
                        <button
                          className="btn btn-sm btn-link text-secondary"
                          onClick={() => {
                            setEditandoId(c.id);
                            setTextoEditado(c.texto);
                          }}
                        >
                          Editar
                        </button>
                      </div>

                      {editandoId === c.id ? (
                        <textarea
                          className="form-control form-control-sm mt-1"
                          value={textoEditado}
                          onChange={(e) => setTextoEditado(e.target.value)}
                          onBlur={() => salvarEdicaoComentario(c.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey)
                              salvarEdicaoComentario(c.id);
                          }}
                          rows={calcularRows(textoEditado)}
                        />
                      ) : (
                        <div>{c.texto} </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="comentarios-input">
              {isMobile ? (
                <Button
                  variant="outline-primary"
                  className="w-100 mt-2"
                  onClick={abrirModalComentario}
                >
                  <FontAwesomeIcon icon={faPlus} /> Adicionar comentário
                </Button>
              ) : (
                <div className="input-group">
                  <textarea
                    className="form-control auto-resize"
                    value={comentarioNovo}
                    maxLength={400}
                    onChange={(e) => {
                      setComentarioNovo(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    placeholder="Escreva um comentário..."
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        adicionarComentario();
                      }
                    }}
                  />
                  <button
                    className="btn btn-outline-primary"
                    disabled={!comentarioNovo.trim()}
                    onClick={adicionarComentario}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {aba === "anotacoes" && (
          <EditorAnotacoes
            valorInicial={anotacoes}
            lembrete={lembrete}
            onSalvar={(html) => {
              setAnotacoes(html);
              onSalvarAnotacoes?.(html);
            }}
          />
        )}

        {aba === "snippets" && (
          <AbaSnippets
            snippets={lembrete.snippets || []}
            onSalvar={(snips) => onSalvarSnippets?.(snips)}
          />
        )}

        {aba === "planilha" && (
          <>
            <div className="d-flex justify-content-end mb-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setPlanilhaFullscreen(true)}
              >
                <FontAwesomeIcon icon={faPen} className="me-2" />
                Editar
              </button>
            </div>

            <PlanilhaEditor
              key={`planilha-${lembrete.id}-${planilhaFullscreen}`}
              data={lembrete.planilha}
              onChange={(dados) => {
                onSalvarPlanilha?.(dados);
              }}
            />
          </>
        )}

        <PlanilhaModal
          show={planilhaFullscreen}
          planilhaTitulo={lembrete.titulo}
          onClose={() => setPlanilhaFullscreen(false)}
          data={lembrete.planilha}
          onChange={(dados) => onSalvarPlanilha?.(dados)}
        />

        {mostrarConfig && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h6 className="modal-title">
                      <FontAwesomeIcon icon={faCog} className="me-2" />
                      Configurações do Drawer
                    </h6>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setMostrarConfig(false)}
                    />
                  </div>

                  <div className="modal-body small">
                    {[
                      {
                        key: "detalhes",
                        icon: faInfoCircle,
                        label: "Detalhes",
                      },
                      {
                        key: "comentarios",
                        icon: faCommentDots,
                        label: "Comentários",
                      },
                      {
                        key: "anotacoes",
                        icon: faStickyNote,
                        label: "Anotações",
                      },
                      { key: "snippets", icon: faCode, label: "Snippets" },
                      {
                        key: "planilha",
                        icon: faTable,
                        label: "Planilha",
                      }
                    ].map(({ key, icon, label }) => (
                      <div
                        key={key}
                        className="d-flex justify-content-between align-items-center mb-2"
                      >
                        <span>
                          <FontAwesomeIcon
                            icon={icon}
                            className="me-2 text-secondary"
                          />
                          {label}
                        </span>
                        <div className="form-check form-switch m-0">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={
                              abasVisiveis[key as keyof typeof abasVisiveis]
                            }
                            disabled={key === "detalhes"}
                            onChange={(e) => {
                              if (key === "detalhes") return;
                              setAbasVisiveis({
                                ...abasVisiveis,
                                [key]: e.target.checked,
                              });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="modal-footer py-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setMostrarConfig(false)}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
