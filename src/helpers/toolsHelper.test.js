import { describe, it, expect, vi, beforeEach } from 'vitest';
import Swal from 'sweetalert2';
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
  toApiDateTime,
  toInputDateTime,
  getRemainingLabel,
  getHighestBid,
} from './toolsHelper';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));

describe('dialog helpers', () => {
  beforeEach(() => {
    Swal.fire.mockReset();
  });

  it('showSuccessDialog memanggil Swal dengan ikon success', () => {
    Swal.fire.mockResolvedValue({});
    showSuccessDialog('Berhasil', 'Teks');
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', title: 'Berhasil', text: 'Teks' }));
  });

  it('showErrorDialog memanggil Swal dengan ikon error dan teks default', () => {
    Swal.fire.mockResolvedValue({});
    showErrorDialog('Gagal');
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: 'Gagal', text: '' }));
  });

  it('showConfirmDialog mengembalikan true bila dikonfirmasi', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await expect(showConfirmDialog('Yakin?', 'Teks')).resolves.toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ showCancelButton: true, icon: 'warning' }));
  });

  it('showConfirmDialog mengembalikan false bila dibatalkan', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    await expect(showConfirmDialog('Yakin?')).resolves.toBe(false);
  });
});

describe('formatRupiah', () => {
  it('memformat angka ke rupiah tanpa desimal', () => {
    const text = formatRupiah(1500000);
    expect(text).toContain('1.500.000');
    expect(text).toContain('Rp');
  });

  it('mengembalikan Rp 0 untuk nilai bukan angka', () => {
    expect(formatRupiah('abc')).toBe('Rp 0');
  });
});

describe('formatDate', () => {
  it('memformat tanggal dengan spasi sebagai pemisah', () => {
    expect(formatDate('2026-10-10 12:30:00')).toContain('2026');
  });

  it('memformat tanggal ISO', () => {
    expect(formatDate('2026-10-10T12:30:00Z')).toContain('2026');
  });

  it('mengembalikan - untuk nilai kosong atau tidak valid', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate('bukan tanggal')).toBe('-');
  });
});

describe('toApiDateTime', () => {
  it('mengubah nilai datetime-local ke format API', () => {
    expect(toApiDateTime('2026-10-10T12:30')).toBe('2026-10-10 12:30:00');
  });

  it('mempertahankan detik bila sudah ada', () => {
    expect(toApiDateTime('2026-10-10T12:30:15')).toBe('2026-10-10 12:30:15');
  });

  it('mengisi jam default bila waktu tidak ada', () => {
    expect(toApiDateTime('2026-10-10')).toBe('2026-10-10 00:00:00');
  });

  it('mengembalikan string kosong untuk nilai kosong', () => {
    expect(toApiDateTime('')).toBe('');
  });
});

describe('toInputDateTime', () => {
  it('mengubah format API ke nilai datetime-local', () => {
    expect(toInputDateTime('2026-10-10 12:30:00')).toBe('2026-10-10T12:30');
  });

  it('mengembalikan string kosong untuk nilai kosong', () => {
    expect(toInputDateTime(null)).toBe('');
  });
});

describe('getRemainingLabel', () => {
  const now = new Date('2026-10-08T10:00:00').getTime();

  it('menampilkan jam dan menit bila kurang dari sehari', () => {
    expect(getRemainingLabel('2026-10-08 12:15:00', now)).toBe('2 jam 15 menit lagi');
  });

  it('menampilkan jumlah hari bila lebih dari sehari', () => {
    expect(getRemainingLabel('2026-10-10 10:00:00', now)).toBe('2 hari lagi');
  });

  it('menampilkan Ditutup bila waktu sudah lewat', () => {
    expect(getRemainingLabel('2026-10-01 10:00:00', now)).toBe('Ditutup');
  });

  it('menampilkan - bila tanggal tidak valid', () => {
    expect(getRemainingLabel('', now)).toBe('-');
  });
});

describe('getHighestBid', () => {
  it('mengembalikan null untuk data bukan array atau kosong', () => {
    expect(getHighestBid(undefined)).toBeNull();
    expect(getHighestBid([])).toBeNull();
  });

  it('mengembalikan null bila daftar hanya berisi ID bid', () => {
    expect(getHighestBid([1, 2, 3])).toBeNull();
  });

  it('mengembalikan tawaran tertinggi dari objek bid', () => {
    expect(getHighestBid([null, { id: 1, bid: 1000 }, { id: 2, bid: '2500' }, { id: 3 }])).toBe(2500);
  });
});
