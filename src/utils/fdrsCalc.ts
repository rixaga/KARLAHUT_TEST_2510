import type { FDRSClass } from '../types/karhutla.ts';

/**
 * Klasifikasi Indeks FDRS BMKG:
 * FFMC (Fine Fuel Moisture Code):
 * - Aman / Rendah: 0 - 60
 * - Sedang: 61 - 75
 * - Tinggi: 76 - 88
 * - Ekstrem: > 88
 */
export function classifyFFMC(value: number | null | undefined): FDRSClass {
  if (value === null || value === undefined || isNaN(value)) return 'TIDAK_TERSEDIA';
  if (value > 88) return 'EKSTREM';
  if (value >= 76) return 'TINGGI';
  if (value >= 61) return 'SEDANG';
  return 'AMAN';
}

/**
 * FWI (Fire Weather Index - Indeks Cuaca Kebakaran):
 * - Aman: 0 - 6
 * - Sedang: 7 - 13
 * - Tinggi: 14 - 23
 * - Ekstrem: > 23
 */
export function classifyFWI(value: number | null | undefined): FDRSClass {
  if (value === null || value === undefined || isNaN(value)) return 'TIDAK_TERSEDIA';
  if (value > 23) return 'EKSTREM';
  if (value >= 14) return 'TINGGI';
  if (value >= 7) return 'SEDANG';
  return 'AMAN';
}

/**
 * ISI (Initial Spread Index - Indeks Penjalaran Awal):
 * - Aman: 0 - 2
 * - Sedang: 3 - 6
 * - Tinggi: 7 - 12
 * - Ekstrem: > 12
 */
export function classifyISI(value: number | null | undefined): FDRSClass {
  if (value === null || value === undefined || isNaN(value)) return 'TIDAK_TERSEDIA';
  if (value > 12) return 'EKSTREM';
  if (value >= 7) return 'TINGGI';
  if (value >= 3) return 'SEDANG';
  return 'AMAN';
}

export function getFDRSColor(level: FDRSClass): string {
  switch (level) {
    case 'EKSTREM':
      return '#dc2626'; // Red-600
    case 'TINGGI':
      return '#ea580c'; // Orange-600
    case 'SEDANG':
      return '#ca8a04'; // Yellow-600
    case 'AMAN':
      return '#16a34a'; // Green-600
    case 'TIDAK_TERSEDIA':
    default:
      return '#64748b'; // Slate-500
  }
}

export function getFDRSBadge(level: FDRSClass): { label: string; bg: string; text: string; border: string } {
  switch (level) {
    case 'EKSTREM':
      return { label: 'Sangat Mudah Terbakar (Ekstrem)', bg: 'bg-red-950/60', text: 'text-red-300', border: 'border-red-700/60' };
    case 'TINGGI':
      return { label: 'Mudah Terbakar (Tinggi)', bg: 'bg-orange-950/60', text: 'text-orange-300', border: 'border-orange-700/60' };
    case 'SEDANG':
      return { label: 'Sedang (Waspada)', bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/60' };
    case 'AMAN':
      return { label: 'Aman / Rendah', bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-700/60' };
    case 'TIDAK_TERSEDIA':
    default:
      return { label: 'Data Tidak Tersedia (N/A)', bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-800' };
  }
}
