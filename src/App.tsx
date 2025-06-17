import { useState } from 'react';
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

export default function App() {
  const [modalAberta, setModalAberta] = useState(false);
  const [lembreteParaEditar, setLembreteParaEditar] = useState<Lembrete | null>(null);

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

  const sensors = useSensors(useSensor(PointerSensor));

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

  return (
    <div className="app">
      <main className="painel">
        <section className="col-esquerda h-100">
          <div className="d-flex justify-content-center mb-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={abrirModalNovo}>
              + Adicionar Lembrete
            </button>
          </div>
          <hr />
          <div className="d-flex flex-column align-items-start mb-3">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <i className="fas fa-note-sticky text-dark"></i> Lembretes{' '}
              <span className="text-muted">({lembretes.length})</span>
            </h5>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={() => fecharDetalhes()}>
            <SortableContext items={lembretes.map((l) => l.id)} strategy={rectSortingStrategy}>
              <div
                className="d-grid"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1rem',
                }}
              >
                {lembretes.map((l) => (
                  <SortableItem key={l.id} id={l.id}>
                    <LembreteCard
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
                        onSalvarComentario={(comentarios) => salvarComentarios(l.id, comentarios)}
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
                onSalvarComentario={(comentarios) => salvarComentarios(l.id, comentarios)}
                onSalvarAnotacoes={(texto) => atualizar(l.id, { ...l, anotacoes: texto })}
                onSalvarSnippets={(snips) => atualizar(l.id, { ...l, snippets: snips })}
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
    </div>
  );
}
