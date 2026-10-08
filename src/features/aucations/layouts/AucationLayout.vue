<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import NavbarComponent from '../components/NavbarComponent.vue';
import SidebarComponent from '../components/SidebarComponent.vue';

const isDrawerOpen = ref(false);
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <NavbarComponent @toggle-sidebar="isDrawerOpen = !isDrawerOpen" />
    <div class="flex">
      <SidebarComponent :is-open="isDrawerOpen" @close="isDrawerOpen = false" />
      <main class="w-full p-4 sm:p-6 lg:ml-64">
        <RouterView />
      </main>
    </div>
  </div>
</template>
