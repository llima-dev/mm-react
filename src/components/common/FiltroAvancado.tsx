import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Categoria } from "../../types";
import "./FiltroAvancado.css";

export type FiltroTipo =
  | "categoria"
  | "titulo"
  | "descricao"
  | "prazo"
  | "status"
  | "recorrencia";

export type FiltroAvancado = {
  tipo: FiltroTipo;
  valor: string;
};

type Props = {
  onAdicionarFiltro: (filtro: FiltroAvancado) => void;
  categorias: Categoria[];
};

export default function FiltroAvancado({ onAdicionarFiltro, categorias }: Props) {
  const [tipo, setTipo] = useState<FiltroTipo>("categoria");
  const [valor, setValor] = useState("");

  const adicionar = () => {
    if (valor.trim()) {
      onAdicionarFiltro({ tipo, valor });
      setValor("");
    }
  };

  const categoriasOrdenadas = [...categorias].sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "pt-BR", { sensitivity: "base" })
  );

  return (
    <div className="d-flex gap-2 align-items-center mb-3 advanced-filter-container">
      <select
        className="form-select form-select-sm"
        style={{ maxWidth: "140px" }}
        value={tipo}
        onChange={(e) => {
          setTipo(e.target.value as FiltroTipo);
          setValor("");
        }}
      >
        <option value="categoria">Categoria</option>
        <option value="titulo">Título</option>
        <option value="descricao">Descrição</option>
        <option value="prazo">Prazo</option>
        <option value="status">Status</option>
        <option value="recorrencia">Recorrência</option>
      </select>

      {/* Campo dinâmico */}
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
      ) : tipo === "recorrencia" ? (
        <select
          className="form-select form-select-sm"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={{ minWidth: "160px" }}
        >
          <option value="">Selecione...</option>
          <option value="com-recorrencia">Com recorrência</option>
          <option value="gerados">Gerados automaticamente</option>
        </select>
      ) : tipo === "categoria" ? (
        <select
          className="form-select form-select-sm"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={{ minWidth: "160px" }}
        >
          <option value="">Selecione...</option>
          {[
            ...new Map(
              categoriasOrdenadas.map((cat) => [cat.titulo.toLowerCase(), cat])
            ).values(),
          ].map((cat) => (
            <option key={cat.id} value={cat.titulo}>
              {cat.titulo}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Valor..."
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={{ minWidth: "160px" }}
        />
      )}

      <button
        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
        style={{
          padding: "0.25rem 0.75rem",
          fontSize: "0.8rem",
          whiteSpace: "nowrap",
        }}
        onClick={adicionar}
      >
        Adicionar filtro
      </button>
    </div>
  );
}
