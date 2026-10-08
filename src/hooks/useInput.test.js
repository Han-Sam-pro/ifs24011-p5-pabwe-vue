import { describe, it, expect } from 'vitest';
import { useInput } from './useInput';

describe('useInput', () => {
  it('menggunakan nilai awal sebagai string', () => {
    const input = useInput('halo');
    expect(input.value).toBe('halo');
  });

  it('memperbarui nilai dari event input', () => {
    const input = useInput();
    input.onChange({ target: { value: 'baru' } });
    expect(input.value).toBe('baru');
  });

  it('menerima nilai langsung bila bukan event', () => {
    const input = useInput();
    input.onChange('langsung');
    expect(input.value).toBe('langsung');
  });

  it('mereset ke nilai awal atau nilai yang diberikan', () => {
    const input = useInput('awal');
    input.value = 'ubah';
    input.reset();
    expect(input.value).toBe('awal');
    input.reset('lain');
    expect(input.value).toBe('lain');
  });
});
