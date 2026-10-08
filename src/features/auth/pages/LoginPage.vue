<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../states/authStore';
import { useInput } from '@/hooks/useInput';
import { showSuccessDialog, showErrorDialog } from '@/helpers/toolsHelper';
import { reactive } from 'vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = useInput('');
const password = useInput('');
const errors = reactive({});

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  if (!email.value.trim()) errors.email = 'Email wajib diisi';
  if (!password.value) errors.password = 'Kata sandi wajib diisi';
  return Object.keys(errors).length === 0;
}

function safeRedirect() {
  const target = route.query.redirect;
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

async function onSubmit() {
  if (!validate()) return;
  const result = await authStore.login(email.value.trim(), password.value);
  if (result.ok) {
    await showSuccessDialog('Login berhasil', `Selamat datang, ${result.user.name}`);
    router.push(safeRedirect());
  } else {
    showErrorDialog('Login gagal', result.message);
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-extrabold text-ink-900">Masuk</h1>
    <p class="mt-2 text-slate-500">Masuk untuk mulai memasang dan menawar lelang.</p>

    <form class="mt-8 flex flex-col gap-5" novalidate data-testid="login-form" @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-700">Email</span>
        <input
          id="login-email-input"
          :value="email.value"
          type="email"
          name="email"
          class="rounded-xl border border-slate-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none"
          @input="email.onChange"
        />
        <span v-if="errors.email || authStore.validation.email" class="text-xs text-red-700">
          {{ errors.email || authStore.validation.email[0] }}
        </span>
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-700">Kata sandi</span>
        <input
          id="login-password-input"
          :value="password.value"
          type="password"
          name="password"
          class="rounded-xl border border-slate-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none"
          @input="password.onChange"
        />
        <span v-if="errors.password" class="text-xs text-red-700">{{ errors.password }}</span>
      </label>

      <button
        id="login-submit-button"
        type="submit"
        :disabled="authStore.isAuthLogin"
        class="rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {{ authStore.isAuthLogin ? 'Memproses...' : 'Masuk' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-primary hover:underline">Daftar sekarang</RouterLink>
    </p>
  </div>
</template>
