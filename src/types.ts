// types.ts

export type ChecklistItem = {
  texto: string;
  feito: boolean;
};

export type Lembrete = {
  id: string;
  titulo: string;
  descricao: string;
  prazo?: string;
  cor?: string;
  favoritos?: boolean;
  checklist?: ChecklistItem[];
};
