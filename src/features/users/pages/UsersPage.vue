<script setup>
import { onMounted } from 'vue';
import { useUsersStore } from '../states/usersStore';
import { formatDate } from '@/helpers/toolsHelper';

const usersStore = useUsersStore();
onMounted(() => usersStore.fetchUsers());
</script>

<template>
  <section class="flex flex-col gap-6">
    <header>
      <h1 class="text-2xl font-extrabold text-ink-900">Daftar Pengguna</h1>
      <p class="text-sm text-slate-500">Seluruh pengguna yang terdaftar di sistem lelang.</p>
    </header>

    <p v-if="usersStore.isUsers" class="text-slate-500">Memuat pengguna...</p>
    <p v-else-if="usersStore.users.length === 0" class="rounded-2xl bg-white p-10 text-center text-slate-500 ring-1 ring-slate-200">
      Belum ada pengguna.
    </p>

    <div v-else class="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table class="w-full text-left text-sm" data-testid="users-table">
        <thead class="bg-slate-50 text-slate-500">
          <tr>
            <th class="px-5 py-3 font-semibold">Pengguna</th>
            <th class="px-5 py-3 font-semibold">Email</th>
            <th class="px-5 py-3 font-semibold">Bergabung</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="user in usersStore.users" :key="user.id" data-testid="user-row">
            <td class="flex items-center gap-3 px-5 py-3">
              <img :src="user.photo" :alt="`Foto ${user.name}`" loading="lazy" decoding="async" class="h-9 w-9 rounded-full object-cover bg-slate-100" />
              <span class="font-semibold text-slate-800">{{ user.name }}</span>
            </td>
            <td class="px-5 py-3 text-slate-600">{{ user.email }}</td>
            <td class="px-5 py-3 text-slate-500">{{ formatDate(user.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
