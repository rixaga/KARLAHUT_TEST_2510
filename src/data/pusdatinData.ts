import type { PusdatinEventRecord } from '../types/karhutla.ts';

/**
 * DATA SAMPEL CATATAN KEJADIAN KARHUTLA - BELUM DIVERIFIKASI DENGAN LOG RESMI PUSDATIN
 * Label Integritas: DEMO_BELUM_TERVERIFIKASI
 * 
 * Data luas terbakar dan personil berikut merupakan sampel demonstrasi alur pemantauan darurat.
 * Log resmi diperoleh melalui mekanisme sinkronisasi data Pusdalops/Pusdatin BNPB.
 */
export const PUSDATIN_INCIDENT_RECORDS: PusdatinEventRecord[] = [
  {
    eventId: 'DEMO-BNPB-KHT-2026-081',
    date: '2026-10-16',
    province: 'Sumatera Selatan',
    regency: 'Kab. Ogan Komering Ilir',
    burnedAreaHa: 42.5,
    personnelCount: 145,
    waterBombingSorties: 38,
    status: 'PROSES_PEMADAMAN',
    remarks: 'Sampel Demo: Simulasi pemadaman lahan gambut di Kec. Pangkalan Lampam.',
    provenance: 'DEMO_BELUM_TERVERIFIKASI'
  },
  {
    eventId: 'DEMO-BNPB-KHT-2026-079',
    date: '2026-10-15',
    province: 'Riau',
    regency: 'Kab. Pelalawan',
    burnedAreaHa: 28.0,
    personnelCount: 110,
    waterBombingSorties: 24,
    status: 'PENDINGINAN',
    remarks: 'Sampel Demo: Simulasi pembasahan dan penyekatan parit gambut di Kuala Panduk.',
    provenance: 'DEMO_BELUM_TERVERIFIKASI'
  },
  {
    eventId: 'DEMO-BNPB-KHT-2026-076',
    date: '2026-10-14',
    province: 'Kalimantan Tengah',
    regency: 'Kab. Kotawaringin Timur',
    burnedAreaHa: 35.2,
    personnelCount: 95,
    waterBombingSorties: 18,
    status: 'PROSES_PEMADAMAN',
    remarks: 'Sampel Demo: Simulasi pemadaman semak belukar dan gambut di Mentawa Baru Ketapang.',
    provenance: 'DEMO_BELUM_TERVERIFIKASI'
  }
];
