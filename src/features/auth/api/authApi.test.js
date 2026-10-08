import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest } from '@/helpers/apiHelper';
import { loginApi, registerApi, logoutApi } from './authApi';

vi.mock('@/helpers/apiHelper', () => ({ apiRequest: vi.fn() }));

describe('authApi', () => {
  beforeEach(() => apiRequest.mockReset());

  it('loginApi mengirim POST /auth/login', async () => {
    await loginApi({ email: 'a@b.c', password: 'x' });
    expect(apiRequest).toHaveBeenCalledWith('/auth/login', { method: 'POST', body: { email: 'a@b.c', password: 'x' } });
  });

  it('registerApi mengirim POST /auth/register', async () => {
    await registerApi({ name: 'Budi', email: 'a@b.c', password: 'x' });
    expect(apiRequest).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: { name: 'Budi', email: 'a@b.c', password: 'x' },
    });
  });

  it('logoutApi mengirim POST /auth/logout', async () => {
    await logoutApi();
    expect(apiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
  });
});
