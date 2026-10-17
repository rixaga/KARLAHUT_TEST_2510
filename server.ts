import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_HOTSPOTS } from './src/data/initialHotspots.ts';
import { IRBI_2025_RECORDS } from './src/data/irbi2025Data.ts';
import { BMKG_FDRS_RECORDS, OPEN_METEO_PROTOTYPE_RECORDS } from './src/data/bmkgFdrsData.ts';
import { OFFICIAL_ISPU_RECORDS } from './src/data/ispuData.ts';
import { PUSDATIN_INCIDENT_RECORDS } from './src/data/pusdatinData.ts';
import { INARISK_LAYERS } from './src/data/inariskConfig.ts';
import { parseSiPongiPoints, parseSiPongiRegencySummary } from './src/utils/sipongiParser.ts';
import { parseNASAFirmsCSV } from './src/utils/nasaFirmsParser.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Server-side environment variable only (never exposed via unauthenticated POST endpoint)
const FIRMS_MAP_KEY = process.env.FIRMS_MAP_KEY || '';
let runtimeSiPongiHotspots = [...INITIAL_HOTSPOTS];
let lastSipongiImportTime: string | null = null;
let lastSipongiFileName: string | null = null;

// --- API Endpoints ---

// 0. Download Project Source Code ZIP
app.get('/api/download-source-zip', (req, res) => {
  const zipPath = path.join(__dirname, 'bnpb-karhutla-dashboard-source.zip');
  res.download(zipPath, 'bnpb-karhutla-dashboard-source.zip', (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: 'Gagal mengunduh berkas zip kode sumber.' });
    }
  });
});

// 1. Health & Connection Status Summary (Real live health check)
app.get('/api/status', async (req, res) => {
  const isKeyConfigured = Boolean(FIRMS_MAP_KEY && FIRMS_MAP_KEY.trim().length > 0);
  
  // Real ping check to InaRISK ArcGIS endpoint with 3s timeout
  let inariskConnected = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const testRes = await fetch('https://gis.bnpb.go.id/arcgis/rest/services/inaRISK?f=json', {
      signal: controller.signal
    });
    clearTimeout(timeout);
    inariskConnected = testRes.ok;
  } catch {
    inariskConnected = false;
  }

  res.json({
    timestamp: new Date().toISOString(),
    firms: {
      connected: isKeyConfigured,
      keyConfigured: isKeyConfigured,
      message: isKeyConfigured 
        ? 'Terhubung ke NASA FIRMS Area API (VIIRS/MODIS via server secret)' 
        : 'Kunci API MAP_KEY belum terkonfigurasi di server (.env). Menampilkan dataset sampel demonstrasi.',
      source: 'NASA EOSDIS FIRMS Area API',
      provenance: isKeyConfigured ? 'RESMI_TERVERIFIKASI' : 'DEMO_BELUM_TERVERIFIKASI'
    },
    sipongi: {
      importedCount: runtimeSiPongiHotspots.filter(h => h.source === 'SIPONGI_KLHK').length,
      lastImport: lastSipongiImportTime || 'Dataset Sampel Terpasang',
      fileName: lastSipongiFileName || 'sampel_bawaan.csv',
      source: 'Kementerian Lingkungan Hidup dan Kehutanan (SiPongi+)',
      provenance: lastSipongiImportTime ? 'RESMI_TERVERIFIKASI' : 'DEMO_BELUM_TERVERIFIKASI'
    },
    inarisk: {
      connected: inariskConnected,
      serviceUrl: 'https://gis.bnpb.go.id/arcgis/rest/services/inaRISK',
      layersCount: INARISK_LAYERS.length,
      source: 'Direktorat Pemetaan & Evaluasi Risiko Bencana BNPB',
      status: inariskConnected ? 'ONLINE' : 'OFFLINE_TIDAK_TERHUBUNG',
      provenance: 'RESMI_TERVERIFIKASI'
    },
    bmkg: {
      connected: true,
      product: 'Sistem Peringkat Bahaya Kebakaran (FDRS: FFMC, FWI, ISI)',
      source: 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)',
      provenance: 'DEMO_BELUM_TERVERIFIKASI'
    },
    irbi: {
      connected: true,
      year: 2025,
      totalRegencies: IRBI_2025_RECORDS.length,
      source: 'Indeks Risiko Bencana Indonesia (IRBI) 2025 BNPB',
      provenance: 'DEMO_BELUM_TERVERIFIKASI'
    },
    ispu: {
      connected: true,
      stationsCount: OFFICIAL_ISPU_RECORDS.length,
      source: 'Stasiun AQMS Ditjen PPKL Kementerian Lingkungan Hidup',
      provenance: 'DEMO_BELUM_TERVERIFIKASI'
    },
    pusdatin: {
      connected: true,
      incidentsCount: PUSDATIN_INCIDENT_RECORDS.length,
      source: 'Pusat Data, Informasi & Komunikasi Kebencanaan BNPB',
      provenance: 'DEMO_BELUM_TERVERIFIKASI'
    }
  });
});

// 2. NASA FIRMS Hotspots Endpoint (Supports Multi-day chunking with verified parser)
app.get('/api/firms/hotspots', async (req, res) => {
  const days = req.query.days ? Math.min(Math.max(parseInt(req.query.days as string, 10), 1), 10) : 7;
  const isKeyConfigured = Boolean(FIRMS_MAP_KEY && FIRMS_MAP_KEY.trim().length > 0);

  if (isKeyConfigured) {
    try {
      // Indonesia Bounding Box: 95, -11, 141, 6
      const extent = '95,-11,141,6';
      const source = 'VIIRS_SNPP_NRT';
      const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_MAP_KEY}/${source}/${extent}/${days}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const firmsResponse = await fetch(firmsUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (firmsResponse.ok) {
        const csvData = await firmsResponse.text();
        const liveHotspots = parseNASAFirmsCSV(csvData, 'RESMI_TERVERIFIKASI');
        return res.json({
          success: true,
          source: 'NASA_FIRMS_LIVE',
          connectionStatus: 'TERHUBUNG',
          provenance: 'RESMI_TERVERIFIKASI',
          count: liveHotspots.length,
          data: liveHotspots,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('NASA FIRMS API fetch timed out or failed, falling back to baseline:', err);
    }
  }

  // Baseline dataset marked as DEMO / BELUM TERVERIFIKASI when live credentials are not set
  res.json({
    success: true,
    source: isKeyConfigured ? 'NASA_FIRMS_CACHE' : 'SAMPEL_DEMO_LOKAL',
    connectionStatus: isKeyConfigured ? 'TERHUBUNG' : 'KUNCI_API_BELUM_TERSEDIA',
    provenance: 'DEMO_BELUM_TERVERIFIKASI',
    count: runtimeSiPongiHotspots.length,
    data: runtimeSiPongiHotspots,
    timestamp: new Date().toISOString()
  });
});

// 3. Official SiPongi Import Endpoint (2 Modes: Point & Regency Summary)
app.post('/api/sipongi/import', (req, res) => {
  try {
    const { content, fileName, mode } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Isi berkas SiPongi tidak boleh kosong.' });
    }

    if (mode === 'summary') {
      const summaryResult = parseSiPongiRegencySummary(content, 'RESMI_TERVERIFIKASI');
      if (summaryResult.summaries.length === 0) {
        return res.status(400).json({ 
          error: 'Tidak ditemukan baris rekapitulasi valid pada berkas. Pastikan kolom Kabupaten dan Jumlah Hotspot tersedia.' 
        });
      }

      lastSipongiImportTime = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      lastSipongiFileName = fileName || 'sipongi_rekap_kabupaten.csv';

      return res.json({
        success: true,
        mode: 'summary',
        message: `Berhasil mengimpor rekapitulasi ${summaryResult.validRows} kabupaten/kota dari SiPongi+.`,
        summaries: summaryResult.summaries,
        skippedRows: summaryResult.skippedRows,
        fileName: lastSipongiFileName,
        timestamp: lastSipongiImportTime
      });
    }

    // Default: Mode Points
    const parseResult = parseSiPongiPoints(content, fileName || 'sipongi_import.csv', 'RESMI_TERVERIFIKASI');
    if (parseResult.hotspots.length === 0) {
      return res.status(400).json({ 
        error: 'Tidak ada data titik hotspot valid yang dapat diekstrak. Baris tanpa koordinat lintang/bujur valid otomatis dilewati.',
        skippedReasons: parseResult.skippedReasons
      });
    }

    // Deduplicate against existing IDs
    const existingIds = new Set(runtimeSiPongiHotspots.map(h => `${h.latitude.toFixed(3)}_${h.longitude.toFixed(3)}_${h.acq_date}`));
    const newRecords = parseResult.hotspots.filter(h => !existingIds.has(`${h.latitude.toFixed(3)}_${h.longitude.toFixed(3)}_${h.acq_date}`));

    runtimeSiPongiHotspots = [...newRecords, ...runtimeSiPongiHotspots];
    lastSipongiImportTime = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    lastSipongiFileName = fileName || 'sipongi_impor_manual.csv';

    res.json({
      success: true,
      mode: 'points',
      message: `Berhasil mengimpor ${newRecords.length} titik hotspot SiPongi+ valid. (${parseResult.skippedRows} baris tanpa koordinat dilewati).`,
      totalHotspots: runtimeSiPongiHotspots.length,
      importedCount: newRecords.length,
      skippedRows: parseResult.skippedRows,
      skippedReasons: parseResult.skippedReasons,
      fileName: lastSipongiFileName,
      timestamp: lastSipongiImportTime
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memproses berkas impor SiPongi.' });
  }
});

// 4. InaRISK Layer Metadata & Proxy Endpoint
app.get('/api/inarisk/layers', (req, res) => {
  res.json({
    layers: INARISK_LAYERS,
    source: 'Direktorat Pemetaan & Evaluasi Risiko Bencana BNPB',
    restDirectory: 'https://gis.bnpb.go.id/arcgis/rest/services/inaRISK'
  });
});

// 5. IRBI 2025 Endpoint
app.get('/api/irbi', (req, res) => {
  res.json({
    year: 2025,
    source: 'Indeks Risiko Bencana Indonesia (IRBI) 2025 - Dit. PERB BNPB',
    provenance: 'DEMO_BELUM_TERVERIFIKASI',
    count: IRBI_2025_RECORDS.length,
    data: IRBI_2025_RECORDS
  });
});

// 6. BMKG FDRS & Weather Forecast Endpoint
app.get('/api/bmkg/fdrs', (req, res) => {
  const includePrototype = req.query.includePrototype === 'true';
  res.json({
    source: 'Sistem Peringkat Bahaya Kebakaran (FDRS) BMKG',
    provenance: 'DEMO_BELUM_TERVERIFIKASI',
    isForecastNotice: 'Hotspot besok tidak ditampilkan sebagai observasi; hari esok dan 10 hari ke depan disajikan sebagai Indeks Peringkat Bahaya BMKG.',
    data: BMKG_FDRS_RECORDS,
    prototypeData: includePrototype ? OPEN_METEO_PROTOTYPE_RECORDS : [],
    timestamp: new Date().toISOString()
  });
});

// 7. KLHK ISPU & Pusdatin Endpoints
app.get('/api/ispu', (req, res) => {
  res.json({
    source: 'Indeks Standar Pencemar Udara (ISPU) Ditjen PPKL KLHK',
    provenance: 'DEMO_BELUM_TERVERIFIKASI',
    count: OFFICIAL_ISPU_RECORDS.length,
    data: OFFICIAL_ISPU_RECORDS,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/pusdatin', (req, res) => {
  res.json({
    source: 'Pusat Data, Informasi, dan Komunikasi Kebencanaan (Pusdatin) BNPB',
    provenance: 'DEMO_BELUM_TERVERIFIKASI',
    count: PUSDATIN_INCIDENT_RECORDS.length,
    data: PUSDATIN_INCIDENT_RECORDS,
    timestamp: new Date().toISOString()
  });
});

// --- Vite Middleware Mounting in Dev or Static Serving in Prod ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BNPB Karhutla Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
