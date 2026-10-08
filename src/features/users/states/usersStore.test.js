import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUsersStore } from './usersStore';
import {
  getUsersApi,
  getUserByIdApi,
  getProfileApi,
  updateProfileApi,
  changePhotoApi,
  changePasswordApi,
} from '../api/userApi';

vi.mock('../api/userApi', () => ({
  getUsersApi: vi.fn(),
  getUserByIdApi: vi.fn(),
  getProfileApi: vi.fn(),
  updateProfileApi: vi.fn(),
  changePhotoApi: vi.fn(),
  changePasswordApi: vi.fn(),
}));

describe('usersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchUsers menyimpan daftar pengguna', async () => {
    getUsersApi.mockResolvedValue({ status: 'success', data: { users: [{ id: 1 }] } });
    const store = useUsersStore();
    await expect(store.fetchUsers()).resolves.toBe(true);
    expect(store.users).toEqual([{ id: 1 }]);
    expect(store.isUsers).toBe(false);
  });

  it('fetchUsers tetap memakai daftar kosong bila respons sukses tanpa data', async () => {
    getUsersApi.mockResolvedValueOnce({ status: 'success' });
    const store = useUsersStore();
    await store.fetchUsers();
    expect(store.users).toEqual([]);
  });

  it('fetchUsers mengosongkan daftar bila gagal atau error', async () => {
    const store = useUsersStore();
    getUsersApi.mockResolvedValueOnce({ status: 'fail' });
    await expect(store.fetchUsers()).resolves.toBe(false);
    expect(store.users).toEqual([]);

    getUsersApi.mockRejectedValueOnce(new Error('x'));
    await expect(store.fetchUsers()).resolves.toBe(false);
    expect(store.users).toEqual([]);
  });

  it('fetchUser menyimpan detail pengguna dan menangani kegagalan', async () => {
    getUserByIdApi.mockResolvedValueOnce({ status: 'success', data: { user: { id: 2 } } });
    const store = useUsersStore();
    await expect(store.fetchUser(2)).resolves.toBe(true);
    expect(store.user).toEqual({ id: 2 });

    getUserByIdApi.mockResolvedValueOnce({ status: 'fail' });
    await expect(store.fetchUser(3)).resolves.toBe(false);
    expect(store.user).toBeNull();

    getUserByIdApi.mockRejectedValueOnce(new Error('x'));
    await expect(store.fetchUser(4)).resolves.toBe(false);
    expect(store.user).toBeNull();
  });

  it('fetchUser dan fetchProfile memakai null bila respons sukses tanpa data', async () => {
    getUserByIdApi.mockResolvedValueOnce({ status: 'success' });
    getProfileApi.mockResolvedValueOnce({ status: 'success' });
    const store = useUsersStore();
    await store.fetchUser(1);
    await store.fetchProfile();
    expect(store.user).toBeNull();
    expect(store.profile).toBeNull();
  });

  it('fetchProfile menyimpan profil aktif dan menangani kegagalan', async () => {
    getProfileApi.mockResolvedValueOnce({ status: 'success', data: { user: { id: 1, name: 'A' } } });
    const store = useUsersStore();
    await expect(store.fetchProfile()).resolves.toBe(true);
    expect(store.profile).toEqual({ id: 1, name: 'A' });

    getProfileApi.mockRejectedValueOnce(new Error('x'));
    await expect(store.fetchProfile()).resolves.toBe(false);
    expect(store.profile).toBeNull();
    expect(store.isProfile).toBe(false);
  });

  it('updateProfile sukses memperbarui profil lokal', async () => {
    updateProfileApi.mockResolvedValue({ status: 'success', message: 'Berhasil mengubah data', data: { user: { id: 1, name: 'Baru' } } });
    const store = useUsersStore();
    const result = await store.updateProfile('Baru', 'b@c.d');
    expect(result).toEqual({ ok: true, message: 'Berhasil mengubah data' });
    expect(store.profile).toEqual({ id: 1, name: 'Baru' });
    expect(store.isProfileMutation).toBe(false);
  });

  it('mutasi gagal menyimpan validasi objek', async () => {
    updateProfileApi.mockResolvedValue({ status: 'fail', message: 'Data tidak valid', data: { email: ['salah'] } });
    const store = useUsersStore();
    const result = await store.updateProfile('x', 'y');
    expect(result).toEqual({ ok: false, message: 'Data tidak valid' });
    expect(store.validation).toEqual({ email: ['salah'] });
  });

  it('mutasi gagal dengan data non-objek dan tanpa pesan memakai default', async () => {
    updateProfileApi.mockResolvedValue({ status: 'fail', data: 'teks' });
    const store = useUsersStore();
    const result = await store.updateProfile('x', 'y');
    expect(result.message).toBe('Gagal memperbarui data');
    expect(store.validation).toEqual({});
  });

  it('mutasi menangani kegagalan jaringan', async () => {
    updateProfileApi.mockRejectedValue(new Error('offline'));
    const store = useUsersStore();
    const result = await store.updateProfile('x', 'y');
    expect(result.message).toBe('Tidak dapat terhubung ke server');
    expect(store.isProfileMutation).toBe(false);
  });

  it('changePhoto memuat ulang profil setelah sukses', async () => {
    changePhotoApi.mockResolvedValue({ status: 'success', message: 'Foto diubah' });
    getProfileApi.mockResolvedValue({ status: 'success', data: { user: { id: 1, photo: 'baru.png' } } });
    const store = useUsersStore();
    const result = await store.changePhoto(new File(['x'], 'a.png'));
    expect(result.ok).toBe(true);
    expect(getProfileApi).toHaveBeenCalledTimes(1);
    expect(store.profile.photo).toBe('baru.png');
  });

  it('changePassword sukses tanpa memperbarui profil', async () => {
    changePasswordApi.mockResolvedValue({ status: 'success', message: 'Kata sandi diubah' });
    const store = useUsersStore();
    const result = await store.changePassword({ password: 'a', newPassword: 'b', newPasswordConfirmation: 'b' });
    expect(result).toEqual({ ok: true, message: 'Kata sandi diubah' });
    expect(changePasswordApi).toHaveBeenCalledWith({ password: 'a', newPassword: 'b', newPasswordConfirmation: 'b' });
  });
});
