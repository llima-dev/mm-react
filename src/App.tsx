import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import SortableItem from './components/common/SortableItem';

type Lembrete = {
  id: string;
  titulo: string;
  descricao: string;
  prazo: string;
  favoritos: boolean;
};

const lembretesIniciais: Lembrete[] = [
  {
    id: '1',
    titulo: 'Atualizar documentação',
    descricao: 'Finalizar os tópicos da nova versão antes do release.',
    prazo: '2025-06-20',
    favoritos: true,
  },
  {
    id: '2',
    titulo: 'Revisar código do checklist',
    descricao: 'Refatorar para evitar repetições e garantir acessibilidade.',
    prazo: '2025-06-21',
    favoritos: false,
  },
  {
    id: '3',
    titulo: 'Enviar e-mail para equipe',
    descricao: 'Alinhar expectativas da sprint e próximos passos.',
    prazo: '2025-06-22',
    favoritos: true,
  },
];

function App() {
  const [lembretes, setLembretes] = useState(lembretesIniciais);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = lembretes.findIndex((l) => l.id === active.id);
      const newIndex = lembretes.findIndex((l) => l.id === over?.id);
      setLembretes(arrayMove(lembretes, oldIndex, newIndex));
    }
  };

  return (
    <div className="app">
      <main className="painel">
        <section className="col-esquerda h-100">
          <div className="d-flex justify-content-center mb-2">
            <button className="btn btn-sm btn-outline-primary">
              + Adicionar Lembrete
            </button>
          </div>
          <div className="d-flex flex-column align-items-start mb-3">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <i className="fas fa-note-sticky text-dark"></i> Lembretes <span className="text-muted">({lembretes.length})</span>
            </h5>
          </div>
          <div className="d-flex align-items-center gap-2 mb-3">
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Buscar lembretes..."
            />
            <select className="form-select rounded-pill" style={{ maxWidth: '120px' }}>
              <option value="">Todos</option>
              <option value="hoje">Hoje</option>
              <option value="atrasado">Atrasados</option>
              <option value="concluido">Concluídos</option>
            </select>
            <span className="badge bg-warning text-dark rounded-pill">
              ⭐ {lembretes.filter((l) => l.favoritos).length}
            </span>
          </div>

          {/* Drag and drop */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={lembretes.map(l => l.id)} strategy={rectSortingStrategy}>
              <div
                className="d-grid"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1rem',
                }}
              >
                {lembretes.map((l) => (
                  <SortableItem key={l.id} id={l.id}>
                    <div className="border rounded p-3 shadow-sm bg-white">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>{l.titulo}</strong>
                        {l.favoritos && <span className="text-warning">⭐</span>}
                      </div>
                      <p className="mb-1 text-muted" style={{ fontSize: '0.9rem' }}>{l.descricao}</p>
                      <small className="text-secondary">📅 Prazo: {l.prazo}</small>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        <section className="col-direita h-100">
          <div className="d-flex justify-content-center mb-2">
            <button className="btn btn-sm btn-outline-secondary">
              + Adicionar Snippet
            </button>
          </div>
          <div className="d-flex flex-column align-items-start mb-3">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <i className="fas fa-code text-dark"></i> Snippets <span className="text-muted">(0)</span>
            </h5>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
