import './LembreteCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTrash, faEdit, faListCheck, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import type { ChecklistItem } from '../../types';

type Props = {
  titulo: string;
  descricao: string;
  prazo?: string;
  cor?: string;
  checklist?: ChecklistItem[];
};

export default function LembreteCard({
  titulo,
  descricao,
  prazo,
  cor = 'azul',
  checklist = [],
}: Props) {
  const percentual =
    checklist.length > 0
      ? Math.round(
          (checklist.filter((i) => i.feito).length / checklist.length) * 100
        )
      : 0;

  return (
    <div className={`card card-borda-${cor}`}>
      <div className="card-body">
        <h5 className="card-title">{titulo}</h5>
        <p className="card-text">{descricao}</p>
        {prazo && <p className="prazo"><FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-muted" />
        {prazo}</p>}
        {checklist.length > 0 && (
          <div className="checklist">
            <div className="barra">
              <div
                className="barra-preenchida"
                style={{ width: `${percentual}%` }}
              >
                {percentual}%
              </div>
            </div>
            <ul>
              {checklist.map((item, i) => (
                <li key={i}>
                  <input type="checkbox" checked={item.feito} readOnly />{' '}
                  {item.texto}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="d-flex justify-content-end gap-2 mt-3">
          <FontAwesomeIcon icon={faTrash} className="text-secondary opacity-50" />
          <FontAwesomeIcon icon={faEdit} className="text-secondary opacity-50" />
          <FontAwesomeIcon icon={faListCheck} className="text-secondary opacity-50" />
          <FontAwesomeIcon icon={faInfoCircle} className="text-secondary opacity-50" />
        </div>
      </div>
    </div>
  );
}
