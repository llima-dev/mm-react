import { Modal, Button } from "react-bootstrap";
import PlanilhaEditor from "../PlanilhaEditor";
import type { Planilha } from "../../../types";

type Props = {
  show: boolean;
  onClose: () => void;
  data?: Planilha;
  onChange?: (data: Planilha) => void;
  planilhaTitulo: string;
};

export default function PlanilhaModal({ show, onClose, data, onChange, planilhaTitulo }: Props) {
  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          Planilha
          <small
            className="text-muted"
            style={{
              maxWidth: "250px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
            title={planilhaTitulo}
          >
           - {planilhaTitulo}
          </small>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ height: "75vh", display: "flex", flexDirection: "column" }}>
        <PlanilhaEditor isDrawer={false} data={data} onChange={onChange} />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
