import { useState } from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { DragEndEvent } from "@dnd-kit/core";
import type { ChecklistItem, Comentario } from "../../types";
import { confirmarExclusao } from "../common/helper.ts";
import SortableChecklistItem from "./checklist/SortableChecklistItem.tsx";
import ChecklistModal from "./checklist/ChecklistModal.tsx";

import {
  faCalendarAlt,
  faTrash,
  faEdit,
  faListCheck,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import "./LembreteCard.css";

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

type Props = {
  titulo: string;
  descricao: string;
  prazo?: string;
  cor?: string;
  checklist?: ChecklistItem[];
  onEditar?: () => void;
  onExcluir?: () => void;
  onReordenarChecklist?: (novoChecklist: ChecklistItem[]) => void;
  onToggleChecklistItem?: (itemId: string) => void;
  onSalvarAnotacoes?: (texto: string) => void;
  onAbrirDetalhes?: () => void;
  onFecharDetalhes?: () => void;
  onSalvarComentario?: (comentarios: Comentario[]) => void; 
  drawerAberto?: boolean;
  comentarios?: Comentario[];
  dragHandle?: React.ReactNode;
};

export default function LembreteCard({
  titulo,
  descricao,
  prazo,
  cor = "azul",
  onEditar,
  onExcluir,
  checklist = [],
  onReordenarChecklist,
  onToggleChecklistItem,
  onSalvarComentario,
  onAbrirDetalhes,
  onFecharDetalhes,
  comentarios,
  drawerAberto,
  dragHandle,
}: Props) {
  const percentual =
    checklist.length > 0
      ? Math.round(
          (checklist.filter((i) => i.feito).length / checklist.length) * 100
        )
      : 0;

  const [modalChecklistAberto, setModalChecklistAberto] = useState(false);
  const [comentarioNovo, setComentarioNovo] = useState("");
  const [aba, setAba] = useState<"detalhes" | "comentarios">("detalhes");

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && onReordenarChecklist) {
      const oldIndex = checklist.findIndex((i) => i.id === active.id);
      const newIndex = checklist.findIndex((i) => i.id === over.id);
      const novaOrdem = arrayMove(checklist, oldIndex, newIndex);
      onReordenarChecklist(novaOrdem);
    }
  };

  const adicionarComentario = () => {
    if (!comentarioNovo.trim()) return;
    const novo: Comentario = {
      id: crypto.randomUUID(),
      texto: comentarioNovo.trim(),
      data: new Date().toISOString(),
    };
    const atualizados = [...(comentarios || []), novo];
    onSalvarComentario?.(atualizados);
    setComentarioNovo('');
  };  

  return (
    <div className={`card card-borda-${cor}`}>
      {dragHandle && (
        <div className="position-absolute top-0 end-0 p-2">{dragHandle}</div>
      )}
      <div className="card-body">
        <h5 className="card-title">{titulo}</h5>
        <p className="card-text">{descricao}</p>
        {prazo && (
          <p className="prazo">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-muted" />
            {prazo}
          </p>
        )}
        {checklist.length > 0 && (
          <div className="checklist mt-2">
            <div className="barra">
              <div
                className="barra-preenchida"
                style={{ width: `${percentual}%` }}
              >
                {percentual}%
              </div>
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
                <div className="d-flex flex-column mt-2 ml-1 card-checklist-scroll">
                  {checklist.map((item) => (
                    <SortableChecklistItem key={item.id} id={item.id}>
                      <>
                        <div className="checklist-linha">
                          <div className="checklist-esquerda">
                            <input
                              type="checkbox"
                              checked={item.feito}
                              onChange={() => onToggleChecklistItem?.(item.id)}
                            />
                            <span
                              className={`checklist-texto ${
                                item.feito ? "feito" : ""
                              }`}
                            >
                              {item.texto}
                            </span>
                          </div>
                        </div>
                      </>
                    </SortableChecklistItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button
            variant="link"
            className="p-0 text-secondary opacity-50"
            onClick={onEditar}
            title="Editar"
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>

          <Button
            variant="link"
            className="p-0 text-secondary opacity-50"
            onClick={() => {
              if (onExcluir) confirmarExclusao(onExcluir);
            }}
            title="Excluir"
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>

          <Button
            variant="link"
            className="p-0 text-secondary opacity-50"
            onClick={() => setModalChecklistAberto(true)}
            title="Editar checklist"
          >
            <FontAwesomeIcon icon={faListCheck} />
          </Button>

          <Button
            variant="link"
            className="p-0 text-secondary opacity-50"
            title="Detalhes"
            onClick={onAbrirDetalhes}
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </Button>
        </div>
      </div>

      <ChecklistModal
        show={modalChecklistAberto}
        onClose={() => setModalChecklistAberto(false)}
        checklistInicial={checklist}
        onSalvar={(novoChecklist) => {
          setModalChecklistAberto(false);
          onReordenarChecklist?.(novoChecklist);
        }}
      />
    </div>
  );
}
