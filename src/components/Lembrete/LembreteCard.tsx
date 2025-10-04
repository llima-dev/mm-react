import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ChecklistItem, Comentario, Lembrete } from "../../types";
import { confirmarExclusao, getStatusPrazo, formatarData, extrairHashtags } from "../common/helper.ts";
import 'highlight.js/styles/github-dark.css';

import {
  faCalendarAlt,
  faTrash,
  faEdit,
  faCircle,
  faCheckCircle,
  faBoxArchive,
  faThumbtack,
  faCircleCheck,
  faCircleExclamation,
  faCircleXmark,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";

import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

import "./LembreteCard.css";

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
  fixado?: boolean;
  onToggleFixado?: () => void;
  onDuplicar: () => void;
  categoria?: { id: string; titulo: string };
  onDuploClick?: (lembrete: Lembrete) => void;
  lembrete: Lembrete;
};

export default function LembreteCard({
  categoria,
  titulo,
  descricao,
  prazo,
  favorito,
  cor = "azul",
  onEditar,
  onExcluir,
  checklist = [],
  onAbrirDetalhes,
  onToggleFavorito,
  onToggleArquivar,
  onToggleFixado,
  dragHandle,
  fixado,
  onDuplicar,
  drawerAberto,
  lembrete,
  onDuploClick
}: Props) {
  const percentual =
    checklist.length > 0
      ? Math.round(
          (checklist.filter((i) => i.feito).length / checklist.length) * 100
        )
      : 0;

  const status = getStatusPrazo(prazo, checklist);

  const hashtags = extrairHashtags(descricao);

  return (
    <div
      className={`card card-borda-${cor} ${fixado ? "fixado" : ""} ${
        drawerAberto ? "card-aberto" : ""
      }`}
      onClick={onAbrirDetalhes}
      onDoubleClick={() => onDuploClick?.(lembrete)}
      style={{ cursor: "pointer" }}
    >
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-1">
            {status.tipo !== "nulo" && (
              <>
                {status.tipo === "finalizado" ? (
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="text-success fa-sm me-1"
                    title="Checklist finalizado"
                  />
                ) : status.tipo === "ok" ? (
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="text-success fa-sm me-1"
                    title="Prazo em dia"
                  />
                ) : status.tipo === "proximo" ? (
                  <FontAwesomeIcon
                    icon={faCircleExclamation}
                    className="text-warning fa-sm me-1"
                    title="Prazo se aproximando"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    className="text-danger fa-sm me-1"
                    title="Prazo atrasado"
                  />
                )}
              </>
            )}
            <div className="d-flex flex-column flex-grow-1">
              {/* Categoria no topo */}
              {categoria && (
                <small
                    className="text-muted text-truncate"
                    style={{ maxWidth: "200px" }}
                    title={categoria.titulo}
                  >
                    {categoria.titulo}
                  </small>
              )}

              {categoria && (
                <hr className="hr-fina" />
              )}

              <span
                className="fw-semibold text-truncate"
                style={{
                  display: "inline-block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={titulo}
              >
                {titulo}
              </span>
            </div>
          </div>

          {/* drag handle encaixado no flex */}
          {!fixado && dragHandle && (
            <div className="drag-handle ms-2">{dragHandle}</div>
          )}
        </h5>

        <p className="card-text card-text-limitada">
          {descricao.replace(/#\w+/g, "").trim()}
        </p>

        {hashtags.length > 0 && (
          <div className="mt-2 d-flex flex-wrap gap-1">
            {hashtags.map((tag, idx) => (
              <span key={idx} className="badge rounded-pill hashtag-badge">
                {tag}
              </span>
            ))}
          </div>
        )}

        {checklist.length > 0 && (
          <div className="checklist-resumo mt-3">
            {/* Tabela enxuta */}
            <table className="table table-sm mb-0">
              <tbody>
                {checklist.slice(0, 4).map((item) => (
                  <tr key={item.id}>
                    <td style={{ width: "30px", textAlign: "center" }}>
                      {item.feito ? (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-success"
                          title="Concluído"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faCircle} title="Pendente" />
                      )}
                    </td>
                    <td
                      className={
                        (item.feito
                          ? "text-decoration-line-through text-muted "
                          : "") + "text-truncate"
                      }
                      style={{ maxWidth: "180px" }}
                      title={item.texto}
                    >
                      {item.texto}
                    </td>
                  </tr>
                ))}
                {checklist.length > 4 && (
                  <tr>
                    <td colSpan={2} className="text-muted small fst-italic">
                      + {checklist.length - 4} itens
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-footer" onClick={(e) => e.stopPropagation()}>
        {prazo && (
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className={`prazo prazo-${status.tipo}`}>
              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
              {formatarData(prazo)}
            </span>

            {Array.isArray(checklist) && checklist.length > 0 && (
              <span className="text-muted small">{percentual}% concluído</span>
            )}
          </div>
        )}

        <div className="d-flex justify-content-end gap-1 mt-2">
          <button
            className="btn-icon acao-pin"
            onClick={onToggleFixado}
            title={fixado ? "Desafixar" : "Fixar no topo"}
          >
            <FontAwesomeIcon
              icon={faThumbtack}
              className={fixado ? "text-danger" : "text-muted"}
              style={{ transform: fixado ? "rotate(0deg)" : "rotate(45deg)" }}
            />
          </button>

          <button
            className="btn-icon acao-favorito"
            onClick={onToggleFavorito}
            title={
              favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"
            }
          >
            <FontAwesomeIcon
              icon={favorito ? faStarSolid : faStarRegular}
              className={favorito ? "text-warning" : "text-muted"}
            />
          </button>

          <button
            className="btn-icon acao-arquivar"
            onClick={onToggleArquivar}
            title="Arquivar"
          >
            <FontAwesomeIcon icon={faBoxArchive} />
          </button>

          <button
            className="btn-icon acao-duplicar"
            onClick={onDuplicar}
            title="Duplicar lembrete"
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>

          <button
            className="btn-icon acao-editar"
            onClick={onEditar}
            title="Editar"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>

          <button
            className="btn-icon acao-excluir"
            onClick={() => {
              if (onExcluir) confirmarExclusao(onExcluir);
            }}
            title="Excluir"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
}
