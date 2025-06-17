// hooks/useLembretes.ts
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Lembrete } from "../types";
import { STORAGE_CHAVE_LEMBRETES } from '../utils/constants';

export function useLembretes() {
  const [idDetalhesAberto, setIdDetalhesAberto] = useState<string | null>(null);
  const [lembretes, setLembretes] = useState<Lembrete[]>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_CHAVE_LEMBRETES);
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  const abrirDetalhes = (id: string) => setIdDetalhesAberto(id);
  const fecharDetalhes = () => setIdDetalhesAberto(null);

  // 🧠 Salva sempre que mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_CHAVE_LEMBRETES, JSON.stringify(lembretes));
  }, [lembretes]);

  const adicionar = (lembrete: Lembrete) => {
    const novo = { ...lembrete, id: uuidv4() };
    setLembretes((prev) => [...prev, novo]);
  };

  const remover = (id: string) => {
    setLembretes((prev) => prev.filter((l) => l.id !== id));
  };

  const atualizar = (id: string, dados: Partial<Lembrete>) => {
    setLembretes((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...dados } : l))
    );
  };

  const reordenar = (novaLista: Lembrete[]) => {
    setLembretes(novaLista);
  };

  return {
    lembretes,
    adicionar,
    remover,
    atualizar,
    reordenar,
    idDetalhesAberto,
    abrirDetalhes,
    fecharDetalhes,
  };
}
