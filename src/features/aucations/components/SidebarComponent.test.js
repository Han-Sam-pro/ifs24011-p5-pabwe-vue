import { describe, it, expect } from 'vitest';
import { fireEvent, screen } from '@testing-library/vue';
import SidebarComponent from './SidebarComponent.vue';
import { renderWithProviders } from '@/test-utils';

describe('SidebarComponent', () => {
  it('menampilkan empat menu navigasi', async () => {
    await renderWithProviders(SidebarComponent, { props: { isOpen: false } });
    ['Dashboard Lelang', 'Lelang Saya', 'Daftar Pengguna', 'Profil Saya'].forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
  });

  it('menggeser sidebar keluar layar saat tertutup dan tidak menampilkan backdrop', async () => {
    const { container } = await renderWithProviders(SidebarComponent, { props: { isOpen: false } });
    expect(container.querySelector('aside').className).toContain('-translate-x-full');
    expect(screen.queryByTestId('sidebar-backdrop')).toBeNull();
  });

  it('menampilkan backdrop dan mengirim close saat terbuka lalu diklik', async () => {
    const { container, emitted } = await renderWithProviders(SidebarComponent, { props: { isOpen: true } });
    expect(container.querySelector('aside').className).toContain('translate-x-0');
    await fireEvent.click(screen.getByTestId('sidebar-backdrop'));
    expect(emitted().close).toHaveLength(1);
  });

  it('mengirim close saat salah satu menu diklik', async () => {
    const { emitted } = await renderWithProviders(SidebarComponent, { props: { isOpen: true } });
    await fireEvent.click(screen.getByRole('link', { name: 'Daftar Pengguna' }));
    expect(emitted().close).toHaveLength(1);
  });
});
