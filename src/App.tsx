import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import SplashScreen from "./components/common/SplashScreen";

import {
  DndContext,
  MouseSensor,
  useSensor,
  useSensors,
  TouchSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

import SortableItem from "./components/common/SortableItem";
import LembreteCard from "./components/Lembrete/LembreteCard";
import LembreteModal from "./components/Lembrete/LembreteModal";
import { useLembretes } from "./hooks/useLembretes";
import type { Lembrete, Comentario } from "./types";
import LembreteDrawer from "./components/Lembrete/drawer/LembreteDrawer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalArquivados from "./components/common/ModalArquivados";
import {
  exportarLembretes,
  importarLembretesDoArquivo,
  limparMural,
  getStatusPrazo,
  corPorTipo,
  formatarData,
  calcularUsoLocalStorage,
  toggleFullScreen,
  duplicarLembrete,
  gerarLembretesRecorrentes,
} from "./components/common/helper";
import FiltroAvancado from "./components/common/FiltroAvancado";
import type { FiltroAvancado as TipoFiltro } from "./components/common/FiltroAvancado";

import {
  STORAGE_CHAVE_LEMBRETES,
  STORAGE_CHAVE_FILTROS,
  STORAGE_CHAVE_FILTRO_FAVORITO,
  APP_VERSAO,
} from "./utils/constants";

import {
  faStar,
  faBoxArchive,
  faDownload,
  faUpload,
  faBroom,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";

export default function App() {
  const { usadoKB, porcentagem } = calcularUsoLocalStorage();

  const [mostrarSplash, setMostrarSplash] = useState(true);

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

  const [nomeProjeto, setNomeProjeto] = useState(() => {
    return localStorage.getItem("nomeProjeto") || "";
  });

  useEffect(() => {
    localStorage.setItem("nomeProjeto", nomeProjeto);
    localStorage.setItem(STORAGE_CHAVE_FILTROS, JSON.stringify(filtros));
    localStorage.setItem(
      STORAGE_CHAVE_FILTRO_FAVORITO,
      filtroFavoritos.toString()
    );

    document.title = nomeProjeto ? `Meu Mural | ${nomeProjeto}` : "Meu Mural";
  }, [filtros, filtroFavoritos, nomeProjeto]);

  const [modalAberta, setModalAberta] = useState(false);
  const [lembreteParaEditar, setLembreteParaEditar] = useState<Lembrete | null>(
    null
  );
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
    idDetalhesAberto,
  } = useLembretes();

  const jaVerificouRecorrencia = useRef(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (modalAberta) return;

      const hojeStr = new Date().toISOString().slice(0, 10);

      const novos = gerarLembretesRecorrentes(lembretes, new Date());
      if (novos.length > 0) {
        novos.forEach((l) => adicionar(l));
      }

      lembretes.forEach((l) => {
        if (l.arquivado && l.prazo && l.prazo <= hojeStr) {
          atualizar(l.id, { ...l, arquivado: false });
        }
      });
    }, 60 * 1000);

    return () => clearInterval(intervalo);
  }, [lembretes, adicionar, atualizar, modalAberta]);

  useEffect(() => {
    if (jaVerificouRecorrencia.current) return;
  
    jaVerificouRecorrencia.current = true;
  
    const hoje = new Date();
    const novos = gerarLembretesRecorrentes(lembretes, hoje);
  
    if (novos.length > 0) {
      novos.forEach((l) => adicionar(l));
    }
  }, []);

  const arquivados = lembretes.filter((l) => l.arquivado);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );  

  function handleImportar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    importarLembretesDoArquivo(file, lembretes, (novos, nomeDoArquivo) => {
      localStorage.setItem(STORAGE_CHAVE_LEMBRETES, JSON.stringify(novos));
      if (nomeDoArquivo) localStorage.setItem("nomeProjeto", nomeDoArquivo);
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
            return l.prazo?.includes(v);
          case "status":
            return getStatusPrazo(l.prazo, l.checklist).tipo === v;
          case "recorrencia":
            if (v === "com-recorrencia") return !!l.diasRecorrencia?.length;
            if (v === "gerados") return l.criadoPorRecorrencia === true;
            return true;
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
    <>
      {mostrarSplash ? (
        <SplashScreen onComplete={() => setMostrarSplash(false)} />
      ) : (
        <div className="app">
          <main className="painel">
            <section className="col-esquerda h-100">
              {/* Painel de ações + filtro */}
              {/* Lado esquerdo: ações */}
              <>
                {/* Desktop */}
                <div className="d-none d-md-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-secondary btn-sm no-border"
                    onClick={toggleFullScreen}
                    title="Tela cheia"
                  >
                    <FontAwesomeIcon icon={faExpand} />
                  </button>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Nome do mural"
                    value={nomeProjeto}
                    onChange={(e) => setNomeProjeto(e.target.value)}
                    style={{ maxWidth: "200px" }}
                  />
                  <button
                    className="btn btn-sm btn-outline-secondary no-border"
                    onClick={abrirModalNovo}
                  >
                    + Adicionar Lembrete
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm no-border"
                    onClick={() => exportarLembretes(lembretes, nomeProjeto)}
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
                    style={{ opacity: "0.5" }}
                  >
                    <FontAwesomeIcon icon={faBroom} /> Limpar Mural
                  </button>
                </div>

                {/* Mobile */}
                <div className="d-md-none w-100">
                  <div className="input-group mb-2">
                    <button
                      className="btn btn-outline-secondary btn-sm no-border"
                      onClick={toggleFullScreen}
                      title="Tela cheia"
                    >
                      <FontAwesomeIcon icon={faExpand} />
                    </button>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Nome do mural"
                      value={nomeProjeto}
                      onChange={(e) => setNomeProjeto(e.target.value)}
                    />
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-outline-secondary btn-sm dropdown-toggle w-100"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Ações
                    </button>
                    <ul className="dropdown-menu w-100">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={abrirModalNovo}
                        >
                          + Adicionar Lembrete
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            exportarLembretes(lembretes, nomeProjeto)
                          }
                        >
                          Exportar
                        </button>
                      </li>
                      <li>
                        <label
                          htmlFor="inputImportarJson"
                          className="dropdown-item"
                        >
                          Importar
                        </label>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={limparMural}
                          style={{ opacity: "0.7" }}
                        >
                          Limpar Mural
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setModalArquivadosAberta(true)}
                        >
                          <FontAwesomeIcon icon={faBoxArchive} /> Arquivados (
                          {arquivados.length})
                        </button>
                      </li>
                      <hr />
                      <li>
                        <button
                          className={`dropdown-item ${
                            filtroFavoritos ? "text-warning" : ""
                          }`}
                          onClick={() => setFiltroFavoritos((atual) => !atual)}
                        >
                          <FontAwesomeIcon icon={faStar} /> Filtrar Favoritos
                        </button>
                      </li>
                      <li>
                        <div className="px-2">
                          <FiltroAvancado
                            onAdicionarFiltro={(f) =>
                              setFiltros([...filtros, f])
                            }
                          />
                        </div>
                      </li>
                      <li>
                        <div className="dropdown-divider"></div>
                      </li>
                      {/* Fora do <details>, mas ainda dentro da <ul> */}
                      {filtros.length > 0 && (
                        <li className="px-2">
                          <div className="dropdown-divider"></div>
                          <strong className="small text-muted">
                            Filtros Ativos:
                          </strong>
                          <div className="d-flex flex-column gap-2 mt-1">
                            {filtros.map((f, i) => {
                              const cor = corPorTipo(f.tipo);
                              return (
                                <span
                                  key={i}
                                  className={`border badge d-flex align-items-center justify-content-between px-2 py-1 rounded-pill bg-${cor.bg} ${cor.text}`}
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <span style={{ textTransform: "capitalize" }}>
                                    {f.tipo === "prazo"
                                      ? `Prazo: ${formatarData(f.valor)}`
                                      : `${f.tipo}: `}
                                    {f.tipo !== "prazo" && (
                                      <strong>{f.valor}</strong>
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn-close btn-close-white btn-sm ms-2"
                                    style={{ filter: "invert(0.5)" }}
                                    onClick={() =>
                                      setFiltros(
                                        filtros.filter((_, idx) => idx !== i)
                                      )
                                    }
                                  ></button>
                                </span>
                              );
                            })}
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="filtros-wrapper d-flex flex-column flex-md-row flex-wrap gap-2 mb-1 mt-2">
                  <div className="d-flex flex-column filtros-container">
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

                    <div className="d-flex">
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
                                setFiltros(
                                  filtros.filter((_, idx) => idx !== i)
                                )
                              }
                            ></button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>

              <hr />
              <div className="d-flex flex-row align-items-start mb-3 advanced-filter-container">
                <div className="d-flex w-100 align-items-start justify-content-between">
                  <h5 className="mb-0 d-flex align-items-center gap-2">
                    <i className="fas fa-note-sticky text-dark"></i> Lembretes{" "}
                    <span className="text-muted">
                      ({lembretesFiltrados.length})
                    </span>
                  </h5>

                  {/* Mobile: botão arquivados vai dentro do dropdown */}
                  <div className="d-none d-md-flex gap-2">
                    <button
                      className="no-border btn btn-outline-secondary btn-sm"
                      onClick={() => setModalArquivadosAberta(true)}
                    >
                      <FontAwesomeIcon icon={faBoxArchive} /> Arquivados (
                      {arquivados.length})
                    </button>
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
                    className="d-grid lista-lembretes"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(320px, 1fr))",
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
                          onDuplicar={() => {
                            const copia = duplicarLembrete(l);
                            adicionar(copia);
                          }}
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
                    onSalvarChecklist={(novoChecklist) =>
                      atualizar(l.id, { ...l, checklist: novoChecklist })
                    }
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

          <footer
            className="text-center text-muted small mt-auto border-top pt-1"
            style={{ marginBottom: "-30px", opacity: "0.5" }}
          >
            <span>
              <a
                target="_blank"
                style={{ textDecoration: "none" }}
                href="https://github.com/llima-dev"
              >
                L.L Dev
              </a>{" "}
              — Meu Mural v{APP_VERSAO}
            </span>
            <br />
            <span>
              Armazenamento: {usadoKB} KB ({porcentagem}%)
            </span>
          </footer>
        </div>
      )}
    </>
  );
}
