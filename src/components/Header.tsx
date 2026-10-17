import React from 'react';
import { ShieldAlert, FileSpreadsheet, FileText, Upload, Settings2, FileArchive } from 'lucide-react';

export type ActiveTab = 'MAP' | 'FDRS' | 'IRBI' | 'IMPACT' | 'REPORT';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onExportExcel: () => void;
  isKeyConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenImport,
  onOpenSettings,
  onExportExcel,
  isKeyConfigured
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
            Dit. PD BNPB · Peringatan Dini Karhutla
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400">
          <button
            onClick={() => onTabChange('MAP')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'MAP'
                ? 'text-white bg-slate-800 font-semibold border-b-2 border-amber-500'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Peta & Hotspot
          </button>
          <button
            onClick={() => onTabChange('FDRS')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'FDRS'
                ? 'text-white bg-slate-800 font-semibold border-b-2 border-amber-500'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Indeks FDRS BMKG
          </button>
          <button
            onClick={() => onTabChange('IRBI')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'IRBI'
                ? 'text-white bg-slate-800 font-semibold border-b-2 border-amber-500'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Tabel IRBI 2025
          </button>
          <button
            onClick={() => onTabChange('IMPACT')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'IMPACT'
                ? 'text-white bg-slate-800 font-semibold border-b-2 border-amber-500'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            ISPU & Dampak
          </button>
          <button
            onClick={() => onTabChange('REPORT')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'REPORT'
                ? 'text-white bg-slate-800 font-semibold border-b-2 border-amber-500'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Laporan Pimpinan
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/api/download-source-zip"
            download="bnpb-karhutla-dashboard-source.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
            title="Unduh berkas ZIP kode sumber bersih untuk ChatGPT"
          >
            <FileArchive className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Unduh ZIP Kode</span>
          </a>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
            title="Impor berkas resmi SiPongi/BMKG (XLSX, CSV, TXT, KMZ)"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Impor Resmi</span>
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
            title="Unduh seluruh data dalam format Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors shrink-0"
            title="Pengaturan NASA FIRMS MAP_KEY & Status Koneksi"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
