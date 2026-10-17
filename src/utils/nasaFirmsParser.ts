import type { Hotspot, HotspotConfidence, DataProvenance } from '../types/karhutla.ts';
import { calculateDistanceKm } from './geo.ts';

/**
 * Parser resmi untuk respon CSV NASA FIRMS (VIIRS SNPP, NOAA-20, MODIS)
 * Skema Resmi NASA:
 * latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
 */
export function parseNASAFirmsCSV(csvText: string, provenance: DataProvenance = 'RESMI_TERVERIFIKASI'): Hotspot[] {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));

  const latIdx = headers.findIndex(h => h === 'latitude' || h === 'lat');
  const lonIdx = headers.findIndex(h => h === 'longitude' || h === 'lon');
  const dateIdx = headers.findIndex(h => h === 'acq_date' || h === 'date');
  const timeIdx = headers.findIndex(h => h === 'acq_time' || h === 'time');
  const satIdx = headers.findIndex(h => h === 'satellite' || h === 'sat');
  const confIdx = headers.findIndex(h => h === 'confidence' || h === 'conf');
  const frpIdx = headers.findIndex(h => h === 'frp');
  const brightTi4Idx = headers.findIndex(h => h === 'bright_ti4' || h === 'brightness');
  const daynightIdx = headers.findIndex(h => h === 'daynight');

  if (latIdx === -1 || lonIdx === -1) {
    throw new Error('Skema CSV NASA FIRMS tidak valid: Kolom latitude dan longitude tidak ditemukan.');
  }

  const rawList: Hotspot[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length <= Math.max(latIdx, lonIdx)) continue;

    const lat = parseFloat(cols[latIdx]);
    const lon = parseFloat(cols[lonIdx]);

    // Validasi ketat: abaikan koordinat non-numerik atau di luar batas Indonesia (-11 s.d 6 lat, 95 s.d 141 lon)
    if (isNaN(lat) || isNaN(lon)) continue;
    if (lat < -11.5 || lat > 6.5 || lon < 94.5 || lon > 141.5) continue;

    // Tanpa mengarang tanggal/waktu default palsu
    const acq_date = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : 'Tidak Diketahui';
    const acq_time = timeIdx !== -1 && cols[timeIdx] ? cols[timeIdx] : 'N/A';

    // NASA confidence parsing:
    // VIIRS: 'l' -> low, 'n' -> nominal, 'h' -> high
    // MODIS: numeric percentage (0-100)
    let confidence: HotspotConfidence = 'nominal';
    if (confIdx !== -1 && cols[confIdx]) {
      const raw = cols[confIdx].toLowerCase();
      if (raw === 'h' || raw === 'high' || parseInt(raw, 10) >= 80) {
        confidence = 'high';
      } else if (raw === 'l' || raw === 'low' || (parseInt(raw, 10) < 30 && parseInt(raw, 10) >= 0)) {
        confidence = 'low';
      } else {
        confidence = 'nominal';
      }
    }

    const satellite = satIdx !== -1 && cols[satIdx] ? cols[satIdx] : 'VIIRS (NASA FIRMS)';
    const frp = frpIdx !== -1 && cols[frpIdx] && !isNaN(parseFloat(cols[frpIdx])) ? parseFloat(cols[frpIdx]) : null;
    const brightness = brightTi4Idx !== -1 && cols[brightTi4Idx] && !isNaN(parseFloat(cols[brightTi4Idx])) ? parseFloat(cols[brightTi4Idx]) : null;
    const daynight = daynightIdx !== -1 && (cols[daynightIdx] === 'D' || cols[daynightIdx] === 'N') ? cols[daynightIdx] : 'D';

    rawList.push({
      id: `NASA-${i}-${Date.now().toString().slice(-4)}`,
      source: 'NASA_FIRMS',
      latitude: lat,
      longitude: lon,
      brightness,
      acq_date,
      acq_time,
      satellite,
      confidence,
      frp,
      daynight,
      province: 'Indonesia (Satelit NRT)',
      regency: 'Observasi Spasial',
      validationStatus: 'OBSERVASI_SATELIT',
      provenance
    });
  }

  // Deduplikasi Spasial-Temporal (Hindari penghitungan ganda antar satelit pada titik yang sama <1 km dalam rentang 30 menit)
  return deduplicateHotspots(rawList);
}

/**
 * Deduplikasi spasial-temporal untuk menghindari penghitungan ganda lintas sensor satelit
 */
export function deduplicateHotspots(hotspots: Hotspot[]): Hotspot[] {
  const unique: Hotspot[] = [];

  for (const current of hotspots) {
    const isDuplicate = unique.some(existing => {
      if (existing.acq_date !== current.acq_date) return false;
      // Periksa jarak spasial dalam radius 1 km
      const distKm = calculateDistanceKm(existing.latitude, existing.longitude, current.latitude, current.longitude);
      if (distKm <= 1.0) {
        // Cek selisih waktu bila tersedia
        const time1 = parseInt(existing.acq_time.replace(':', ''), 10);
        const time2 = parseInt(current.acq_time.replace(':', ''), 10);
        if (!isNaN(time1) && !isNaN(time2) && Math.abs(time1 - time2) <= 30) {
          return true; // Dideteksi sebagai kebakaran yang sama
        }
      }
      return false;
    });

    if (!isDuplicate) {
      unique.push(current);
    }
  }

  return unique;
}
