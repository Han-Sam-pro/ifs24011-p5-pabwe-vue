import { describe, it, expect, vi, beforeAll } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/vue';
import AddModal from './AddModal.vue';

vi.mock('../MarkdownEditor.vue', () => ({
  default: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<textarea data-testid="desc-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
}));

async function fillForm({ title = 'Laptop', description = 'Deskripsi', startBid = '100000', closedAt = '2026-12-01T10:00' } = {}) {
  await fireEvent.update(screen.getByLabelText('Judul barang'), title);
  await fireEvent.update(screen.getByLabelText('Harga awal (Rp)'), startBid);
  await fireEvent.update(screen.getByLabelText('Ditutup pada'), closedAt);
  return { description };
}

describe('AddModal', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('menampilkan error validasi saat form kosong', async () => {
    const { emitted } = render(AddModal, { props: { open: true } });
    await fireEvent.click(screen.getByText('Simpan Lelang'));
    expect(await screen.findByText('Judul wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Harga awal harus lebih dari 0')).toBeInTheDocument();
    expect(screen.getByText('Batas waktu wajib diisi')).toBeInTheDocument();
    expect(emitted().submit).toBeUndefined();
  });

  it('mengirim payload dengan format API saat valid', async () => {
    const { emitted } = render(AddModal, { props: { open: true } });
    await fillForm({ title: '  Laptop  ', startBid: '250000', closedAt: '2026-12-01T10:30' });
    await fireEvent.update(screen.getByTestId('desc-input'), 'Deskripsi lengkap');
    await fireEvent.click(screen.getByText('Simpan Lelang'));
    await waitFor(() => expect(emitted().submit).toBeDefined());
    expect(emitted().submit[0][0]).toEqual({
      title: 'Laptop',
      description: 'Deskripsi lengkap',
      startBid: 250000,
      closedAt: '2026-12-01 10:30:00',
    });
  });

  it('menutup modal lewat tombol X', async () => {
    const { emitted } = render(AddModal, { props: { open: true } });
    await fireEvent.click(screen.getByLabelText('Tutup'));
    expect(emitted().close).toHaveLength(1);
  });

  it('memvalidasi ulang dengan error sebelumnya dan menolak harga nol', async () => {
    render(AddModal, { props: { open: true } });
    await fireEvent.update(screen.getByLabelText(/Harga awal/), '0');
    await fireEvent.click(screen.getByText('Simpan Lelang'));
    expect(await screen.findByText('Harga awal harus lebih dari 0')).toBeInTheDocument();
    await fireEvent.update(screen.getByLabelText(/Harga awal/), '5');
    await fireEvent.click(screen.getByText('Simpan Lelang'));
    await waitFor(() => expect(screen.queryByText('Harga awal harus lebih dari 0')).toBeNull());
  });

  it('menampilkan pesan validasi dari server', () => {
    render(AddModal, {
      props: { open: true, validation: { title: ['Judul sudah ada'], start_bid: ['Harus angka'], closed_at: ['Tanggal lampau'] } },
    });
    expect(screen.getByText('Judul sudah ada')).toBeInTheDocument();
    expect(screen.getByText('Harus angka')).toBeInTheDocument();
    expect(screen.getByText('Tanggal lampau')).toBeInTheDocument();
  });

  it('menampilkan teks tombol saat loading dan mengirim close saat batal', async () => {
    const { emitted } = render(AddModal, { props: { open: true, loading: true } });
    expect(screen.getByText('Menyimpan...')).toBeDisabled();
    await fireEvent.click(screen.getByText('Batal'));
    expect(emitted().close).toHaveLength(1);
  });

  it('mengosongkan form saat modal ditutup', async () => {
    const { rerender } = render(AddModal, { props: { open: true } });
    await fireEvent.click(screen.getByText('Simpan Lelang'));
    expect(await screen.findByText('Judul wajib diisi')).toBeInTheDocument();
    await rerender({ open: false });
    await rerender({ open: true });
    await waitFor(() => expect(screen.queryByText('Judul wajib diisi')).toBeNull());
  });
});
