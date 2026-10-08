import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/vue';
import BidModal from './BidModal.vue';

describe('BidModal', () => {
  it('menggunakan harga awal sebagai minimal bila belum ada tawaran', () => {
    render(BidModal, { props: { open: true, startBid: 100000, highestBid: null } });
    expect(screen.getByText('Rp 100.000', { exact: false })).toBeInTheDocument();
  });

  it('menggunakan tawaran tertinggi + 1 sebagai minimal', () => {
    render(BidModal, { props: { open: true, startBid: 100000, highestBid: 250000 } });
    expect(screen.getByText('Rp 250.001', { exact: false })).toBeInTheDocument();
  });

  it('menolak nominal tidak valid', async () => {
    const { emitted } = render(BidModal, { props: { open: true, startBid: 100000 } });
    await fireEvent.update(screen.getByLabelText('Nominal penawaran (Rp)'), '0');
    await fireEvent.click(screen.getByText('Kirim Penawaran'));
    expect(await screen.findByText('Masukkan nominal penawaran yang valid')).toBeInTheDocument();
    expect(emitted().submit).toBeUndefined();
  });

  it('menolak nominal di bawah minimal', async () => {
    const { emitted, container } = render(BidModal, { props: { open: true, startBid: 100000, highestBid: 200000 } });
    await fireEvent.update(screen.getByLabelText('Nominal penawaran (Rp)'), '150000');
    await fireEvent.click(screen.getByText('Kirim Penawaran'));
    await waitFor(() => expect(container.querySelector('.text-red-700').textContent).toContain('200.001'));
    expect(emitted().submit).toBeUndefined();
  });

  it('mengirim nominal yang valid sebagai angka', async () => {
    const { emitted } = render(BidModal, { props: { open: true, startBid: 100000, highestBid: null } });
    await fireEvent.update(screen.getByLabelText('Nominal penawaran (Rp)'), '120000');
    await fireEvent.click(screen.getByText('Kirim Penawaran'));
    await waitFor(() => expect(emitted().submit).toBeDefined());
    expect(emitted().submit[0]).toEqual([120000]);
  });

  it('menampilkan status loading dan mengirim close', async () => {
    const { emitted } = render(BidModal, { props: { open: true, startBid: 1, loading: true } });
    expect(screen.getByText('Mengirim...')).toBeDisabled();
    await fireEvent.click(screen.getByText('Batal'));
    expect(emitted().close).toHaveLength(1);
  });

  it('menutup modal lewat tombol X', async () => {
    const { emitted } = render(BidModal, { props: { open: true, startBid: 1 } });
    await fireEvent.click(screen.getByLabelText('Tutup'));
    expect(emitted().close).toHaveLength(1);
  });

  it('menolak input kosong dan memvalidasi ulang setelah error', async () => {
    render(BidModal, { props: { open: true, startBid: 100 } });
    await fireEvent.click(screen.getByText('Kirim Penawaran'));
    expect(await screen.findByText('Masukkan nominal penawaran yang valid')).toBeInTheDocument();
    await fireEvent.update(screen.getByLabelText(/Nominal penawaran/), '50');
    await fireEvent.click(screen.getByText('Kirim Penawaran'));
    await waitFor(() => expect(screen.getByText(/Penawaran minimal/, { selector: 'span' })).toBeInTheDocument());
  });

  it('menghapus input dan pesan error saat ditutup', async () => {
    const { rerender } = render(BidModal, { props: { open: true, startBid: 100 } });
    await fireEvent.click(screen.getByText('Kirim Penawaran'));
    await screen.findByText('Masukkan nominal penawaran yang valid');
    await rerender({ open: false, startBid: 100 });
    await rerender({ open: true, startBid: 100 });
    await waitFor(() => expect(screen.queryByText('Masukkan nominal penawaran yang valid')).toBeNull());
  });
});
