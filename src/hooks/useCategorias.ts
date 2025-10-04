import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Categoria } from "../types";
import { STORAGE_CHAVE_CATEGORIAS } from "../utils/constants";

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_CHAVE_CATEGORIAS);
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_CHAVE_CATEGORIAS, JSON.stringify(categorias));
  }, [categorias]);

  const adicionar = (categoria: Categoria) => {
    const nova = { ...categoria, id: uuidv4() };
    setCategorias((prev) => [...prev, nova]);
  };

  const remover = (id: string) => {
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  const atualizar = (id: string, dados: Partial<Categoria>) => {
    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...dados } : c))
    );
  };

  return {
    categorias,
    adicionar,
    remover,
    atualizar,
  };
}
