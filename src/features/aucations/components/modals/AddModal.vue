<script setup>
import { reactive, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import MarkdownEditor from '../MarkdownEditor.vue';
import { useInput } from '@/hooks/useInput';
import { toApiDateTime } from '@/helpers/toolsHelper';

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  validation: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['close', 'submit']);

const title = useInput('');
const startBid = useInput('');
const closedAt = useInput('');
const description = useInput('');
const errors = reactive({});

function resetForm() {
  title.reset();
  startBid.reset();
  closedAt.reset();
  description.reset();
  Object.keys(errors).forEach((key) => delete errors[key]);
}

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  if (!title.value.trim()) errors.title = 'Judul wajib diisi';
  if (!description.value.trim()) errors.description = 'Deskripsi wajib diisi';
  if (!(Number(startBid.value) > 0)) errors.startBid = 'Harga awal harus lebih dari 0';
  if (!closedAt.value) errors.closedAt = 'Batas waktu wajib diisi';
  return Object.keys(errors).length === 0;
}

function onSubmit() {
  if (!validate()) return;
  emit('submit', {
    title: title.value.trim(),
    description: description.value,
    startBid: Number(startBid.value),
    closedAt: toApiDateTime(closedAt.value),
  });
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) resetForm();
  },
);

</script>

<template>
  <BaseModal :open="open" title="Tambah Lelang Baru" @close="emit('close')">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-700">Judul barang</span>
        <input
          :value="title.value"
          type="text"
          name="title"
          class="rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          @input="title.onChange"
        />
        <span v-if="errors.title || validation.title" class="text-xs text-red-600">
          {{ errors.title || validation.title[0] }}
        </span>
      </label>

      <div class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-700">Deskripsi</span>
        <MarkdownEditor v-model="description.value" />
        <span v-if="errors.description" class="text-xs text-red-600">{{ errors.description }}</span>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold text-slate-700">Harga awal (Rp)</span>
          <input
            :value="startBid.value"
            type="number"
            min="1"
            name="start_bid"
            class="rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            @input="startBid.onChange"
          />
          <span v-if="errors.startBid || validation.start_bid" class="text-xs text-red-600">
            {{ errors.startBid || validation.start_bid[0] }}
          </span>
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold text-slate-700">Ditutup pada</span>
          <input
            :value="closedAt.value"
            type="datetime-local"
            name="closed_at"
            class="rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            @input="closedAt.onChange"
          />
          <span v-if="errors.closedAt || validation.closed_at" class="text-xs text-red-600">
            {{ errors.closedAt || validation.closed_at[0] }}
          </span>
        </label>
      </div>

      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100" @click="emit('close')">
          Batal
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {{ loading ? 'Menyimpan...' : 'Simpan Lelang' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
