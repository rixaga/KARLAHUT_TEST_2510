import type { Hotspot, HotspotConfidence, SiPongiRegencySummary, DataProvenance } from '../types/karhutla.ts';

export function detectDelimeter(text: string): string {
  const firstLine = text.split('\n')[0] || '';
  if (firstLine.includes('\t')) return '\t';
  if (firstLine.includes(';')) return ';';
  return ',';
}

export interface SiPongiPointParseResult {
  hotspots: Hotspot[];
  totalRows: number;
  validRows: number;
  skippedRows: number;
  skippedReasons: string[];
}

export interface SiPongiSummaryParseResult {
  summaries: SiPongiRegencySummary[];
  totalRows: number;
  validRows: number;
  skippedRows: number;
}

/**
 * Mode 1: Impor Data Titik Hotspot Berkoordinat Resmi SiPongi+ KLHK
 * Aturan Ketat:
 * - Baris tanpa koordinat lintang/bujur valid WAJIB dilewati (TIDAK BOLEH mengarang koordinat default).
 * - FRP atau suhu kecerahan yang tidak ada diisi null (TIDAK BOLEH mengarang nilai default).
 * - Membedakan klasifikasi kepercayaan SiPongi ('Tinggi', 'Sedang', 'Rendah' / persentase).
 */
export function parseSiPongiPoints(
  csvText: string,
  fileName = 'sipongi_points.csv',
  provenance: DataProvenance = 'RESMI_TERVERIFIKASI'
): SiPongiPointParseResult {
  if (!csvText || !csvText.trim()) {
    return { hotspots: [], totalRows: 0, validRows: 0, skippedRows: 0, skippedReasons: ['Berkas kosong'] };
  }

  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) {
    return { hotspots: [], totalRows: 0, validRows: 0, skippedRows: 0, skippedReasons: ['Berkas tidak memiliki baris data'] };
  }

  const delim = detectDelimeter(lines[0]);
  const headers = lines[0].split(delim).map(h => h.trim().toLowerCase().replace(/["']/g, ''));

  const latIdx = headers.findIndex(h => h.includes('lat') || h.includes('lintang') || h === 'y');
  const lonIdx = headers.findIndex(h => h.includes('lon') || h.includes('bujur') || h === 'x');
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('tanggal') || h.includes('tgl'));
  const timeIdx = headers.findIndex(h => h.includes('time') || h.includes('jam') || h.includes('pukul') || h.includes('waktu'));
  const satIdx = headers.findIndex(h => h.includes('sat') || h.includes('sensor'));
  const confIdx = headers.findIndex(h => h.includes('conf') || h.includes('kepercayaan') || h.includes('tingkat'));
  const provIdx = headers.findIndex(h => h.includes('prov'));
  const kabIdx = headers.findIndex(h => h.includes('kab') || h.includes('kota') || h.includes('regency'));
  const kecIdx = headers.findIndex(h => h.includes('kec'));
  const desaIdx = headers.findIndex(h => h.includes('desa') || h.includes('kel'));
  const frpIdx = headers.findIndex(h => h.includes('frp') || h.includes('power'));
  const brightIdx = headers.findIndex(h => h.includes('bright') || h.includes('suhu') || h.includes('temp'));

  if (latIdx === -1 || lonIdx === -1) {
    throw new Error('Kolom koordinat Latitude/Lintang dan Longitude/Bujur tidak ditemukan dalam berkas SiPongi.');
  }

  const hotspots: Hotspot[] = [];
  let skippedRows = 0;
  const skippedReasons: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(delim).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (rawCols.length <= Math.max(latIdx, lonIdx)) {
      skippedRows++;
      continue;
    }

    const rawLat = rawCols[latIdx];
    const rawLon = rawCols[lonIdx];

    if (!rawLat || !rawLon) {
      skippedRows++;
      skippedReasons.push(`Baris ${i + 1}: Koordinat lintang/bujur kosong.`);
      continue;
    }

    const lat = parseFloat(rawLat);
    const lon = parseFloat(rawLon);

    // Verifikasi koordinat geografis wilayah Indonesia
    if (isNaN(lat) || isNaN(lon)) {
      skippedRows++;
      skippedReasons.push(`Baris ${i + 1}: Format koordinat tidak valid (${rawLat}, ${rawLon}).`);
      continue;
    }
    if (lat < -11.5 || lat > 6.5 || lon < 94.5 || lon > 141.5) {
      skippedRows++;
      skippedReasons.push(`Baris ${i + 1}: Koordinat di luar batas teritori Indonesia.`);
      continue;
    }

    // Parsing klasifikasi kepercayaan SiPongi
    let confidence: HotspotConfidence = 'nominal';
    if (confIdx !== -1 && rawCols[confIdx]) {
      const c = rawCols[confIdx].toLowerCase();
      if (c.includes('tinggi') || c.includes('high') || parseInt(c, 10) >= 80) {
        confidence = 'high';
      } else if (c.includes('rendah') || c.includes('low') || (parseInt(c, 10) < 50 && parseInt(c, 10) >= 0)) {
        confidence = 'low';
      } else {
        confidence = 'nominal';
      }
    }

    // Tanggal dan waktu - tidak mengarang tanggal jika tidak tersedia
    const acq_date = dateIdx !== -1 && rawCols[dateIdx] ? rawCols[dateIdx] : 'Tidak Tercantum';
    const acq_time = timeIdx !== -1 && rawCols[timeIdx] ? rawCols[timeIdx] : 'N/A';
    const satellite = satIdx !== -1 && rawCols[satIdx] ? rawCols[satIdx] : 'SiPongi+ KLHK';
    const province = provIdx !== -1 && rawCols[provIdx] ? rawCols[provIdx] : 'Belum Terklasifikasi';
    const regency = kabIdx !== -1 && rawCols[kabIdx] ? rawCols[kabIdx] : 'Belum Terklasifikasi';
    const district = kecIdx !== -1 && rawCols[kecIdx] ? rawCols[kecIdx] : undefined;
    const village = desaIdx !== -1 && rawCols[desaIdx] ? rawCols[desaIdx] : undefined;

    // Nilai FRP dan Suhu Kecerahan - jika tidak ada diisi null
    const frp = frpIdx !== -1 && rawCols[frpIdx] && !isNaN(parseFloat(rawCols[frpIdx])) ? parseFloat(rawCols[frpIdx]) : null;
    const brightness = brightIdx !== -1 && rawCols[brightIdx] && !isNaN(parseFloat(rawCols[brightIdx])) ? parseFloat(rawCols[brightIdx]) : null;

    hotspots.push({
      id: `SIPONGI-PT-${i}-${Date.now().toString().slice(-4)}`,
      source: 'SIPONGI_KLHK',
      latitude: lat,
      longitude: lon,
      brightness,
      acq_date,
      acq_time,
      satellite,
      confidence,
      frp,
      province,
      regency,
      district,
      village,
      validationStatus: 'OBSERVASI_SATELIT',
      provenance
    });
  }

  return {
    hotspots,
    totalRows: lines.length - 1,
    validRows: hotspots.length,
    skippedRows,
    skippedReasons: skippedReasons.slice(0, 10)
  };
}

/**
 * Mode 2: Impor Data Rekapitulasi Hotspot per Kabupaten / Kota Resmi SiPongi+
 * Membaca tabel agregasi wilayah tanpa koordinat spasial individu
 */
export function parseSiPongiRegencySummary(
  csvText: string,
  provenance: DataProvenance = 'RESMI_TERVERIFIKASI'
): SiPongiSummaryParseResult {
  if (!csvText || !csvText.trim()) {
    return { summaries: [], totalRows: 0, validRows: 0, skippedRows: 0 };
  }

  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) {
    return { summaries: [], totalRows: 0, validRows: 0, skippedRows: 0 };
  }

  const delim = detectDelimeter(lines[0]);
  const headers = lines[0].split(delim).map(h => h.trim().toLowerCase().replace(/["']/g, ''));

  const provIdx = headers.findIndex(h => h.includes('prov'));
  const kabIdx = headers.findIndex(h => h.includes('kab') || h.includes('kota') || h.includes('daerah'));
  const countIdx = headers.findIndex(h => h.includes('jumlah') || h.includes('total') || h.includes('count') || h.includes('hotspot'));
  const highConfIdx = headers.findIndex(h => h.includes('tinggi') || h.includes('high') || h.includes('kritis'));
  const periodIdx = headers.findIndex(h => h.includes('periode') || h.includes('tanggal') || h.includes('bulan'));
  const satIdx = headers.findIndex(h => h.includes('satelit') || h.includes('sensor'));

  if (kabIdx === -1 || countIdx === -1) {
    throw new Error('Kolom Kabupaten/Kota dan Jumlah Hotspot wajib tersedia pada berkas rekap SiPongi.');
  }

  const summaries: SiPongiRegencySummary[] = [];
  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delim).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length <= Math.max(kabIdx, countIdx)) {
      skippedRows++;
      continue;
    }

    const regency = cols[kabIdx];
    const rawCount = cols[countIdx];
    const hotspotCount = parseInt(rawCount, 10);

    if (!regency || isNaN(hotspotCount)) {
      skippedRows++;
      continue;
    }

    const province = provIdx !== -1 && cols[provIdx] ? cols[provIdx] : '-';
    const highConfidenceCount = highConfIdx !== -1 && !isNaN(parseInt(cols[highConfIdx], 10)) ? parseInt(cols[highConfIdx], 10) : 0;
    const period = periodIdx !== -1 && cols[periodIdx] ? cols[periodIdx] : 'Periode Rekapitulasi Resmi';
    const satellite = satIdx !== -1 && cols[satIdx] ? cols[satIdx] : 'Multi-Sensor (SiPongi+)';

    summaries.push({
      province,
      regency,
      hotspotCount,
      highConfidenceCount,
      period,
      satellite,
      provenance
    });
  }

  return {
    summaries,
    totalRows: lines.length - 1,
    validRows: summaries.length,
    skippedRows
  };
}

// Backward compatible export for existing callers
export function parseSiPongiCSV(csvText: string, fileName = 'sipongi_export.csv'): Hotspot[] {
  return parseSiPongiPoints(csvText, fileName, 'RESMI_TERVERIFIKASI').hotspots;
}
