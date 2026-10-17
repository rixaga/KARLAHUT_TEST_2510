# Dashboard Peringatan Dini Karhutla Nasional
### Prototipe Internal Direktorat Peringatan Dini (Dit. PD)
**Deputi Bidang Pencegahan — Badan Nasional Penanggulangan Bencana (BNPB)**

---

> **PERHATIAN (INTERNAL ONLY):**  
> Sistem ini merupakan prototipe operasional internal Direktorat Peringatan Dini BNPB. Jangan mempublikasikan dashboard atau menyebarluaskan data ke domain publik tanpa persetujuan tertulis dari Pimpinan BNPB.

---

## 1. Ikhtisar Sistem
Dashboard Peringatan Dini Karhutla Nasional dirancang untuk mengintegrasikan secara spasial dan numerik berbagai sumber data observasi satelit, model bahaya cuaca kebakaran, kajian risiko bencana, kualitas udara, dan data historis operasi darurat di tingkat nasional, khususnya pada **6 Provinsi Kerja Prioritas**:
1. **Provinsi Riau** (Kawasan gambut pesisir: Pelalawan, Bengkalis, Dumai, Siak, Rokan Hilir)
2. **Provinsi Jambi** (Muaro Jambi, Tanjung Jabung Timur, Tanjung Jabung Barat)
3. **Provinsi Sumatera Selatan** (Ogan Komering Ilir / OKI, Musi Banyuasin, Ogan Ilir, Banyuasin)
4. **Provinsi Kalimantan Barat** (Ketapang, Kubu Raya, Sanggau, Mempawah)
5. **Provinsi Kalimantan Tengah** (Kotawaringin Timur, Pulang Pisau, Kapuas, Palangka Raya, Barito Selatan)
6. **Provinsi Kalimantan Selatan** (Banjar, Tanah Laut, Barito Kuala)

Serta fokus pengawasan ketat pada **20 Kabupaten/Kota Prioritas Karhutla Nasional**.

---

## 2. Integrasi 7 Sumber Data Resmi

| No | Sumber Data | Parameter & Produk | Metode Integrasi |
|---|---|---|---|
| 1 | **NASA FIRMS Area API** | Titik hotspot koordinat lintang/bujur, FRP (MW), suhu kecerahan, sensor VIIRS SNPP, NOAA-20, MODIS Aqua/Terra, riwayat 7 hari | Backend proxy API via `server.ts` dengan penyimpanan aman `FIRMS_MAP_KEY` |
| 2 | **KLHK SiPongi+** | Titik hotspot terverifikasi groundcheck Ditjen PPI KLHK | Parser berkas resmi XLSX, CSV, TXT, dan KMZ (tanpa mengarang API publik KLHK) |
| 3 | **InaRISK BNPB** | Peta Bahaya Karhutla & Peta Risiko Karhutla 2024-2025 | ArcGIS REST ImageServer & MapServer (`https://gis.bnpb.go.id/arcgis/rest/services/inaRISK`) |
| 4 | **Batas Administrasi BNPB / BIG** | Poligon batas 38 provinsi dan 514 kabupaten/kota | ArcGIS MapServer Geoportal BNPB untuk agregasi spasial hotspot |
| 5 | **IRBI Karhutla 2025** | Skor Bahaya, Kerentanan, Kapasitas, dan Indeks Risiko Akhir (0–250) per kabupaten/kota | Basis data resmi Dit. PERB BNPB edisi 2025 |
| 6 | **BMKG FDRS** | Indeks FFMC, FWI, ISI, peluang hujan (%), kecepatan & arah angin, indikator citra asap, serta prakiraan numerik 10 hari | Analisis harian BMKG, mekanisme impor buletin resmi, serta pemisahan tegas prototipe alternatif Open-Meteo |
| 7 | **ISPU KLH & Pusdatin BNPB** | Stasiun sensor AQMS (PM2.5, PM10, CO, SO2, O3) dan catatan historis kejadian karhutla, luas terbakar (Ha), water bombing, personil satgas darat | Impor resmi data sensor KLHK dan log operasi Pusdatin |

---

## 3. Prinsip Validasi & Pemisahan Data
- **Hotspot Teramati (Observasi)**: Data titik api real-time atau riwayat hingga hari ini berdasarkan pantauan sensor satelit. **Hotspot besok TIDAK PERNAH ditampilkan sebagai observasi.**
- **Prakiraan Cuaca (Forecast)**: Hari esok (H+1) hingga 10 hari ke depan (H+10) secara ketat disajikan dalam bentuk **Indeks Peringkat Bahaya Kebakaran (FDRS) BMKG**, probabilitas hujan, dan simulasi arah angin.
- **Model Prototipe Alternatif (Open-Meteo)**: Tersedia opsi perbandingan simulasi algoritma numerik cuaca global, namun **wajib dipisahkan dan diberi label eksplisit** agar tidak tertukar dengan produk rujukan resmi BMKG.
- **Transparansi Metadata**: Setiap komponen kartu dan tabel mencantumkan identitas sumber, periode data, timestamp sinkronisasi, status validasi lapangan, dan status koneksi server.

---

## 4. Fitur Utama Dashboard
- **Peta Interaktif Berlapis (Leaflet)**: Peta dasar gelap dan citra satelit, lapisan Hotspot berwarna menurut tingkat kepercayaan, buffer 20 kabupaten prioritas, serta layer InaRISK Bahaya/Risiko dengan pengatur transparansi (opacity slider).
- **Alat Penyaring Komprehensif**: Filter wilayah (Nasional dan 6 Provinsi Kerja), rentang waktu (Hari Ini, 7 Hari Terakhir, Prakiraan 10 Hari), serta pemilihan spesifik 20 Kabupaten Prioritas.
- **Visualisasi Tren Analitik (Recharts)**: Grafik batang tren harian 7 hari, grafik distribusi hotspot per provinsi, dan kurva prakiraan 10 hari FFMC vs peluang hujan.
- **Tabel Indeks Risiko IRBI 2025**: Pencarian kabupaten, pengurutan kolom bahaya/kerentanan/kapasitas, serta penanda status prioritas.
- **Modul Kualitas Udara (ISPU) & Operasi Penanganan**: Pemantauan stasiun AQMS kota-kota terdampak asap dan log operasi water bombing BNPB.
- **Ekspor Dokumen Resmi**:
  - **Ekspor Excel (.xlsx)**: Berkas multi-sheet mencakup Ringkasan Eksekutif, Hotspot Teramati, Tabel IRBI 2025, dan FDRS Cuaca.
  - **Laporan Harian Pimpinan**: Format resmi nota dinas peringatan dini siap cetak atau ekspor PDF (`window.print()`).
  - **Modal Pengaturan & Impor**: Konfigurasi kunci NASA FIRMS MAP_KEY dan pengunggah berkas resmi SiPongi/BMKG.

---

## 5. Cara Menjalankan Aplikasi

### Persyaratan:
- Node.js versi 22+
- NPM

### Instalasi dan Peluncuran:
```bash
# 1. Pasang dependensi
npm install

# 2. Konfigurasi Lingkungan (Opsional)
# Salin berkas .env.example menjadi .env dan masukkan kunci NASA FIRMS jika tersedia:
# FIRMS_MAP_KEY="kunci_nasa_firms_anda"

# 3. Jalankan Pengujian Logika Unit Test
node --test src/utils/karhutla.test.ts

# 4. Jalankan Server Pengembangan Full-Stack
npm run dev
```

Aplikasi dapat diakses melalui peramban web pada port `3000`: `http://localhost:3000`.

---
*Direktorat Peringatan Dini — Badan Nasional Penanggulangan Bencana (BNPB) © 2026*
