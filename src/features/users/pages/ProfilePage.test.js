import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/vue';
import Swal from 'sweetalert2';
import ProfilePage from './ProfilePage.vue';
import { renderWithProviders } from '@/test-utils';
import { apiRequest } from '@/helpers/apiHelper';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })) } }));
vi.mock('@/helpers/apiHelper', () => ({
  apiRequest: vi.fn(),
  getAccessToken: vi.fn(() => null),
  putAccessToken: vi.fn(),
}));

const profile = { id: 1, name: 'Budi', email: 'b@c.d', photo: 'p.png' };

function mockApi(extra = {}) {
  apiRequest.mockImplementation(async (path, options = {}) => {
    const key = `${options.method ?? 'GET'} ${path}`;
    if (extra[key]) return extra[key];
    if (key === 'GET /users/me') return { status: 'success', data: { user: profile } };
    return { status: 'success', message: 'Berhasil', data: { user: { ...profile, name: 'Baru' } } };
  });
}

describe('ProfilePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mengisi form dari profil dan menampilkan foto', async () => {
    mockApi();
    await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    expect(screen.getByLabelText('Nama')).toHaveValue('Budi');
    expect(screen.getByLabelText('Email')).toHaveValue('b@c.d');
    expect(screen.getByAltText('Foto profil')).toHaveAttribute('src', 'p.png');
    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith('/users/me'));
  });

  it('menampilkan strip kosong saat profil belum dimuat', async () => {
    mockApi({ 'GET /users/me': { status: 'fail' } });
    await renderWithProviders(ProfilePage);
    expect(screen.getByLabelText('Nama')).toHaveValue('');
    expect(screen.getByText('Zona Berbahaya')).toBeInTheDocument();
  });

  it('memperbarui nilai email dari input', async () => {
    mockApi();
    await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    await fireEvent.update(screen.getByLabelText('Email'), 'baru@c.d');
    expect(screen.getByLabelText('Email')).toHaveValue('baru@c.d');
  });

  it('menyimpan profil dan menampilkan dialog sukses', async () => {
    mockApi();
    await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    await fireEvent.update(screen.getByLabelText('Nama'), 'Baru');
    await fireEvent.click(screen.getByText('Simpan Profil'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Profil diperbarui' })));
    expect(apiRequest).toHaveBeenCalledWith('/users/me', { method: 'PUT', body: { name: 'Baru', email: 'b@c.d' } });
  });

  it('menampilkan dialog error dan validasi email bila simpan profil gagal', async () => {
    mockApi({
      'PUT /users/me': { status: 'fail', message: 'Email dipakai', data: { email: ['Email dipakai akun lain'] } },
    });
    await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    await fireEvent.click(screen.getByText('Simpan Profil'));
    expect(await screen.findByText('Email dipakai akun lain')).toBeInTheDocument();
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: 'Gagal memperbarui profil' })));
  });

  it('meminta pilih foto sebelum unggah', async () => {
    mockApi();
    await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    await fireEvent.click(screen.getByText('Unggah Foto'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Pilih foto' })));
    expect(apiRequest).not.toHaveBeenCalledWith('/users/me/photo', expect.anything());
  });

  it('mengunggah foto yang dipilih lalu mereset pilihan', async () => {
    mockApi();
    const { container } = await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    const input = container.querySelector('input[name="photo"]');
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    await fireEvent.change(input);
    await fireEvent.click(screen.getByText('Unggah Foto'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Foto diperbarui' })));
    expect(apiRequest).toHaveBeenCalledWith('/users/me/photo', expect.objectContaining({ method: 'POST', isForm: true }));
  });

  it('menampilkan dialog error bila unggah foto gagal', async () => {
    mockApi({ 'POST /users/me/photo': { status: 'fail', message: 'Format tidak didukung' } });
    const { container } = await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    const input = container.querySelector('input[name="photo"]');
    Object.defineProperty(input, 'files', { value: [new File(['x'], 'a.gif', { type: 'image/gif' })], configurable: true });
    await fireEvent.change(input);
    await fireEvent.click(screen.getByText('Unggah Foto'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Format tidak didukung' })));
  });

  it('mengosongkan pilihan foto bila berkas dibatalkan', async () => {
    mockApi();
    const { container } = await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    const input = container.querySelector('input[name="photo"]');
    Object.defineProperty(input, 'files', { value: [], configurable: true });
    await fireEvent.change(input);
    await fireEvent.click(screen.getByText('Unggah Foto'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Pilih foto' })));
  });

  it('memvalidasi kata sandi baru dan konfirmasinya', async () => {
    mockApi();
    await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    await fireEvent.click(screen.getByText('Ubah Kata Sandi'));
    expect(await screen.findByText('Kata sandi lama wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi baru minimal 6 karakter')).toBeInTheDocument();

    await fireEvent.update(screen.getByLabelText(/Kata sandi lama/), 'lama');
    await fireEvent.update(screen.getByLabelText(/^Kata sandi baru/), '123456');
    await fireEvent.update(screen.getByLabelText(/Ulangi kata sandi baru/), '999999');
    await fireEvent.click(screen.getByText('Ubah Kata Sandi'));
    expect(await screen.findByText('Konfirmasi tidak sama')).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalledWith('/users/password', expect.anything());
  });

  it('mengganti kata sandi dan menampilkan dialog sukses', async () => {
    mockApi();
    await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    await fireEvent.update(screen.getByLabelText(/Kata sandi lama/), 'lama');
    await fireEvent.update(screen.getByLabelText(/^Kata sandi baru/), '123456');
    await fireEvent.update(screen.getByLabelText(/Ulangi kata sandi baru/), '123456');
    await fireEvent.click(screen.getByText('Ubah Kata Sandi'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Kata sandi diubah' })));
    expect(apiRequest).toHaveBeenCalledWith('/users/password', expect.objectContaining({ method: 'PUT' }));
  });

  it('menampilkan validasi server saat kata sandi lama salah', async () => {
    mockApi({ 'PUT /users/password': { status: 'fail', message: 'Gagal', data: { password: ['Kata sandi lama salah'] } } });
    await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    await fireEvent.update(screen.getByLabelText(/Kata sandi lama/), 'x');
    await fireEvent.update(screen.getByLabelText('Kata sandi baru'), '123456');
    await fireEvent.update(screen.getByLabelText('Ulangi kata sandi baru'), '123456');
    await fireEvent.click(screen.getByText('Ubah Kata Sandi'));
    expect(await screen.findByText('Kata sandi lama salah')).toBeInTheDocument();
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: 'Gagal mengubah kata sandi' })));
  });

  it('menghapus semua lelang setelah konfirmasi', async () => {
    mockApi({ 'DELETE /aucations': { status: 'success', message: 'Semua dihapus' } });
    await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    await fireEvent.click(screen.getByTestId('delete-all-button'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Lelang dihapus' })));
    expect(apiRequest).toHaveBeenCalledWith('/aucations', { method: 'DELETE' });
  });

  it('menampilkan dialog error bila hapus semua lelang gagal dan tidak melakukan apa-apa saat dibatalkan', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    mockApi();
    await renderWithProviders(ProfilePage, { initialState: { auth: { token: 'T' }, users: { profile } } });
    await fireEvent.click(screen.getByTestId('delete-all-button'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(apiRequest).not.toHaveBeenCalledWith('/aucations', { method: 'DELETE' });

    mockApi({ 'DELETE /aucations': { status: 'fail', message: 'Gagal hapus' } });
    await fireEvent.click(screen.getByTestId('delete-all-button'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Gagal menghapus' })));
  });
});
