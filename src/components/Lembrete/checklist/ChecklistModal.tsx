import { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import type { ChecklistItem } from "../../../types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
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

export default function ChecklistModal({
  show,
  onClose,
  checklistInicial,
  onSalvar,
}: Props) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [novoItem, setNovoItem] = useState("");
  const sensors = useSensors(useSensor(PointerSensor));

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEditado, setTextoEditado] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, feito: !item.feito } : item
      )
    );
  };

  const remover = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const editar = (id: string) => {
    const item = checklist.find((i) => i.id === id);
    if (!item) return;
    setEditandoId(id);
    setTextoEditado(item.texto);
  };

  const salvarEdicao = () => {
    if (!editandoId) return;
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === editandoId ? { ...item, texto: textoEditado } : item
      )
    );
    setEditandoId(null);
    setTextoEditado("");
  };

  useEffect(() => {
    setChecklist(checklistInicial);
  }, [checklistInicial]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = checklist.findIndex((i) => i.id === active.id);
      const newIndex = checklist.findIndex((i) => i.id === over.id);
      setChecklist(arrayMove(checklist, oldIndex, newIndex));
    }
  };

  const adicionarItem = () => {
    if (!novoItem.trim()) return;
  
    setChecklist([
      ...checklist,
      { id: crypto.randomUUID(), texto: novoItem.trim(), feito: false },
    ]);
    setNovoItem('');
  
    // Reaplica o foco no input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
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
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={() => onSalvar(checklist)}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
