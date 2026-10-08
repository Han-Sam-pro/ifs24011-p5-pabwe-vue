import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/vue';
import AuthLayout from './AuthLayout.vue';
import { renderWithProviders } from '@/test-utils';

describe('AuthLayout', () => {
  it('menampilkan branding dan area formulir', async () => {
    await renderWithProviders(AuthLayout, { route: '/auth', routePattern: '/auth' });
    expect(screen.getByText('Delcom Auction')).toBeInTheDocument();
    expect(screen.getByText(/Lelang barang terbaik/)).toBeInTheDocument();
  });
});
