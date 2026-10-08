<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Editor from '@toast-ui/editor';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Tulis deskripsi barang...' },
});
const emit = defineEmits(['update:modelValue']);

const container = ref(null);
let editor = null;

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
  editor.destroy();
  editor = null;
});
</script>

<template>
  <div ref="container" data-testid="markdown-editor" />
</template>
