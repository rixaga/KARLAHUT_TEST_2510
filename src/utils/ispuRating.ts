import type { ISPUCategory } from '../types/karhutla.ts';

/**
 * Klasifikasi ISPU Resmi KLHK (Peraturan Menteri LHK No. P.14/2020)
 * 1 - 50: Baik (Hijau)
 * 51 - 100: Sedang (Biru)
 * 101 - 200: Tidak Sehat (Kuning)
 * 201 - 300: Sangat Tidak Sehat (Merah)
 * > 300: Berbahaya (Hitam/Ungu)
 */
export function classifyISPU(value: number | null | undefined): ISPUCategory {
  if (value === null || value === undefined || isNaN(value)) return 'TIDAK_TERSEDIA';
  if (value > 300) return 'BERBAHAYA';
  if (value > 200) return 'SANGAT_TIDAK_SEHAT';
  if (value > 100) return 'TIDAK_SEHAT';
  if (value > 50) return 'SEDANG';
  return 'BAIK';
}

export function getISPUColor(category: ISPUCategory): string {
  switch (category) {
    case 'BERBAHAYA':
      return '#701a75'; // Fuchsia-900 / Black-Purple
    case 'SANGAT_TIDAK_SEHAT':
      return '#dc2626'; // Red-600
    case 'TIDAK_SEHAT':
      return '#ca8a04'; // Yellow-600
    case 'SEDANG':
      return '#2563eb'; // Blue-600
    case 'BAIK':
      return '#16a34a'; // Green-600
    case 'TIDAK_TERSEDIA':
    default:
      return '#64748b'; // Slate-500
  }
}

export function getISPUDescription(category: ISPUCategory): string {
  switch (category) {
    case 'BERBAHAYA':
      return 'Kualitas udara tingkat berbahaya secara umum dapat merugikan kesehatan serius pada seluruh populasi.';
    case 'SANGAT_TIDAK_SEHAT':
      return 'Kualitas udara dapat merugikan kesehatan pada sejumlah segmen populasi terpapar akibat kabut asap karhutla.';
    case 'TIDAK_SEHAT':
      return 'Kualitas udara bersifat merugikan pada manusia atau kelompok hewan yang sensitif, serta merusak estetika.';
    case 'SEDANG':
      return 'Kualitas udara tidak berpengaruh pada kesehatan manusia ataupun hewan tetapi berpengaruh pada tumbuhan rentan.';
    case 'BAIK':
      return 'Kualitas udara sangat baik, tidak memberikan efek negatif terhadap manusia, hewan, dan tumbuhan.';
    case 'TIDAK_TERSEDIA':
    default:
      return 'Data stasiun pemantau kualitas udara belum tersedia atau sensor sedang dalam pemeliharaan.';
  }
}
