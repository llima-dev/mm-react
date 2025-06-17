import { render, screen, fireEvent } from '@testing-library/react';
import LembreteDrawer from '../components/Lembrete/drawer/LembreteDrawer';
import '@testing-library/jest-dom';
import type { Lembrete } from '../types';

describe('LembreteDrawer', () => {
  const lembrete: Lembrete = {
    id: 'abc123',
    titulo: 'Lembrete Teste',
    descricao: 'Descrição #tag1 #tag2',
    prazo: '2025-06-30',
    comentarios: [],
    fixado: false,
    arquivado: false,
    checklist: [],
  };

  const onFechar = vi.fn();
  const onSalvarComentario = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = ''; // limpa portal
  });

  test('renderiza título e abas', () => {
    render(
      <LembreteDrawer
        lembrete={lembrete}
        onFechar={onFechar}
        onSalvarComentario={onSalvarComentario}
      />
    );

    expect(screen.getByText('Lembrete Teste')).toBeInTheDocument();
    expect(screen.getByText('Detalhes')).toBeInTheDocument();
    expect(screen.getByText('Comentários')).toBeInTheDocument();
    expect(screen.getByText('Anotações')).toBeInTheDocument();
    expect(screen.getByText('Snippets')).toBeInTheDocument();
  });

  test('mostra detalhes e hashtags corretamente', () => {
    render(<LembreteDrawer lembrete={lembrete} onFechar={onFechar} />);

    expect(screen.getByText('Prazo')).toBeInTheDocument();
    expect(screen.getByText('#tag1')).toBeInTheDocument();
    expect(screen.getByText('#tag2')).toBeInTheDocument();
  });

  test('permite adicionar comentário com Enter', () => {
    render(
      <LembreteDrawer
        lembrete={lembrete}
        onFechar={onFechar}
        onSalvarComentario={onSalvarComentario}
      />
    );

    fireEvent.click(screen.getByText('Comentários'));
    const textarea = screen.getByPlaceholderText('Escreva um comentário...');
    fireEvent.change(textarea, { target: { value: 'Novo comentário' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    expect(onSalvarComentario).toHaveBeenCalled();
  });

  test('chama onFechar ao clicar no botão X', () => {
    render(<LembreteDrawer lembrete={lembrete} onFechar={onFechar} />);
    fireEvent.click(screen.getByTitle('Fechar'));
    expect(onFechar).toHaveBeenCalled();
  });
});
