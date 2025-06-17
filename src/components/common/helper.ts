import Swal from 'sweetalert2';
import type { ChecklistItem, Lembrete } from "../../types";
import { STORAGE_CHAVE_LEMBRETES } from '../../utils/constants';

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

export function exportarLembretes(lembretes: Lembrete[]) {
  const json = JSON.stringify(lembretes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "meu-mural-lembretes.json";
  link.click();
}

export function importarLembretesDoArquivo(
  arquivo: File,
  lembretesAtuais: Lembrete[],
  onImportar: (novos: Lembrete[]) => void
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string) as Lembrete[];
      const validos = json.filter((l) => l.id && l.titulo);

      const convertidos = validos.map((l) => ({
        ...l,
        id: crypto.randomUUID(),
      }));

      onImportar([...lembretesAtuais, ...convertidos]);
    } catch (erro) {
      alert("Arquivo inválido.");
    }
  };
  reader.readAsText(arquivo);
}

export function limparMural() {
  if (window.confirm("Tem certeza que deseja apagar todos os lembretes? Essa ação não pode ser desfeita.")) {
    localStorage.removeItem(STORAGE_CHAVE_LEMBRETES);
    location.reload();
  }
}