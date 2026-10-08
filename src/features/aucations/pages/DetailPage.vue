<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { Pencil, Image, Trash2, Gavel, ArrowLeft } from 'lucide-vue-next';
import { useAucationsStore } from '../states/aucationsStore';
import { useUsersStore } from '@/features/users/states/usersStore';
import MarkdownViewer from '../components/MarkdownViewer.vue';
import ChangeModal from '../components/modals/ChangeModal.vue';
import ChangeCoverModal from '../components/modals/ChangeCoverModal.vue';
import BidModal from '../components/modals/BidModal.vue';
import {
  formatDate,
  formatRupiah,
  getHighestBid,
  getRemainingLabel,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from '@/helpers/toolsHelper';

const route = useRoute();
const router = useRouter();
const store = useAucationsStore();
const usersStore = useUsersStore();

const isChangeOpen = ref(false);
const isCoverOpen = ref(false);
const isBidOpen = ref(false);

const aucationId = computed(() => route.params.aucationId);
const item = computed(() => store.aucation);
const isOwner = computed(() => Boolean(item.value && usersStore.profile && item.value.user_id === usersStore.profile.id));
const myBid = computed(() => item.value?.my_bid ?? null);
const highestBid = computed(() => getHighestBid(item.value?.bids));
const bidList = computed(() => (item.value?.bids ?? []).filter((bid) => bid && typeof bid === 'object'));

async function load() {
  await Promise.all([store.fetchAucation(aucationId.value), usersStore.fetchProfile()]);
}

async function runAndReload(request, successTitle, successText) {
  const result = await request();
  if (result.ok) {
    await showSuccessDialog(successTitle, successText);
    return true;
  }
  showErrorDialog('Permintaan gagal', result.message);
  return false;
}

async function onChangeSubmit(payload) {
  const ok = await runAndReload(() => store.changeAucation(aucationId.value, payload), 'Lelang diperbarui', 'Perubahan data lelang tersimpan.');
  if (ok) {
    isChangeOpen.value = false;
    await store.fetchAucation(aucationId.value);
  }
}

async function onCoverSubmit(file) {
  const ok = await runAndReload(() => store.changeCover(aucationId.value, file), 'Cover diperbarui', 'Foto cover berhasil diunggah.');
  if (ok) isCoverOpen.value = false;
}

async function onDelete() {
  const confirmed = await showConfirmDialog('Hapus lelang ini?', 'Tindakan ini tidak bisa dibatalkan.');
  if (!confirmed) return;
  const result = await store.removeAucation(aucationId.value);
  if (result.ok) {
    await showSuccessDialog('Lelang dihapus', 'Lelang berhasil dihapus.');
    router.push({ name: 'home' });
  } else {
    showErrorDialog('Gagal menghapus', result.message);
  }
}

async function onBidSubmit(bid) {
  const ok = await runAndReload(() => store.addBid(aucationId.value, bid), 'Penawaran terkirim', 'Penawaran Anda sudah tercatat.');
  if (ok) isBidOpen.value = false;
}

async function onCancelBid() {
  const confirmed = await showConfirmDialog('Batalkan penawaran?', 'Penawaran Anda pada lelang ini akan dihapus.');
  if (!confirmed) return;
  await runAndReload(() => store.removeBid(aucationId.value), 'Penawaran dibatalkan', 'Penawaran Anda telah dibatalkan.');
}

watch(aucationId, load);
onMounted(load);
</script>

<template>
  <section class="flex flex-col gap-6">
    <RouterLink to="/" class="flex w-fit items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
      <ArrowLeft class="h-4 w-4" /> Kembali ke dashboard
    </RouterLink>

    <p v-if="store.isAucation" class="text-slate-500">Memuat detail lelang...</p>
    <p v-else-if="!item" class="rounded-2xl bg-white p-10 text-center text-slate-500 ring-1 ring-slate-200">
      Lelang tidak ditemukan.
    </p>

    <template v-else>
      <div class="grid gap-6 lg:grid-cols-5">
        <div class="flex flex-col gap-4 lg:col-span-3">
          <img :src="item.cover" :alt="`Cover ${item.title}`" class="w-full rounded-2xl bg-slate-100 object-cover shadow-sm" />
          <div class="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <h2 class="mb-3 text-lg font-bold text-ink-900">Deskripsi</h2>
            <MarkdownViewer :content="item.description" />
          </div>
        </div>

        <aside class="flex flex-col gap-4 lg:col-span-2">
          <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h1 class="text-2xl font-extrabold text-ink-900">{{ item.title }}</h1>
            <p class="mt-1 text-sm text-slate-500">Oleh {{ item.author?.name ?? '-' }}</p>
            <dl class="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt class="text-slate-500">Harga awal</dt>
                <dd class="font-semibold">{{ formatRupiah(item.start_bid) }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Tawaran tertinggi</dt>
                <dd class="font-semibold text-brand-700">{{ highestBid === null ? 'Belum ada' : formatRupiah(highestBid) }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Ditutup</dt>
                <dd class="font-semibold">{{ formatDate(item.closed_at) }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Sisa waktu</dt>
                <dd class="font-semibold">{{ getRemainingLabel(item.closed_at) }}</dd>
              </div>
            </dl>

            <div v-if="isOwner" class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button type="button" class="flex items-center justify-center gap-1 rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white" @click="isChangeOpen = true">
                <Pencil class="h-4 w-4" /> Ubah
              </button>
              <button type="button" class="flex items-center justify-center gap-1 rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white" @click="isCoverOpen = true">
                <Image class="h-4 w-4" /> Cover
              </button>
              <button type="button" class="flex items-center justify-center gap-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white" @click="onDelete">
                <Trash2 class="h-4 w-4" /> Hapus
              </button>
            </div>

            <div v-else class="mt-6">
              <button
                v-if="myBid"
                type="button"
                class="w-full rounded-xl border border-red-300 py-2.5 font-semibold text-red-600 hover:bg-red-50"
                @click="onCancelBid"
              >
                Batalkan Penawaran Saya ({{ formatRupiah(myBid.bid) }})
              </button>
              <button
                v-else
                type="button"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700"
                @click="isBidOpen = true"
              >
                <Gavel class="h-4 w-4" /> Ajukan Penawaran
              </button>
            </div>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 class="mb-3 text-lg font-bold text-ink-900">Riwayat Penawaran</h2>
            <p v-if="bidList.length === 0" class="text-sm text-slate-500">Belum ada penawaran.</p>
            <ul v-else class="flex flex-col divide-y divide-slate-100" data-testid="bid-history">
              <li v-for="bid in bidList" :key="bid.id" class="flex items-center justify-between py-2.5 text-sm">
                <span class="font-semibold text-slate-800">{{ formatRupiah(bid.bid) }}</span>
                <span class="text-slate-500">{{ formatDate(bid.created_at) }}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <ChangeModal :open="isChangeOpen" :loading="store.isAucationChange" :aucation="item" :validation="store.validation" @close="isChangeOpen = false" @submit="onChangeSubmit" />
      <ChangeCoverModal :open="isCoverOpen" :loading="store.isAucationChangeCover" @close="isCoverOpen = false" @submit="onCoverSubmit" />
      <BidModal :open="isBidOpen" :loading="store.isBidAdd" :start-bid="item.start_bid" :highest-bid="highestBid" @close="isBidOpen = false" @submit="onBidSubmit" />
    </template>
  </section>
</template>
