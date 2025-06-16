import './LembreteCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTrash, faEdit, faListCheck, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import type { ChecklistItem } from '../../types';
import { Button } from 'react-bootstrap';

type Props = {
  titulo: string;
  descricao: string;
  prazo?: string;
  cor?: string;
  checklist?: ChecklistItem[];
  onEditar?: () => void;
  dragHandle?: React.ReactNode;
};

export default function LembreteCard({
  titulo,
  descricao,
  prazo,
  cor = 'azul',
  onEditar,
  checklist = [],
  dragHandle
}: Props) {
  const percentual =
    checklist.length > 0
      ? Math.round(
          (checklist.filter((i) => i.feito).length / checklist.length) * 100
        )
      : 0;
      

  return (
    <div className={`card card-borda-${cor}`}>
      {dragHandle && (
        <div className="position-absolute top-0 end-0 p-2">
          {dragHandle}
        </div>
      )}
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
          <Button variant="link" className="p-0 text-secondary opacity-50" onClick={onEditar} title="Editar">
            <FontAwesomeIcon icon={faEdit} />
          </Button>
          <Button variant="link" className="p-0 text-secondary opacity-50" onClick={(e) => {console.log(e);
          }} title="Excluir">
            <FontAwesomeIcon icon={faTrash} />
          </Button>
          <Button variant="link" className="p-0 text-secondary opacity-50" title="Checklist (em breve)">
            <FontAwesomeIcon icon={faListCheck} />
          </Button>
          <Button variant="link" className="p-0 text-secondary opacity-50" title="Detalhes (em breve)">
            <FontAwesomeIcon icon={faInfoCircle} />
          </Button>
        </div>
      </div>
    </div>
  );
}
