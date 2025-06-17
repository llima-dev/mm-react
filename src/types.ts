// types.ts

export type ChecklistItem = {
  id: string;
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
  comentarios?: Comentario[];
  anotacoes?: string;
};

export type Comentario = {
  id: string;
  texto: string;
  data: string;
};