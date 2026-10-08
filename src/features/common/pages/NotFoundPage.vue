<script setup>
import { RouterLink } from 'vue-router';
import { SearchX } from 'lucide-vue-next';
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
    <SearchX class="h-16 w-16 text-brand-600" aria-hidden="true" />
    <p class="text-sm font-semibold uppercase tracking-widest text-brand-600">404</p>
    <h1 class="text-3xl font-extrabold text-ink-900">Halaman tidak ditemukan</h1>
    <p class="max-w-md text-slate-500">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
    <RouterLink
      to="/"
      class="rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
    >
      Kembali ke beranda
    </RouterLink>
  </main>
</template>
