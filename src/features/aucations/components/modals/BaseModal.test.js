import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/vue';
import BaseModal from './BaseModal.vue';

describe('BaseModal', () => {
  it('tidak merender apa pun saat tertutup', () => {
    render(BaseModal, { props: { open: false, title: 'Judul' } });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('merender judul dan slot saat terbuka', () => {
    render(BaseModal, {
      props: { open: true, title: 'Judul Modal' },
      slots: { default: '<p>Isi modal</p>' },
    });
    expect(screen.getByRole('dialog', { name: 'Judul Modal' })).toBeInTheDocument();
    expect(screen.getByText('Isi modal')).toBeInTheDocument();
  });

  it('mengirim close saat tombol tutup diklik', async () => {
    const { emitted } = render(BaseModal, { props: { open: true, title: 'X' } });
    await fireEvent.click(screen.getByLabelText('Tutup'));
    expect(emitted().close).toHaveLength(1);
  });

  it('mengirim close saat backdrop diklik, tetapi tidak saat isi diklik', async () => {
    const { emitted, container } = render(BaseModal, {
      props: { open: true, title: 'X' },
      slots: { default: '<span>isi</span>' },
    });
    await fireEvent.click(screen.getByText('isi'));
    expect(emitted().close).toBeUndefined();
    await fireEvent.click(container.querySelector('[data-testid="base-modal"]'));
    expect(emitted().close).toHaveLength(1);
    vi.restoreAllMocks();
  });
});
