import * as XLSX from 'xlsx';
import type { Hotspot, IRBIRecord, BMKGFDRSRecord, ISPUSiteRecord } from '../types/karhutla.ts';

export function exportKarhutlaReportToExcel(data: {
  hotspots: Hotspot[];
  irbiRecords: IRBIRecord[];
  fdrsRecords: BMKGFDRSRecord[];
  ispuRecords: ISPUSiteRecord[];
  filterProvince: string;
  filterTime: string;
}) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Ringkasan Eksekutif
  const summaryData = [
    ['DIREKTORAT PERINGATAN DINI - BADAN NASIONAL PENANGGULANGAN BENCANA (BNPB)'],
    ['LAPORAN DATA PERINGATAN DINI KEBAKARAN HUTAN DAN LAHAN NASIONAL'],
    ['Tanggal Cetak:', new Date().toLocaleString('id-ID')],
    ['Filter Wilayah:', data.filterProvince],
    ['Filter Periode:', data.filterTime],
    [''],
    ['PARAMETER', 'JUMLAH / NILAI', 'KETERANGAN'],
    ['Total Hotspot Teramati', data.hotspots.length, 'NASA FIRMS & SiPongi+ KLHK'],
    ['Hotspot Kepercayaan Tinggi (High)', data.hotspots.filter(h => h.confidence === 'high').length, 'Prioritas Groundcheck'],
    ['Kabupaten Prioritas Karhutla (IRBI)', 20, '20 Kab/Kota Prioritas Nasional'],
    ['Stasiun Pemantauan Udara (ISPU)', data.ispuRecords.length, 'AQMS Ditjen PPKL KLHK'],
    ['Wilayah FDRS Ekstrem Hari Ini', data.fdrsRecords.filter(f => f.ffmcClass === 'EKSTREM').length, 'BMKG FDRS FFMC > 88']
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');

  // 2. Sheet: Hotspot Terverifikasi
  const hotspotRows = data.hotspots.map((h, idx) => ({
    'No': idx + 1,
    'ID Hotspot': h.id,
    'Sumber Data': h.source,
    'Tanggal Akusisi': h.acq_date,
    'Waktu (WIB/UTC)': h.acq_time,
    'Satelit / Sensor': h.satellite,
    'Latitude': h.latitude,
    'Longitude': h.longitude,
    'Tingkat Kepercayaan': h.confidence,
    'FRP (MW)': h.frp,
    'Suhu Kecerahan (K)': h.brightness,
    'Provinsi': h.province,
    'Kabupaten / Kota': h.regency,
    'Kecamatan': h.district || '-',
    'Desa': h.village || '-',
    'Status Validasi': h.validationStatus
  }));
  const wsHotspots = XLSX.utils.json_to_sheet(hotspotRows);
  XLSX.utils.book_append_sheet(wb, wsHotspots, 'Hotspot Teramati');

  // 3. Sheet: IRBI 2025
  const irbiRows = data.irbiRecords.map(r => ({
    'Peringkat Risiko': r.rank,
    'Kabupaten / Kota': r.regency,
    'Provinsi': r.province,
    'Skor Bahaya (0-100)': r.hazardScore,
    'Skor Kerentanan (0-100)': r.vulnerabilityScore,
    'Skor Kapasitas (0-100)': r.capacityScore,
    'Indeks Risiko Karhutla (0-250)': r.riskIndex,
    'Kelas Risiko': r.riskClass,
    'Luas Gambut (Ha)': r.peatlandAreaHa,
    'Prioritas 20 Nasional': r.isPriority20 ? 'YA' : 'TIDAK'
  }));
  const wsIRBI = XLSX.utils.json_to_sheet(irbiRows);
  XLSX.utils.book_append_sheet(wb, wsIRBI, 'Indeks Risiko IRBI 2025');

  // 4. Sheet: FDRS BMKG
  const fdrsRows = data.fdrsRecords.map(f => ({
    'Wilayah': `${f.regency}, ${f.province}`,
    'Tanggal': f.date,
    'FFMC (Kemudahan Terbakar)': f.ffmc,
    'Kategori FFMC': f.ffmcClass,
    'FWI (Indeks Cuaca Api)': f.fwi,
    'Kategori FWI': f.fwiClass,
    'ISI (Laju Penjalaran)': f.isi,
    'Peluang Hujan (%)': f.rainProbability,
    'Kecepatan Angin (km/j)': f.windSpeedKmH,
    'Arah Angin': f.windDirection,
    'Status': f.isForecast ? `Prakiraan (H+${f.forecastDay})` : 'Observasi Hari Ini',
    'Sumber': f.dataSource === 'BMKG_OFFICIAL' ? 'BMKG Resmi' : 'Open-Meteo Alternatif'
  }));
  const wsFDRS = XLSX.utils.json_to_sheet(fdrsRows);
  XLSX.utils.book_append_sheet(wb, wsFDRS, 'BMKG FDRS & Cuaca');

  // Generate file and trigger browser download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Laporan_Karhutla_BNPB_${dateStr}.xlsx`);
}
