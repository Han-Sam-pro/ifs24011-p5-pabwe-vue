import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.APP_PORT || process.env.APP_PORT || 5173);
  const delcomBaseUrl = env.VITE_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1';

  return {
    plugins: [vue(), tailwindcss()],
    build: {
      // Toast UI Editor cukup besar; batas default 500 kB akan selalu memberi peringatan.
      chunkSizeWarningLimit: 1200,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port,
      strictPort: true,
    },
    preview: {
      port,
      strictPort: true,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(delcomBaseUrl),
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/setupTests.js'],
      include: ['src/**/*.{test,spec}.{js,jsx}'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,vue}'],
        exclude: ['src/main.js', 'src/setupTests.js', 'src/test-utils.js', 'src/**/*.test.js'],
        reporter: ['text', 'html'],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});
