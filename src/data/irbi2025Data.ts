import type { IRBIRecord } from '../types/karhutla.ts';

/**
 * DATA CONTOH IRBI KARHUTLA - BELUM DIVERIFIKASI RESMI DENGAN BUKU IRBI 2025 ASLI
 * Label Integritas: DEMO_BELUM_TERVERIFIKASI
 * 
 * Nilai bahaya, kerentanan, dan kapasitas di bawah ini merupakan data sampel pengujian tabel.
 * Pembacaan indeks risiko bencana resmi mengacu pada Publikasi Resmi Dit. PERB BNPB.
 */
export const IRBI_2025_RECORDS: IRBIRecord[] = [
  { rank: 1, province: 'Sumatera Selatan', regency: 'Kab. Ogan Komering Ilir', hazardScore: 92.4, vulnerabilityScore: 88.5, capacityScore: 42.1, riskIndex: 218.6, riskClass: 'TINGGI', peatlandAreaHa: 1024500, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 2, province: 'Riau', regency: 'Kab. Pelalawan', hazardScore: 89.2, vulnerabilityScore: 85.0, capacityScore: 44.6, riskIndex: 210.4, riskClass: 'TINGGI', peatlandAreaHa: 890400, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 3, province: 'Kalimantan Tengah', regency: 'Kab. Kotawaringin Timur', hazardScore: 88.0, vulnerabilityScore: 84.1, capacityScore: 41.2, riskIndex: 206.5, riskClass: 'TINGGI', peatlandAreaHa: 685000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 4, province: 'Riau', regency: 'Kab. Bengkalis', hazardScore: 86.5, vulnerabilityScore: 82.3, capacityScore: 45.0, riskIndex: 198.8, riskClass: 'TINGGI', peatlandAreaHa: 765200, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 5, province: 'Kalimantan Barat', regency: 'Kab. Ketapang', hazardScore: 85.1, vulnerabilityScore: 81.7, capacityScore: 40.8, riskIndex: 194.2, riskClass: 'TINGGI', peatlandAreaHa: 720000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 6, province: 'Kalimantan Tengah', regency: 'Kab. Pulang Pisau', hazardScore: 84.8, vulnerabilityScore: 80.2, capacityScore: 39.5, riskIndex: 191.0, riskClass: 'TINGGI', peatlandAreaHa: 550000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 7, province: 'Sumatera Selatan', regency: 'Kab. Musi Banyuasin', hazardScore: 82.6, vulnerabilityScore: 78.4, capacityScore: 43.0, riskIndex: 184.5, riskClass: 'TINGGI', peatlandAreaHa: 620500, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 8, province: 'Kalimantan Tengah', regency: 'Kab. Kapuas', hazardScore: 81.9, vulnerabilityScore: 77.8, capacityScore: 41.0, riskIndex: 181.3, riskClass: 'TINGGI', peatlandAreaHa: 640000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 9, province: 'Jambi', regency: 'Kab. Muaro Jambi', hazardScore: 80.5, vulnerabilityScore: 76.2, capacityScore: 46.2, riskIndex: 175.8, riskClass: 'TINGGI', peatlandAreaHa: 410300, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 10, province: 'Riau', regency: 'Kab. Siak', hazardScore: 79.8, vulnerabilityScore: 75.0, capacityScore: 48.0, riskIndex: 171.2, riskClass: 'TINGGI', peatlandAreaHa: 520000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 11, province: 'Kalimantan Barat', regency: 'Kab. Kubu Raya', hazardScore: 78.4, vulnerabilityScore: 74.3, capacityScore: 44.5, riskIndex: 168.0, riskClass: 'TINGGI', peatlandAreaHa: 495000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 12, province: 'Jambi', regency: 'Kab. Tanjung Jabung Timur', hazardScore: 77.2, vulnerabilityScore: 73.1, capacityScore: 45.1, riskIndex: 164.5, riskClass: 'TINGGI', peatlandAreaHa: 380000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 13, province: 'Riau', regency: 'Kab. Rokan Hilir', hazardScore: 76.5, vulnerabilityScore: 72.8, capacityScore: 43.8, riskIndex: 161.7, riskClass: 'TINGGI', peatlandAreaHa: 460000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 14, province: 'Riau', regency: 'Kota Dumai', hazardScore: 75.0, vulnerabilityScore: 71.5, capacityScore: 49.2, riskIndex: 156.4, riskClass: 'TINGGI', peatlandAreaHa: 172000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 15, province: 'Kalimantan Selatan', regency: 'Kab. Banjar', hazardScore: 74.2, vulnerabilityScore: 70.8, capacityScore: 46.0, riskIndex: 152.0, riskClass: 'TINGGI', peatlandAreaHa: 215000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 16, province: 'Kalimantan Selatan', regency: 'Kab. Tanah Laut', hazardScore: 73.1, vulnerabilityScore: 69.4, capacityScore: 45.5, riskIndex: 148.9, riskClass: 'TINGGI', peatlandAreaHa: 180000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 17, province: 'Sumatera Selatan', regency: 'Kab. Ogan Ilir', hazardScore: 72.5, vulnerabilityScore: 68.2, capacityScore: 47.1, riskIndex: 146.2, riskClass: 'TINGGI', peatlandAreaHa: 195000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 18, province: 'Kalimantan Tengah', regency: 'Kota Palangka Raya', hazardScore: 71.8, vulnerabilityScore: 67.5, capacityScore: 52.0, riskIndex: 141.5, riskClass: 'SEDANG', peatlandAreaHa: 240000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 19, province: 'Kalimantan Barat', regency: 'Kab. Sanggau', hazardScore: 70.4, vulnerabilityScore: 66.1, capacityScore: 48.4, riskIndex: 137.8, riskClass: 'SEDANG', peatlandAreaHa: 290000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' },
  { rank: 20, province: 'Kalimantan Tengah', regency: 'Kab. Barito Selatan', hazardScore: 69.8, vulnerabilityScore: 65.0, capacityScore: 46.5, riskIndex: 135.2, riskClass: 'SEDANG', peatlandAreaHa: 310000, isPriority20: true, provenance: 'DEMO_BELUM_TERVERIFIKASI' }
];
