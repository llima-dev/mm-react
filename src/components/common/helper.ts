import Swal from 'sweetalert2';

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
