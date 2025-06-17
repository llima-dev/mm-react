// src/setupTests.ts
import '@testing-library/jest-dom';

// Mock global necessário pra evitar erros com certos componentes React
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
