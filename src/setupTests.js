import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

globalThis.DELCOM_BASEURL = 'https://open-api.delcom.org/api/v1';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
