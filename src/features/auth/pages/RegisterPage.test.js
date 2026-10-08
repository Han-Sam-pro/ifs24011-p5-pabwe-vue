import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/vue';
import Swal from 'sweetalert2';
import RegisterPage from './RegisterPage.vue';
import { renderWithProviders } from '@/test-utils';
import { apiRequest } from '@/helpers/apiHelper';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })) } }));
vi.mock('@/helpers/apiHelper', () => ({
  apiRequest: vi.fn(),
  getAccessToken: vi.fn(() => null),
  putAccessToken: vi.fn(),
}));

async function fill({ name = 'Budi', email = 'b@c.d', password = '123456', confirm = '123456' } = {}) {
  await fireEvent.update(screen.getByLabelText('Nama lengkap'), name);
  await fireEvent.update(screen.getByLabelText('Email'), email);
  await fireEvent.update(screen.getByLabelText('Kata sandi'), password);
  await fireEvent.update(screen.getByLabelText('Ulangi kata sandi'), confirm);
  await fireEvent.click(screen.getByText('Daftar'));
}

describe('RegisterPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('menampilkan seluruh error validasi klien', async () => {
    await renderWithProviders(RegisterPage);
    await fill({ name: '', email: '', password: '123', confirm: '999' });
    expect(await screen.findByText('Nama wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Email wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi minimal 6 karakter')).toBeInTheDocument();
    expect(screen.getByText('Konfirmasi kata sandi tidak sama')).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
    await fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(await screen.findByText('Nama wajib diisi')).toBeInTheDocument();
  });

  it('registrasi sukses menampilkan dialog dan pindah ke login', async () => {
    apiRequest.mockResolvedValue({ status: 'success', message: 'Akun dibuat' });
    const { router } = await renderWithProviders(RegisterPage, { route: '/auth/register' });
    await fill();
    await waitFor(() => expect(router.currentRoute.value.name).toBe('login'));
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Registrasi berhasil' }));
  });

  it('registrasi gagal menampilkan validasi server dan dialog error', async () => {
    apiRequest.mockResolvedValue({ status: 'fail', message: 'Email sudah dipakai', data: { email: ['Email sudah dipakai'] } });
    await renderWithProviders(RegisterPage);
    await fill();
    expect(await screen.findByText('Email sudah dipakai', { selector: 'span' })).toBeInTheDocument();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: 'Registrasi gagal' }));
  });

  it('menampilkan error kata sandi dan konfirmasi dari validasi klien pada pengiriman kedua', async () => {
    await renderWithProviders(RegisterPage);
    await fill({ name: 'Budi', email: 'b@c.d', password: '123', confirm: '999' });
    await fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(await screen.findByText('Kata sandi minimal 6 karakter')).toBeInTheDocument();
    expect(screen.getByText('Konfirmasi kata sandi tidak sama')).toBeInTheDocument();
  });

  it('menampilkan error nama dan kata sandi dari server', async () => {
    apiRequest.mockResolvedValue({
      status: 'fail',
      message: 'Data tidak valid',
      data: { name: ['Nama terlalu pendek'], password: ['Lemah'] },
    });
    await renderWithProviders(RegisterPage);
    await fill();
    expect(await screen.findByText('Nama terlalu pendek')).toBeInTheDocument();
    expect(screen.getByText('Lemah')).toBeInTheDocument();
  });

  it('menampilkan teks memproses saat registrasi berjalan', async () => {
    await renderWithProviders(RegisterPage, {
      initialState: { auth: { isAuthRegister: true, validation: {}, token: null } },
    });
    expect(screen.getByText('Memproses...')).toBeDisabled();
  });
});
