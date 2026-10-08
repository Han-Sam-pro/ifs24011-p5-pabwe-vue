# Delcom Auction — Studi Kasus 3.1 (Vue 3 + Bun)

Aplikasi lelang (Delcom Auction) berbasis **Vue 3 (JavaScript)**, **Pinia**, **Vue Router**, dan **Tailwind CSS v4**,
dengan data dari REST API Delcom: <https://open-api.delcom.org/docs/1.0/api-aucations>.

## Fitur

- **Autentikasi**: login, registrasi, logout, dan guard rute (rute `/auth` hanya untuk tamu, rute lain butuh login).
- **Dashboard lelang**: tab *Semua Lelang*, *Lelang Saya*, *Lelang Berlangsung*, *Lelang Ditutup*, pencarian judul/deskripsi (live search), kartu lelang dengan countdown.
- **Tambah / ubah / hapus lelang**, unggah cover, dan deskripsi Markdown (Toast UI Editor).
- **Detail lelang**: cover, deskripsi Markdown, riwayat penawaran, ajukan atau batalkan penawaran.
- **Daftar pengguna** dan **profil** (ubah data, foto, kata sandi, hapus semua lelang milik sendiri).
- **Pengujian**: Vitest + Testing Library, coverage v8 **100%** (statements, branches, functions, lines).

## Struktur

```
src/
├── helpers/      apiHelper.js (fetch wrapper + token), toolsHelper.js (SweetAlert2, format rupiah/tanggal)
├── hooks/        useInput.js (composable two-way binding)
├── features/
│   ├── auth/       api/ states/authStore.js layouts/ pages/
│   ├── users/      api/ states/usersStore.js pages/
│   ├── aucations/  api/ states/aucationsStore.js layouts/ components/ (modals/) pages/
│   └── common/     pages/NotFoundPage.vue
├── router.js     rute + guard autentikasi
├── main.js       entry point (Pinia, Router)
├── index.css     Tailwind v4 + tema
├── test-utils.js helper render dengan Pinia & router
└── setupTests.js setup Vitest / jest-dom
```

## Menjalankan

Prasyarat: [Bun](https://bun.sh).

```bash
bun install
cp .env.example .env     # sudah tersedia; sesuaikan bila perlu
bun run dev              # http://localhost:<APP_PORT>
```

### Environment (`.env`)

| Variabel | Fungsi | Default |
|---|---|---|
| `APP_PORT` | Port dev/preview Vite | `5173` |
| `VITE_DELCOM_BASEURL` | Base URL API Delcom (di-`define` sebagai `DELCOM_BASEURL`) | `https://open-api.delcom.org/api/v1` |

### Skrip

| Perintah | Keterangan |
|---|---|
| `bun run dev` | Dev server |
| `bun run build` | Build produksi ke `dist/` |
| `bun run preview` | Preview hasil build |
| `bun run test` | Jalankan seluruh tes |
| `bun run coverage` | Tes + laporan coverage (threshold 100%, gagal bila di bawah) |

## Catatan Implementasi

- Token disimpan di `localStorage` (`delcom_access_token`) dan dikirim sebagai `Authorization: Bearer <token>`.
- Pola status mutasi di store konsisten: `isXxx` (sedang berjalan) dan `isXxxed` (sukses), misalnya `isAucationAdd` / `isAucationAdded`.
- Endpoint daftar lelang hanya mengembalikan **ID** penawaran, sehingga kartu di dashboard menampilkan jumlah penawaran; **tawaran tertinggi** ditampilkan di halaman detail (data bid lengkap).
- Dokumentasi API Delcom tidak menyertakan kode HTTP; kegagalan dibaca dari field `status` (`success` / `fail` / `error`).
