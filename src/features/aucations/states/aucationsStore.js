import { defineStore } from 'pinia';
import {
  getAucationsApi,
  getAucationDetailApi,
  addAucationApi,
  updateAucationApi,
  changeCoverApi,
  deleteAucationApi,
  addBidApi,
  deleteBidApi,
  deleteAllAucationsApi,
} from '../api/aucationApi';

const initialFlags = () => ({
  isAucationAdd: false,
  isAucationAdded: false,
  isAucationChange: false,
  isAucationChanged: false,
  isAucationChangeCover: false,
  isAucationChangedCover: false,
  isAucationDelete: false,
  isAucationDeleted: false,
  isBidAdd: false,
  isBidAdded: false,
  isBidDelete: false,
  isBidDeleted: false,
  isAucationDeleteAll: false,
  isAucationDeletedAll: false,
});

export const useAucationsStore = defineStore('aucations', {
  state: () => ({
    aucations: [],
    aucation: null,
    isAucation: false,
    validation: {},
    message: '',
    ...initialFlags(),
  }),

  actions: {
    /**
     * Menjalankan satu mutasi dengan pola status yang konsisten:
     * `pendingFlag` true selama request, `doneFlag` true bila sukses.
     */
    async mutate(pendingFlag, doneFlag, request, onSuccess) {
      this[pendingFlag] = true;
      this[doneFlag] = false;
      this.validation = {};
      this.message = '';
      try {
        const json = await request();
        if (json.status === 'success') {
          this[doneFlag] = true;
          if (onSuccess) await onSuccess(json);
          this.message = json.message;
          return { ok: true, message: json.message };
        }
        this.validation = json.data && typeof json.data === 'object' ? json.data : {};
        this.message = json.message || 'Permintaan gagal';
        return { ok: false, message: this.message };
      } catch (error) {
        this.message = 'Tidak dapat terhubung ke server';
        return { ok: false, message: this.message };
      } finally {
        this[pendingFlag] = false;
      }
    },

    resetFlags() {
      Object.assign(this, initialFlags());
    },

    async fetchAucations(filters = {}) {
      this.isAucation = true;
      try {
        const json = await getAucationsApi(filters);
        this.aucations = json.status === 'success' ? (json.data?.aucations ?? []) : [];
        return json.status === 'success';
      } catch (error) {
        this.aucations = [];
        return false;
      } finally {
        this.isAucation = false;
      }
    },

    async fetchAucation(id) {
      this.isAucation = true;
      try {
        const json = await getAucationDetailApi(id);
        this.aucation = json.status === 'success' ? (json.data?.aucation ?? null) : null;
        return json.status === 'success';
      } catch (error) {
        this.aucation = null;
        return false;
      } finally {
        this.isAucation = false;
      }
    },

    addAucation(payload) {
      return this.mutate('isAucationAdd', 'isAucationAdded', () => addAucationApi(payload));
    },

    changeAucation(id, payload) {
      return this.mutate('isAucationChange', 'isAucationChanged', () =>
        updateAucationApi(id, payload),
      );
    },

    changeCover(id, file) {
      return this.mutate(
        'isAucationChangeCover',
        'isAucationChangedCover',
        () => changeCoverApi(id, file),
        () => this.fetchAucation(id),
      );
    },

    removeAucation(id) {
      return this.mutate('isAucationDelete', 'isAucationDeleted', () => deleteAucationApi(id));
    },

    addBid(id, bid) {
      return this.mutate(
        'isBidAdd',
        'isBidAdded',
        () => addBidApi(id, bid),
        () => this.fetchAucation(id),
      );
    },

    removeBid(id) {
      return this.mutate(
        'isBidDelete',
        'isBidDeleted',
        () => deleteBidApi(id),
        () => this.fetchAucation(id),
      );
    },

    removeAllAucations() {
      return this.mutate('isAucationDeleteAll', 'isAucationDeletedAll', () =>
        deleteAllAucationsApi(),
      );
    },
  },
});
