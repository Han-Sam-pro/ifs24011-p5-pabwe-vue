<script setup>
import { reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../states/authStore';
import { useInput } from '@/hooks/useInput';
import { showSuccessDialog, showErrorDialog } from '@/helpers/toolsHelper';

const router = useRouter();
const authStore = useAuthStore();

const name = useInput('');
const email = useInput('');
const password = useInput('');
const passwordConfirmation = useInput('');
const errors = reactive({});

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  if (!name.value.trim()) errors.name = 'Nama wajib diisi';
  if (!email.value.trim()) errors.email = 'Email wajib diisi';
  if (password.value.length < 6) errors.password = 'Kata sandi minimal 6 karakter';
  if (passwordConfirmation.value !== password.value) errors.passwordConfirmation = 'Konfirmasi kata sandi tidak sama';
  return Object.keys(errors).length === 0;
}

async function onSubmit() {
  if (!validate()) return;
  const result = await authStore.register(name.value.trim(), email.value.trim(), password.value);
  if (result.ok) {
    await showSuccessDialog('Registrasi berhasil', 'Silakan masuk dengan akun Anda.');
    router.push({ name: 'login' });
  } else {
    showErrorDialog('Registrasi gagal', result.message);
  }
}

function fieldError(key, apiKey) {
  return errors[key] || authStore.validation[apiKey]?.[0] || '';
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-extrabold text-ink-900">Buat akun</h1>
    <p class="mt-2 text-slate-500">Daftar gratis dan mulai lelang pertama Anda.</p>

    <form class="mt-8 flex flex-col gap-5" novalidate data-testid="register-form" @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-700">Nama lengkap</span>
        <input :value="name.value" type="text" name="name" class="rounded-xl border border-slate-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none" @input="name.onChange" />
        <span v-if="fieldError('name', 'name')" class="text-xs text-red-700">{{ fieldError('name', 'name') }}</span>
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-700">Email</span>
        <input :value="email.value" type="email" name="email" class="rounded-xl border border-slate-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none" @input="email.onChange" />
        <span v-if="fieldError('email', 'email')" class="text-xs text-red-700">{{ fieldError('email', 'email') }}</span>
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-700">Kata sandi</span>
        <input :value="password.value" type="password" name="password" class="rounded-xl border border-slate-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none" @input="password.onChange" />
        <span v-if="fieldError('password', 'password')" class="text-xs text-red-700">{{ fieldError('password', 'password') }}</span>
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-700">Ulangi kata sandi</span>
        <input :value="passwordConfirmation.value" type="password" name="password_confirmation" class="rounded-xl border border-slate-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none" @input="passwordConfirmation.onChange" />
        <span v-if="errors.passwordConfirmation" class="text-xs text-red-700">{{ errors.passwordConfirmation }}</span>
      </label>

      <button type="submit" :disabled="authStore.isAuthRegister" class="rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-60">
        {{ authStore.isAuthRegister ? 'Memproses...' : 'Daftar' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">Masuk</RouterLink>
    </p>
  </div>
</template>
