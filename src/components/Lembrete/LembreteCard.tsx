import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Lembrete } from "../../types";
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
  lembrete: Lembrete;
  categoria?: { id: string; titulo: string };
  drawerAberto?: boolean;
  dragHandle?: React.ReactNode;
  onEditar?: () => void;
  onExcluir?: () => void;
  onAbrirDetalhes?: () => void;
  onToggleFavorito?: () => void;
  onToggleArquivar?: () => void;
  onToggleFixado?: () => void;
  onDuplicar: () => void;
  onDuploClick?: (lembrete: Lembrete) => void;
};

export default function LembreteCard({
  lembrete,
  categoria,
  drawerAberto,
  dragHandle,
  onEditar,
  onExcluir,
  onAbrirDetalhes,
  onToggleFavorito,
  onToggleArquivar,
  onToggleFixado,
  onDuplicar,
  onDuploClick
}: Props) {
  const {
    titulo,
    descricao,
    prazo,
    checklist = [],
    favorito,
    fixado,
    cor = "azul",
  } = lembrete;

  const percentual = checklist.length
    ? Math.round((checklist.filter((i) => i.feito).length / checklist.length) * 100)
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
          <div className="d-flex flex-column flex-grow-1">
            {/* Categoria no topo */}
            {categoria && (
              <>
                <small
                  className="text-muted text-truncate"
                  style={{ maxWidth: "200px" }}
                  title={categoria.titulo}
                >
                  {categoria.titulo}
                </small>
                <hr className="hr-fina" />
              </>
            )}

            {/* Linha principal: ícone + título */}
            <div className="d-flex align-items-center gap-1">
              {status.tipo !== "nulo" && (
                <>
                  {status.tipo === "finalizado" ? (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="text-success fa-sm"
                      title="Checklist finalizado"
                    />
                  ) : status.tipo === "ok" ? (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="text-success fa-sm"
                      title="Prazo em dia"
                    />
                  ) : status.tipo === "proximo" ? (
                    <FontAwesomeIcon
                      icon={faCircleExclamation}
                      className="text-warning fa-sm"
                      title="Prazo se aproximando"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faCircleXmark}
                      className="text-danger fa-sm"
                      title="Prazo atrasado"
                    />
                  )}
                </>
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
          <div className="mt-3 space-y-1">
            {checklist.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200"
              >
                <div className="w-5 flex justify-center pt-0.5">
                  {item.feito ? (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500"
                      title="Concluído"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faCircle}
                      className="text-neutral-400"
                      title="Pendente"
                    />
                  )}
                </div>

                <span
                  title={item.texto}
                  className={`flex-1 truncate ${
                    item.feito
                      ? "line-through text-neutral-400 dark:text-neutral-500"
                      : "text-neutral-700 dark:text-neutral-200"
                  }`}
                >
                  {item.texto}
                </span>
              </div>
            ))}

            {checklist.length > 4 && (
              <div className="text-xs italic text-neutral-500 mt-1">
                + {checklist.length - 4} itens
              </div>
            )}

            {/* Barra de progresso sutil */}
            <div className="mt-2 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentual === 100
                    ? "bg-green-500"
                    : percentual >= 50
                    ? "bg-blue-500"
                    : "bg-yellow-500"
                }`}
                style={{ width: `${percentual}%` }}
              />
            </div>
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
