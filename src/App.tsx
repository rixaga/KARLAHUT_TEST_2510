import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { InteractiveMap } from './components/InteractiveMap.tsx';
import { AnalyticsCharts } from './components/AnalyticsCharts.tsx';
import { IRBITable } from './components/IRBITable.tsx';
import { BMKGFDRSView } from './components/BMKGFDRSView.tsx';
import { ISPUImpactView } from './components/ISPUImpactView.tsx';
import { ExecutiveReportModal } from './components/ExecutiveReportModal.tsx';
import { FileImportModal } from './components/FileImportModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { SourceMetadataBadge } from './components/SourceMetadataBadge.tsx';
import { exportKarhutlaReportToExcel } from './utils/excelExport.ts';

import type {
  Hotspot,
  IRBIRecord,
  BMKGFDRSRecord,
  ISPUSiteRecord,
  PusdatinEventRecord,
  InaRiskLayerConfig,
  TimeRangeFilter,
  WorkingProvince
} from './types/karhutla.ts';

import { Flame, ShieldAlert, AlertTriangle, Wind, Info, CheckCircle2 } from 'lucide-react';
import { INARISK_LAYERS } from './data/inariskConfig.ts';
import { IRBI_2025_RECORDS } from './data/irbi2025Data.ts';
import { INITIAL_HOTSPOTS } from './data/initialHotspots.ts';
import { BMKG_FDRS_RECORDS, OPEN_METEO_PROTOTYPE_RECORDS } from './data/bmkgFdrsData.ts';
import { OFFICIAL_ISPU_RECORDS } from './data/ispuData.ts';
import { PUSDATIN_INCIDENT_RECORDS } from './data/pusdatinData.ts';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('MAP');
  
  // Filter States
  const [selectedProvince, setSelectedProvince] = useState<WorkingProvince>('SEMUA');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeFilter>('7_HARI_TERAKHIR');
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>('');
  const [useOpenMeteoPrototype, setUseOpenMeteoPrototype] = useState<boolean>(false);

  // Data States
  const [hotspots, setHotspots] = useState<Hotspot[]>(INITIAL_HOTSPOTS);
  const [irbiRecords, setIrbiRecords] = useState<IRBIRecord[]>(IRBI_2025_RECORDS);
  const [fdrsRecords, setFdrsRecords] = useState<BMKGFDRSRecord[]>(BMKG_FDRS_RECORDS);
  const [prototypeRecords, setPrototypeRecords] = useState<BMKGFDRSRecord[]>(OPEN_METEO_PROTOTYPE_RECORDS);
  const [ispuRecords, setIspuRecords] = useState<ISPUSiteRecord[]>(OFFICIAL_ISPU_RECORDS);
  const [pusdatinRecords, setPusdatinRecords] = useState<PusdatinEventRecord[]>(PUSDATIN_INCIDENT_RECORDS);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch initial data & system status (Supports static GitHub Pages & full-stack API)
  const loadSystemStatus = async () => {
    try {
      // 1. Try static manifest.json first (GitHub Pages mode)
      const staticRes = await fetch('./data/manifest.json');
      if (staticRes.ok) {
        const manifestData = await staticRes.json();
        setSystemStatus({
          timestamp: manifestData.generatedAt,
          firms: manifestData.sources?.firms,
          sipongi: manifestData.sources?.sipongi,
          inarisk: manifestData.sources?.inarisk,
          bmkg: manifestData.sources?.bmkg,
          irbi: manifestData.sources?.irbi,
          ispu: manifestData.sources?.ispu,
          pusdatin: manifestData.sources?.pusdatin
        });
        return;
      }
    } catch {
      // Ignore and fallback to live server route
    }

    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (e) {
      console.warn('API /api/status error:', e);
    }
  };

  const loadHotspots = async () => {
    try {
      // 1. Try static published hotspots.json first (GitHub Pages mode)
      const staticRes = await fetch('./data/hotspots.json');
      if (staticRes.ok) {
        const json = await staticRes.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setHotspots(json.data);
          return;
        }
      }
    } catch {
      // Ignore and fallback to live server route
    }

    try {
      const res = await fetch('/api/firms/hotspots?days=7');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setHotspots(json.data);
        }
      }
    } catch (e) {
      console.warn('API /api/firms/hotspots error:', e);
    }
  };

  useEffect(() => {
    loadSystemStatus();
    loadHotspots();
  }, []);

  // Filter Hotspots based on province and time
  const filteredHotspots = hotspots.filter((hs) => {
    // 1. Province filter
    if (selectedProvince !== 'SEMUA' && hs.province !== selectedProvince) {
      return false;
    }

    // 2. Time range filter
    const todayStr = '2026-10-17';
    if (selectedTimeRange === 'HARI_INI') {
      return hs.acq_date === todayStr;
    }
    // '7_HARI_TERAKHIR' includes all past 7 days up to today
    // 'PRAKIRAAN_10_HARI': Hotspots are observed events; when forecast is active, we preserve the 7-day baseline
    return true;
  });

  const handleExportExcel = () => {
    exportKarhutlaReportToExcel({
      hotspots: filteredHotspots,
      irbiRecords,
      fdrsRecords,
      ispuRecords,
      filterProvince: selectedProvince,
      filterTime: selectedTimeRange
    });
    showToast('Laporan data karhutla berhasil diekspor ke format Excel (.xlsx)');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleImportSuccess = (updatedHotspots: Hotspot[], msg: string) => {
    setHotspots(updatedHotspots);
    showToast(msg);
    loadSystemStatus();
  };

  // Summary Metrics calculations
  const totalObserved = filteredHotspots.length;
  const highConfidenceCount = filteredHotspots.filter((h) => h.confidence === 'high').length;
  const extremeFdrsCount = fdrsRecords.filter((f) => !f.isForecast && f.ffmcClass === 'EKSTREM').length;
  const unhealthyAirCount = ispuRecords.filter(
    (i) => i.category === 'TIDAK_SEHAT' || i.category === 'SANGAT_TIDAK_SEHAT'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract (Section 2 Frontend Constitution) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportExcel={handleExportExcel}
        isKeyConfigured={Boolean(systemStatus?.firms?.keyConfigured)}
      />

      {/* Filter Toolbar */}
      <FilterBar
        selectedProvince={selectedProvince}
        onSelectProvince={setSelectedProvince}
        selectedTimeRange={selectedTimeRange}
        onSelectTimeRange={setSelectedTimeRange}
        selectedRegencyId={selectedRegencyId}
        onSelectRegencyId={setSelectedRegencyId}
        totalHotspotsCount={totalObserved}
        useOpenMeteoPrototype={useOpenMeteoPrototype}
        onToggleOpenMeteo={setUseOpenMeteoPrototype}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* KPI Strip (Domain-Grounded Single Elevation) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Hotspot Teramati</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 tabular-nums">
              {totalObserved}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              NASA FIRMS & SiPongi+ · {selectedTimeRange === 'HARI_INI' ? 'Hari Ini' : '7 Hari'}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Kepercayaan Tinggi (High)</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-red-400 tabular-nums">
              {highConfidenceCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              Prioritas Verifikasi & Groundcheck
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Zona FDRS Ekstrem</span>
              <Wind className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-orange-400 tabular-nums">
              {extremeFdrsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              BMKG FFMC &gt; 88 (Sangat Mudah Terbakar)
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Stasiun ISPU Tidak Sehat</span>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 tabular-nums">
              {unhealthyAirCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              AQMS KLHK Terdampak Asap Karhutla
            </div>
          </div>
        </div>

        {/* View Switcher Container */}
        {activeTab === 'MAP' && (
          <div className="space-y-6">
            {/* Map Header & Source Metadata */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    Peta Terpadu Hotspot Satelit & Bahaya InaRISK Karhutla
                  </h2>
                  <span className="text-xs text-slate-400">
                    Cakupan Nasional & 6 Provinsi Prioritas Penanganan Bencana Karhutla
                  </span>
                </div>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-amber-400 border border-amber-600/60 rounded hover:bg-amber-950/40 transition-colors"
                >
                  Buka Laporan Harian Pimpinan
                </button>
              </div>

              <SourceMetadataBadge
                metadata={{
                  agency: 'NASA FIRMS & KLHK SiPongi+ & InaRISK BNPB',
                  name: 'Integrasi Observasi Hotspot & ArcGIS ImageServer',
                  period: selectedTimeRange === 'HARI_INI' ? '17 Oktober 2026' : '11 - 17 Oktober 2026',
                  timestamp: '2026-10-17 14:30 WIB',
                  validationStatus: 'Observasi Satelit NRT & Verifikasi Pusdalops BPBD',
                  connectionStatus: 'TERHUBUNG',
                  provenance: filteredHotspots.some(h => h.provenance === 'RESMI_TERVERIFIKASI') ? 'RESMI_TERVERIFIKASI' : 'DEMO_BELUM_TERVERIFIKASI',
                  details: 'Satelit VIIRS Suomi-NPP, NOAA-20, Aqua/Terra MODIS'
                }}
              />
            </div>

            {/* Interactive Leaflet Map */}
            <InteractiveMap
              hotspots={filteredHotspots}
              selectedProvince={selectedProvince}
              selectedRegencyId={selectedRegencyId}
              inariskLayers={INARISK_LAYERS}
            />

            {/* Hotspots Detailed Verification Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Daftar Rincian Titik Hotspot Teramati (Observasi Satelit)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Menampilkan koordinat lintang/bujur, sensor satelit, estimasi FRP, dan status konfirmasi
                  </span>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {filteredHotspots.length} Titik Terdaftar
                </span>
              </div>

              <div className="overflow-x-auto rounded border border-slate-800 max-h-80">
                <table className="w-full text-xs text-left text-slate-300 border-collapse">
                  <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Sumber</th>
                      <th className="py-2.5 px-3">Waktu Akuisisi</th>
                      <th className="py-2.5 px-3">Satelit / Sensor</th>
                      <th className="py-2.5 px-3">Koordinat (Lat, Lon)</th>
                      <th className="py-2.5 px-3 text-right">FRP (MW)</th>
                      <th className="py-2.5 px-3 text-right">Suhu (K)</th>
                      <th className="py-2.5 px-3">Wilayah Administrasi</th>
                      <th className="py-2.5 px-3 text-center">Kepercayaan</th>
                      <th className="py-2.5 px-3">Status Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono tabular-nums">
                    {filteredHotspots.map((hs) => (
                      <tr key={hs.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-3 font-sans font-medium text-slate-200">
                          {hs.source === 'NASA_FIRMS' ? 'NASA FIRMS' : hs.source === 'SIPONGI_KLHK' ? 'SiPongi+' : 'Sampel Demo'}
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          {hs.acq_date} {hs.acq_time}
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          {hs.satellite}
                        </td>
                        <td className="py-2 px-3 text-slate-300 font-mono">
                          {hs.latitude.toFixed(4)}, {hs.longitude.toFixed(4)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-amber-400">
                          {hs.frp !== null && hs.frp !== undefined ? hs.frp.toFixed(1) : <span className="text-slate-500 font-normal">N/A</span>}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          {hs.brightness !== null && hs.brightness !== undefined ? hs.brightness.toFixed(1) : <span className="text-slate-500 font-normal">N/A</span>}
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-300">
                          {hs.regency}, {hs.province}
                          {hs.district && <span className="text-slate-500 block text-[10px]">Kec. {hs.district}</span>}
                        </td>
                        <td className="py-2 px-3 text-center font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              hs.confidence === 'high'
                                ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            }`}
                          >
                            {hs.confidence.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans text-[11px] text-sky-400">
                          {hs.validationStatus.replace(/_/g, ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recharts Analytics Charts */}
            <AnalyticsCharts
              hotspots={filteredHotspots}
              fdrsRecords={fdrsRecords}
              ispuRecords={ispuRecords}
              selectedProvince={selectedProvince}
            />
          </div>
        )}

        {/* Tab 2: BMKG FDRS Numerical Weather & Index */}
        {activeTab === 'FDRS' && (
          <BMKGFDRSView
            fdrsRecords={fdrsRecords}
            prototypeRecords={prototypeRecords}
            selectedProvince={selectedProvince}
            useOpenMeteoPrototype={useOpenMeteoPrototype}
            onOpenImport={() => setIsImportOpen(true)}
          />
        )}

        {/* Tab 3: Official IRBI 2025 Disaster Risk Table */}
        {activeTab === 'IRBI' && (
          <IRBITable
            records={irbiRecords}
            selectedProvince={selectedProvince}
            onSelectRegency={(regName) => {
              // Switch to map and focus on regency
              setActiveTab('MAP');
              const found = irbiRecords.find((r) => r.regency === regName);
              if (found) {
                showToast(`Memfokuskan peta pada ${regName}`);
              }
            }}
          />
        )}

        {/* Tab 4: ISPU Air Quality & Pusdatin Impact Operations */}
        {activeTab === 'IMPACT' && (
          <ISPUImpactView
            ispuRecords={ispuRecords}
            pusdatinRecords={pusdatinRecords}
            selectedProvince={selectedProvince}
            onOpenImport={() => setIsImportOpen(true)}
          />
        )}

        {/* Tab 5: Executive Report View */}
        {activeTab === 'REPORT' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div>
                <h2 className="text-sm font-bold text-slate-100">
                  Laporan Situasi Harian Pimpinan (Dit. PD BNPB)
                </h2>
                <span className="text-xs text-slate-400">
                  Format Ringkasan Eksekutif untuk Kepala BNPB & Deputi Bidang Pencegahan
                </span>
              </div>
              <button
                onClick={() => setIsReportOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded text-xs transition-colors"
              >
                Buka Modal Cetak / Unduh PDF
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="max-w-3xl mx-auto space-y-6 text-xs text-slate-300 leading-relaxed">
                <div className="text-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-100 uppercase">
                    BADAN NASIONAL PENANGGULANGAN BENCANA (BNPB)
                  </h3>
                  <span className="text-amber-400 font-semibold block">
                    DIREKTORAT PERINGATAN DINI
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    LAPORAN STATUS PERINGATAN DINI KARHUTLA · {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200">1. Ringkasan Eksekutif</h4>
                  <p className="text-justify">
                    Hasil pemantauan 24 jam terakhir menunjukkan peningkatan indeks kemudahan terbakar (FFMC) di atas ambang kritis 88 pada 2 kabupaten prioritas utama: Kab. Ogan Komering Ilir (Sumatera Selatan) dan Kab. Pelalawan (Riau). Sejumlah {highConfidenceCount} titik hotspot berstatus kepercayaan tinggi memerlukan intervensi pemadaman darat dan pemantauan udara lanjutan.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200">2. Rekomendasi Siaga</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Optimalisasi posko siaga darurat BPBD Provinsi Riau dan Sumsel.</li>
                    <li>Mobilisasi Satgas Udara helikopter water bombing ke zona Teluk Meranti & Pangkalan Lampam.</li>
                    <li>Koordinasi teknis pelaksanaan TMC dengan BMKG menjelang jendela awan hari ke-4/ke-5.</li>
                  </ul>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium"
                  >
                    Buka Dokumen Lengkap & Pratinjau Cetak
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Direktorat Peringatan Dini · Deputi Bidang Pencegahan · Badan Nasional Penanggulangan Bencana (BNPB)
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Integrasi Data Resmi: NASA FIRMS Area API, KLHK SiPongi+, InaRISK ArcGIS REST, BMKG FDRS, IRBI 2025, ISPU KLH, dan Pusdatin BNPB.
        </p>
      </footer>

      {/* Modals */}
      <ExecutiveReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        hotspots={filteredHotspots}
        irbiRecords={irbiRecords}
        fdrsRecords={fdrsRecords}
        ispuRecords={ispuRecords}
        selectedProvince={selectedProvince}
        onExportExcel={handleExportExcel}
      />

      <FileImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemStatus={systemStatus}
        onRefreshStatus={loadSystemStatus}
      />
    </div>
  );
}
