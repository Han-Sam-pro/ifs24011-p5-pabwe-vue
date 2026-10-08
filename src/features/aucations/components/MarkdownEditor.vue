<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Tulis deskripsi barang...' },
  label: { type: String, default: 'Deskripsi barang' },
});
const emit = defineEmits(['update:modelValue']);

const container = ref(null);
let editor = null;
let observer = null;

// Toast UI Editor tidak memberi label pada textarea, tombol "more", dan tab mode.
// Atribut dilengkapi setelah render agar layar pembaca bisa membacanya.
function patchAccessibility() {
  const root = container.value;
  root.querySelectorAll('textarea').forEach((el) => el.setAttribute('aria-label', props.label));
  root.querySelectorAll('.toastui-editor-tabs').forEach((el) => el.setAttribute('role', 'tablist'));
  root.querySelectorAll('.more').forEach((el) => el.setAttribute('aria-label', 'Menu lainnya'));
  root.querySelectorAll('[aria-role]').forEach((el) => {
    el.removeAttribute('aria-role');
    if (el.hasAttribute('aria-selected')) el.setAttribute('role', 'tab');
  });
}

onMounted(() => {
  editor = new Editor({
    el: container.value,
    initialValue: props.modelValue,
    initialEditType: 'markdown',
    previewStyle: 'tab',
    height: '260px',
    placeholder: props.placeholder,
    usageStatistics: false,
    events: {
      change: () => emit('update:modelValue', editor.getMarkdown()),
    },
  });
  patchAccessibility();
  // Toolbar (termasuk tombol "more") bisa dibuat ulang oleh library, jadi patch dijalankan
  // setiap kali DOM editor berubah. Patch bersifat idempoten dan hanya mengubah atribut.
  observer = new MutationObserver(patchAccessibility);
  observer.observe(container.value, { childList: true, subtree: true });
  patchAccessibility();
});

// Editor selalu dibuat saat mount, sehingga watch hanya berjalan ketika editor sudah ada.
watch(
  () => props.modelValue,
  (value) => {
    if (value !== editor.getMarkdown()) {
      editor.setMarkdown(value, false);
    }
  },
);

onBeforeUnmount(() => {
  observer.disconnect();
  editor.destroy();
  editor = null;
});
</script>

<template>
  <div ref="container" data-testid="markdown-editor" />
</template>
