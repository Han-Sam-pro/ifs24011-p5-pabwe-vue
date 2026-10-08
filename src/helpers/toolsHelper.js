import Swal from 'sweetalert2';

const baseOptions = {
  confirmButtonColor: '#059669',
  customClass: { popup: 'rounded-2xl' },
};

export function showSuccessDialog(title, text = '') {
  return Swal.fire({ ...baseOptions, icon: 'success', title, text });
}

export function showErrorDialog(title, text = '') {
  return Swal.fire({ ...baseOptions, icon: 'error', title, text });
}

export async function showConfirmDialog(title, text = '') {
  const result = await Swal.fire({
    ...baseOptions,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
  });
  return result.isConfirmed;
}

export function formatRupiah(value) {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatDate(value) {
  if (!value) {
    return '-';
  }
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Mengubah nilai datetime-local (YYYY-MM-DDTHH:MM) ke format API (YYYY-MM-DD HH:MM:SS). */
export function toApiDateTime(localValue) {
  if (!localValue) {
    return '';
  }
  const [date, time = '00:00'] = String(localValue).split('T');
  const seconds = time.split(':').length === 3 ? '' : ':00';
  return `${date} ${time}${seconds}`;
}

/** Mengubah format API (YYYY-MM-DD HH:MM:SS) ke nilai datetime-local (YYYY-MM-DDTHH:MM). */
export function toInputDateTime(apiValue) {
  if (!apiValue) {
    return '';
  }
  return String(apiValue).replace(' ', 'T').slice(0, 16);
}

function toTimestamp(value) {
  return new Date(String(value).replace(' ', 'T')).getTime();
}

/** Label sisa waktu lelang, misal "2 jam 15 menit lagi" atau "Ditutup". */
export function getRemainingLabel(closedAt, now = Date.now()) {
  const end = toTimestamp(closedAt);
  if (Number.isNaN(end)) {
    return '-';
  }
  const diff = end - now;
  if (diff <= 0) {
    return 'Ditutup';
  }
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours >= 24) {
    return `${Math.floor(hours / 24)} hari lagi`;
  }
  return `${hours} jam ${minutes} menit lagi`;
}

/** Tawaran tertinggi dari daftar bid objek; null bila belum ada data bid berbentuk objek. */
export function getHighestBid(bids) {
  if (!Array.isArray(bids) || bids.length === 0) {
    return null;
  }
  const values = bids
    .map((item) => (item && typeof item === 'object' ? Number(item.bid) : NaN))
    .filter((value) => !Number.isNaN(value));
  return values.length ? Math.max(...values) : null;
}
