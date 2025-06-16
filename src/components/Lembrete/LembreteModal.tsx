import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import type { Lembrete } from '../../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Props = {
  show: boolean;
  onClose: () => void;
  onSalvar: (l: Lembrete) => void;
  lembreteParaEditar?: Lembrete | null;
};

export default function LembreteModal({
  show,
  onClose,
  onSalvar,
  lembreteParaEditar,
}: Props) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prazo, setPrazo] = useState('');
  const [cor, setCor] = useState('azul');

  useEffect(() => {
    if (lembreteParaEditar) {
      setTitulo(lembreteParaEditar.titulo);
      setDescricao(lembreteParaEditar.descricao);
      setPrazo(lembreteParaEditar.prazo ?? '');
      setCor(lembreteParaEditar.cor || 'azul');
    } else {
      setTitulo('');
      setDescricao('');
      setPrazo('');
      setCor('azul');
    }
  }, [lembreteParaEditar]);  

  const handleSalvar = () => {
    if (!titulo.trim()) return;
  
    const lembrete: Lembrete = {
      id: lembreteParaEditar?.id ?? crypto.randomUUID(),
      titulo,
      descricao,
      prazo,
      cor,
      favoritos: lembreteParaEditar?.favoritos ?? false,
      checklist: lembreteParaEditar?.checklist ?? [],
    };
  
    onSalvar(lembrete);
  };  

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {lembreteParaEditar ? "Editar" : "Novo"} Lembrete
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input
          className="form-control mb-2"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <div>
        <DatePicker
          selected={prazo ? new Date(prazo) : null}
          onChange={(date) =>
            setPrazo(date ? date.toISOString().split("T")[0] : "")
          }
          dateFormat="dd/MM/yyyy"
          className="form-control mb-3"
        />
        </div>
        <label className="form-label">Cor do card:</label>
        <div className="d-flex gap-2">
          {["branco", "azul", "verde", "vermelho", "amarelo"].map((c) => (
            <label key={c}>
              <input
                type="radio"
                name="corCard"
                value={c}
                checked={cor === c}
                onChange={() => setCor(c)}
                className="visually-hidden"
              />
              <span
                className="rounded-circle d-inline-block"
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor:
                    c === "branco"
                      ? "#fff"
                      : c === "azul"
                      ? "#3b82f6"
                      : c === "verde"
                      ? "#10b981"
                      : c === "vermelho"
                      ? "#ef4444"
                      : "#facc15",
                  border: "2px solid #ccc",
                  cursor: "pointer",
                  boxShadow: cor === c ? "0 0 0 3px #0004" : "none",
                }}
              ></span>
            </label>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSalvar}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
