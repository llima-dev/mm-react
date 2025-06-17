import { useState } from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { DragEndEvent } from "@dnd-kit/core";
import type { ChecklistItem, Comentario } from "../../types";
import { confirmarExclusao, getStatusPrazo } from "../common/helper.ts";
import SortableChecklistItem from "./checklist/SortableChecklistItem.tsx";
import ChecklistModal from "./checklist/ChecklistModal.tsx";
import 'highlight.js/styles/github-dark.css';

import {
  faCalendarAlt,
  faTrash,
  faEdit,
  faListCheck,
  faInfoCircle,
  faFlagCheckered,
  faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";

import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

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
  favorito?: boolean;
  onToggleFavorito?: () => void;
  arquivado?: boolean;
  onToggleArquivar?: () => void;
};

export default function LembreteCard({
  titulo,
  descricao,
  prazo,
  favorito,
  cor = "azul",
  onEditar,
  onExcluir,
  checklist = [],
  onReordenarChecklist,
  onToggleChecklistItem,
  onAbrirDetalhes,
  onToggleFavorito,
  onToggleArquivar,
  dragHandle,
}: Props) {
  const percentual =
    checklist.length > 0
      ? Math.round(
          (checklist.filter((i) => i.feito).length / checklist.length) * 100
        )
      : 0;

  const status = getStatusPrazo(prazo, checklist);
  const [modalChecklistAberto, setModalChecklistAberto] = useState(false);

  const corBarra =
    percentual === 100
      ? "#16a34a" // verde
      : percentual >= 66
      ? "#84cc16" // verde limão
      : percentual >= 33
      ? "#facc15" // amarelo
      : "#dc2626"; // vermelho

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    
    if (active.id !== over?.id && onReordenarChecklist) {
      const oldIndex = checklist.findIndex((i) => i.id === active.id);
      const newIndex = checklist.findIndex((i) => i.id === over.id);
      const novaOrdem = arrayMove(checklist, oldIndex, newIndex);
      onReordenarChecklist(novaOrdem);
    }
  };

  return (
    <div className={`card card-borda-${cor}`}>
      {dragHandle && (
        <div className="position-absolute top-0 end-0 p-2">{dragHandle}</div>
      )}
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center gap-2">
          {status.tipo !== "nulo" &&
            (status.tipo === "finalizado" ? (
              <FontAwesomeIcon
                icon={faFlagCheckered}
                className="text-secondary"
                title="Checklist finalizado"
              />
            ) : (
              <span
                title={
                  status.tipo === "ok"
                    ? "Prazo em dia"
                    : status.tipo === "proximo"
                    ? "Prazo se aproximando"
                    : "Prazo atrasado"
                }
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor:
                    status.tipo === "ok"
                      ? "#198754"
                      : status.tipo === "proximo"
                      ? "#facc15"
                      : "#dc3545",
                  display: "inline-block",
                }}
              ></span>
            ))}

          <span>{titulo}</span>
        </h5>

        <p className="card-text">{descricao}</p>
        {prazo && (
          <p className="prazo">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-muted" />
            {prazo}
          </p>
        )}
        {checklist.length > 0 && (
          <div className="checklist mt-2">
            <div className="barra-status-wrapper d-flex align-items-baselign justify-content-between mt-2">
              <div className="barra flex-grow-1 me-2">
                <div
                  className="barra-preenchida"
                  style={{
                    width: `${percentual}%`,
                    backgroundColor: corBarra,
                  }}
                >
                  {percentual}%
                </div>
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
            className="p-0"
            onClick={onToggleFavorito}
            title={
              favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"
            }
          >
            <FontAwesomeIcon
              icon={favorito ? faStarSolid : faStarRegular}
              className={favorito ? "text-warning" : "text-muted"}
            />
          </Button>

          <Button
            variant="link"
            className="p-0 text-secondary opacity-50"
            onClick={onToggleArquivar}
            title="Arquivar"
          >
            <FontAwesomeIcon icon={faBoxArchive} />
          </Button>


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
