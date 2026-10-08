<script setup>
import { RouterView } from 'vue-router';
import { Gavel } from 'lucide-vue-next';
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <main class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-2">
          <Gavel class="h-7 w-7 text-primary" aria-hidden="true" />
          <span class="text-lg font-extrabold text-ink-900">Delcom Auction</span>
        </div>
        <RouterView />
      </div>
    </main>
    <aside
      class="hidden flex-col justify-end bg-gradient-to-br from-primary to-emerald-900 p-12 text-white lg:flex"
      aria-hidden="true"
    >
      <p class="text-4xl font-extrabold leading-tight">Lelang barang terbaik, dalam satu genggaman.</p>
      <p class="mt-4 max-w-md text-emerald-100">
        Pasang barang lelang, pantau tawaran tertinggi, dan kelola profil Anda dengan mudah.
      </p>
    </aside>
  </div>
</template>
