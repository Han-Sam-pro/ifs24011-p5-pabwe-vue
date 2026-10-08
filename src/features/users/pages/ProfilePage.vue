<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useUsersStore } from '../states/usersStore';
import { useAucationsStore } from '@/features/aucations/states/aucationsStore';
import { useInput } from '@/hooks/useInput';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/helpers/toolsHelper';

const usersStore = useUsersStore();
const aucationsStore = useAucationsStore();

const name = useInput('');
const email = useInput('');
const oldPassword = useInput('');
const newPassword = useInput('');
const newPasswordConfirmation = useInput('');
const passwordErrors = reactive({});
const photoFile = ref(null);

watch(
  () => usersStore.profile,
  (profile) => {
    name.reset(profile?.name ?? '');
    email.reset(profile?.email ?? '');
  },
  { immediate: true },
);

async function onProfileSubmit() {
  const result = await usersStore.updateProfile(name.value.trim(), email.value.trim());
  if (result.ok) {
    await showSuccessDialog('Profil diperbarui', result.message);
  } else {
    showErrorDialog('Gagal memperbarui profil', result.message);
  }
}

function onPhotoChange(event) {
  photoFile.value = event.target.files?.[0] ?? null;
}

async function onPhotoSubmit() {
  if (!photoFile.value) {
    showErrorDialog('Pilih foto', 'Silakan pilih berkas foto terlebih dahulu.');
    return;
  }
  const result = await usersStore.changePhoto(photoFile.value);
  if (result.ok) {
    await showSuccessDialog('Foto diperbarui', result.message);
    photoFile.value = null;
  } else {
    showErrorDialog('Gagal mengunggah foto', result.message);
  }
}

function validatePassword() {
  Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);
  if (!oldPassword.value) passwordErrors.password = 'Kata sandi lama wajib diisi';
  if (newPassword.value.length < 6) passwordErrors.newPassword = 'Kata sandi baru minimal 6 karakter';
  if (newPasswordConfirmation.value !== newPassword.value) passwordErrors.newPasswordConfirmation = 'Konfirmasi tidak sama';
  return Object.keys(passwordErrors).length === 0;
}

async function onPasswordSubmit() {
  if (!validatePassword()) return;
  const result = await usersStore.changePassword({
    password: oldPassword.value,
    newPassword: newPassword.value,
    newPasswordConfirmation: newPasswordConfirmation.value,
  });
  if (result.ok) {
    oldPassword.reset();
    newPassword.reset();
    newPasswordConfirmation.reset();
    await showSuccessDialog('Kata sandi diubah', result.message);
  } else {
    showErrorDialog('Gagal mengubah kata sandi', result.message);
  }
}

async function onDeleteAll() {
  const confirmed = await showConfirmDialog('Hapus semua lelang Anda?', 'Seluruh lelang milik Anda beserta foto dan penawarannya akan dihapus permanen.');
  if (!confirmed) return;
  const result = await aucationsStore.removeAllAucations();
  if (result.ok) {
    await showSuccessDialog('Lelang dihapus', result.message);
  } else {
    showErrorDialog('Gagal menghapus', result.message);
  }
}

onMounted(() => {
  usersStore.fetchProfile();
});
</script>

<template>
  <section class="grid gap-6 xl:grid-cols-2">
    <header class="xl:col-span-2">
      <h1 class="text-2xl font-extrabold text-ink-900">Profil Saya</h1>
      <p class="text-sm text-slate-500">Kelola informasi akun, foto profil, dan kata sandi Anda.</p>
    </header>

    <div class="flex flex-col gap-6">
      <div class="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <img
          v-if="usersStore.profile?.photo"
          :src="usersStore.profile.photo"
          alt="Foto profil"
          class="h-20 w-20 rounded-full object-cover bg-slate-100"
        />
        <div>
          <p class="text-lg font-bold text-ink-900">{{ usersStore.profile?.name ?? '-' }}</p>
          <p class="text-sm text-slate-500">{{ usersStore.profile?.email ?? '-' }}</p>
        </div>
      </div>

      <form class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200" novalidate data-testid="profile-form" @submit.prevent="onProfileSubmit">
        <h2 class="text-lg font-bold text-ink-900">Informasi Akun</h2>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold text-slate-700">Nama</span>
          <input :value="name.value" type="text" name="name" class="rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" @input="name.onChange" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold text-slate-700">Email</span>
          <input :value="email.value" type="email" name="email" class="rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" @input="email.onChange" />
        </label>
        <span v-if="usersStore.validation.email" class="text-xs text-red-600">{{ usersStore.validation.email[0] }}</span>
        <button type="submit" :disabled="usersStore.isProfileMutation" class="rounded-xl bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          Simpan Profil
        </button>
      </form>

      <form class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200" novalidate @submit.prevent="onPhotoSubmit">
        <h2 class="text-lg font-bold text-ink-900">Foto Profil</h2>
        <input type="file" accept="image/*" name="photo" class="text-sm" @change="onPhotoChange" />
        <button type="submit" :disabled="usersStore.isProfileMutation" class="rounded-xl bg-slate-900 py-2.5 font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
          Unggah Foto
        </button>
      </form>
    </div>

    <div class="flex flex-col gap-6">
      <form class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200" novalidate data-testid="password-form" @submit.prevent="onPasswordSubmit">
        <h2 class="text-lg font-bold text-ink-900">Ganti Kata Sandi</h2>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold text-slate-700">Kata sandi lama</span>
          <input :value="oldPassword.value" type="password" name="password" class="rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" @input="oldPassword.onChange" />
          <span v-if="passwordErrors.password || usersStore.validation.password" class="text-xs text-red-600">
            {{ passwordErrors.password || usersStore.validation.password[0] }}
          </span>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold text-slate-700">Kata sandi baru</span>
          <input :value="newPassword.value" type="password" name="new_password" class="rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" @input="newPassword.onChange" />
          <span v-if="passwordErrors.newPassword" class="text-xs text-red-600">{{ passwordErrors.newPassword }}</span>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold text-slate-700">Ulangi kata sandi baru</span>
          <input :value="newPasswordConfirmation.value" type="password" name="new_password_confirmation" class="rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" @input="newPasswordConfirmation.onChange" />
          <span v-if="passwordErrors.newPasswordConfirmation" class="text-xs text-red-600">{{ passwordErrors.newPasswordConfirmation }}</span>
        </label>
        <button type="submit" :disabled="usersStore.isProfileMutation" class="rounded-xl bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          Ubah Kata Sandi
        </button>
      </form>

      <div class="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 class="text-lg font-bold text-red-700">Zona Berbahaya</h2>
        <p class="text-sm text-red-600">Menghapus seluruh lelang Anda bersifat permanen.</p>
        <button
          type="button"
          :disabled="aucationsStore.isAucationDeleteAll"
          class="rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          data-testid="delete-all-button"
          @click="onDeleteAll"
        >
          Hapus Semua Lelang Saya
        </button>
      </div>
    </div>
  </section>
</template>
