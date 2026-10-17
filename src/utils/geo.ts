import type { WorkingProvince } from '../types/karhutla.ts';

export interface PriorityRegency {
  id: string;
  name: string;
  province: WorkingProvince;
  latitude: number;
  longitude: number;
  peatlandAreaHa: number;
  fireProneLevel: 'SANGAT_RAWAN' | 'RAWAN' | 'SEDANG';
  bpbdContact: string;
}

export const PROVINCE_VIEW_CONFIGS: Record<WorkingProvince, { center: [number, number]; zoom: number; label: string }> = {
  'SEMUA': { center: [-1.4, 114.0], zoom: 5, label: 'Nasional (Seluruh Indonesia)' },
  'Riau': { center: [0.5071, 101.4478], zoom: 7, label: 'Provinsi Riau' },
  'Jambi': { center: [-1.6101, 103.6131], zoom: 7, label: 'Provinsi Jambi' },
  'Sumatera Selatan': { center: [-3.3194, 104.9147], zoom: 7, label: 'Provinsi Sumatera Selatan' },
  'Kalimantan Barat': { center: [-0.0263, 109.3425], zoom: 6, label: 'Provinsi Kalimantan Barat' },
  'Kalimantan Tengah': { center: [-1.6815, 113.3824], zoom: 6, label: 'Provinsi Kalimantan Tengah' },
  'Kalimantan Selatan': { center: [-3.0926, 115.2838], zoom: 7, label: 'Provinsi Kalimantan Selatan' },
};

export const PRIORITY_20_REGENCIES: PriorityRegency[] = [
  { id: 'REG-1', name: 'Kab. Ogan Komering Ilir', province: 'Sumatera Selatan', latitude: -3.3765, longitude: 105.1234, peatlandAreaHa: 1024500, fireProneLevel: 'SANGAT_RAWAN', bpbdContact: 'Pusdalops BPBD OKI: 0712-321113' },
  { id: 'REG-2', name: 'Kab. Pelalawan', province: 'Riau', latitude: 0.2833, longitude: 102.1333, peatlandAreaHa: 890400, fireProneLevel: 'SANGAT_RAWAN', bpbdContact: 'Pusdalops BPBD Pelalawan: 0761-493113' },
  { id: 'REG-3', name: 'Kab. Bengkalis', province: 'Riau', latitude: 1.4822, longitude: 102.1345, peatlandAreaHa: 765200, fireProneLevel: 'SANGAT_RAWAN', bpbdContact: 'Pusdalops BPBD Bengkalis: 0766-21113' },
  { id: 'REG-4', name: 'Kab. Kotawaringin Timur', province: 'Kalimantan Tengah', latitude: -2.0833, longitude: 112.7500, peatlandAreaHa: 685000, fireProneLevel: 'SANGAT_RAWAN', bpbdContact: 'Pusdalops BPBD Kotim: 0531-21113' },
  { id: 'REG-5', name: 'Kab. Ketapang', province: 'Kalimantan Barat', latitude: -1.8500, longitude: 109.9833, peatlandAreaHa: 720000, fireProneLevel: 'SANGAT_RAWAN', bpbdContact: 'Pusdalops BPBD Ketapang: 0534-32113' },
  { id: 'REG-6', name: 'Kab. Pulang Pisau', province: 'Kalimantan Tengah', latitude: -2.7500, longitude: 114.2500, peatlandAreaHa: 550000, fireProneLevel: 'SANGAT_RAWAN', bpbdContact: 'Pusdalops BPBD Pulpis: 0536-61113' },
  { id: 'REG-7', name: 'Kab. Muaro Jambi', province: 'Jambi', latitude: -1.5333, longitude: 103.8167, peatlandAreaHa: 410300, fireProneLevel: 'RAWAN', bpbdContact: 'Pusdalops BPBD Muaro Jambi: 0741-61113' },
  { id: 'REG-8', name: 'Kab. Musi Banyuasin', province: 'Sumatera Selatan', latitude: -2.4833, longitude: 103.8833, peatlandAreaHa: 620500, fireProneLevel: 'SANGAT_RAWAN', bpbdContact: 'Pusdalops BPBD Muba: 0714-321113' },
  { id: 'REG-9', name: 'Kab. Siak', province: 'Riau', latitude: 0.8000, longitude: 102.0333, peatlandAreaHa: 520000, fireProneLevel: 'RAWAN', bpbdContact: 'Pusdalops BPBD Siak: 0764-81113' },
  { id: 'REG-10', name: 'Kab. Kubu Raya', province: 'Kalimantan Barat', latitude: -0.1500, longitude: 109.4000, peatlandAreaHa: 495000, fireProneLevel: 'RAWAN', bpbdContact: 'Pusdalops BPBD Kubu Raya: 0561-71113' },
  { id: 'REG-11', name: 'Kab. Kapuas', province: 'Kalimantan Tengah', latitude: -2.3333, longitude: 114.3833, peatlandAreaHa: 640000, fireProneLevel: 'SANGAT_RAWAN', bpbdContact: 'Pusdalops BPBD Kapuas: 0536-81113' },
  { id: 'REG-12', name: 'Kab. Tanjung Jabung Timur', province: 'Jambi', latitude: -1.1500, longitude: 103.8667, peatlandAreaHa: 380000, fireProneLevel: 'RAWAN', bpbdContact: 'Pusdalops BPBD Tanjabtim: 0740-41113' },
  { id: 'REG-13', name: 'Kota Dumai', province: 'Riau', latitude: 1.6667, longitude: 101.4500, peatlandAreaHa: 172000, fireProneLevel: 'RAWAN', bpbdContact: 'Pusdalops BPBD Dumai: 0765-31113' },
  { id: 'REG-14', name: 'Kab. Banjar', province: 'Kalimantan Selatan', latitude: -3.3167, longitude: 114.9833, peatlandAreaHa: 215000, fireProneLevel: 'RAWAN', bpbdContact: 'Pusdalops BPBD Banjar: 0511-471113' },
  { id: 'REG-15', name: 'Kab. Tanah Laut', province: 'Kalimantan Selatan', latitude: -3.8833, longitude: 114.8500, peatlandAreaHa: 180000, fireProneLevel: 'RAWAN', bpbdContact: 'Pusdalops BPBD Tala: 0512-21113' },
  { id: 'REG-16', name: 'Kab. Rokan Hilir', province: 'Riau', latitude: 2.1500, longitude: 100.8167, peatlandAreaHa: 460000, fireProneLevel: 'RAWAN', bpbdContact: 'Pusdalops BPBD Rohil: 0767-21113' },
  { id: 'REG-17', name: 'Kab. Sanggau', province: 'Kalimantan Barat', latitude: 0.1167, longitude: 110.5833, peatlandAreaHa: 290000, fireProneLevel: 'SEDANG', bpbdContact: 'Pusdalops BPBD Sanggau: 0564-21113' },
  { id: 'REG-18', name: 'Kota Palangka Raya', province: 'Kalimantan Tengah', latitude: -2.2088, longitude: 113.9140, peatlandAreaHa: 240000, fireProneLevel: 'RAWAN', bpbdContact: 'Pusdalops BPBD Palangka Raya: 0536-322113' },
  { id: 'REG-19', name: 'Kab. Ogan Ilir', province: 'Sumatera Selatan', latitude: -3.4333, longitude: 104.6500, peatlandAreaHa: 195000, fireProneLevel: 'RAWAN', bpbdContact: 'Pusdalops BPBD Ogan Ilir: 0711-581113' },
  { id: 'REG-20', name: 'Kab. Barito Selatan', province: 'Kalimantan Tengah', latitude: -1.7500, longitude: 114.9167, peatlandAreaHa: 310000, fireProneLevel: 'SEDANG', bpbdContact: 'Pusdalops BPBD Barsel: 0525-21113' },
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function findNearestPriorityRegency(lat: number, lon: number): { regency: PriorityRegency; distanceKm: number } | null {
  let closest: PriorityRegency | null = null;
  let minDist = Infinity;

  for (const reg of PRIORITY_20_REGENCIES) {
    const dist = calculateDistanceKm(lat, lon, reg.latitude, reg.longitude);
    if (dist < minDist) {
      minDist = dist;
      closest = reg;
    }
  }

  if (closest && minDist <= 150) {
    return { regency: closest, distanceKm: Math.round(minDist * 10) / 10 };
  }
  return null;
}
