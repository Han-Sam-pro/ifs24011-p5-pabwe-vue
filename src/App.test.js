import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import App from './App.vue';

describe('App', () => {
  it('merender area router tanpa error', () => {
    const { container } = render(App, { global: { stubs: { RouterView: { template: '<div data-testid="router-view" />' } } } });
    expect(container.querySelector('[data-testid="router-view"]')).toBeInTheDocument();
  });
});
