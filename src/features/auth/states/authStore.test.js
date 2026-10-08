import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './authStore';
import { loginApi, registerApi, logoutApi } from '../api/authApi';
import { putAccessToken } from '@/helpers/apiHelper';

vi.mock('../api/authApi', () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  logoutApi: vi.fn(),
}));

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('membaca token tersimpan saat inisialisasi', () => {
    putAccessToken('tersimpan');
    const store = useAuthStore();
    expect(store.token).toBe('tersimpan');
    expect(store.isAuthenticated).toBe(true);
  });

  it('login sukses menyimpan token dan mengembalikan user', async () => {
    loginApi.mockResolvedValue({ status: 'success', data: { token: 'T1', user: { name: 'Budi' } } });
    const store = useAuthStore();

    const result = await store.login('a@b.c', 'pw');

    expect(result).toEqual({ ok: true, user: { name: 'Budi' } });
    expect(store.token).toBe('T1');
    expect(localStorage.getItem('delcom_access_token')).toBe('T1');
    expect(store.isAuthLogin).toBe(false);
  });

  it('login gagal menyimpan validasi dan pesan dari server', async () => {
    loginApi.mockResolvedValue({ status: 'fail', message: 'Data tidak valid', data: { email: ['Email salah'] } });
    const store = useAuthStore();

    const result = await store.login('x', 'y');

    expect(result).toEqual({ ok: false, message: 'Data tidak valid' });
    expect(store.validation).toEqual({ email: ['Email salah'] });
    expect(store.isAuthenticated).toBe(false);
  });

  it('login gagal tanpa data dan pesan memakai nilai default', async () => {
    loginApi.mockResolvedValue({ status: 'fail' });
    const store = useAuthStore();
    const result = await store.login('x', 'y');
    expect(result.message).toBe('Login gagal');
    expect(store.validation).toEqual({});
  });

  it('login menangani kegagalan jaringan', async () => {
    loginApi.mockRejectedValue(new Error('offline'));
    const store = useAuthStore();
    const result = await store.login('x', 'y');
    expect(result).toEqual({ ok: false, message: 'Tidak dapat terhubung ke server' });
    expect(store.isAuthLogin).toBe(false);
  });

  it('register sukses mengembalikan pesan', async () => {
    registerApi.mockResolvedValue({ status: 'success', message: 'Berhasil' });
    const store = useAuthStore();
    await expect(store.register('Budi', 'a@b.c', 'pw')).resolves.toEqual({ ok: true, message: 'Berhasil' });
    expect(store.isAuthRegister).toBe(false);
  });

  it('register gagal menyimpan validasi dan memakai pesan default', async () => {
    registerApi.mockResolvedValue({ status: 'fail', data: 'bukan objek' });
    const store = useAuthStore();
    const result = await store.register('', '', '');
    expect(result.message).toBe('Registrasi gagal');
    expect(store.validation).toEqual({});
  });

  it('register gagal dengan pesan dari server', async () => {
    registerApi.mockResolvedValue({ status: 'fail', message: 'Email sudah dipakai', data: { email: ['dipakai'] } });
    const store = useAuthStore();
    const result = await store.register('Budi', 'a@b.c', 'pw');
    expect(result.message).toBe('Email sudah dipakai');
    expect(store.validation).toEqual({ email: ['dipakai'] });
  });

  it('register menangani kegagalan jaringan', async () => {
    registerApi.mockRejectedValue(new Error('offline'));
    const store = useAuthStore();
    const result = await store.register('Budi', 'a@b.c', 'pw');
    expect(result.ok).toBe(false);
    expect(store.isAuthRegister).toBe(false);
  });

  it('logout menghapus token meski permintaan gagal', async () => {
    putAccessToken('T1');
    logoutApi.mockRejectedValue(new Error('offline'));
    const store = useAuthStore();

    await store.logout();

    expect(store.token).toBeNull();
    expect(localStorage.getItem('delcom_access_token')).toBeNull();
    expect(store.isAuthLogout).toBe(false);
  });

  it('logout memanggil API dan menghapus token', async () => {
    putAccessToken('T1');
    logoutApi.mockResolvedValue({ status: 'success' });
    const store = useAuthStore();
    await store.logout();
    expect(logoutApi).toHaveBeenCalledTimes(1);
    expect(store.isAuthenticated).toBe(false);
  });

  it('setValidation menerima objek atau nilai tidak valid', () => {
    const store = useAuthStore();
    store.setValidation(null);
    expect(store.validation).toEqual({});
    store.setValidation({ a: ['b'] });
    expect(store.validation).toEqual({ a: ['b'] });
  });
});
