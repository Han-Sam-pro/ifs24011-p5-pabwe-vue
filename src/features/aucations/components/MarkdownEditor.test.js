import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/vue';
import MarkdownEditor from './MarkdownEditor.vue';

const instances = [];
vi.mock('@toast-ui/editor', () => {
  class FakeEditor {
    constructor(options) {
      this.options = options;
      this.markdown = options.initialValue;
      this.getMarkdown = vi.fn(() => this.markdown);
      this.setMarkdown = vi.fn((value) => {
        this.markdown = value;
      });
      this.destroy = vi.fn();
      instances.push(this);
    }
  }
  return { default: FakeEditor };
});

describe('MarkdownEditor', () => {
  beforeEach(() => {
    instances.length = 0;
  });

  it('membuat editor dengan nilai awal dan mengirim perubahan markdown', async () => {
    const { emitted } = render(MarkdownEditor, { props: { modelValue: '# Halo' } });
    const editor = instances[0];
    expect(editor.options.initialValue).toBe('# Halo');
    expect(editor.options.initialEditType).toBe('markdown');

    editor.markdown = '# Baru';
    editor.options.events.change();
    expect(emitted()['update:modelValue'][0]).toEqual(['# Baru']);
  });

  it('memperbarui isi editor bila modelValue berubah', async () => {
    const { rerender } = render(MarkdownEditor, { props: { modelValue: 'a' } });
    const editor = instances[0];
    await rerender({ modelValue: 'b' });
    expect(editor.setMarkdown).toHaveBeenCalledWith('b', false);
  });

  it('tidak memanggil setMarkdown bila nilai baru sama dengan isi editor', async () => {
    const { rerender, emitted } = render(MarkdownEditor, { props: { modelValue: 'a' } });
    const editor = instances[0];
    editor.markdown = 'hasil ketik';
    editor.options.events.change();
    await rerender({ modelValue: emitted()['update:modelValue'][0][0] });
    expect(editor.setMarkdown).not.toHaveBeenCalled();
  });

  it('menghancurkan editor saat komponen dilepas', () => {
    const { unmount } = render(MarkdownEditor, { props: { modelValue: '' } });
    const editor = instances[0];
    unmount();
    expect(editor.destroy).toHaveBeenCalled();
  });
});
