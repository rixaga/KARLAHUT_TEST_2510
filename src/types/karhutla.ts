export type TimeRangeFilter = 'HARI_INI' | '7_HARI_TERAKHIR' | 'PRAKIRAAN_10_HARI';

export type WorkingProvince = 
  | 'SEMUA'
  | 'Riau'
  | 'Jambi'
  | 'Sumatera Selatan'
  | 'Kalimantan Barat'
  | 'Kalimantan Tengah'
  | 'Kalimantan Selatan';

export type HotspotSource = 'NASA_FIRMS' | 'SIPONGI_KLHK' | 'SIMULASI_DEMO';

export type HotspotConfidence = 'nominal' | 'high' | 'low' | string;

export type ValidationStatus = 
  | 'OBSERVASI_SATELIT' 
  | 'VERIFIKASI_GROUNDCHECK_BPBD' 
  | 'TERKONFIRMASI_PEMADAM'
  | 'BELUM_TERVERIFIKASI_DEMO';

export type DataProvenance = 'RESMI_TERVERIFIKASI' | 'DEMO_BELUM_TERVERIFIKASI';

export interface Hotspot {
  id: string;
  source: HotspotSource;
  latitude: number;
  longitude: number;
  brightness: number | null; // Kelvin (null if missing)
  acq_date: string; // YYYY-MM-DD
  acq_time: string; // HH:MM or HHMM
  satellite: string; // VIIRS-SNPP, NOAA-20, MODIS-Aqua, MODIS-Terra
  confidence: HotspotConfidence;
  frp: number | null; // MW (null if missing)
  daynight?: 'D' | 'N';
  province: string;
  regency: string;
  district?: string;
  village?: string;
  validationStatus: ValidationStatus;
  provenance: DataProvenance;
  isForecast?: boolean; // Hotspot besok tidak boleh observasi
}

export interface SiPongiRegencySummary {
  province: string;
  regency: string;
  hotspotCount: number;
  highConfidenceCount: number;
  period: string;
  satellite: string;
  provenance: DataProvenance;
}

export type RiskClass = 'TINGGI' | 'SEDANG' | 'RENDAH' | 'BELUM_TERSEDIA';

export interface IRBIRecord {
  rank: number;
  province: string;
  regency: string;
  hazardScore: number | null;
  vulnerabilityScore: number | null;
  capacityScore: number | null;
  riskIndex: number | null;
  riskClass: RiskClass;
  peatlandAreaHa: number | null;
  isPriority20: boolean;
  provenance: DataProvenance;
}

export type FDRSClass = 'AMAN' | 'SEDANG' | 'TINGGI' | 'EKSTREM' | 'TIDAK_TERSEDIA';

export interface BMKGFDRSRecord {
  province: string;
  regency: string;
  date: string;
  ffmc: number | null; // Fine Fuel Moisture Code
  ffmcClass: FDRSClass;
  fwi: number | null; // Fire Weather Index
  fwiClass: FDRSClass;
  isi: number | null; // Initial Spread Index
  isiClass: FDRSClass;
  rainProbability: number | null; // %
  windSpeedKmH: number | null;
  windDirection: string;
  smokeHazeRisk: 'NIHIL' | 'RINGAN' | 'SEDANG' | 'PEKAT' | 'TIDAK_TERSEDIA';
  isForecast: boolean;
  forecastDay: number; // 0: Hari ini, 1-10: Prakiraan
  dataSource: 'BMKG_OFFICIAL' | 'OPEN_METEO_PROTOTYPE' | 'DEMO_BELUM_TERVERIFIKASI';
  provenance: DataProvenance;
}

export type ISPUCategory = 'BAIK' | 'SEDANG' | 'TIDAK_SEHAT' | 'SANGAT_TIDAK_SEHAT' | 'BERBAHAYA' | 'TIDAK_TERSEDIA';

export interface ISPUSiteRecord {
  stationId: string;
  stationName: string;
  province: string;
  city: string;
  timestamp: string;
  pm25: number | null;
  pm10: number | null;
  co: number | null;
  so2: number | null;
  no2: number | null;
  o3: number | null;
  maxParam: string;
  ispuValue: number | null;
  category: ISPUCategory;
  source: 'KLHK_DITJEN_PPKL' | 'DEMO_AQMS';
  provenance: DataProvenance;
}

export interface PusdatinEventRecord {
  eventId: string;
  date: string;
  province: string;
  regency: string;
  burnedAreaHa: number | null;
  personnelCount: number | null;
  waterBombingSorties: number | null;
  status: 'TERPADAMKAN' | 'PROSES_PEMADAMAN' | 'PENDINGINAN' | 'TIDAK_TERSEDIA';
  remarks: string;
  provenance: DataProvenance;
}

export interface InaRiskLayerConfig {
  id: string;
  name: string;
  type: 'Bahaya' | 'Risiko' | 'Kapasitas';
  serviceUrl: string;
  opacity: number;
  visible: boolean;
  source: string;
  status: 'ONLINE' | 'TIDAK_TERSEDIA' | 'MEMERIKSA';
  description: string;
  lastUpdated: string;
  provenance: DataProvenance;
}

export interface SourceMetadata {
  name: string;
  agency: string;
  period: string;
  timestamp: string;
  validationStatus: string;
  connectionStatus: 'TERHUBUNG' | 'KUNCI_API_BELUM_TERSEDIA' | 'BERKAS_TERIMPOR' | 'ARSIP_VALID' | 'OFFLINE_TIDAK_TERHUBUNG';
  provenance: DataProvenance;
  details?: string;
}

export interface DataManifest {
  generatedAt: string;
  sources: {
    firms: { status: string; count: number; period: string; provenance: DataProvenance };
    sipongi: { status: string; count: number; period: string; provenance: DataProvenance };
    inarisk: { status: string; endpoint: string; provenance: DataProvenance };
    bmkg: { status: string; period: string; provenance: DataProvenance };
    irbi: { status: string; totalRegencies: number; provenance: DataProvenance };
    ispu: { status: string; stationsCount: number; provenance: DataProvenance };
    pusdatin: { status: string; incidentCount: number; provenance: DataProvenance };
  };
}
