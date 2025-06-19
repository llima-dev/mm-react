import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import type { Lembrete } from '../../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import './LembreteModal.css';

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
  const [cor, setCor] = useState('branco');
  const [diasRecorrencia, setDiasRecorrencia] = useState<number[]>([]);

  useEffect(() => {
    if (lembreteParaEditar) {
      setTitulo(lembreteParaEditar.titulo);
      setDescricao(lembreteParaEditar.descricao);
      setPrazo(lembreteParaEditar.prazo ?? '');
      setCor(lembreteParaEditar.cor || 'branco');
      setDiasRecorrencia(lembreteParaEditar.diasRecorrencia ?? []);
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
      favorito: lembreteParaEditar?.favorito ?? false,
      checklist: lembreteParaEditar?.checklist ?? [],
      arquivado: lembreteParaEditar?.arquivado ?? false,
      fixado: lembreteParaEditar?.fixado ?? false,
      diasRecorrencia: diasRecorrencia.length ? diasRecorrencia : undefined,
    };
  
    onSalvar(lembrete);
    setTitulo('');
    setDescricao('');
    setPrazo('');
    setCor('branco');
  };

  const limparModal = () => {
      setTitulo('');
      setDescricao('');
      setPrazo('');
      setCor('branco');
      onClose();
  }

  return (
    <Modal show={show} onHide={limparModal} centered>
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
          onChange={(e) => {
            setDescricao(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          style={{ minHeight: "80px", resize: "none", overflow: "hidden" }}
        />
        <div>
          <DatePicker
            selected={prazo ? new Date(prazo + "T00:00:00") : null}
            onChange={(date) =>
              setPrazo(date ? date.toISOString().split("T")[0] : "")
            }
            dateFormat="dd/MM/yyyy"
            className="form-control mb-3 dt-picker"
            placeholderText="Prazo"
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
        <hr />
        <label className="form-label" title='Define se o lembrete será recriado semanalmente'>Recorrência semanal:</label>
        <div className="d-flex gap-2 flex-wrap mb-2">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((dia, index) => (
            <button
              key={index}
              type="button"
              className={`btn btn-sm ${
                diasRecorrencia.includes(index)
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              style={{ width: "32px", padding: "2px" }}
              onClick={() => {
                setDiasRecorrencia((atual) =>
                  atual.includes(index)
                    ? atual.filter((d) => d !== index)
                    : [...atual, index]
                );
              }}
            >
              {dia}
            </button>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary btn-sm" onClick={limparModal}>
          Cancelar
        </Button>
        <Button variant="outline-primary btn-sm" onClick={handleSalvar}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
