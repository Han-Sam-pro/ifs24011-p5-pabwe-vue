import { apiRequest } from '@/helpers/apiHelper';

export function getUsersApi() {
  return apiRequest('/users');
}

export function getUserByIdApi(id) {
  return apiRequest(`/users/${id}`);
}

export function getProfileApi() {
  return apiRequest('/users/me');
}

export function updateProfileApi({ name, email }) {
  return apiRequest('/users/me', { method: 'PUT', body: { name, email } });
}

export function changePhotoApi(file) {
  const form = new FormData();
  form.append('photo', file);
  return apiRequest('/users/me/photo', { method: 'POST', body: form, isForm: true });
}

export function changePasswordApi({ password, newPassword, newPasswordConfirmation }) {
  return apiRequest('/users/password', {
    method: 'PUT',
    body: {
      password,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    },
  });
}
