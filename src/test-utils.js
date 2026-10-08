import { render } from '@testing-library/vue';
import { h } from 'vue';
import { RouterView, createRouter } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory } from 'vue-router';
import { createAppRouter } from '@/router';
import { useAuthStore } from '@/features/auth/states/authStore';
import { useUsersStore } from '@/features/users/states/usersStore';
import { useAucationsStore } from '@/features/aucations/states/aucationsStore';

const clonePlain = (value) => JSON.parse(JSON.stringify(value));

// Ambil state default setiap store sekali, agar state awal parsial tetap lengkap.
function captureDefaultStates() {
  const probe = createPinia();
  setActivePinia(probe);
  const defaults = {
    auth: clonePlain(useAuthStore().$state),
    users: clonePlain(useUsersStore().$state),
    aucations: clonePlain(useAucationsStore().$state),
  };
  setActivePinia(undefined);
  return defaults;
}

const DEFAULT_STATES = captureDefaultStates();

/** Pinia yang sudah aktif; state awal per store digabung dengan default-nya. */
export function createMockPinia(initialState = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const merged = {};
  Object.keys(DEFAULT_STATES).forEach((id) => {
    merged[id] = { ...clonePlain(DEFAULT_STATES[id]), ...(initialState[id] ?? {}) };
  });
  Object.keys(initialState).forEach((id) => {
    if (!merged[id]) merged[id] = initialState[id];
  });
  pinia.state.value = merged;
  return pinia;
}

/** Render komponen dengan Pinia, router memory, dan rute awal. */
export async function renderWithProviders(
  component,
  { props = {}, route = '/', routePattern = null, initialState = {}, global = {} } = {},
) {
  const pinia = createMockPinia(initialState);
  let router;
  let target = component;

  if (routePattern) {
    // Render komponen sebagai rute sungguhan agar parameter (mis. :aucationId) terisi.
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: routePattern, component },
        { path: '/', name: 'home', component: { render: () => null } },
        { path: '/auth/login', name: 'login', component: { render: () => null } },
      ],
    });
    target = { render: () => h(RouterView) };
  } else {
    router = createAppRouter(createMemoryHistory());
  }

  router.push(route);
  await router.isReady();

  const result = render(target, {
    props,
    global: {
      ...global,
      plugins: [pinia, router, ...(global.plugins ?? [])],
    },
  });

  return { ...result, pinia, router };
}

export function mockFetchResponse(body, init = {}) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: init.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}
