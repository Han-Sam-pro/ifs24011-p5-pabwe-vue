<script setup>
import { LayoutDashboard, Gavel, Users, UserCog } from 'lucide-vue-next';

defineProps({
  isOpen: { type: Boolean, default: false },
});
const emit = defineEmits(['close']);

const menus = [
  { label: 'Dashboard Lelang', to: { name: 'home' }, icon: LayoutDashboard },
  { label: 'Lelang Saya', to: { name: 'home', query: { tab: 'mine' } }, icon: Gavel },
  { label: 'Daftar Pengguna', to: { name: 'users' }, icon: Users },
  { label: 'Profil Saya', to: { name: 'profile' }, icon: UserCog },
];
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
    data-testid="sidebar-backdrop"
    @click="emit('close')"
  />
  <aside
    :class="[
      'fixed inset-y-16 left-0 z-20 w-64 transform border-r border-slate-200 bg-white p-4 transition-transform lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <nav class="flex flex-col gap-1" aria-label="Menu utama">
      <RouterLink
        v-for="menu in menus"
        :key="menu.label"
        :to="menu.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-brand-50 hover:text-primary"
        active-class="bg-brand-50 text-primary"
        @click="emit('close')"
      >
        <component :is="menu.icon" class="h-5 w-5" aria-hidden="true" />
        {{ menu.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
