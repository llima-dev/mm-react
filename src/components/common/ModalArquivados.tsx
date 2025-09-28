import { Modal, Button } from 'react-bootstrap';
import type { Lembrete } from '../../types';
import { faTrash, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import "./SplashScreen.css";

type Props = {
  arquivados: Lembrete[];
  onFechar: () => void;
  onDesarquivar: (id: string) => void;
  onExcluir: (id: string) => void;
  show: boolean;
};

export default function ModalArquivados({ arquivados, onFechar, onDesarquivar, onExcluir, show }: Props) {
  return (
    <Modal show={show} onHide={onFechar} centered>
      <Modal.Header closeButton>
        <Modal.Title>Arquivados</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {arquivados.length === 0 ? (
          <p className="text-muted">Nenhum lembrete arquivado.</p>
        ) : (
          <ul className="list-group">
            {arquivados.map((l) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={l.id}>
                {l.titulo}
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary btn-sm no-border" onClick={() => onDesarquivar(l.id)}>
                    <FontAwesomeIcon icon={faRotateLeft} /> {/* desarquivar */}
                  </Button>
                  <Button variant="outline-danger btn-sm no-border" onClick={() => onExcluir(l.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onFechar}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
