import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAucationsStore } from './aucationsStore';
import * as api from '../api/aucationApi';

vi.mock('../api/aucationApi', () => ({
  getAucationsApi: vi.fn(),
  getAucationDetailApi: vi.fn(),
  addAucationApi: vi.fn(),
  updateAucationApi: vi.fn(),
  changeCoverApi: vi.fn(),
  deleteAucationApi: vi.fn(),
  addBidApi: vi.fn(),
  deleteBidApi: vi.fn(),
  deleteAllAucationsApi: vi.fn(),
}));

const ok = (data = {}) => ({ status: 'success', message: 'Berhasil', data });

describe('aucationsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchAucations memuat daftar dengan filter', async () => {
    api.getAucationsApi.mockResolvedValue(ok({ aucations: [{ id: 1 }] }));
    const store = useAucationsStore();
    await expect(store.fetchAucations({ isMe: true })).resolves.toBe(true);
    expect(api.getAucationsApi).toHaveBeenCalledWith({ isMe: true });
    expect(store.aucations).toEqual([{ id: 1 }]);
    expect(store.isAucation).toBe(false);
  });

  it('fetchAucations dan fetchAucation memakai nilai kosong bila respons sukses tanpa data', async () => {
    const store = useAucationsStore();
    api.getAucationsApi.mockResolvedValueOnce({ status: 'success' });
    await store.fetchAucations();
    expect(store.aucations).toEqual([]);
    api.getAucationDetailApi.mockResolvedValueOnce({ status: 'success' });
    await store.fetchAucation(1);
    expect(store.aucation).toBeNull();
  });

  it('fetchAucations memakai filter kosong secara default dan menangani gagal/error', async () => {
    const store = useAucationsStore();
    api.getAucationsApi.mockResolvedValueOnce({ status: 'fail' });
    await expect(store.fetchAucations()).resolves.toBe(false);
    expect(api.getAucationsApi).toHaveBeenCalledWith({});
    expect(store.aucations).toEqual([]);

    api.getAucationsApi.mockRejectedValueOnce(new Error('x'));
    await expect(store.fetchAucations()).resolves.toBe(false);
    expect(store.aucations).toEqual([]);
  });

  it('fetchAucation memuat detail dan menangani gagal/error', async () => {
    const store = useAucationsStore();
    api.getAucationDetailApi.mockResolvedValueOnce(ok({ aucation: { id: 5 } }));
    await expect(store.fetchAucation(5)).resolves.toBe(true);
    expect(store.aucation).toEqual({ id: 5 });

    api.getAucationDetailApi.mockResolvedValueOnce({ status: 'fail' });
    await expect(store.fetchAucation(6)).resolves.toBe(false);
    expect(store.aucation).toBeNull();

    api.getAucationDetailApi.mockRejectedValueOnce(new Error('x'));
    await expect(store.fetchAucation(7)).resolves.toBe(false);
    expect(store.aucation).toBeNull();
  });

  it('addAucation menandai isAucationAdded setelah sukses', async () => {
    api.addAucationApi.mockResolvedValue(ok());
    const store = useAucationsStore();
    const result = await store.addAucation({ title: 'T' });
    expect(result.ok).toBe(true);
    expect(store.isAucationAdded).toBe(true);
    expect(store.isAucationAdd).toBe(false);
  });

  it('changeAucation dan removeAucation memanggil API yang tepat', async () => {
    api.updateAucationApi.mockResolvedValue(ok());
    api.deleteAucationApi.mockResolvedValue(ok());
    const store = useAucationsStore();
    await store.changeAucation(1, { title: 'x' });
    await store.removeAucation(1);
    expect(store.isAucationChanged).toBe(true);
    expect(store.isAucationDeleted).toBe(true);
  });

  it('changeCover memuat ulang detail setelah sukses', async () => {
    api.changeCoverApi.mockResolvedValue(ok());
    api.getAucationDetailApi.mockResolvedValue(ok({ aucation: { id: 2 } }));
    const store = useAucationsStore();
    await store.changeCover(2, new File(['x'], 'c.jpg'));
    expect(store.isAucationChangedCover).toBe(true);
    expect(store.aucation).toEqual({ id: 2 });
  });

  it('addBid dan removeBid memuat ulang detail setelah sukses', async () => {
    api.addBidApi.mockResolvedValue(ok());
    api.deleteBidApi.mockResolvedValue(ok());
    api.getAucationDetailApi.mockResolvedValue(ok({ aucation: { id: 3 } }));
    const store = useAucationsStore();
    await store.addBid(3, 9000);
    expect(store.isBidAdded).toBe(true);
    await store.removeBid(3);
    expect(store.isBidDeleted).toBe(true);
    expect(api.getAucationDetailApi).toHaveBeenCalledTimes(2);
  });

  it('removeAllAucations menandai isAucationDeletedAll', async () => {
    api.deleteAllAucationsApi.mockResolvedValue(ok());
    const store = useAucationsStore();
    await store.removeAllAucations();
    expect(store.isAucationDeletedAll).toBe(true);
  });

  it('mutasi gagal menyimpan validasi objek dan tidak menandai selesai', async () => {
    api.addAucationApi.mockResolvedValue({ status: 'fail', message: 'Data tidak valid', data: { title: ['wajib'] } });
    const store = useAucationsStore();
    const result = await store.addAucation({});
    expect(result).toEqual({ ok: false, message: 'Data tidak valid' });
    expect(store.validation).toEqual({ title: ['wajib'] });
    expect(store.isAucationAdded).toBe(false);
  });

  it('mutasi gagal dengan data non-objek dan tanpa pesan memakai default', async () => {
    api.deleteAucationApi.mockResolvedValue({ status: 'fail', data: 'teks' });
    const store = useAucationsStore();
    const result = await store.removeAucation(1);
    expect(result.message).toBe('Permintaan gagal');
    expect(store.validation).toEqual({});
  });

  it('mutasi menangani kegagalan jaringan', async () => {
    api.deleteBidApi.mockRejectedValue(new Error('offline'));
    const store = useAucationsStore();
    const result = await store.removeBid(1);
    expect(result.message).toBe('Tidak dapat terhubung ke server');
    expect(store.isBidDelete).toBe(false);
  });

  it('resetFlags mengembalikan semua flag ke false', async () => {
    api.addAucationApi.mockResolvedValue(ok());
    const store = useAucationsStore();
    await store.addAucation({});
    store.resetFlags();
    expect(store.isAucationAdded).toBe(false);
  });
});
