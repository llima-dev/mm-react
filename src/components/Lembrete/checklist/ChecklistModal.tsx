import { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import type { ChecklistItem } from "../../../types";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableChecklistItem from "./SortableChecklistItem";

import './SortableChecklistItem.css';

type Props = {
  show: boolean;
  onClose: () => void;
  checklistInicial: ChecklistItem[];
  onSalvar: (novoChecklist: ChecklistItem[]) => void;
};

function toggleChecklistItem(arr: ChecklistItem[], id: string): ChecklistItem[] {
  return arr.map(item =>
    item.id === id
      ? {
          ...item,
          feito: !item.feito,
          concluidoEm: !item.feito ? new Date().toISOString() : undefined,
        }
      : item
  );
}


export default function ChecklistModal({
  show,
  onClose,
  checklistInicial,
  onSalvar,
}: Props) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [novoItem, setNovoItem] = useState("");
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEditado, setTextoEditado] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const primeiraVez = useRef(true);

  const toggleItem = (id: string) => {
    setChecklist((prev) => {
      const atualizado = toggleChecklistItem(prev, id);
      return atualizado;
    });
  };

  const remover = (id: string) => {
    setChecklist((prev) => {
      const atualizado = prev.filter((item) => item.id !== id);
      return atualizado;
    });
  };

  const editar = (id: string) => {
    const item = checklist.find((i) => i.id === id);
    if (!item) return;
    setEditandoId(id);
    setTextoEditado(item.texto);
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    setChecklist((prev) => {
      const atualizado = prev.map((item) =>
        item.id === editandoId ? { ...item, texto: textoEditado } : item
      );
      return atualizado;
    });
    setEditandoId(null);
    setTextoEditado("");
  };

  useEffect(() => {
    if (primeiraVez.current) {
      primeiraVez.current = false;
      return;
    }
    
    if (show) {
      onSalvar(checklist);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist]);

  useEffect(() => {
    if (show) setChecklist(checklistInicial || []);
  }, [show, checklistInicial]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setChecklist((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        const atualizado = arrayMove(prev, oldIndex, newIndex);
        return atualizado;
      });
    }
  };

  const adicionarItem = () => {
    if (!novoItem.trim()) return;
    setChecklist((prev) => {
      const atualizado = [
        ...prev,
        { id: crypto.randomUUID(), texto: novoItem.trim(), feito: false },
      ];
      return atualizado;
    });
    setNovoItem("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Checklist</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex gap-2 mb-2">
        <input
            ref={inputRef}
            type="text"
            className="form-control"
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            placeholder="Novo item"
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                e.preventDefault();
                adicionarItem();
                }
            }}
            />
          <Button variant="success" onClick={adicionarItem}>
            +
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={checklist.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="d-flex flex-column gap-2 checklist-scroll-container">
              {checklist.map((item) => (
                <SortableChecklistItem key={item.id} id={item.id}>
                  <div className="checklist-linha">
                    <div className="checklist-esquerda">
                        <input
                        type="checkbox"
                        checked={item.feito}
                        onChange={() => toggleItem(item.id)}
                        />
                        {editandoId === item.id ? (
                        <input
                            value={textoEditado}
                            onChange={(e) => setTextoEditado(e.target.value)}
                            onBlur={salvarEdicao}
                            onKeyDown={(e) => {
                            if (e.key === "Enter") salvarEdicao();
                            }}
                            autoFocus
                            className="form-control form-control-sm"
                        />
                        ) : (
                        <span className={`checklist-texto ${item.feito ? "feito" : ""}`}>
                            {item.texto}
                        </span>
                        )}
                    </div>
                    <div className="checklist-acoes">
                        <button className="btn-acao" onClick={() => editar(item.id)}>
                        Editar
                        </button>
                        <button className="btn-acao" onClick={() => remover(item.id)}>
                        Remover
                        </button>
                    </div>
                    </div>
                </SortableChecklistItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Modal.Body>
    </Modal>
  );
}
