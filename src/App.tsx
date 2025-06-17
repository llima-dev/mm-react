import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';

import SortableItem from './components/common/SortableItem';
import LembreteCard from './components/Lembrete/LembreteCard';
import LembreteModal from './components/Lembrete/LembreteModal';
import { useLembretes } from './hooks/useLembretes';
import type { Lembrete, Comentario } from './types';
import LembreteDrawer from './components/Lembrete/drawer/LembreteDrawer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalArquivados from './components/common/ModalArquivados';
import { 
  exportarLembretes,
  importarLembretesDoArquivo,
  limparMural,
  getStatusPrazo,
  corPorTipo,
  formatarData
} from './components/common/helper';
import FiltroAvancado from "./components/common/FiltroAvancado";
import type { FiltroAvancado as TipoFiltro } from "./components/common/FiltroAvancado";

import { 
  STORAGE_CHAVE_LEMBRETES,
  STORAGE_CHAVE_FILTROS,
  STORAGE_CHAVE_FILTRO_FAVORITO,
  APP_VERSAO
} from './utils/constants';

import {
  faStar,
  faBoxArchive,
  faDownload,
  faUpload,
  faBroom,
} from "@fortawesome/free-solid-svg-icons";

export default function App() {

  const [filtros, setFiltros] = useState<TipoFiltro[]>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_CHAVE_FILTROS);
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  const [filtroFavoritos, setFiltroFavoritos] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_CHAVE_FILTRO_FAVORITO);
      return salvo === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_CHAVE_FILTROS, JSON.stringify(filtros));
    localStorage.setItem(STORAGE_CHAVE_FILTRO_FAVORITO, filtroFavoritos.toString());
  }, [filtros, filtroFavoritos]);

  const [modalAberta, setModalAberta] = useState(false);
  const [lembreteParaEditar, setLembreteParaEditar] = useState<Lembrete | null>(null);
  const [modalArquivadosAberta, setModalArquivadosAberta] = useState(false);

  const salvarComentarios = (id: string, novos: Comentario[]) => {
    atualizar(id, { comentarios: novos });
  };

  const { 
    lembretes,
    adicionar,
    reordenar,
    atualizar,
    remover,
    abrirDetalhes,
    fecharDetalhes,
    idDetalhesAberto
  } = useLembretes();

  const arquivados = lembretes.filter((l) => l.arquivado);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleImportar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
  
    importarLembretesDoArquivo(file, lembretes, (novos) => {
      localStorage.setItem(STORAGE_CHAVE_LEMBRETES, JSON.stringify(novos));
      location.reload();
    });
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over?.id) {
      const oldIndex = lembretes.findIndex((l) => l.id === active.id);
      const newIndex = lembretes.findIndex((l) => l.id === over.id);
      const novaLista = arrayMove(lembretes, oldIndex, newIndex);
      reordenar(novaLista);
    }
  };

  const handleSalvar = (lembrete: Lembrete) => {
    if (lembreteParaEditar) {
      atualizar(lembrete.id, lembrete);
    } else {
      adicionar(lembrete);
    }
    setModalAberta(false);
    setLembreteParaEditar(null);
  };

  const abrirModalNovo = () => {
    setLembreteParaEditar(null);
    setModalAberta(true);
  };

  const editarLembrete = (lembrete: Lembrete) => {
    setLembreteParaEditar(lembrete);
    setModalAberta(true);
  };

  const lembretesFiltrados = lembretes
  .filter((l) => !l.arquivado)
  .filter((l) => (filtroFavoritos ? l.favorito : true))
  .filter((l) =>
    filtros.every((f) => {
      const v = f.valor.toLowerCase();
      switch (f.tipo) {
        case "titulo":
          return l.titulo.toLowerCase().includes(v);
        case "descricao":
          return l.descricao.toLowerCase().includes(v);
        case "prazo":
            return l.prazo?.includes(v)
        case "status":
          return getStatusPrazo(l.prazo, l.checklist).tipo === v;
        default:
          return true;
      }
    })
  );  

  const lembretesOrdenados = [...lembretesFiltrados].sort((a, b) => {
    const fa = a.fixado ? 1 : 0;
    const fb = b.fixado ? 1 : 0;
    return fb - fa;
  });  

  return (
    <div className="app">
      <main className="painel">
        <section className="col-esquerda h-100">
          {/* Painel de ações + filtro */}
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
            {/* Lado esquerdo: ações */}
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-sm btn-outline-secondary no-border"
                onClick={abrirModalNovo}
              >
                + Adicionar Lembrete
              </button>

              <button
                className="btn btn-outline-secondary btn-sm no-border"
                onClick={() => exportarLembretes(lembretes)}
              >
                <FontAwesomeIcon icon={faDownload} /> Exportar
              </button>

              <input
                type="file"
                accept=".json"
                style={{ display: "none" }}
                id="inputImportarJson"
                onChange={handleImportar}
              />

              <label
                htmlFor="inputImportarJson"
                className="btn btn-outline-secondary btn-sm no-border"
              >
                <FontAwesomeIcon icon={faUpload} /> Importar
              </label>

              <button
                className="btn btn-outline-danger btn-sm no-border"
                onClick={limparMural}
              >
                <FontAwesomeIcon icon={faBroom} /> Limpar Mural
              </button>
            </div>

            {/* Lado direito: filtro avançado */}
            <div className="d-flex align-items-baseline">
              <button
                className={`no-border btn ${
                  filtroFavoritos ? "text-warning" : "text-dark"
                } btn-sm btn-fav`}
                onClick={() => setFiltroFavoritos((atual) => !atual)}
              >
                <FontAwesomeIcon icon={faStar} />
              </button>
              <FiltroAvancado
                onAdicionarFiltro={(f) => setFiltros([...filtros, f])}
              />
            </div>
          </div>

          {/* Badges de filtros aplicados */}
          <div className="d-flex gap-2">
            {filtros.map((f, i) => {
              const cor = corPorTipo(f.tipo);

              return (
                <span
                  key={i}
                  className={`border badge d-flex align-items-center gap-2 px-2 py-1 rounded-pill bg-${cor.bg} ${cor.text}`}
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    maxWidth: "fit-content",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span style={{ textTransform: "capitalize" }}>
                    {f.tipo === "prazo"
                      ? `Prazo: ${formatarData(f.valor)}`
                      : `${f.tipo}: `}
                    {f.tipo !== "prazo" && <strong>{f.valor}</strong>}
                  </span>
                  <button
                    type="button"
                    className="btn-close btn-close-white btn-sm"
                    style={{ marginLeft: 4, filter: "invert(0.5)" }}
                    onClick={() =>
                      setFiltros(filtros.filter((_, idx) => idx !== i))
                    }
                  ></button>
                </span>
              );
            })}
          </div>

          <hr />
          <div className="d-flex flex-row align-items-start mb-3">
            <div className="d-flex w-50 align-items-start">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <i className="fas fa-note-sticky text-dark"></i> Lembretes{" "}
                <span className="text-muted">({lembretes.length})</span>
              </h5>
              <div className="d-flex gap-2 mb-3" style={{ marginLeft: "5px" }}>
                <button
                  className="no-border btn btn-outline-secondary btn-sm"
                  onClick={() => setModalArquivadosAberta(true)}
                >
                  <FontAwesomeIcon icon={faBoxArchive} /> Arquivados
                </button>
                {/* Demais filtros... */}
              </div>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={() => fecharDetalhes()}
          >
            <SortableContext
              items={lembretesFiltrados.map((l) => l.id)}
              strategy={rectSortingStrategy}
            >
              <div
                className="d-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1rem",
                }}
              >
                {lembretesOrdenados.map((l) => (
                  <SortableItem key={l.id} id={l.id}>
                    <LembreteCard
                      favorito={l.favorito ?? false}
                      titulo={l.titulo}
                      descricao={l.descricao}
                      prazo={l.prazo}
                      cor={l.cor}
                      checklist={l.checklist}
                      onEditar={() => editarLembrete(l)}
                      onExcluir={() => remover(l.id)}
                      onAbrirDetalhes={() => abrirDetalhes(l.id)}
                      onFecharDetalhes={() => fecharDetalhes()}
                      drawerAberto={idDetalhesAberto === l.id}
                      comentarios={l.comentarios}
                      fixado={l.fixado}
                      onToggleFixado={() =>
                        atualizar(l.id, { ...l, fixado: !l.fixado })
                      }
                      onToggleArquivar={() =>
                        atualizar(l.id, { ...l, arquivado: true })
                      }
                      onToggleFavorito={() =>
                        atualizar(l.id, { ...l, favorito: !l.favorito })
                      }
                      onSalvarComentario={(comentarios) =>
                        salvarComentarios(l.id, comentarios)
                      }
                      onToggleChecklistItem={(itemId) => {
                        if (!l.checklist) return;

                        const atualizado = {
                          ...l,
                          checklist: l.checklist.map((i) =>
                            i.id === itemId ? { ...i, feito: !i.feito } : i
                          ),
                        };
                        atualizar(l.id, atualizado);
                      }}
                      onReordenarChecklist={(novoChecklist) => {
                        atualizar(l.id, { ...l, checklist: novoChecklist });
                      }}
                    />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {lembretes.map((l) =>
            idDetalhesAberto === l.id ? (
              <LembreteDrawer
                key={`drawer-${l.id}`}
                lembrete={l}
                onFechar={fecharDetalhes}
                onSalvarComentario={(comentarios) =>
                  salvarComentarios(l.id, comentarios)
                }
                onSalvarAnotacoes={(texto) =>
                  atualizar(l.id, { ...l, anotacoes: texto })
                }
                onSalvarSnippets={(snips) =>
                  atualizar(l.id, { ...l, snippets: snips })
                }
              />
            ) : null
          )}
        </section>
      </main>

      <LembreteModal
        show={modalAberta}
        onClose={() => {
          setModalAberta(false);
          setLembreteParaEditar(null);
        }}
        onSalvar={handleSalvar}
        lembreteParaEditar={lembreteParaEditar}
      />

      <ModalArquivados
        show={modalArquivadosAberta}
        arquivados={arquivados}
        onFechar={() => setModalArquivadosAberta(false)}
        onDesarquivar={(id) =>
          atualizar(id, {
            ...lembretes.find((l) => l.id === id)!,
            arquivado: false,
          })
        }
        onExcluir={(id) => remover(id)}
      />

      <footer className="text-center text-muted small mt-auto border-top pt-1" style={{marginBottom: '-30px', opacity: '0.5'}}>
        <span>L.L Dev — Meu Mural v{APP_VERSAO}</span>
      </footer>
    </div>
  );
}
