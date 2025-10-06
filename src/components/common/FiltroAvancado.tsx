import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Categoria } from "../../types";

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
    <div className="flex flex-wrap items-center gap-2 mb-2">
      {/* Tipo de filtro */}
      <select
        className="px-2 py-1.5 rounded-md border border-border/60 bg-background text-foreground text-sm
                   focus:outline-none focus:ring-1 focus:ring-indigo-400"
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
          className="px-2 py-1.5 rounded-md border border-border/60 bg-background text-foreground text-sm
                     focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      ) : tipo === "status" ? (
        <select
          className="px-2 py-1.5 rounded-md border border-border/60 bg-background text-foreground text-sm
                     focus:outline-none focus:ring-1 focus:ring-indigo-400"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        >
          <option value="">Selecione...</option>
          <option value="finalizado">Finalizado</option>
          <option value="atrasado">Atrasado</option>
          <option value="proximo">Próximo</option>
          <option value="ok">Ok</option>
        </select>
      ) : tipo === "recorrencia" ? (
        <select
          className="px-2 py-1.5 rounded-md border border-border/60 bg-background text-foreground text-sm
                     focus:outline-none focus:ring-1 focus:ring-indigo-400"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        >
          <option value="">Selecione...</option>
          <option value="com-recorrencia">Com recorrência</option>
          <option value="gerados">Gerados automaticamente</option>
        </select>
      ) : tipo === "categoria" ? (
        <select
          className="px-2 py-1.5 rounded-md border border-border/60 bg-background text-foreground text-sm
                     focus:outline-none focus:ring-1 focus:ring-indigo-400"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        >
          <option value="">Selecione...</option>
          {[...new Map(categoriasOrdenadas.map((cat) => [cat.titulo.toLowerCase(), cat])).values()].map(
            (cat) => (
              <option key={cat.id} value={cat.titulo}>
                {cat.titulo}
              </option>
            )
          )}
        </select>
      ) : (
        <input
          type="text"
          placeholder="Valor..."
          className="px-2 py-1.5 rounded-md border border-border/60 bg-background text-foreground text-sm
                     focus:outline-none focus:ring-1 focus:ring-indigo-400"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
      )}

      <button
        onClick={adicionar}
        className="inline-flex items-center gap-1 rounded-md border border-border/60 px-3 py-1 text-sm font-medium
                   text-foreground/80 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800
                   focus:outline-none focus:ring-1 focus:ring-indigo-400 transition"
      >
        Adicionar filtro
      </button>
    </div>
  );
}
