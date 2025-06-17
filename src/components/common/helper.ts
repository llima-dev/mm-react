import Swal from 'sweetalert2';
import type { ChecklistItem } from "../../types";

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
