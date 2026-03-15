// types.ts

export type ChecklistItem = {
  id: string;
  texto: string;
  feito: boolean;
  concluidoEm?: string;
};

export type Planilha = CelulaPlanilha[][];
export type CelulaPlanilha = string | number;

export type Lembrete = {
  id: string;
  titulo: string;
  descricao: string;
  prazo?: string;
  cor?: string;
  favoritos?: boolean;
  checklist?: ChecklistItem[];
  comentarios?: Comentario[];
  snippets?: Snippet[];
  anotacoes?: string;
  favorito?: boolean;
  arquivado?: boolean;
  fixado?: boolean;
  criadoPorRecorrencia?: boolean;
  geradoPor?: string;
  diasRecorrencia?: number[];
  categoriaId?: string;
  planilha?: CelulaPlanilha[][];
};

export type Comentario = {
  id: string;
  texto: string;
  data: string;
  editado?: boolean;
};

export type Snippet = {
  id: string;
  titulo: string;
  linguagem: string;
  codigo: string;
};

export type Categoria = {
  id: string;
  titulo: string
  descricao?: string;
  hashtags?: string[];
  checklist?: string[];
  mascaraTitulo?: string;
  mascaraDescricao?: string;
};
