import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/vue';
import NavbarComponent from './NavbarComponent.vue';
import { renderWithProviders } from '@/test-utils';
import { showConfirmDialog } from '@/helpers/toolsHelper';
import { apiRequest } from '@/helpers/apiHelper';

vi.mock('@/helpers/apiHelper', () => ({
  apiRequest: vi.fn(),
  getAccessToken: vi.fn(() => null),
  putAccessToken: vi.fn(),
}));
vi.mock('@/helpers/toolsHelper', () => ({
  showConfirmDialog: vi.fn(),
}));

describe('NavbarComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiRequest.mockResolvedValue({ status: 'success', data: { user: { id: 1, name: 'Budi', photo: 'p.png' } } });
  });

  it('memuat profil bila belum tersedia dan menampilkan nama', async () => {
    await renderWithProviders(NavbarComponent, { initialState: { users: { profile: null } } });
    await waitFor(() => expect(screen.getByTestId('navbar-name')).toHaveTextContent('Budi'));
    expect(apiRequest).toHaveBeenCalledWith('/users/me');
    expect(screen.getByAltText('Foto profil')).toHaveAttribute('src', 'p.png');
  });

  it('tidak memuat ulang profil bila sudah tersedia dan memakai nama default bila kosong', async () => {
    await renderWithProviders(NavbarComponent, { initialState: { users: { profile: { id: 2, name: 'Sari' } } } });
    expect(screen.getByTestId('navbar-name')).toHaveTextContent('Sari');
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('menampilkan nama default saat profil belum ada dan tanpa foto', async () => {
    apiRequest.mockResolvedValue({ status: 'fail' });
    await renderWithProviders(NavbarComponent, { initialState: { users: { profile: null } } });
    expect(screen.getByTestId('navbar-name')).toHaveTextContent('Akun Saya');
    expect(screen.queryByAltText('Foto profil')).toBeNull();
  });

  it('mengirim toggle-sidebar saat tombol menu diklik', async () => {
    const { emitted } = await renderWithProviders(NavbarComponent, { initialState: { users: { profile: { name: 'A' } } } });
    await fireEvent.click(screen.getByTestId('toggle-sidebar'));
    expect(emitted()['toggle-sidebar']).toHaveLength(1);
  });

  it('logout setelah dikonfirmasi dan mengarahkan ke login', async () => {
    showConfirmDialog.mockResolvedValue(true);
    apiRequest.mockResolvedValue({ status: 'success' });
    const { router } = await renderWithProviders(NavbarComponent, {
      route: '/profile',
      initialState: { users: { profile: { name: 'A' } }, auth: { token: 'T' } },
    });
    await fireEvent.click(screen.getByTestId('logout-button'));
    await waitFor(() => expect(router.currentRoute.value.name).toBe('login'));
    expect(apiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
  });

  it('tidak logout bila konfirmasi dibatalkan', async () => {
    showConfirmDialog.mockResolvedValue(false);
    const { router } = await renderWithProviders(NavbarComponent, {
      route: '/profile',
      initialState: { users: { profile: { name: 'A' } }, auth: { token: 'T' } },
    });
    await fireEvent.click(screen.getByTestId('logout-button'));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(router.currentRoute.value.path).toBe('/profile');
    expect(apiRequest).not.toHaveBeenCalledWith('/auth/logout', expect.anything());
  });
});
