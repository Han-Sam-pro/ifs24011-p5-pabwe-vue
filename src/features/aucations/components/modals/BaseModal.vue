<script setup>
import { X } from 'lucide-vue-next';

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
});
const emit = defineEmits(['close']);
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
    data-testid="base-modal"
    @click.self="emit('close')"
  >
    <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-ink-900">{{ title }}</h2>
        <button
          type="button"
          class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          aria-label="Tutup"
          @click="emit('close')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>
