import { render, screen, fireEvent } from '@testing-library/react';
import LembreteCard from '../components/Lembrete/LembreteCard';
import '@testing-library/jest-dom';
import type { ChecklistItem } from '../types';

describe('LembreteCard', () => {
  const checklist: ChecklistItem[] = [
    { id: '1', texto: 'Ler docs do RTL', feito: false },
    { id: '2', texto: 'Escrever testes', feito: true },
  ];

  const mockProps = {
    titulo: 'Estudar React',
    descricao: 'Estudar testes em React #tarefa #urgente',
    prazo: '2025-06-18',
    checklist,
    favorito: false,
    fixado: false,
    onEditar: vi.fn(),
    onExcluir: vi.fn(),
    onReordenarChecklist: vi.fn(),
    onToggleChecklistItem: vi.fn(),
    onAbrirDetalhes: vi.fn(),
    onToggleFavorito: vi.fn(),
    onToggleArquivar: vi.fn(),
    onToggleFixado: vi.fn(),
    onDuplicar: vi.fn(),
  };

  test('renderiza título, descrição (sem hashtags) e tags', () => {
    render(<LembreteCard {...mockProps} />);
    expect(screen.getByText('Estudar React')).toBeInTheDocument();
    expect(screen.getByText('Estudar testes em React')).toBeInTheDocument();
    expect(screen.getByText('#tarefa')).toBeInTheDocument();
    expect(screen.getByText('#urgente')).toBeInTheDocument();
  });

  test('chama onToggleFavorito ao clicar no botão de favorito', () => {
    render(<LembreteCard {...mockProps} />);
    const botaoFav = screen.getByTitle('Adicionar aos favoritos');
    fireEvent.click(botaoFav);
    expect(mockProps.onToggleFavorito).toHaveBeenCalled();
  });

  test('renderiza checklist com itens e porcentagem correta', () => {
    render(<LembreteCard {...mockProps} />);
    expect(screen.getByText('Ler docs do RTL')).toBeInTheDocument();
    expect(screen.getByText('Escrever testes')).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument(); // 1 de 2 feito
  });

  test('chama onEditar ao clicar no botão de editar', () => {
    render(<LembreteCard {...mockProps} />);
    const botaoEditar = screen.getByTitle('Editar');
    fireEvent.click(botaoEditar);
    expect(mockProps.onEditar).toHaveBeenCalled();
  });

  test('chama onAbrirDetalhes ao clicar no botão de detalhes', () => {
    render(<LembreteCard {...mockProps} />);
    const botaoDetalhes = screen.getByTitle('Detalhes');
    fireEvent.click(botaoDetalhes);
    expect(mockProps.onAbrirDetalhes).toHaveBeenCalled();
  });

  test('chama onDuplicar ao clicar no botão de duplicar', () => {
    render(<LembreteCard {...mockProps} onDuplicar={vi.fn()} />);
    const botaoDuplicar = screen.getByTitle('Duplicar lembrete');
    fireEvent.click(botaoDuplicar);
    expect(mockProps.onDuplicar).toHaveBeenCalled();
  });  
});
