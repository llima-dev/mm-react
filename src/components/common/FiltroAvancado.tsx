import { useState } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export type FiltroTipo = "titulo" | "descricao" | "prazo" | "status";

export type FiltroAvancado = {
  tipo: FiltroTipo;
  valor: string;
};

type Props = {
  onAdicionarFiltro: (filtro: FiltroAvancado) => void;
};

export default function FiltroAvancado({ onAdicionarFiltro }: Props) {
  const [tipo, setTipo] = useState<FiltroTipo>("titulo");
  const [valor, setValor] = useState("");

  const adicionar = () => {
    if (valor.trim()) {
      onAdicionarFiltro({ tipo, valor });
      setValor("");
    }
  };

  return (
    <div className="d-flex gap-2 align-items-center mb-3 advanced-filter-container">
      <select
        className="form-select form-select-sm"
        style={{ maxWidth: "120px" }}
        value={tipo}
        onChange={(e) => setTipo(e.target.value as FiltroTipo)}
      >
        <option value="titulo">Título</option>
        <option value="descricao">Descrição</option>
        <option value="prazo">Prazo</option>
        <option value="status">Status</option>
      </select>
      
      {tipo === "prazo" ? (
        <DatePicker
          selected={valor ? new Date(valor) : null}
          onChange={(date: Date | null) =>
            setValor(date ? date.toISOString().split("T")[0] : "")
          }
          dateFormat="dd/MM/yyyy"
          placeholderText="Prazo"
          className="form-control form-control-sm"
          wrapperClassName="date-picker-wrapper"
        />
      ) : tipo === "status" ? (
        <select
          className="form-select form-select-sm"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={{ minWidth: "140px" }}
        >
          <option value="">Selecione...</option>
          <option value="finalizado">Finalizado</option>
          <option value="atrasado">Atrasado</option>
          <option value="proximo">Próximo</option>
          <option value="ok">Ok</option>
        </select>
      ) : (
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Valor..."
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={{ minWidth: "140px" }}
        />
      )}

      <button
        className="btn btn-sm btn-outline-secondary"
        style={{
          padding: "0.25rem 0.75rem",
          fontSize: "0.8rem",
          whiteSpace: "nowrap",
        }}
        onClick={adicionar}
      >
        + Filtro
      </button>
    </div>
  );
}
