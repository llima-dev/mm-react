import Swal from 'sweetalert2';
import type { ChecklistItem, Lembrete } from "../../types";
import { STORAGE_CHAVE_LEMBRETES } from '../../utils/constants';

type badgeStyle = {
  bg: string;
  text: string;
}

export function confirmarExclusao(callback: () => void) {
  Swal.fire({
    title: 'Excluir lembrete?',
    text: 'Essa ação não pode ser desfeita!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
      Swal.fire({
        title: 'Excluído!',
        text: 'O lembrete foi removido.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
}

export function copiarCodigoComAlerta(codigo: string) {
  navigator.clipboard.writeText(codigo)
    .then(() => {
      Swal.fire({
        title: 'Copiado!',
        text: 'O código foi copiado para a área de transferência.',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      });
    })
    .catch(() => {
      Swal.fire({
        title: 'Erro!',
        text: 'Não foi possível copiar o código.',
        icon: 'error',
      });
    });
}

export function getStatusPrazo(prazo?: string, checklist: ChecklistItem[] = []) {
  const todosFeitos = checklist.length > 0 && checklist.every(i => i.feito);
  if (todosFeitos) return { tipo: 'finalizado' };

  if (!prazo) return { tipo: 'nulo' };

  const hoje = new Date();
  const dataPrazo = new Date(prazo);
  const diffDias = (dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDias < 0) return { tipo: 'atrasado' };
  if (diffDias <= 1) return { tipo: 'proximo' };
  return { tipo: 'ok' };
}

export function exportarLembretes(lembretes: Lembrete[], nomeProjeto?: string) {
  const nomeArquivo = nomeProjeto?.trim()
    ? `meu-mural-${nomeProjeto.replace(/\s+/g, '_')}.json`
    : 'meu-mural-export.json';

  const dados = {
    nomeProjeto: nomeProjeto || '',
    lembretes
  };

  const blob = new Blob([JSON.stringify(dados, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

export function importarLembretesDoArquivo(
  arquivo: File,
  lembretesAtuais: Lembrete[],
  onImportar: (novos: Lembrete[], nomeProjeto?: string) => void
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);

      const lista = (Array.isArray(json) ? json : json.lembretes) as Partial<Lembrete>[];
      const nomeProjeto = typeof json.nomeProjeto === 'string' ? json.nomeProjeto : undefined;

      const validos = lista.filter((l) => l.id && l.titulo);

      const convertidos: Lembrete[] = validos.map((l) => ({
        id: crypto.randomUUID(),
        titulo: l.titulo || 'Sem título',
        descricao: l.descricao || '',
        cor: l.cor || 'azul',
        checklist: l.checklist || [],
        favorito: l.favorito ?? false,
        fixado: l.fixado ?? false,
        arquivado: false,
        comentarios: l.comentarios || [],
        anotacoes: l.anotacoes || '',
        snippets: l.snippets || [],
        prazo: l.prazo || ''
      }));

      onImportar([...lembretesAtuais, ...convertidos], nomeProjeto);
    } catch (erro) {
      alert("Arquivo inválido.");
    }
  };
  reader.readAsText(arquivo);
}

export function limparMural() {
  Swal.fire({
    title: 'Limpar mural?',
    text: 'Tem certeza que deseja apagar todos os lembretes? Essa ação não pode ser desfeita.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Sim, apagar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem(STORAGE_CHAVE_LEMBRETES);
      location.reload();
    }
  });
}

export function corPorTipo(tipo: string): badgeStyle {
  switch (tipo) {
    case "status":
      return { bg: "warning", text: "text-dark" };
    case "prazo":
      return { bg: "primary", text: "text-white" };
    case "titulo":
      return { bg: "light", text: "text-dark" };
    case "descricao":
      return { bg: "secondary", text: "text-white" };
    default:
      return { bg: "light", text: "text-dark" };
  }
}

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function extrairHashtags(texto: string): string[] {
  return (texto.match(/#\w+/g) || []).slice(0, 5);
}

export function calcularUsoLocalStorage(): { usadoKB: number; porcentagem: number } {
  const totalEstimado = 5 * 1024 * 1024; // 5MB padrão (em bytes)

  let totalUsado = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    const valor = localStorage.getItem(chave!);
    totalUsado += chave!.length + (valor?.length ?? 0);
  }

  const usadoKB = +(totalUsado / 1024).toFixed(1); // em KB
  const porcentagem = +((totalUsado / totalEstimado) * 100).toFixed(1);

  return { usadoKB, porcentagem };
}

export function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Erro ao entrar em fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}
