<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import BaseModal from './BaseModal.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'submit']);

const file = ref(null);
const previewUrl = ref('');
const error = ref('');

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
}

function onFileChange(event) {
  const selected = event.target.files[0] ?? null;
  revokePreview();
  error.value = '';
  if (!selected) {
    file.value = null;
    return;
  }
  if (!selected.type.startsWith('image/')) {
    file.value = null;
    error.value = 'Berkas harus berupa gambar';
    return;
  }
  file.value = selected;
  previewUrl.value = URL.createObjectURL(selected);
}

function onSubmit() {
  if (!file.value) {
    error.value = 'Pilih gambar terlebih dahulu';
    return;
  }
  emit('submit', file.value);
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      file.value = null;
      error.value = '';
      revokePreview();
    }
  },
);

onBeforeUnmount(revokePreview);
</script>

<template>
  <BaseModal :open="open" title="Ganti Foto Cover" @close="emit('close')">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-700">Pilih gambar</span>
        <input type="file" accept="image/*" name="cover" class="text-sm" @change="onFileChange" />
        <span v-if="error" class="text-xs text-red-600">{{ error }}</span>
      </label>

      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="Pratinjau cover"
        class="max-h-64 w-full rounded-xl object-cover"
        data-testid="cover-preview"
      />

      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100" @click="emit('close')">
          Batal
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {{ loading ? 'Mengunggah...' : 'Unggah Cover' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
