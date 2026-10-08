import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest } from '@/helpers/apiHelper';
import {
  getUsersApi,
  getUserByIdApi,
  getProfileApi,
  updateProfileApi,
  changePhotoApi,
  changePasswordApi,
} from './userApi';

vi.mock('@/helpers/apiHelper', () => ({ apiRequest: vi.fn() }));

describe('userApi', () => {
  beforeEach(() => apiRequest.mockReset());

  it('memanggil endpoint daftar dan detail pengguna', async () => {
    await getUsersApi();
    await getUserByIdApi(7);
    await getProfileApi();
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/users');
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/users/7');
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/users/me');
  });

  it('updateProfileApi mengirim PUT /users/me', async () => {
    await updateProfileApi({ name: 'Budi', email: 'b@c.d' });
    expect(apiRequest).toHaveBeenCalledWith('/users/me', {
      method: 'PUT',
      body: { name: 'Budi', email: 'b@c.d' },
    });
  });

  it('changePhotoApi mengirim FormData dengan field photo', async () => {
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    await changePhotoApi(file);
    const [path, options] = apiRequest.mock.calls[0];
    expect(path).toBe('/users/me/photo');
    expect(options.method).toBe('POST');
    expect(options.isForm).toBe(true);
    expect(options.body.get('photo')).toBeInstanceOf(File);
  });

  it('changePasswordApi memetakan field ke snake_case', async () => {
    await changePasswordApi({ password: 'a', newPassword: 'b', newPasswordConfirmation: 'b' });
    expect(apiRequest).toHaveBeenCalledWith('/users/password', {
      method: 'PUT',
      body: { password: 'a', new_password: 'b', new_password_confirmation: 'b' },
    });
  });
});
