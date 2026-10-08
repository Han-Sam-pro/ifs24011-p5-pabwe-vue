import { defineStore } from 'pinia';
import {
  getUsersApi,
  getUserByIdApi,
  getProfileApi,
  updateProfileApi,
  changePhotoApi,
  changePasswordApi,
} from '../api/userApi';

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    user: null,
    profile: null,
    isUsers: false,
    isProfile: false,
    isProfileMutation: false,
    validation: {},
    message: '',
  }),

  actions: {
    async fetchUsers() {
      this.isUsers = true;
      try {
        const json = await getUsersApi();
        this.users = json.status === 'success' ? (json.data?.users ?? []) : [];
        return json.status === 'success';
      } catch (error) {
        this.users = [];
        return false;
      } finally {
        this.isUsers = false;
      }
    },

    async fetchUser(id) {
      this.isUsers = true;
      try {
        const json = await getUserByIdApi(id);
        this.user = json.status === 'success' ? (json.data?.user ?? null) : null;
        return json.status === 'success';
      } catch (error) {
        this.user = null;
        return false;
      } finally {
        this.isUsers = false;
      }
    },

    async fetchProfile() {
      this.isProfile = true;
      try {
        const json = await getProfileApi();
        this.profile = json.status === 'success' ? (json.data?.user ?? null) : null;
        return json.status === 'success';
      } catch (error) {
        this.profile = null;
        return false;
      } finally {
        this.isProfile = false;
      }
    },

    // Membungkus mutasi profil agar status `isProfileMutation` selalu konsisten.
    async runProfileMutation(request, onSuccess) {
      this.isProfileMutation = true;
      this.validation = {};
      this.message = '';
      try {
        const json = await request();
        if (json.status === 'success') {
          if (onSuccess) onSuccess(json);
          this.message = json.message;
          return { ok: true, message: json.message };
        }
        this.validation = json.data && typeof json.data === 'object' ? json.data : {};
        this.message = json.message || 'Gagal memperbarui data';
        return { ok: false, message: this.message };
      } catch (error) {
        this.message = 'Tidak dapat terhubung ke server';
        return { ok: false, message: this.message };
      } finally {
        this.isProfileMutation = false;
      }
    },

    updateProfile(name, email) {
      return this.runProfileMutation(
        () => updateProfileApi({ name, email }),
        (json) => {
          this.profile = json.data.user;
        },
      );
    },

    changePhoto(file) {
      return this.runProfileMutation(
        () => changePhotoApi(file),
        () => this.fetchProfile(),
      );
    },

    changePassword(payload) {
      return this.runProfileMutation(() => changePasswordApi(payload));
    },
  },
});
