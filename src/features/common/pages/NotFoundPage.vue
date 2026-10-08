<script setup>
import { RouterLink } from 'vue-router';
import { SearchX } from 'lucide-vue-next';
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
    <SearchX class="h-16 w-16 text-primary" aria-hidden="true" />
    <p class="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
    <h1 class="text-3xl font-extrabold text-ink-900">Halaman tidak ditemukan</h1>
    <p class="max-w-md text-slate-500">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
    <RouterLink
      to="/"
      class="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover"
    >
      Kembali ke beranda
    </RouterLink>
  </main>
</template>
