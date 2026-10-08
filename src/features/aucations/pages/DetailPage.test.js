import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/vue';
import Swal from 'sweetalert2';
import DetailPage from './DetailPage.vue';
import { renderWithProviders } from '@/test-utils';
import { apiRequest } from '@/helpers/apiHelper';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })) } }));
vi.mock('@/helpers/apiHelper', () => ({
  apiRequest: vi.fn(),
  getAccessToken: vi.fn(() => null),
  putAccessToken: vi.fn(),
}));
vi.mock('../components/MarkdownViewer.vue', () => ({
  default: { props: ['content'], template: '<div data-testid="viewer">{{ content }}</div>' },
}));
vi.mock('../components/modals/ChangeModal.vue', () => ({
  default: { props: ['open'], emits: ['submit', 'close'], template: '<div v-if="open" data-testid="change-modal"><button @click="$emit(\'submit\', { title: \'Baru\' })">kirim-ubah</button><button @click="$emit(\'close\')">tutup-ubah</button></div>' },
}));
vi.mock('../components/modals/ChangeCoverModal.vue', () => ({
  default: { props: ['open'], emits: ['submit', 'close'], template: '<div v-if="open" data-testid="cover-modal"><button @click="$emit(\'submit\', \'FILE-COVER\')">kirim-cover</button><button @click="$emit(\'close\')">tutup-cover</button></div>' },
}));
vi.mock('../components/modals/BidModal.vue', () => ({
  default: { props: ['open', 'highestBid', 'startBid'], emits: ['submit', 'close'], template: '<div v-if="open" data-testid="bid-modal"><button @click="$emit(\'submit\', 999999)">kirim-bid</button><button @click="$emit(\'close\')">tutup-bid</button></div>' },
}));

const owner = { id: 1, name: 'Budi' };
const aucation = (overrides = {}) => ({
  id: 10,
  user_id: 1,
  title: 'Jam Tangan',
  description: '**Asli**',
  cover: 'jam.png',
  start_bid: 200000,
  closed_at: '2099-01-01 10:00:00',
  author: { name: 'Budi' },
  bids: [{ id: 1, bid: 300000, created_at: '2026-10-01 10:00:00' }],
  my_bid: null,
  ...overrides,
});

function mockApi({ detail = aucation(), profile = owner, extra = {} } = {}) {
  apiRequest.mockImplementation(async (path, options = {}) => {
    const key = `${options.method ?? 'GET'} ${path}`;
    if (extra[key]) return extra[key];
    if (key === 'GET /aucations/10') return detail ? { status: 'success', data: { aucation: detail } } : { status: 'fail' };
    if (key === 'GET /users/me') return profile ? { status: 'success', data: { user: profile } } : { status: 'fail' };
    return { status: 'success', message: 'Berhasil' };
  });
}

async function renderPage(options) {
  return renderWithProviders(DetailPage, { route: '/aucations/10', routePattern: '/aucations/:aucationId', ...options });
}

describe('DetailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('menampilkan detail lelang dan riwayat penawaran', async () => {
    mockApi();
    await renderPage();
    expect((await screen.findAllByText('Jam Tangan'))[0]).toBeInTheDocument();
    expect(screen.getByTestId('viewer')).toHaveTextContent('**Asli**');
    expect(screen.getByTestId('bid-history')).toHaveTextContent('300.000');
    expect(screen.getByText('Oleh Budi')).toBeInTheDocument();
  });

  it('menampilkan status memuat saat detail sedang diambil', async () => {
    apiRequest.mockReturnValue(new Promise(() => {}));
    await renderPage();
    expect(screen.getByText('Memuat detail lelang...')).toBeInTheDocument();
  });

  it('menampilkan pesan tidak ditemukan bila detail gagal dimuat', async () => {
    mockApi({ detail: null });
    await renderPage();
    expect(await screen.findByText('Lelang tidak ditemukan.')).toBeInTheDocument();
  });

  it('menampilkan teks tanpa penawaran dan nama penulis default', async () => {
    mockApi({ detail: aucation({ bids: [], author: undefined, my_bid: null }) });
    await renderPage();
    expect(await screen.findByText('Belum ada penawaran.')).toBeInTheDocument();
    expect(screen.getByText('Oleh -')).toBeInTheDocument();
    expect(screen.getByText('Belum ada')).toBeInTheDocument();
  });

  it('menampilkan tombol kelola untuk pemilik dan memuat ulang setelah ubah data', async () => {
    mockApi();
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Ubah'));
    await fireEvent.click(await screen.findByText('kirim-ubah'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Lelang diperbarui' })));
    expect(apiRequest).toHaveBeenCalledWith('/aucations/10', expect.objectContaining({ method: 'PUT' }));
  });

  it('menutup modal ubah data saat close dikirim', async () => {
    mockApi();
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Ubah'));
    await fireEvent.click(await screen.findByText('tutup-ubah'));
    await waitFor(() => expect(screen.queryByTestId('change-modal')).toBeNull());
  });

  it('menampilkan dialog error bila ubah data gagal', async () => {
    mockApi({ extra: { 'PUT /aucations/10': { status: 'fail', message: 'Gagal ubah' } } });
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Ubah'));
    await fireEvent.click(await screen.findByText('kirim-ubah'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Gagal ubah' })));
  });

  it('mengunggah cover baru untuk pemilik', async () => {
    mockApi();
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Cover'));
    await fireEvent.click(await screen.findByText('kirim-cover'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cover diperbarui' })));
    expect(apiRequest).toHaveBeenCalledWith('/aucations/10/cover', expect.objectContaining({ method: 'POST', isForm: true }));
  });

  it('menampilkan dialog error bila unggah cover gagal', async () => {
    mockApi({ extra: { 'POST /aucations/10/cover': { status: 'fail', message: 'Berkas terlalu besar' } } });
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Cover'));
    await fireEvent.click(await screen.findByText('kirim-cover'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: 'Permintaan gagal' })));
  });

  it('menutup modal cover dan penawaran dari halaman detail', async () => {
    mockApi();
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Cover'));
    await fireEvent.click(await screen.findByText('tutup-cover'));
    await waitFor(() => expect(screen.queryByTestId('cover-modal')).toBeNull());
  });

  it('menutup modal penawaran dari halaman detail', async () => {
    mockApi({ profile: { id: 99, name: 'Sari' } });
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Ajukan Penawaran'));
    await fireEvent.click(await screen.findByText('tutup-bid'));
    await waitFor(() => expect(screen.queryByTestId('bid-modal')).toBeNull());
  });

  it('menampilkan riwayat kosong bila daftar bid tidak dikirim API', async () => {
    mockApi({ detail: aucation({ bids: undefined }) });
    await renderPage();
    expect(await screen.findByText('Belum ada penawaran.')).toBeInTheDocument();
  });

  it('mengabaikan data bid yang bukan objek', async () => {
    mockApi({ detail: aucation({ bids: [null, 5, { id: 2, bid: 400000, created_at: '2026-10-02 10:00:00' }] }) });
    await renderPage();
    const history = await screen.findByTestId('bid-history');
    expect(history.querySelectorAll('li')).toHaveLength(1);
    expect(history).toHaveTextContent('400.000');
  });

  it('menghapus lelang setelah konfirmasi lalu kembali ke beranda', async () => {
    mockApi();
    const { router } = await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Hapus'));
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'));
    expect(apiRequest).toHaveBeenCalledWith('/aucations/10', { method: 'DELETE' });
  });

  it('tidak menghapus bila konfirmasi dibatalkan', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    mockApi();
    const { router } = await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Hapus'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(apiRequest).not.toHaveBeenCalledWith('/aucations/10', { method: 'DELETE' });
    expect(router.currentRoute.value.path).toBe('/aucations/10');
  });

  it('menampilkan dialog error bila hapus lelang gagal', async () => {
    mockApi({ extra: { 'DELETE /aucations/10': { status: 'fail', message: 'Tidak bisa hapus' } } });
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Hapus'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Gagal menghapus' })));
  });

  it('peserta dapat mengajukan penawaran bila belum pernah menawar', async () => {
    mockApi({ profile: { id: 99, name: 'Sari' } });
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    expect(screen.queryByText('Ubah')).toBeNull();
    await fireEvent.click(screen.getByText('Ajukan Penawaran'));
    await fireEvent.click(await screen.findByText('kirim-bid'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Penawaran terkirim' })));
  });

  it('menampilkan dialog error bila penawaran gagal dikirim', async () => {
    mockApi({
      profile: { id: 99, name: 'Sari' },
      extra: { 'POST /aucations/10/bids': { status: 'fail', message: 'Penawaran terlalu rendah' } },
    });
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText('Ajukan Penawaran'));
    await fireEvent.click(await screen.findByText('kirim-bid'));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Penawaran terlalu rendah' })));
  });

  it('peserta yang sudah menawar dapat membatalkan penawaran setelah konfirmasi', async () => {
    mockApi({ profile: { id: 99, name: 'Sari' }, detail: aucation({ my_bid: { id: 5, bid: 400000 } }) });
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText(/Batalkan Penawaran Saya/));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Penawaran dibatalkan' })));
    expect(apiRequest).toHaveBeenCalledWith('/aucations/10/bids', { method: 'DELETE' });
  });

  it('tidak membatalkan penawaran bila konfirmasi ditolak', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    mockApi({ profile: { id: 99, name: 'Sari' }, detail: aucation({ my_bid: { id: 5, bid: 400000 } }) });
    await renderPage();
    await screen.findAllByText('Jam Tangan');
    await fireEvent.click(screen.getByText(/Batalkan Penawaran Saya/));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(apiRequest).not.toHaveBeenCalledWith('/aucations/10/bids', { method: 'DELETE' });
  });

  it('memuat ulang detail ketika parameter rute berubah', async () => {
    mockApi();
    const { router } = await renderPage();
    await screen.findAllByText('Jam Tangan');
    const before = apiRequest.mock.calls.length;
    await router.push('/aucations/11');
    await waitFor(() => expect(apiRequest.mock.calls.length).toBeGreaterThan(before));
  });
});
