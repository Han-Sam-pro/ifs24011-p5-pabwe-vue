<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, LogOut } from 'lucide-vue-next';
import { useAuthStore } from '@/features/auth/states/authStore';
import { useUsersStore } from '@/features/users/states/usersStore';
import { showConfirmDialog } from '@/helpers/toolsHelper';

const emit = defineEmits(['toggle-sidebar']);
const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const displayName = computed(() => usersStore.profile?.name ?? 'Akun Saya');
const displayPhoto = computed(() => usersStore.profile?.photo ?? '');

onMounted(() => {
  if (!usersStore.profile) {
    usersStore.fetchProfile();
  }
});

async function onLogout() {
  const confirmed = await showConfirmDialog('Keluar dari akun?', 'Anda perlu login kembali untuk mengakses lelang.');
  if (!confirmed) return;
  await authStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Buka menu"
        data-testid="toggle-sidebar"
        @click="emit('toggle-sidebar')"
      >
        <Menu class="h-5 w-5" />
      </button>
      <RouterLink to="/" class="text-lg font-extrabold text-ink-900">Delcom Auction</RouterLink>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <img
          v-if="displayPhoto"
          :src="displayPhoto"
          alt="Foto profil"
          class="h-9 w-9 rounded-full object-cover"
        />
        <span class="hidden text-sm font-semibold text-slate-700 sm:inline" data-testid="navbar-name">
          {{ displayName }}
        </span>
      </div>
      <button
        type="button"
        class="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
        data-testid="logout-button"
        @click="onLogout"
      >
        <LogOut class="h-4 w-4" />
        <span class="hidden sm:inline">Keluar</span>
      </button>
    </div>
  </header>
</template>
