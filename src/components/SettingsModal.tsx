import React from 'react';
import { Settings2, X, Key, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, ShieldCheck, Lock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: any;
  onRefreshStatus: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  systemStatus,
  onRefreshStatus
}) => {
  if (!isOpen) return null;

  const isFirmsConnected = Boolean(systemStatus?.firms?.connected);
  const isInariskConnected = Boolean(systemStatus?.inarisk?.connected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-xl w-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-100">
              Konfigurasi Kredensial & Diagnostik Sistem
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs text-slate-300 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Kredensial NASA FIRMS API */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                NASA FIRMS Area API Map Key (Server-Side Secret)
              </span>
              <a
                href="https://firms.modaps.eosdis.nasa.gov/api/map_key/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
              >
                <span>Daftar Kunci NASA</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status Konfigurasi:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  isFirmsConnected 
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                }`}>
                  {isFirmsConnected ? 'TERKONFIGURASI DI SERVER (.env / SECRET)' : 'BELUM TERKONFIGURASI'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Sesuai standar audit keamanan, kunci MAP_KEY tidak boleh diubah melalui endpoint publik peramban. Kunci dikelola secara aman melalui:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li><code className="text-amber-400">FIRMS_MAP_KEY</code> pada berkas <code className="text-slate-300">.env</code> lokal backend.</li>
                <li><code className="text-amber-400">FIRMS_MAP_KEY</code> pada GitHub Actions Repository Secret untuk pipeline statis.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Matriks Status Koneksi 7 Integrasi Utama */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">
                Pemeriksaan Status Koneksi & Integritas Data Aktual:
              </span>
              <button
                onClick={onRefreshStatus}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Periksa Ulang</span>
              </button>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              {/* NASA FIRMS */}
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-sans font-medium text-slate-200">1. NASA FIRMS Area API</div>
                  <div className="text-slate-400 text-[10px] font-sans">
                    {systemStatus?.firms?.message || 'Memeriksa kredensial...'}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                  isFirmsConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {isFirmsConnected ? 'LIVE FEED AKTIF' : 'DEMO / BELUM TERVERIFIKASI'}
                </span>
              </div>

              {/* SiPongi */}
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-sans font-medium text-slate-200">2. KLHK SiPongi+ (Ditjen PPI)</div>
                  <div className="text-slate-400 text-[10px] font-sans">
                    {systemStatus?.sipongi?.fileName || 'sampel_bawaan.csv'} · {systemStatus?.sipongi?.importedCount || 0} Titik
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                  systemStatus?.sipongi?.provenance === 'RESMI_TERVERIFIKASI'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {systemStatus?.sipongi?.provenance === 'RESMI_TERVERIFIKASI' ? 'RESMI TERVERIFIKASI' : 'DEMO / BELUM TERVERIFIKASI'}
                </span>
              </div>

              {/* InaRISK */}
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-sans font-medium text-slate-200">3. InaRISK ArcGIS REST ImageServer</div>
                  <div className="text-slate-400 text-[10px] font-sans">
                    https://gis.bnpb.go.id/arcgis/rest/services/inaRISK
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                  isInariskConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  {isInariskConnected ? 'ONLINE (TERHUBUNG)' : 'SERVER TIDAK MERESPON'}
                </span>
              </div>

              {/* Batas Administrasi */}
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-sans font-medium text-slate-200">4. Batas Administrasi BIG / BNPB</div>
                  <div className="text-slate-400 text-[10px] font-sans">
                    Geoportal BNPB · 38 Provinsi & 514 Kab/Kota
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ONLINE (TERHUBUNG)
                </span>
              </div>

              {/* IRBI 2025 */}
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-sans font-medium text-slate-200">5. IRBI Karhutla (Dit. PERB BNPB)</div>
                  <div className="text-slate-400 text-[10px] font-sans">
                    Basis Indeks Risiko Bencana Indonesia
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                  DEMO / BELUM TERVERIFIKASI
                </span>
              </div>

              {/* BMKG FDRS */}
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-sans font-medium text-slate-200">6. BMKG FDRS (FFMC/FWI/ISI)</div>
                  <div className="text-slate-400 text-[10px] font-sans">
                    Sistem Peringkat Bahaya Kebakaran BMKG
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                  DEMO / BELUM TERVERIFIKASI
                </span>
              </div>

              {/* ISPU & Pusdatin */}
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-sans font-medium text-slate-200">7. ISPU KLH & Pusdatin BNPB</div>
                  <div className="text-slate-400 text-[10px] font-sans">
                    Sensor Ambien AQMS & Catatan Operasi Darurat
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                  DEMO / BELUM TERVERIFIKASI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
