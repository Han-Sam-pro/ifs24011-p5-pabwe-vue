import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/vue';
import Swal from 'sweetalert2';
import LoginPage from './LoginPage.vue';
import { renderWithProviders } from '@/test-utils';
import { apiRequest } from '@/helpers/apiHelper';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })) } }));
vi.mock('@/helpers/apiHelper', () => ({
  apiRequest: vi.fn(),
  getAccessToken: vi.fn(() => null),
  putAccessToken: vi.fn(),
}));

async function submit(email, password) {
  await fireEvent.update(screen.getByLabelText('Email'), email);
  await fireEvent.update(screen.getByLabelText('Kata sandi'), password);
  await fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('menampilkan error validasi bila field kosong dan tidak memanggil API', async () => {
    await renderWithProviders(LoginPage);
    await fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByText('Email wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi wajib diisi')).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
    // Validasi kedua saat error sudah ada: hapus error lama lalu hitung ulang.
    await fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByText('Email wajib diisi')).toBeInTheDocument();
  });

  it('login sukses menampilkan dialog lalu mengarahkan ke beranda', async () => {
    apiRequest.mockResolvedValue({ status: 'success', data: { token: 'T', user: { name: 'Budi' } } });
    const { router } = await renderWithProviders(LoginPage, { route: '/auth/login' });

    await submit(' budi@mail.com ', 'rahasia');

    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'));
    expect(apiRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'budi@mail.com', password: 'rahasia' },
    });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', title: 'Login berhasil' }));
  });

  it('mengarahkan ke rute redirect yang aman', async () => {
    apiRequest.mockResolvedValue({ status: 'success', data: { token: 'T', user: { name: 'Budi' } } });
    const { router } = await renderWithProviders(LoginPage, { route: '/auth/login?redirect=/users' });
    await submit('a@b.c', 'pw');
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/users'));
  });

  it('mengabaikan redirect ke domain luar', async () => {
    apiRequest.mockResolvedValue({ status: 'success', data: { token: 'T', user: { name: 'Budi' } } });
    const { router } = await renderWithProviders(LoginPage, { route: '/auth/login?redirect=//evil.com' });
    await submit('a@b.c', 'pw');
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'));
  });

  it('login gagal menampilkan dialog error dan validasi server', async () => {
    apiRequest.mockResolvedValue({ status: 'fail', message: 'Kredensial salah', data: { email: ['Email tidak terdaftar'] } });
    await renderWithProviders(LoginPage);
    await submit('x@y.z', 'salah');
    expect(await screen.findByText('Email tidak terdaftar')).toBeInTheDocument();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: 'Login gagal', text: 'Kredensial salah' }));
  });

  it('menampilkan teks memproses saat login berjalan', async () => {
    await renderWithProviders(LoginPage, { initialState: { auth: { isAuthLogin: true, validation: {}, token: null } } });
    expect(screen.getByText('Memproses...')).toBeDisabled();
  });
});
