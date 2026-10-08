import { defineAsyncComponent } from 'vue';

// Toast UI Editor/Viewer berukuran besar. Komponen ini hanya diunduh saat dibutuhkan,
// sehingga halaman lain tidak ikut memuat library tersebut.
export const MarkdownEditor = defineAsyncComponent(() => import('./MarkdownEditor.vue'));
export const MarkdownViewer = defineAsyncComponent(() => import('./MarkdownViewer.vue'));
