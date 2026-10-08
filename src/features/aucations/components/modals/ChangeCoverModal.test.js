import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/vue';
import ChangeCoverModal from './ChangeCoverModal.vue';

describe('ChangeCoverModal', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });

  it('menampilkan pratinjau setelah gambar valid dipilih', async () => {
    render(ChangeCoverModal, { props: { open: true } });
    const input = screen.getByLabelText('Pilih gambar');
    const file = new File(['x'], 'cover.jpg', { type: 'image/jpeg' });
    await fireEvent.update(input, '');
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    await fireEvent.change(input);
    expect(await screen.findByTestId('cover-preview')).toHaveAttribute('src', 'blob:preview');
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it('menolak berkas yang bukan gambar', async () => {
    render(ChangeCoverModal, { props: { open: true } });
    const input = screen.getByLabelText('Pilih gambar');
    Object.defineProperty(input, 'files', { value: [new File(['x'], 'a.pdf', { type: 'application/pdf' })], configurable: true });
    await fireEvent.change(input);
    expect(await screen.findByText('Berkas harus berupa gambar')).toBeInTheDocument();
    expect(screen.queryByTestId('cover-preview')).toBeNull();
  });

  it('mengosongkan pilihan saat tidak ada berkas', async () => {
    render(ChangeCoverModal, { props: { open: true } });
    const input = screen.getByLabelText('Pilih gambar');
    Object.defineProperty(input, 'files', { value: [], configurable: true });
    await fireEvent.change(input);
    expect(screen.queryByText('Berkas harus berupa gambar')).toBeNull();
  });

  it('meminta pilih gambar sebelum submit', async () => {
    const { emitted } = render(ChangeCoverModal, { props: { open: true } });
    await fireEvent.click(screen.getByText('Unggah Cover'));
    expect(await screen.findByText('Pilih gambar terlebih dahulu')).toBeInTheDocument();
    expect(emitted().submit).toBeUndefined();
  });

  it('mengirim file yang dipilih dan memakai teks loading', async () => {
    const { emitted, rerender } = render(ChangeCoverModal, { props: { open: true } });
    const input = screen.getByLabelText('Pilih gambar');
    const file = new File(['x'], 'cover.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    await fireEvent.change(input);
    await rerender({ open: true, loading: true });
    expect(screen.getByText('Mengunggah...')).toBeDisabled();
    await rerender({ open: true, loading: false });
    await fireEvent.click(screen.getByText('Unggah Cover'));
    expect(emitted().submit[0][0]).toBe(file);
  });

  it('membersihkan pilihan saat modal ditutup', async () => {
    const { rerender } = render(ChangeCoverModal, { props: { open: true } });
    const input = screen.getByLabelText('Pilih gambar');
    const file = new File(['x'], 'cover.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    await fireEvent.change(input);
    await rerender({ open: false });
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview'));
  });

  it('membersihkan pilihan saat ditutup tanpa pratinjau', async () => {
    const { rerender } = render(ChangeCoverModal, { props: { open: true } });
    await rerender({ open: false });
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    await rerender({ open: true });
    expect(screen.getByLabelText('Pilih gambar')).toBeInTheDocument();
  });

  it('mengirim close saat batal atau tombol X', async () => {
    const { emitted } = render(ChangeCoverModal, { props: { open: true } });
    await fireEvent.click(screen.getByText('Batal'));
    await fireEvent.click(screen.getByLabelText('Tutup'));
    expect(emitted().close).toHaveLength(2);
  });

  it('mengganti pratinjau saat memilih gambar kedua dan menolak berkas non-gambar setelahnya', async () => {
    render(ChangeCoverModal, { props: { open: true } });
    const input = screen.getByLabelText('Pilih gambar');
    Object.defineProperty(input, 'files', { value: [new File(['x'], 'a.png', { type: 'image/png' })], configurable: true });
    await fireEvent.change(input);
    expect(await screen.findByTestId('cover-preview')).toBeInTheDocument();

    Object.defineProperty(input, 'files', { value: [new File(['y'], 'b.jpg', { type: 'image/jpeg' })], configurable: true });
    await fireEvent.change(input);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');

    Object.defineProperty(input, 'files', { value: [new File(['z'], 'c.txt', { type: 'text/plain' })], configurable: true });
    await fireEvent.change(input);
    expect(await screen.findByText('Berkas harus berupa gambar')).toBeInTheDocument();
    expect(screen.queryByTestId('cover-preview')).toBeNull();
  });
});
