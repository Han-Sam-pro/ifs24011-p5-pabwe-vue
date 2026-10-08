import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/vue';
import UsersPage from './UsersPage.vue';
import { renderWithProviders } from '@/test-utils';
import { apiRequest } from '@/helpers/apiHelper';

vi.mock('@/helpers/apiHelper', () => ({
  apiRequest: vi.fn(),
  getAccessToken: vi.fn(() => null),
  putAccessToken: vi.fn(),
}));

describe('UsersPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('menampilkan tabel pengguna dari API', async () => {
    apiRequest.mockResolvedValue({
      status: 'success',
      data: { users: [{ id: 1, name: 'Budi', email: 'b@c.d', photo: 'p.png', created_at: '2026-10-01 10:00:00' }] },
    });
    await renderWithProviders(UsersPage);
    expect(await screen.findByTestId('users-table')).toBeInTheDocument();
    expect(screen.getAllByTestId('user-row')).toHaveLength(1);
    expect(screen.getByText('b@c.d')).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith('/users');
  });

  it('menampilkan pesan memuat saat data diambil', async () => {
    await renderWithProviders(UsersPage, { initialState: { users: { users: [], isUsers: true } } });
    expect(screen.getByText('Memuat pengguna...')).toBeInTheDocument();
  });

  it('menampilkan pesan kosong bila tidak ada pengguna', async () => {
    apiRequest.mockResolvedValue({ status: 'success', data: { users: [] } });
    await renderWithProviders(UsersPage);
    expect(await screen.findByText('Belum ada pengguna.')).toBeInTheDocument();
  });
});
