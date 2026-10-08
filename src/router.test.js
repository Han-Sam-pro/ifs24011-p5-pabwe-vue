import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryHistory } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';
import { createAppRouter } from './router';
import { putAccessToken } from '@/helpers/apiHelper';

describe('router', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('mengarahkan tamu dari rute terlindungi ke login dengan redirect', async () => {
    const router = createAppRouter(createMemoryHistory());
    await router.push('/profile');
    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/profile');
  });

  it('mengizinkan pengguna yang login mengakses rute terlindungi', async () => {
    putAccessToken('T');
    const router = createAppRouter(createMemoryHistory());
    await router.push('/users');
    expect(router.currentRoute.value.name).toBe('users');
  });

  it('mengarahkan pengguna yang sudah login dari halaman auth ke beranda', async () => {
    putAccessToken('T');
    const router = createAppRouter(createMemoryHistory());
    await router.push('/auth/login');
    expect(router.currentRoute.value.name).toBe('home');
  });

  it('menampilkan halaman login untuk tamu', async () => {
    const router = createAppRouter(createMemoryHistory());
    await router.push('/auth/register');
    expect(router.currentRoute.value.name).toBe('register');
  });

  it('menampilkan halaman 404 untuk rute yang tidak dikenal', async () => {
    putAccessToken('T');
    const router = createAppRouter(createMemoryHistory());
    await router.push('/tidak/ada');
    expect(router.currentRoute.value.name).toBe('not-found');
  });

  it('membuka detail lelang dengan parameter id', async () => {
    putAccessToken('T');
    const router = createAppRouter(createMemoryHistory());
    await router.push('/aucations/42');
    expect(router.currentRoute.value.name).toBe('aucation-detail');
    expect(router.currentRoute.value.params.aucationId).toBe('42');
  });
});
