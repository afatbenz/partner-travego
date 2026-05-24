import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format nomor telepon ke format internasional Indonesia (+62-XXX-XXXX-XXXX)
 * Mengubah awalan 0 menjadi 62, menghapus karakter non-digit, dan memformat.
 */
export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return '';
  
  // Hapus semua karakter selain angka
  let cleaned = phone.replace(/\D/g, '');
  
  // Jika diawali dengan '0', ubah menjadi '62'
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  // Format nomor menggunakan regex jika panjangnya minimal 10 digit
  // Hasil format: +62-XXX-XXXX-XXXX
  return cleaned.replace(/^(\d{2})(\d{3})(\d{4})(\d+)$/, '+$1-$2-$3-$4');
}
