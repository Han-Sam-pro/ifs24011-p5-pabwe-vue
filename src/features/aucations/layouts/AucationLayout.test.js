import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/vue';
import App from '@/App.vue';
import { renderWithProviders } from '@/test-utils';
import { apiRequest } from '@/helpers/apiHelper';

vi.mock('@/helpers/apiHelper', () => ({
  apiRequest: vi.fn(() => Promise.resolve({ status: 'success', data: { user: { id: 1, name: 'Budi' }, aucations: [] } })),
  getAccessToken: vi.fn(() => null),
  putAccessToken: vi.fn(),
}));

describe('AucationLayout (melalui App dan router sungguhan)', () => {
  it('menampilkan navbar, sidebar, dan drawer yang bisa dibuka serta ditutup', async () => {
    const { container } = await renderWithProviders(App, {
      route: '/',
      initialState: { auth: { token: 'T' }, users: { profile: { name: 'Budi' } } },
    });

    expect(screen.getAllByTestId('toggle-sidebar')).toHaveLength(1);
    expect(screen.queryByTestId('sidebar-backdrop')).toBeNull();

    await fireEvent.click(screen.getByTestId('toggle-sidebar'));
    expect(screen.getByTestId('sidebar-backdrop')).toBeInTheDocument();
    expect(container.querySelector('aside').className).toContain('translate-x-0');

    await fireEvent.click(screen.getByTestId('sidebar-backdrop'));
    await waitFor(() => expect(screen.queryByTestId('sidebar-backdrop')).toBeNull());
    expect(apiRequest).toHaveBeenCalledWith('/aucations', expect.anything());
  });
});
