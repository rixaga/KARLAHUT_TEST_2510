# Audit & Remediasi Dashboard Peringatan Dini Karhutla BNPB

Rencana audit dan perbaikan menyeluruh terhadap Dashboard Peringatan Dini Karhutla Nasional Dit. PD BNPB untuk menegakkan integritas data, validasi sumber resmi, arsitektur statis GitHub Pages, dan keakuratan geospasial tanpa merombak ulang antarmuka yang sudah berfungsi.

## Keputusan & Preferensi Pengguna Terkonfirmasi

> [!IMPORTANT]
> - **Format Base Path GitHub Pages**: Menggunakan jalur relatif (`./`) sehingga aplikasi portabel di subpath repository GitHub apa pun (`username.github.io/karhutla-dashboard/`) maupun custom domain tanpa modifikasi manual.
> - **Penanganan Data Demo**: Ketika feed langsung atau kredensial API belum terkonfigurasi, data contoh tetap ditampilkan namun wajib diberi penanda visual tegas `DEMO / BELUM TERVERIFIKASI` (tidak boleh diklaim sebagai `OFFICIAL` atau `TERVERIFIKASI`). Nilai kosong/hilang ditampilkan sebagai `Data Tidak Tersedia` atau `N/A` (bukan angka nol palsu).

---

## 1. Ikhtisar & Tujuan Remediasi

Audit ini berfokus pada 5 pilar utama kepatuhan:
1. **Integritas Data & Provenance**: Mengaudit seluruh dataset bawaan (`initialHotspots.ts`, `bmkgFdrsData.ts`, `irbi2025Data.ts`, `ispuData.ts`, `pusdatinData.ts`), menandai data tanpa pembuktian resmi sebagai `DEMO / BELUM TERVERIFIKASI`, dan mengganti status koneksi statis dengan pemeriksaan koneksi nyata (*live health check*).
2. **Standardisasi API Hotspot**:
   - Memperbaiki parser NASA FIRMS Area API sesuai spesifikasi skema CSV resmi NASA (VIIRS/MODIS).
   - Menghilangkan endpoint publik yang mengekspos pengubahan API Key (`POST /api/firms/set-key`).
   - Menyediakan 2 mode impor SiPongi: **Data Titik Berkoordinat** dan **Data Rekap Agregasi Kabupaten/Kota**.
   - Menghapus semua nilai default rekayasa (tidak ada default lat/lon/FRP palsu) dan menerapkan deduplikasi spasial-temporal lintas satelit.
3. **Pembersihan Geospasial InaRISK**:
   - Menghapus poligon hardcoded buatan tangan yang sebelumnya mengatasnamakan InaRISK.
   - Mengintegrasikan layanan ArcGIS REST MapServer/ImageServer resmi BNPB (`gis.bnpb.go.id`) dengan penanganan kegagalan koneksi transparan.
4. **Kesiapan Publikasi GitHub Pages**:
   - Menambahkan skrip Python (`scripts/fetch_data.py`) untuk pipeline *headless ingestion* yang dijalankan via GitHub Actions dengan secret `FIRMS_MAP_KEY`.
   - Menghasilkan file JSON statis di `public/data/` beserta `manifest.json`.
   - Mengonfigurasi `vite.config.ts` dengan `base: './'` dan alur kerja `.github/workflows/deploy.yml`.
5. **Verifikasi & Validasi Menyeluruh**:
   - Unit test native `node:test` untuk parser skema NASA, dua mode parser SiPongi, dan kalkulator indeks.
   - Pengecekan build produksi (`npm run build`) dan TypeScript linting.

---

## 2. Pengalaman Pengguna & Perubahan Antarmuka

- **Penanda Integritas Data (Data Provenance Banners)**:
  - Setiap kartu metrik, tabel, dan peta menampilkan lencana status jelas:
    - `RESMI / TERVERIFIKASI` (hijau) jika data bersumber dari pipeline atau file impor resmi yang tervalidasi.
    - `DEMO / BELUM TERVERIFIKASI` (kuning/abu-abu) jika bersumber dari data sampel lokal.
  - Nilai data yang tidak ada ditampilkan sebagai `Tidak Ada Data (N/A)`, bukan `0` atau koordinat palsu.
- **Peta Spasial Tanpa Mock Polygon**:
  - Layer InaRISK murni menggunakan ArcGIS REST tiles/export service. Jika server InaRISK BNPB lambat atau offline, peta menampilkan notifikasi informatif tanpa menggambar poligon imajiner.
- **Modal Impor SiPongi 2-Mode**:
  - Tab 1: **Impor Titik Hotspot Berkoordinat** (XLSX, CSV, TXT) dengan validasi bujur/lintang ketat.
  - Tab 2: **Impor Rekap Agregasi Wilayah** (tabel rekap per kabupaten/kota resmi KLHK) untuk pemutakhiran agregat tanpa koordinat individu.

---

## 3. Keputusan Produk & Arsitektur Teknis

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PIPELINE GITHUB ACTIONS (Otomatis)                   │
│   Workflow: .github/workflows/fetch-data.yml (Jadwal Cron / Dispatch)   │
│   - Menggunakan Secret: FIRMS_MAP_KEY                                  │
│   - Menjalankan: scripts/fetch_data.py (Multi-request 7 hari NASA)     │
│   - Output: public/data/hotspots.json & public/data/manifest.json      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  HOSTING STATIS: GITHUB PAGES                          │
│   Workflow: .github/workflows/deploy.yml (Vite base: './')             │
│   - Membaca data statis dari /data/hotspots.json & manifest.json       │
│   - Fallback cerdas: Mendukung runtime Express backend saat dev lokal │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND DASHBOARD (React 19)                      │
│  - InteractiveMap (ArcGIS REST InaRISK Asli, Tanpa Polygon Mock)       │
│  - FilterBar & Metric Cards (Label DEMO vs RESMI yang jelas)           │
│  - SiPongi Importer (2 Mode: Titik Koordinat & Rekap Kabupaten)        │
│  - IRBI 2025 Table & BMKG FDRS View (Data Provenance Terverifikasi)    │
└────────────────────────────────────────────────────────────────────────┘
```

### Rincian Perubahan Kunci:
1. **Pemisahan Kredensial**:
   - `POST /api/firms/set-key` dihapus dari kode server publik. Kunci hanya dibaca dari environment variable `process.env.FIRMS_MAP_KEY` atau GitHub Actions Secret.
2. **Parser NASA FIRMS Standar**:
   - Memproses format field NASA VIIRS SNPP: `latitude`, `longitude`, `bright_ti4`, `scan`, `track`, `acq_date`, `acq_time`, `satellite`, `confidence`, `version`, `bright_ti5`, `frp`, `daynight`.
   - Mengambil 7 hari melalui pemanggilan chunk resmi atau kompilasi riwayat tanpa menduplikasi data.
3. **Parser SiPongi Dua Mode**:
   - Mode A (Titik Koordinat): Memerlukan kolom lintang/bujur valid; baris tanpa koordinat otomatis dilewati (*skipped*) dengan laporan jumlah baris tak valid, tanpa membuat koordinat palsu.
   - Mode B (Rekapitulasi Wilayah): Membaca jumlah kejadian per kabupaten/provinsi dan memperbarui agregat rekapitulasi daerah.
4. **ArcGIS InaRISK**:
   - Menggunakan URL resmi ArcGIS REST: `https://gis.bnpb.go.id/arcgis/rest/services/inaRISK/Bahaya_Karhutla_2024/ImageServer/exportImage` atau Tile Service Geoportal BNPB.
   - Menghapus poligon statis buatan tangan (`riauHazard`, `sumselHazard`, `kaltengHazard`).
5. **Data Manifest**:
   - `public/data/manifest.json` mencatat secara transparan metadata pengambilan data, periode berlaku, stempel waktu, dan status validasi setiap layer.

---

## 4. Rencana Pengujian & Validasi

1. **Unit Test (`node:test`)**:
   - Menguji parser CSV NASA FIRMS resmi.
   - Menguji parser SiPongi Mode Koordinat vs Mode Rekap Wilayah.
   - Menguji logika penolakan data tanpa koordinat/FRP asli.
   - Menguji deduplikasi hotspot spasial-temporal.
2. **Typecheck & Build**:
   - `npm run lint` (`tsc --noEmit`) tanpa ada galat tipe.
   - `npm run build` sukses menghasilkan paket statis di `dist/` dengan aset relatif.
3. **Pemeriksaan Fungsional di Browser**:
   - Uji filter wilayah 6 provinsi dan 20 kabupaten prioritas.
   - Uji pergantian layer peta InaRISK.
   - Uji alur pengunggahan berkas SiPongi 2-mode.
   - Uji ekspor berkas Excel dan cetak Laporan Harian Pimpinan.
