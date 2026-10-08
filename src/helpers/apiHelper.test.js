import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, buildQuery, getAccessToken, putAccessToken } from './apiHelper';
import { mockFetchResponse } from '@/test-utils';

describe('apiHelper token storage', () => {
  it('menyimpan dan mengambil token dari localStorage', () => {
    putAccessToken('abc');
    expect(getAccessToken()).toBe('abc');
  });

  it('menghapus token bila nilai null', () => {
    putAccessToken('abc');
    putAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});

describe('buildQuery', () => {
  it('mengabaikan nilai kosong dan menghasilkan query string', () => {
    expect(buildQuery({ a: 1, b: undefined, c: null, d: '', e: 0 })).toBe('?a=1&e=0');
  });

  it('mengembalikan string kosong bila tidak ada parameter', () => {
    expect(buildQuery()).toBe('');
    expect(buildQuery({ a: undefined })).toBe('');
  });
});

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('mengirim GET dengan query dan header Authorization bila ada token', async () => {
    putAccessToken('secret');
    fetch.mockReturnValue(mockFetchResponse({ status: 'success', data: {} }));

    const json = await apiRequest('/aucations', { query: { is_me: 1 } });

    expect(fetch).toHaveBeenCalledWith(
      `${DELCOM_BASEURL}/aucations?is_me=1`,
      expect.objectContaining({
        method: 'GET',
        body: undefined,
        headers: expect.objectContaining({ Authorization: 'Bearer secret', Accept: 'application/json' }),
      }),
    );
    expect(json.status).toBe('success');
  });

  it('tidak mengirim header Authorization bila belum ada token', async () => {
    fetch.mockReturnValue(mockFetchResponse({ status: 'success' }));
    await apiRequest('/users');
    const headers = fetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it('mengirim body JSON dengan Content-Type application/json', async () => {
    fetch.mockReturnValue(mockFetchResponse({ status: 'success' }));
    await apiRequest('/auth/login', { method: 'POST', body: { email: 'a' } });
    const [, init] = fetch.mock.calls[0];
    expect(init.body).toBe(JSON.stringify({ email: 'a' }));
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('meneruskan FormData tanpa mengatur Content-Type', async () => {
    fetch.mockReturnValue(mockFetchResponse({ status: 'success' }));
    const form = new FormData();
    form.append('photo', 'x');
    await apiRequest('/users/me/photo', { method: 'POST', body: form, isForm: true });
    const [, init] = fetch.mock.calls[0];
    expect(init.body).toBe(form);
    expect(init.headers['Content-Type']).toBeUndefined();
  });

  it('mengembalikan status error bila respons bukan JSON', async () => {
    fetch.mockResolvedValue(new Response('<html>', { status: 500, statusText: 'Server Error' }));
    const json = await apiRequest('/users');
    expect(json).toEqual({ status: 'error', message: 'Server Error' });
  });
});
