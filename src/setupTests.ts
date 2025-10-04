// src/setupTests.ts
import '@testing-library/jest-dom';
// Evita erros de CSS em libs externas durante testes
vi.mock('@mui/x-data-grid/esm/index.css', () => ({}));

// Mock global necessário pra evitar erros com certos componentes React
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
