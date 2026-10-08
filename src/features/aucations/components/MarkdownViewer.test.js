import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/vue';
import MarkdownViewer from './MarkdownViewer.vue';

const instances = [];
vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => {
  class FakeViewer {
    constructor(options) {
      this.options = options;
      this.setMarkdown = vi.fn();
      this.destroy = vi.fn();
      instances.push(this);
    }
  }
  return { default: FakeViewer };
});

describe('MarkdownViewer', () => {
  beforeEach(() => {
    instances.length = 0;
  });

  it('merender konten awal ke viewer', () => {
    render(MarkdownViewer, { props: { content: '**tebal**' } });
    expect(instances[0].options.initialValue).toBe('**tebal**');
  });

  it('memperbarui konten saat prop berubah', async () => {
    const { rerender } = render(MarkdownViewer, { props: { content: 'a' } });
    await rerender({ content: 'b' });
    expect(instances[0].setMarkdown).toHaveBeenCalledWith('b');
  });

  it('menghancurkan viewer saat komponen dilepas', () => {
    const { unmount } = render(MarkdownViewer, { props: {} });
    unmount();
    expect(instances[0].destroy).toHaveBeenCalled();
  });
});
