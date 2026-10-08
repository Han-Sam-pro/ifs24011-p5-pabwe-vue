import { defineStore } from 'pinia';
import { getAccessToken, putAccessToken } from '@/helpers/apiHelper';
import { loginApi, registerApi, logoutApi } from '../api/authApi';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getAccessToken(),
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
    validation: {},
    message: '',
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    setValidation(data) {
      this.validation = data && typeof data === 'object' ? data : {};
    },

    async login(email, password) {
      this.isAuthLogin = true;
      this.validation = {};
      this.message = '';
      try {
        const json = await loginApi({ email, password });
        if (json.status === 'success') {
          this.token = json.data.token;
          putAccessToken(json.data.token);
          return { ok: true, user: json.data.user };
        }
        this.setValidation(json.data);
        this.message = json.message || 'Login gagal';
        return { ok: false, message: this.message };
      } catch (error) {
        this.message = 'Tidak dapat terhubung ke server';
        return { ok: false, message: this.message };
      } finally {
        this.isAuthLogin = false;
      }
    },

    async register(name, email, password) {
      this.isAuthRegister = true;
      this.validation = {};
      this.message = '';
      try {
        const json = await registerApi({ name, email, password });
        if (json.status === 'success') {
          return { ok: true, message: json.message };
        }
        this.setValidation(json.data);
        this.message = json.message || 'Registrasi gagal';
        return { ok: false, message: this.message };
      } catch (error) {
        this.message = 'Tidak dapat terhubung ke server';
        return { ok: false, message: this.message };
      } finally {
        this.isAuthRegister = false;
      }
    },

    async logout() {
      this.isAuthLogout = true;
      try {
        await logoutApi();
      } catch (error) {
        // Sesi lokal tetap dibersihkan walau jaringan gagal.
      } finally {
        this.token = null;
        putAccessToken(null);
        this.isAuthLogout = false;
      }
    },
  },
});
