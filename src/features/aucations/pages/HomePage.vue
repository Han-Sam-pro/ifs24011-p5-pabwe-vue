<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { Plus, Clock, Search } from 'lucide-vue-next';
import { useAucationsStore } from '../states/aucationsStore';
import AddModal from '../components/modals/AddModal.vue';
import { useInput } from '@/hooks/useInput';
import {
  formatRupiah,
  getHighestBid,
  getRemainingLabel,
  showErrorDialog,
  showSuccessDialog,
} from '@/helpers/toolsHelper';

const TABS = [
  { key: 'all', label: 'Semua Lelang', filters: {} },
  { key: 'mine', label: 'Lelang Saya', filters: { isMe: true } },
  { key: 'open', label: 'Lelang Berlangsung', filters: { isClosed: false } },
  { key: 'closed', label: 'Lelang Ditutup', filters: { isClosed: true } },
];

const route = useRoute();
const router = useRouter();
const store = useAucationsStore();
const search = useInput('');
const isAddOpen = ref(false);

const activeTab = computed(() => TABS.find((tab) => tab.key === route.query.tab) ?? TABS[0]);

const filteredAucations = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return store.aucations;
  return store.aucations.filter(
    (item) =>
      item.title?.toLowerCase().includes(keyword) ||
      item.description?.toLowerCase().includes(keyword),
  );
});

async function loadAucations() {
  await store.fetchAucations(activeTab.value.filters);
}

function selectTab(tab) {
  router.push({ name: 'home', query: tab.key === 'all' ? {} : { tab: tab.key } });
}

async function onAddSubmit(payload) {
  const result = await store.addAucation(payload);
  if (result.ok) {
    isAddOpen.value = false;
    await showSuccessDialog('Lelang dibuat', 'Silakan unggah foto cover pada halaman detail.');
    await loadAucations();
  } else {
    showErrorDialog('Gagal membuat lelang', result.message);
  }
}

watch(() => route.query.tab, loadAucations);
onMounted(loadAucations);
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-ink-900">Dashboard Lelang</h1>
        <p class="text-sm text-slate-500">Temukan barang lelang dan ajukan penawaran terbaik Anda.</p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700"
        @click="isAddOpen = true"
      >
        <Plus class="h-4 w-4" /> Tambah Lelang
      </button>
    </header>

    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <nav class="flex flex-wrap gap-2" aria-label="Filter lelang">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          type="button"
          :data-testid="`tab-${tab.key}`"
          :class="[
            'rounded-full px-4 py-1.5 text-sm font-semibold',
            activeTab.key === tab.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100',
          ]"
          @click="selectTab(tab)"
        >
          {{ tab.label }}
        </button>
      </nav>

      <label class="relative w-full lg:w-80">
        <Search class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          :value="search.value"
          type="search"
          name="search"
          placeholder="Cari judul atau deskripsi..."
          class="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 focus:border-brand-500 focus:outline-none"
          @input="search.onChange"
        />
      </label>
    </div>

    <p v-if="store.isAucation" class="text-sm text-slate-500">Memuat lelang...</p>
    <p v-else-if="filteredAucations.length === 0" class="rounded-2xl bg-white p-10 text-center text-slate-500 ring-1 ring-slate-200">
      Belum ada lelang yang sesuai.
    </p>

    <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" data-testid="aucation-list">
      <article
        v-for="item in filteredAucations"
        :key="item.id"
        class="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
        data-testid="aucation-card"
      >
        <img
          :src="item.cover"
          :alt="`Cover ${item.title}`"
          class="h-44 w-full object-cover bg-slate-100"
        />
        <div class="flex flex-1 flex-col gap-3 p-5">
          <h2 class="line-clamp-2 text-lg font-bold text-ink-900">{{ item.title }}</h2>
          <dl class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt class="text-slate-500">Harga awal</dt>
              <dd class="font-semibold text-slate-800">{{ formatRupiah(item.start_bid) }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Tawaran tertinggi</dt>
              <dd class="font-semibold text-brand-700">
                {{ getHighestBid(item.bids) === null ? `${item.bids?.length ?? 0} penawaran` : formatRupiah(getHighestBid(item.bids)) }}
              </dd>
            </div>
          </dl>
          <p class="mt-auto flex items-center gap-1 text-xs text-slate-500">
            <Clock class="h-3.5 w-3.5" aria-hidden="true" />
            {{ getRemainingLabel(item.closed_at) }}
          </p>
          <RouterLink
            :to="{ name: 'aucation-detail', params: { aucationId: item.id } }"
            class="rounded-xl bg-slate-900 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700"
          >
            Lihat Detail
          </RouterLink>
        </div>
      </article>
    </div>

    <AddModal :open="isAddOpen" :loading="store.isAucationAdd" :validation="store.validation" @close="isAddOpen = false" @submit="onAddSubmit" />
  </section>
</template>
