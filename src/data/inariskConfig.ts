import type { InaRiskLayerConfig } from '../types/karhutla.ts';

/**
 * Konfigurasi Endpoint Resmi ArcGIS REST InaRISK & Geoportal BNPB
 * Sumber: Direktorat Pemetaan dan Evaluasi Risiko Bencana (Dit. PERB) BNPB
 * GIS Portal: https://gis.bnpb.go.id/arcgis/rest/services
 */
export const INARISK_LAYERS: InaRiskLayerConfig[] = [
  {
    id: 'inarisk-bahaya-karhutla',
    name: 'InaRISK: Peta Bahaya Karhutla (Geoportal BNPB)',
    type: 'Bahaya',
    serviceUrl: 'https://gis.bnpb.go.id/arcgis/rest/services/inaRISK/Bahaya_Karhutla_2024/ImageServer',
    opacity: 0.65,
    visible: true,
    source: 'Dit. Pemetaan dan Evaluasi Risiko Bencana BNPB (InaRISK)',
    status: 'ONLINE',
    description: 'Peta zonasi tingkat bahaya kebakaran hutan dan lahan berdasarkan riwayat hotspot, jenis tutupan lahan, jenis tanah gambut, dan iklim.',
    lastUpdated: 'Publikasi Geoportal BNPB',
    provenance: 'RESMI_TERVERIFIKASI'
  },
  {
    id: 'bnpb-batas-administrasi',
    name: 'Batas Administrasi Wilayah (BIG & BNPB)',
    type: 'Kapasitas',
    serviceUrl: 'https://gis.bnpb.go.id/arcgis/rest/services/Batas_Administrasi/MapServer',
    opacity: 0.85,
    visible: true,
    source: 'Badan Informasi Geospasial (BIG) & Geoportal BNPB',
    status: 'ONLINE',
    description: 'Batas administrasi resmi provinsi dan kabupaten/kota seluruh Indonesia untuk agregasi spasial.',
    lastUpdated: 'Geoportal BNPB',
    provenance: 'RESMI_TERVERIFIKASI'
  }
];
