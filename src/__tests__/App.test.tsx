import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import '@testing-library/jest-dom';

vi.mock('../components/common/SplashScreen', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => {
    onComplete(); // Simula final da splash
    return <div data-testid="splash">Splash screen falsa</div>;
  },
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renderiza título do mural e botões principais', async () => {
    render(<App />);

    expect(screen.getByPlaceholderText('Nome do mural')).toBeInTheDocument();
    expect(screen.getByText('+ Adicionar Lembrete')).toBeInTheDocument();
    expect(screen.getByText('Exportar')).toBeInTheDocument();
    expect(screen.getByText('Importar')).toBeInTheDocument();
  });

  test('permite alterar o nome do mural e salva no localStorage', async () => {
    render(<App />);

    const input = screen.getByPlaceholderText('Nome do mural');
    fireEvent.change(input, { target: { value: 'Mural Teste' } });

    await waitFor(() => {
      expect(localStorage.getItem('nomeProjeto')).toBe('Mural Teste');
    });
  });

  test('mostra modal ao clicar em "+ Adicionar Lembrete"', async () => {
    render(<App />);

    const botao = screen.getByText('+ Adicionar Lembrete');
    fireEvent.click(botao);

    expect(
      await screen.findByText(/Salvar/i)
    ).toBeInTheDocument(); // botão do modal
  });
});
