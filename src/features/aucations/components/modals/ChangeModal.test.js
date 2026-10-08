import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/vue';
import ChangeModal from './ChangeModal.vue';

vi.mock('../lazy', () => ({
  MarkdownEditor: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<textarea data-testid="desc-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
}));

const aucation = {
  title: 'Kamera',
  description: 'Kamera bekas',
  start_bid: 500000,
  closed_at: '2026-12-01 10:30:00',
};

describe('ChangeModal', () => {
  it('mengisi form dari data lelang saat dibuka', async () => {
    render(ChangeModal, { props: { open: true, aucation } });
    await waitFor(() => expect(screen.getByLabelText('Judul barang')).toHaveValue('Kamera'));
    expect(screen.getByLabelText('Harga awal (Rp)')).toHaveValue(500000);
    expect(screen.getByLabelText('Ditutup pada')).toHaveValue('2026-12-01T10:30');
  });

  it('mengisi form kosong bila data lelang tidak ada', async () => {
    render(ChangeModal, { props: { open: true, aucation: null } });
    await waitFor(() => expect(screen.getByLabelText('Judul barang')).toHaveValue(''));
  });

  it('mengirim payload dengan format API', async () => {
    const { emitted } = render(ChangeModal, { props: { open: true, aucation } });
    await fireEvent.update(screen.getByLabelText('Judul barang'), ' Kamera DSLR ');
    await fireEvent.click(screen.getByText('Simpan Perubahan'));
    await waitFor(() => expect(emitted().submit).toBeDefined());
    expect(emitted().submit[0][0]).toEqual({
      title: 'Kamera DSLR',
      description: 'Kamera bekas',
      startBid: 500000,
      closedAt: '2026-12-01 10:30:00',
    });
  });

  it('menampilkan error validasi bila judul kosong dan tidak mengirim', async () => {
    const { emitted } = render(ChangeModal, { props: { open: true, aucation: { ...aucation, title: '' } } });
    await fireEvent.click(screen.getByText('Simpan Perubahan'));
    expect(await screen.findByText('Judul wajib diisi')).toBeInTheDocument();
    expect(emitted().submit).toBeUndefined();
  });

  it('menampilkan validasi harga dan waktu', async () => {
    render(ChangeModal, { props: { open: true, aucation: { ...aucation, start_bid: 0, closed_at: '' } } });
    await fireEvent.click(screen.getByText('Simpan Perubahan'));
    expect(await screen.findByText('Harga awal harus lebih dari 0')).toBeInTheDocument();
    expect(screen.getByText('Batas waktu wajib diisi')).toBeInTheDocument();
  });

  it('menampilkan validasi server dan status loading', () => {
    render(ChangeModal, {
      props: { open: true, aucation, loading: true, validation: { title: ['Terlalu panjang'], start_bid: ['x'], closed_at: ['y'] } },
    });
    expect(screen.getByText('Terlalu panjang')).toBeInTheDocument();
    expect(screen.getByText('Menyimpan...')).toBeDisabled();
  });

  it('mengirim close saat batal atau tombol X', async () => {
    const { emitted } = render(ChangeModal, { props: { open: true, aucation } });
    await fireEvent.click(screen.getByText('Batal'));
    await fireEvent.click(screen.getByLabelText('Tutup'));
    expect(emitted().close).toHaveLength(2);
  });

  it('memperbarui harga, waktu, dan deskripsi dari input', async () => {
    const { emitted } = render(ChangeModal, { props: { open: true, aucation } });
    await fireEvent.update(screen.getByLabelText('Harga awal (Rp)'), '750000');
    await fireEvent.update(screen.getByLabelText('Ditutup pada'), '2027-03-03T08:15');
    await fireEvent.update(screen.getByTestId('desc-input'), 'Deskripsi baru');
    await fireEvent.click(screen.getByText('Simpan Perubahan'));
    await waitFor(() => expect(emitted().submit).toBeDefined());
    expect(emitted().submit[0][0]).toEqual({
      title: 'Kamera',
      description: 'Deskripsi baru',
      startBid: 750000,
      closedAt: '2027-03-03 08:15:00',
    });
  });

  it('menampilkan validasi server untuk harga dan waktu tanpa error klien', async () => {
    render(ChangeModal, {
      props: { open: true, aucation, validation: { start_bid: ['Harga terlalu rendah'], closed_at: ['Waktu lampau'] } },
    });
    expect(screen.getByText('Harga terlalu rendah')).toBeInTheDocument();
    expect(screen.getByText('Waktu lampau')).toBeInTheDocument();
  });

  it('memvalidasi ulang dengan error sebelumnya dan menolak batas waktu kosong', async () => {
    render(ChangeModal, { props: { open: true, aucation: { ...aucation, title: '' } } });
    await fireEvent.click(screen.getByText('Simpan Perubahan'));
    expect(await screen.findByText('Judul wajib diisi')).toBeInTheDocument();
    await fireEvent.update(screen.getByLabelText('Ditutup pada'), '');
    await fireEvent.click(screen.getByText('Simpan Perubahan'));
    expect(await screen.findByText('Batas waktu wajib diisi')).toBeInTheDocument();
  });

  it('menampilkan validasi batas waktu dari klien bila kosong', async () => {
    render(ChangeModal, { props: { open: true, aucation: { ...aucation, closed_at: '' } } });
    await fireEvent.click(screen.getByText('Simpan Perubahan'));
    expect(await screen.findByText('Batas waktu wajib diisi')).toBeInTheDocument();
  });

  it('tidak mengisi ulang form saat modal tertutup', async () => {
    const { rerender } = render(ChangeModal, { props: { open: false, aucation } });
    await rerender({ open: false, aucation: { ...aucation, title: 'Lain' } });
    expect(screen.queryByLabelText('Judul barang')).toBeNull();
  });
});
