import { describe, it, expect, vi } from 'vitest';

vi.mock('@toast-ui/editor', () => ({ default: class {} }));
vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => ({ default: class {} }));

import { MarkdownEditor, MarkdownViewer } from './lazy';

describe('lazy markdown components', () => {
  // defineAsyncComponent menyimpan fungsi pemuat di __asyncLoader; tes memanggilnya langsung
  // agar modul asli ikut terbaca dan jalur pemuatan tercakup.
  it('memuat MarkdownEditor saat dibutuhkan', async () => {
    const loaded = await MarkdownEditor.__asyncLoader();
    expect(loaded.default ?? loaded).toHaveProperty('setup');
  });

  it('memuat MarkdownViewer saat dibutuhkan', async () => {
    const loaded = await MarkdownViewer.__asyncLoader();
    expect(loaded.default ?? loaded).toHaveProperty('setup');
  });
});
