<script setup>
import { computed, ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import { useInput } from '@/hooks/useInput';
import { formatRupiah } from '@/helpers/toolsHelper';

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  startBid: { type: Number, default: 0 },
  highestBid: { type: Number, default: null },
});
const emit = defineEmits(['close', 'submit']);

const bid = useInput('');
const error = ref('');

const minimumBid = computed(() =>
  props.highestBid !== null && props.highestBid !== undefined ? props.highestBid + 1 : props.startBid,
);

function onSubmit() {
  const value = Number(bid.value);
  if (!Number.isFinite(value) || value <= 0) {
    error.value = 'Masukkan nominal penawaran yang valid';
    return;
  }
  if (value < minimumBid.value) {
    error.value = `Penawaran minimal ${formatRupiah(minimumBid.value)}`;
    return;
  }
  error.value = '';
  emit('submit', value);
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      bid.reset();
      error.value = '';
    }
  },
);
</script>

<template>
  <BaseModal :open="open" title="Ajukan Penawaran" @close="emit('close')">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
      <p class="text-sm text-slate-500">
        Penawaran minimal <span class="font-semibold text-primary">{{ formatRupiah(minimumBid) }}</span>
      </p>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-700">Nominal penawaran (Rp)</span>
        <input
          :value="bid.value"
          type="number"
          name="bid"
          :min="minimumBid"
          class="rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          @input="bid.onChange"
        />
        <span v-if="error" class="text-xs text-red-700">{{ error }}</span>
      </label>
      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100" @click="emit('close')">
          Batal
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="rounded-xl bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {{ loading ? 'Mengirim...' : 'Kirim Penawaran' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
