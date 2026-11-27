import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom no trae matchMedia (GSAP lo necesita). Simulamos "prefiere menos movimiento"
// para que las animaciones no se ejecuten durante las pruebas.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}
  });
}

// Cada prueba parte con localStorage limpio y el DOM desmontado.
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});
