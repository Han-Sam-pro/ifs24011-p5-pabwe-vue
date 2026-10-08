import { apiRequest } from '@/helpers/apiHelper';

export function loginApi({ email, password }) {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } });
}

export function registerApi({ name, email, password }) {
  return apiRequest('/auth/register', { method: 'POST', body: { name, email, password } });
}

export function logoutApi() {
  return apiRequest('/auth/logout', { method: 'POST' });
}
