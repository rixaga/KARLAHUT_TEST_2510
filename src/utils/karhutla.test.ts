import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyFFMC, classifyFWI, classifyISI, getFDRSColor } from './fdrsCalc.ts';
import { classifyISPU, getISPUColor } from './ispuRating.ts';
import { parseSiPongiCSV, parseSiPongiPoints, parseSiPongiRegencySummary } from './sipongiParser.ts';
import { parseNASAFirmsCSV, deduplicateHotspots } from './nasaFirmsParser.ts';
import { calculateDistanceKm, findNearestPriorityRegency, PRIORITY_20_REGENCIES } from './geo.ts';
import type { Hotspot } from '../types/karhutla.ts';

test('FDRS BMKG classifications match official thresholds', () => {
  // FFMC
  assert.equal(classifyFFMC(55), 'AMAN');
  assert.equal(classifyFFMC(70), 'SEDANG');
  assert.equal(classifyFFMC(80), 'TINGGI');
  assert.equal(classifyFFMC(92), 'EKSTREM');

  // FWI
  assert.equal(classifyFWI(5), 'AMAN');
  assert.equal(classifyFWI(10), 'SEDANG');
  assert.equal(classifyFWI(18), 'TINGGI');
  assert.equal(classifyFWI(28), 'EKSTREM');

  // ISI
  assert.equal(classifyISI(1.5), 'AMAN');
  assert.equal(classifyISI(4.5), 'SEDANG');
  assert.equal(classifyISI(8.5), 'TINGGI');
  assert.equal(classifyISI(15.0), 'EKSTREM');

  // Color check
  assert.equal(getFDRSColor('EKSTREM'), '#dc2626');
});

test('KLHK ISPU ratings follow Permen LHK 14/2020', () => {
  assert.equal(classifyISPU(35), 'BAIK');
  assert.equal(classifyISPU(75), 'SEDANG');
  assert.equal(classifyISPU(145), 'TIDAK_SEHAT');
  assert.equal(classifyISPU(250), 'SANGAT_TIDAK_SEHAT');
  assert.equal(classifyISPU(350), 'BERBAHAYA');

  assert.equal(getISPUColor('BAIK'), '#16a34a');
  assert.equal(getISPUColor('BERBAHAYA'), '#701a75');
});

test('SiPongi Mode 1: Point Parser validates coordinates and rejects invalid/missing coords without fabricating numbers', () => {
  const mixedCsv = `Tanggal,Waktu,Satelit,Lintang,Bujur,Tingkat_Kepercayaan,Provinsi,Kabupaten,FRP
2026-10-16,13:30,VIIRS-SNPP,0.285,102.140,Tinggi,Riau,Kab. Pelalawan,24.8
2026-10-16,14:00,VIIRS-SNPP,,,Tinggi,Riau,Kab. Siak,15.2
2026-10-16,14:15,NOAA-20,-3.380,105.120,Sedang,Sumatera Selatan,Kab. Ogan Komering Ilir,18.2
2026-10-16,15:00,MODIS-Aqua,45.200,12.500,85,Luar Negeri,Wilayah Asing,32.0`;

  const result = parseSiPongiPoints(mixedCsv, 'test.csv');
  // 4 rows total:
  // row 1: valid Indonesia coords (Pelalawan)
  // row 2: missing coords (should be skipped!)
  // row 3: valid Indonesia coords (OKI)
  // row 4: outside Indonesia latitude 45.2 (should be skipped!)
  assert.equal(result.validRows, 2);
  assert.equal(result.skippedRows, 2);
  assert.equal(result.hotspots[0].regency, 'Kab. Pelalawan');
  assert.equal(result.hotspots[0].confidence, 'high');
  assert.equal(result.hotspots[1].regency, 'Kab. Ogan Komering Ilir');
});

test('SiPongi Mode 2: Regency Summary Parser extracts aggregated region tables', () => {
  const summaryCsv = `Provinsi,Kabupaten,Jumlah_Hotspot,High_Confidence,Periode,Satelit
Sumatera Selatan,Kab. Ogan Komering Ilir,45,28,11-17 Oktober 2026,VIIRS/MODIS
Riau,Kab. Pelalawan,32,22,11-17 Oktober 2026,VIIRS/MODIS
Kalimantan Tengah,Kab. Kotawaringin Timur,24,15,11-17 Oktober 2026,VIIRS/MODIS`;

  const result = parseSiPongiRegencySummary(summaryCsv);
  assert.equal(result.validRows, 3);
  assert.equal(result.summaries[0].regency, 'Kab. Ogan Komering Ilir');
  assert.equal(result.summaries[0].hotspotCount, 45);
  assert.equal(result.summaries[0].highConfidenceCount, 28);
});

test('NASA FIRMS CSV Parser handles official VIIRS schema with FRP & Brightness', () => {
  const nasaCsv = `latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
0.342,102.185,342.5,0.4,0.4,2026-10-17,0630,N,VIIRS,h,2.0NRT,298.2,42.5,D
-3.450,105.195,338.1,0.5,0.4,2026-10-17,0645,N,VIIRS,n,2.0NRT,295.0,28.0,D`;

  const parsed = parseNASAFirmsCSV(nasaCsv);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].source, 'NASA_FIRMS');
  assert.equal(parsed[0].confidence, 'high');
  assert.equal(parsed[0].frp, 42.5);
  assert.equal(parsed[0].brightness, 342.5);
  assert.equal(parsed[1].confidence, 'nominal');
  assert.equal(parsed[1].daynight, 'D');
});

test('Spatial-temporal deduplication eliminates duplicate satellite detections within 1km and 30 min', () => {
  const rawList: Hotspot[] = [
    {
      id: 'HS-1',
      source: 'NASA_FIRMS',
      latitude: 0.3420,
      longitude: 102.1850,
      brightness: 340.0,
      acq_date: '2026-10-17',
      acq_time: '13:40',
      satellite: 'VIIRS-SNPP',
      confidence: 'high',
      frp: 35.0,
      province: 'Riau',
      regency: 'Kab. Pelalawan',
      validationStatus: 'OBSERVASI_SATELIT',
      provenance: 'RESMI_TERVERIFIKASI'
    },
    {
      // Duplicate sensor detection ~200 meters away at 13:45 on same date
      id: 'HS-2',
      source: 'NASA_FIRMS',
      latitude: 0.3425,
      longitude: 102.1852,
      brightness: 338.0,
      acq_date: '2026-10-17',
      acq_time: '13:45',
      satellite: 'NOAA-20',
      confidence: 'high',
      frp: 34.0,
      province: 'Riau',
      regency: 'Kab. Pelalawan',
      validationStatus: 'OBSERVASI_SATELIT',
      provenance: 'RESMI_TERVERIFIKASI'
    },
    {
      // Distinct event in Sumsel
      id: 'HS-3',
      source: 'NASA_FIRMS',
      latitude: -3.4500,
      longitude: 105.1950,
      brightness: 345.0,
      acq_date: '2026-10-17',
      acq_time: '14:10',
      satellite: 'VIIRS-SNPP',
      confidence: 'high',
      frp: 50.0,
      province: 'Sumatera Selatan',
      regency: 'Kab. Ogan Komering Ilir',
      validationStatus: 'OBSERVASI_SATELIT',
      provenance: 'RESMI_TERVERIFIKASI'
    }
  ];

  const deduped = deduplicateHotspots(rawList);
  assert.equal(deduped.length, 2);
  assert.equal(deduped[0].id, 'HS-1');
  assert.equal(deduped[1].id, 'HS-3');
});

test('Spatial calculation and nearest priority regency match', () => {
  // Coordinates very close to Pelalawan (0.2833, 102.1333)
  const nearby = findNearestPriorityRegency(0.29, 102.14);
  assert.ok(nearby);
  assert.equal(nearby.regency.name, 'Kab. Pelalawan');
  assert.ok(nearby.distanceKm < 15);

  // Exact 20 priority regencies defined
  assert.equal(PRIORITY_20_REGENCIES.length, 20);

  // Distance formula check (same point = 0)
  assert.equal(calculateDistanceKm(0, 0, 0, 0), 0);
});
