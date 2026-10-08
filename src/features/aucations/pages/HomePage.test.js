import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/vue';
import Swal from 'sweetalert2';
import HomePage from './HomePage.vue';
import { renderWithProviders } from '@/test-utils';
import { apiRequest } from '@/helpers/apiHelper';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })) } }));
vi.mock('../components/MarkdownEditor.vue', () => ({
  default: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<textarea data-testid="desc-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
}));
vi.mock('@/helpers/apiHelper', () => ({
  apiRequest: vi.fn(),
  getAccessToken: vi.fn(() => null),
  putAccessToken: vi.fn(),
}));

const AUTH = { auth: { token: 'T' } };

const future = '2099-01-01 10:00:00';
const list = [
  { id: 1, title: 'Laptop Gaming', description: 'Mesin kencang', start_bid: 1000000, closed_at: future, cover: 'a.png', bids: [] },
  {
    id: 2,
    title: 'Sepeda Lipat',
    description: 'Ringan dan kuat',
    start_bid: 500000,
    closed_at: future,
    cover: 'b.png',
    bids: [{ id: 9, bid: 750000 }],
  },
];

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiRequest.mockResolvedValue({ status: 'success', data: { aucations: list } });
  });

  it('memuat dan menampilkan daftar lelang saat dibuka', async () => {
    await renderWithProviders(HomePage, { initialState: AUTH });
    expect(await screen.findByText('Laptop Gaming')).toBeInTheDocument();
    expect(screen.getByText('Sepeda Lipat')).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith('/aucations', { query: { is_me: undefined, is_closed: undefined } });
  });

  it('menampilkan tawaran tertinggi bila tersedia dan jumlah penawaran bila hanya ID', async () => {
    await renderWithProviders(HomePage, { initialState: AUTH });
    await screen.findByText('Sepeda Lipat');
    expect(screen.getByText('0 penawaran')).toBeInTheDocument();
    expect(screen.getByText(/750.000/)).toBeInTheDocument();
  });

  it('menyaring lelang berdasarkan judul dan deskripsi', async () => {
    await renderWithProviders(HomePage, { initialState: AUTH });
    await screen.findByText('Laptop Gaming');
    const search = screen.getByPlaceholderText('Cari judul atau deskripsi...');
    await fireEvent.update(search, 'ringan');
    expect(screen.queryByText('Laptop Gaming')).toBeNull();
    expect(screen.getByText('Sepeda Lipat')).toBeInTheDocument();
    await fireEvent.update(search, 'laptop');
    expect(screen.getByText('Laptop Gaming')).toBeInTheDocument();
  });

  it('menampilkan pesan bila tidak ada lelang yang cocok', async () => {
    await renderWithProviders(HomePage, { initialState: AUTH });
    await screen.findByText('Laptop Gaming');
    await fireEvent.update(screen.getByPlaceholderText('Cari judul atau deskripsi...'), 'xyz tidak ada');
    expect(screen.getByText('Belum ada lelang yang sesuai.')).toBeInTheDocument();
  });

  it('menampilkan status memuat saat data sedang diambil', async () => {
    await renderWithProviders(HomePage, { initialState: AUTH }, { initialState: { aucations: { aucations: [], isAucation: true } } });
    expect(screen.getByText('Memuat lelang...')).toBeInTheDocument();
  });

  it('memfilter berdasarkan tab dan menulis ke query route', async () => {
    const { router } = await renderWithProviders(HomePage, { initialState: AUTH });
    await screen.findByText('Laptop Gaming');

    await fireEvent.click(screen.getByTestId('tab-mine'));
    await waitFor(() => expect(router.currentRoute.value.query.tab).toBe('mine'));
    await waitFor(() => expect(apiRequest).toHaveBeenLastCalledWith('/aucations', { query: { is_me: 1, is_closed: undefined } }));

    await fireEvent.click(screen.getByTestId('tab-closed'));
    await waitFor(() => expect(apiRequest).toHaveBeenLastCalledWith('/aucations', { query: { is_me: undefined, is_closed: 1 } }));

    await fireEvent.click(screen.getByTestId('tab-open'));
    await waitFor(() => expect(apiRequest).toHaveBeenLastCalledWith('/aucations', { query: { is_me: undefined, is_closed: 0 } }));

    await fireEvent.click(screen.getByTestId('tab-all'));
    await waitFor(() => expect(router.currentRoute.value.query.tab).toBeUndefined());
  });

  it('memakai tab semua bila query tab tidak dikenal', async () => {
    await renderWithProviders(HomePage, { initialState: AUTH }, { route: '/?tab=aneh' });
    await screen.findByText('Laptop Gaming');
    expect(screen.getByTestId('tab-all')).toHaveClass('bg-brand-600');
  });

  it('menampilkan pesan kosong saat API tidak mengembalikan data', async () => {
    apiRequest.mockResolvedValue({ status: 'fail' });
    await renderWithProviders(HomePage, { initialState: AUTH });
    expect(await screen.findByText('Belum ada lelang yang sesuai.')).toBeInTheDocument();
  });

  it('menambah lelang baru dan memuat ulang daftar saat sukses', async () => {
    await renderWithProviders(HomePage, { initialState: AUTH });
    await screen.findByText('Laptop Gaming');
    apiRequest.mockImplementation(async (path, options = {}) => {
      if (options.method === 'POST') return { status: 'success', message: 'Dibuat' };
      return { status: 'success', data: { aucations: list } };
    });

    await fireEvent.click(screen.getByText('Tambah Lelang'));
    await fireEvent.update(screen.getByLabelText('Judul barang'), 'Kamera');
    await fireEvent.update(screen.getByTestId('desc-input'), 'Deskripsi kamera');
    await fireEvent.update(screen.getByLabelText('Harga awal (Rp)'), '300000');
    await fireEvent.update(screen.getByLabelText('Ditutup pada'), '2099-02-01T09:00');
    await fireEvent.click(screen.getByText('Simpan Lelang'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Lelang dibuat' })));
    expect(apiRequest).toHaveBeenCalledWith('/aucations', expect.objectContaining({ method: 'POST' }));
  });

  it('menutup modal tambah lelang dan menampilkan jumlah penawaran nol bila bids tidak ada', async () => {
    apiRequest.mockResolvedValue({ status: 'success', data: { aucations: [{ id: 9, title: 'Tanpa Bid', description: '', start_bid: 1, closed_at: future, cover: '' }] } });
    await renderWithProviders(HomePage, { initialState: AUTH });
    expect(await screen.findByText('Tanpa Bid')).toBeInTheDocument();
    expect(screen.getByText('0 penawaran')).toBeInTheDocument();
    await fireEvent.click(screen.getByText('Tambah Lelang'));
    await fireEvent.click(screen.getByLabelText('Tutup'));
    await waitFor(() => expect(screen.queryByLabelText('Judul barang')).toBeNull());
  });

  it('menampilkan dialog error bila gagal menambah lelang', async () => {
    await renderWithProviders(HomePage, { initialState: AUTH });
    await screen.findByText('Laptop Gaming');
    apiRequest.mockImplementation(async (path, options = {}) => {
      if (options.method === 'POST') return { status: 'fail', message: 'Gagal simpan' };
      return { status: 'success', data: { aucations: list } };
    });

    await fireEvent.click(screen.getByText('Tambah Lelang'));
    await fireEvent.update(screen.getByLabelText('Judul barang'), 'Kamera');
    await fireEvent.update(screen.getByTestId('desc-input'), 'Deskripsi kamera');
    await fireEvent.update(screen.getByLabelText('Harga awal (Rp)'), '300000');
    await fireEvent.update(screen.getByLabelText('Ditutup pada'), '2099-02-01T09:00');
    await fireEvent.click(screen.getByText('Simpan Lelang'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Gagal membuat lelang' })));
  });
});
