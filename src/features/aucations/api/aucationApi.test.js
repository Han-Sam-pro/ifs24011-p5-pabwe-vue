import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest } from '@/helpers/apiHelper';
import {
  getAucationsApi,
  getAucationDetailApi,
  addAucationApi,
  updateAucationApi,
  changeCoverApi,
  deleteAucationApi,
  addBidApi,
  deleteBidApi,
  deleteAllAucationsApi,
} from './aucationApi';

vi.mock('@/helpers/apiHelper', () => ({ apiRequest: vi.fn() }));

describe('aucationApi', () => {
  beforeEach(() => apiRequest.mockReset());

  it('getAucationsApi tanpa filter tidak mengirim query', async () => {
    await getAucationsApi();
    expect(apiRequest).toHaveBeenCalledWith('/aucations', {
      query: { is_me: undefined, is_closed: undefined },
    });
  });

  it('getAucationsApi memetakan filter boolean ke 1 atau 0', async () => {
    await getAucationsApi({ isMe: true, isClosed: false });
    expect(apiRequest.mock.calls[0][1].query).toEqual({ is_me: 1, is_closed: 0 });

    await getAucationsApi({ isMe: false, isClosed: true });
    expect(apiRequest.mock.calls[1][1].query).toEqual({ is_me: undefined, is_closed: 1 });
  });

  it('getAucationsApi mengabaikan isClosed bernilai null', async () => {
    await getAucationsApi({ isClosed: null });
    expect(apiRequest.mock.calls[0][1].query.is_closed).toBeUndefined();
  });

  it('getAucationDetailApi mengambil detail berdasarkan id', async () => {
    await getAucationDetailApi(9);
    expect(apiRequest).toHaveBeenCalledWith('/aucations/9');
  });

  it('addAucationApi memetakan startBid dan closedAt ke snake_case', async () => {
    await addAucationApi({ title: 'T', description: 'D', startBid: 100, closedAt: '2026-10-10 10:00:00' });
    expect(apiRequest).toHaveBeenCalledWith('/aucations', {
      method: 'POST',
      body: { title: 'T', description: 'D', start_bid: 100, closed_at: '2026-10-10 10:00:00' },
    });
  });

  it('updateAucationApi mengirim PUT ke id yang sesuai', async () => {
    await updateAucationApi(3, { title: 'T', description: 'D', startBid: 5, closedAt: 'x' });
    expect(apiRequest).toHaveBeenCalledWith('/aucations/3', {
      method: 'PUT',
      body: { title: 'T', description: 'D', start_bid: 5, closed_at: 'x' },
    });
  });

  it('changeCoverApi mengirim FormData berisi field cover', async () => {
    const file = new File(['x'], 'c.jpg', { type: 'image/jpeg' });
    await changeCoverApi(4, file);
    const [path, options] = apiRequest.mock.calls[0];
    expect(path).toBe('/aucations/4/cover');
    expect(options.isForm).toBe(true);
    expect(options.body.get('cover')).toBeInstanceOf(File);
  });

  it('deleteAucationApi, addBidApi, deleteBidApi, dan deleteAllAucationsApi memakai metode yang benar', async () => {
    await deleteAucationApi(1);
    await addBidApi(2, 5000);
    await deleteBidApi(2);
    await deleteAllAucationsApi();
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/aucations/1', { method: 'DELETE' });
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/aucations/2/bids', { method: 'POST', body: { bid: 5000 } });
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/aucations/2/bids', { method: 'DELETE' });
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/aucations', { method: 'DELETE' });
  });
});
