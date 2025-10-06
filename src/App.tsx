import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { v4 as uuidv4 } from "uuid";
import { useHotkeys } from 'react-hotkeys-hook';
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
import CategoriaManager from "./components/Lembrete/categorias/CategoriaManager";
import { useLembretes } from "./hooks/useLembretes";
import { useCategorias } from "./hooks/useCategorias";
import type { Lembrete, Comentario, ChecklistItem } from "./types";
import LembreteDrawer from "./components/Lembrete/drawer/LembreteDrawer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalArquivados from "./components/common/ModalArquivados";
import {
  exportarDadosMural,
  importarDadosMural,
  limparMural,
  getStatusPrazo,
  formatarData,
  calcularUsoLocalStorage,
  toggleFullScreen,
  duplicarLembrete,
  gerarLembretesRecorrentes,
  atualizarFavicon
} from "./components/common/helper";
import FiltroAvancado from "./components/common/FiltroAvancado";
import type { FiltroAvancado as TipoFiltro } from "./components/common/FiltroAvancado";

import {
  STORAGE_CHAVE_LEMBRETES,
  STORAGE_CHAVE_CATEGORIAS,
  STORAGE_CHAVE_FILTROS,
  STORAGE_CHAVE_FILTRO_FAVORITO,
  APP_VERSAO,
} from "./utils/constants";

import {
  faStar,
  faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";

import Toolbar from "./components/common/Toolbar";
import ToolbarMobile from "./components/common/ToolbarMobile";
import MobileFilterBar from "./components/common/MobileFilterBar";

export default function App() {
  const { usadoKB, porcentagem } = calcularUsoLocalStorage();

  const [mostrarSplash, setMostrarSplash] = useState(true);

  // dark mode
  const [modoEscuro, setModoEscuro] = useState<boolean>(() => {
    try {
      const salvo = localStorage.getItem("modoEscuro");
      return salvo ? JSON.parse(salvo) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    if (modoEscuro) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    if (modoEscuro !== null) {
      html.classList.add("theme-forced");
    }
    localStorage.setItem("modoEscuro", JSON.stringify(modoEscuro));
  }, [modoEscuro]);

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
  const [modalCategoriasAberta, setModalCategoriasAberta] = useState(false);
  const [filtroAtual, setFiltroAtual] = useState<string | null>(null);

  useHotkeys(
    "ctrl+a",
    (event) => {
      event.preventDefault();
      if (!modalAberta) abrirModalNovo();
    },
    { enableOnFormTags: false },
    [modalAberta]
  );

  useHotkeys(
    "ctrl+g",
    (event) => {
      event.preventDefault();
      if (!modalCategoriasAberta) setModalCategoriasAberta(true);
    },
    { enableOnFormTags: false },
    [modalCategoriasAberta]
  );

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

  const {
    categorias,
    adicionar: adicionarCategoria,
    remover: removerCategoria,
    atualizar: atualizarCategoria,
  } = useCategorias();

  const jaVerificouRecorrencia = useRef(false);

  useEffect(() => {
    const listener = (e: Event) => {
      const customEvent = e as CustomEvent<{
        id: string;
        checklist: { texto: string; feito: boolean }[];
      }>;

      const { id, checklist } = customEvent.detail;

      const l = lembretes.find((x) => x.id === id);
      if (!l) return;

      const checklistComId: ChecklistItem[] = checklist.map((item) => ({
        id: uuidv4(),
        texto: item.texto,
        feito: item.feito,
      }));

      atualizar(id, { ...l, checklist: checklistComId });
    };

    window.addEventListener("aplicar-checklist", listener);
    return () => window.removeEventListener("aplicar-checklist", listener);
  }, [lembretes, atualizar]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (modalAberta) return;

      const hojeStr = new Date().toISOString().slice(0, 10);

      const novos = gerarLembretesRecorrentes(lembretes, new Date());
      if (novos.length > 0) {
        novos.forEach((l) => adicionar(l));
      }

      lembretes.forEach((l) => {
        const checklist = l.checklist ?? [];
        const checklistExiste = checklist.length > 0;
        const checklistCompleto =
          checklistExiste && checklist.every((item) => item.feito);

        const deveDesarquivar =
          l.arquivado &&
          l.prazo &&
          l.prazo <= hojeStr &&
          (!checklistExiste || !checklistCompleto);

        if (deveDesarquivar) {
          atualizar(l.id, { ...l, arquivado: false });
        }
      });
    }, 60 * 1000);

    return () => clearInterval(intervalo);
  }, [lembretes, adicionar, atualizar, modalAberta]);

  useEffect(() => {
    const ativos = lembretes.filter((l) => {
      const status = getStatusPrazo(l.prazo, l.checklist);
      return !l.arquivado && status.tipo !== "finalizado";
    });

    const atrasados = ativos.some(
      (l) => getStatusPrazo(l.prazo, l.checklist).tipo === "atrasado"
    );

    const proximos = ativos.some(
      (l) => getStatusPrazo(l.prazo, l.checklist).tipo === "proximo"
    );

    if (atrasados) atualizarFavicon("danger");
    else if (proximos) atualizarFavicon("warning");
    else atualizarFavicon("default");
  }, [lembretes]);

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

    importarDadosMural(
      file,
      lembretes,
      categorias,
      (novosLembretes, novasCategorias, nomeProjetoImportado) => {
        localStorage.setItem(
          STORAGE_CHAVE_LEMBRETES,
          JSON.stringify(novosLembretes)
        );

        localStorage.setItem(
          STORAGE_CHAVE_CATEGORIAS,
          JSON.stringify(novasCategorias)
        );

        if (nomeProjetoImportado)
          localStorage.setItem("nomeProjeto", nomeProjetoImportado);

        location.reload();
      }
    );
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
    .filter((l) => (filtroAtual ? l.categoriaId === filtroAtual : true))
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
          case "categoria": {
            const cat = categorias.find((c) => c.id === l.categoriaId);
            return cat ? cat.titulo.toLowerCase().includes(v) : false;
          }
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
                <div className="hidden md:block">
                  <Toolbar
                    modoEscuro={modoEscuro}
                    onToggleModoEscuro={() => setModoEscuro((m) => !m)}
                    onFullScreen={toggleFullScreen}
                    nomeProjeto={nomeProjeto}
                    setNomeProjeto={setNomeProjeto}
                    onNovoLembrete={abrirModalNovo}
                    onCategorias={() => setModalCategoriasAberta(true)}
                    onExportar={() =>
                      exportarDadosMural(lembretes, categorias, nomeProjeto)
                    }
                    onImportar={handleImportar}
                    onManual={() => {
                      const link = document.createElement("a");
                      const base = import.meta.env.BASE_URL;
                      link.href = `${base}Manual_do_Usuario_Meu_Mural.pdf`;
                      link.download = "Manual_do_Usuario_Meu_Mural.pdf";
                      link.click();
                    }}
                    onLimpar={limparMural}
                  />
                </div>

                {/* Mobile */}
                <div className="block md:hidden">
                  <ToolbarMobile
                    modoEscuro={modoEscuro}
                    onToggleModoEscuro={() => setModoEscuro((m) => !m)}
                    onNovoLembrete={abrirModalNovo}
                    onCategorias={() => setModalCategoriasAberta(true)}
                    onExportar={() =>
                      exportarDadosMural(lembretes, categorias, nomeProjeto)
                    }
                    onImportar={handleImportar}
                    onLimpar={limparMural}
                    onArquivados={() => setModalArquivadosAberta(true)}
                    arquivadosCount={arquivados.length}
                    nomeProjeto={nomeProjeto}
                    setNomeProjeto={setNomeProjeto}
                  />
                  <MobileFilterBar
                    categorias={categorias}
                    filtroAtual={filtroAtual}
                    setFiltroAtual={setFiltroAtual}
                  />
                </div>

                <div className="filtros-wrapper d-flex flex-column flex-md-row flex-wrap gap-2 mb-1 mt-2">
                  <div className="d-flex flex-column filtros-container">
                    <div className="d-flex align-items-baseline">
                      <button
                        className={`no-border btn btn-sm btn-fav ${
                          filtroFavoritos ? "btn-fav-ativo" : ""
                        }`}
                        onClick={() => setFiltroFavoritos((atual) => !atual)}
                      >
                        <FontAwesomeIcon icon={faStar} />
                      </button>
                      <FiltroAvancado
                        categorias={categorias}
                        onAdicionarFiltro={(f) => {
                          setFiltros([...filtros, f]);
                          fecharDetalhes();
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {filtros.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium
                 bg-neutral-200/70 dark:bg-neutral-800/70 text-neutral-800 dark:text-neutral-200
                 border border-neutral-300/60 dark:border-neutral-700/60 shadow-sm hover:bg-neutral-300/70
                 dark:hover:bg-neutral-700/70 transition-colors"
                        >
                          <span className="capitalize">
                            {f.tipo === "prazo"
                              ? `Prazo: ${formatarData(f.valor)}`
                              : `${f.tipo}: `}
                            {f.tipo !== "prazo" && <strong>{f.valor}</strong>}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setFiltros(filtros.filter((_, idx) => idx !== i))
                            }
                            className="ml-1 inline-flex items-center justify-center rounded-full p-[2px]
                   hover:bg-neutral-400/30 dark:hover:bg-neutral-600/50 transition"
                            aria-label="Remover filtro"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>

              <hr />
              <div className="d-flex flex-row align-items-start mb-3 advanced-filter-container">
                <div className="d-flex w-100 align-items-start justify-content-between">
                  <h5 className="mb-0 d-flex align-items-center gap-2">
                    <i className="fas fa-note-sticky"></i> Lembretes{" "}
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
                          lembrete={l}
                          categoria={categorias.find(
                            (c) => c.id === l.categoriaId
                          )}
                          onEditar={() => editarLembrete(l)}
                          onExcluir={() => remover(l.id)}
                          onAbrirDetalhes={() => abrirDetalhes(l.id)}
                          drawerAberto={idDetalhesAberto === l.id}
                          onDuploClick={(l) => {
                            setLembreteParaEditar(l);
                            setModalAberta(true);
                          }}
                          onDuplicar={() => {
                            const copia = duplicarLembrete(l);
                            adicionar(copia);
                          }}
                          onToggleFixado={() =>
                            atualizar(l.id, { ...l, fixado: !l.fixado })
                          }
                          onToggleArquivar={() => {
                            atualizar(l.id, { ...l, arquivado: true });
                            fecharDetalhes();
                          }}
                          onToggleFavorito={() =>
                            atualizar(l.id, { ...l, favorito: !l.favorito })
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
                    categoria={categorias.find((c) => c.id === l.categoriaId)}
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
            categorias={categorias}
          />

          <ModalArquivados
            categorias={categorias}
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

          {modalCategoriasAberta && (
            <CategoriaManager
              show={modalCategoriasAberta}
              onClose={() => setModalCategoriasAberta(false)}
              categorias={categorias}
              onAdicionar={adicionarCategoria}
              onAtualizar={atualizarCategoria}
              onRemover={removerCategoria}
              lembretes={lembretes}
            />
          )}

          <footer
            className="text-center footer-custom small mt-md-auto border-top pt-1"
            style={{ opacity: "0.5" }}
          >
            <span>
              <a
                target="_blank"
                style={{ textDecoration: "none" }}
                href="https://github.com/llima-dev"
              >
                L.L Dev
              </a>{" "}
              — Meu Mural v{APP_VERSAO} -{" "}
              <small>
                Armazenamento: {usadoKB} KB ({porcentagem}%)
              </small>
            </span>
            <br />
          </footer>
        </div>
      )}
    </>
  );
}
