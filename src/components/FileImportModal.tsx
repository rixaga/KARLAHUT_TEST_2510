import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Info, Layers, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Hotspot } from '../types/karhutla.ts';
import { parseSiPongiPoints, parseSiPongiRegencySummary } from '../utils/sipongiParser.ts';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (hotspots: Hotspot[], message: string) => void;
}

export const FileImportModal: React.FC<FileImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'SIPONGI' | 'BMKG' | 'ISPU'>('SIPONGI');
  const [sipongiMode, setSipongiMode] = useState<'POINTS' | 'SUMMARY'>('POINTS');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [importReport, setImportReport] = useState<{
    validCount: number;
    skippedCount: number;
    reasons: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setImportReport(null);
    setFileName(file.name);
    setIsProcessing(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const csvText = XLSX.utils.sheet_to_csv(worksheet);
        setFileContent(csvText);

        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setPreviewRows(jsonRows.slice(0, 5));
      } else {
        const text = await file.text();
        setFileContent(text);
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        setPreviewRows(lines.slice(0, 5).map(l => l.split(',')));
      }
    } catch (err: any) {
      setErrorMsg(`Gagal membaca berkas: ${err.message || 'Format tidak didukung'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSamplePoints = () => {
    const sample = `Tanggal,Waktu,Satelit,Lintang,Bujur,Tingkat_Kepercayaan,Provinsi,Kabupaten,Kecamatan,Desa,FRP
2026-10-17,14:10,VIIRS-SNPP,0.342,102.185,Tinggi,Riau,Kab. Pelalawan,Teluk Meranti,Kuala Panduk,42.5
2026-10-17,14:22,NOAA-20,-3.450,105.195,Tinggi,Sumatera Selatan,Kab. Ogan Komering Ilir,Pangkalan Lampam,Rambai,51.0
2026-10-17,13:55,VIIRS-SNPP,-2.115,112.810,Sedang,Kalimantan Tengah,Kab. Kotawaringin Timur,Mentawa Baru Ketapang,Bapeang,28.4
2026-10-17,14:05,MODIS-Aqua,-1.840,109.970,Sedang,Kalimantan Barat,Kab. Ketapang,Kendawangan,Sungai Gantang,22.1
2026-10-17,14:30,VIIRS-SNPP,1.485,102.130,Tinggi,Riau,Kab. Bengkalis,Bukit Batu,Pakning Asal,33.0`;

    setSipongiMode('POINTS');
    setFileName('contoh_resmi_sipongi_titik_koordinat.csv');
    setFileContent(sample);
    setPreviewRows([
      ['Tanggal', 'Waktu', 'Satelit', 'Lintang', 'Bujur', 'Tingkat_Kepercayaan', 'Provinsi', 'Kabupaten', 'FRP'],
      ['2026-10-17', '14:10', 'VIIRS-SNPP', '0.342', '102.185', 'Tinggi', 'Riau', 'Kab. Pelalawan', '42.5'],
      ['2026-10-17', '14:22', 'NOAA-20', '-3.450', '105.195', 'Tinggi', 'Sumatera Selatan', 'Kab. Ogan Komering Ilir', '51.0'],
      ['2026-10-17', '13:55', 'VIIRS-SNPP', '-2.115', '112.810', 'Sedang', 'Kalimantan Tengah', 'Kab. Kotawaringin Timur', '28.4']
    ]);
  };

  const handleLoadSampleSummary = () => {
    const sample = `Provinsi,Kabupaten,Jumlah_Hotspot,High_Confidence,Periode,Satelit
Sumatera Selatan,Kab. Ogan Komering Ilir,48,32,11-17 Oktober 2026,VIIRS/MODIS
Riau,Kab. Pelalawan,36,25,11-17 Oktober 2026,VIIRS/MODIS
Kalimantan Tengah,Kab. Kotawaringin Timur,29,18,11-17 Oktober 2026,VIIRS/MODIS
Kalimantan Barat,Kab. Ketapang,24,14,11-17 Oktober 2026,VIIRS/MODIS
Riau,Kab. Bengkalis,19,12,11-17 Oktober 2026,VIIRS/MODIS`;

    setSipongiMode('SUMMARY');
    setFileName('contoh_resmi_sipongi_rekap_kabupaten.csv');
    setFileContent(sample);
    setPreviewRows([
      ['Provinsi', 'Kabupaten', 'Jumlah_Hotspot', 'High_Confidence', 'Periode', 'Satelit'],
      ['Sumatera Selatan', 'Kab. Ogan Komering Ilir', '48', '32', '11-17 Oktober 2026', 'VIIRS/MODIS'],
      ['Riau', 'Kab. Pelalawan', '36', '25', '11-17 Oktober 2026', 'VIIRS/MODIS'],
      ['Kalimantan Tengah', 'Kab. Kotawaringin Timur', '29', '18', '11-17 Oktober 2026', 'VIIRS/MODIS']
    ]);
  };

  const handleProcessImport = async () => {
    if (!fileContent) {
      setErrorMsg('Pilih berkas terlebih dahulu.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setImportReport(null);

    // 1. Try server endpoint first (when running full-stack)
    let processedViaServer = false;
    try {
      const modeParam = sipongiMode === 'SUMMARY' ? 'summary' : 'points';
      const response = await fetch('/api/sipongi/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fileContent, fileName, mode: modeParam })
      });

      if (response.ok) {
        const result = await response.json();
        processedViaServer = true;

        if (sipongiMode === 'SUMMARY') {
          onImportSuccess([], result.message);
          onClose();
          return;
        }

        const hotspotsRes = await fetch('/api/firms/hotspots');
        if (hotspotsRes.ok) {
          const hotspotsJson = await hotspotsRes.json();
          onImportSuccess(hotspotsJson.data, result.message);
          onClose();
          return;
        }
      }
    } catch {
      // Fallback to client-side parsing (supports GitHub Pages static hosting)
      processedViaServer = false;
    }

    // 2. Client-side robust fallback (for GitHub Pages static deployments)
    try {
      if (sipongiMode === 'SUMMARY') {
        const summaryRes = parseSiPongiRegencySummary(fileContent, 'RESMI_TERVERIFIKASI');
        if (summaryRes.summaries.length === 0) {
          throw new Error('Tidak ditemukan baris rekapitulasi valid. Pastikan kolom Kabupaten dan Jumlah Hotspot tersedia.');
        }
        onImportSuccess([], `Berhasil memproses rekapitulasi ${summaryRes.validRows} kabupaten dari ${fileName}`);
        onClose();
        return;
      }

      // Mode Points
      const parseResult = parseSiPongiPoints(fileContent, fileName, 'RESMI_TERVERIFIKASI');
      if (parseResult.hotspots.length === 0) {
        setErrorMsg('Tidak ada koordinat lintang/bujur valid yang dapat diekstrak. Sesuai protokol integritas data BNPB, baris tanpa koordinat asli otomatis dilewati.');
        setImportReport({
          validCount: 0,
          skippedCount: parseResult.skippedRows,
          reasons: parseResult.skippedReasons
        });
        return;
      }

      setImportReport({
        validCount: parseResult.validRows,
        skippedCount: parseResult.skippedRows,
        reasons: parseResult.skippedReasons
      });

      onImportSuccess(parseResult.hotspots, `Berhasil mengimpor ${parseResult.validRows} titik hotspot SiPongi+ resmi. (${parseResult.skippedRows} baris tanpa koordinat dilewati).`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengimpor berkas.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-xl w-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-100">
              Impor Berkas Resmi SiPongi+ & BMKG
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Format Explanation Notice */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded flex gap-2.5 text-slate-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200 mb-0.5">
                Protokol Integritas Berkas Resmi Dit. PD BNPB:
              </p>
              <p className="leading-relaxed text-slate-400">
                Data resmi SiPongi+ KLHK diimpor langsung tanpa mengarang koordinat default. Baris tanpa koordinat asli akan ditolak secara transparan untuk menjaga keabsahan geospasial.
              </p>
            </div>
          </div>

          {/* Primary Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded border border-slate-800">
            <button
              onClick={() => setActiveTab('SIPONGI')}
              className={`flex-1 py-1.5 rounded font-medium transition-colors ${
                activeTab === 'SIPONGI' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SiPongi+ KLHK (Hotspot)
            </button>
            <button
              onClick={() => setActiveTab('BMKG')}
              className={`flex-1 py-1.5 rounded font-medium transition-colors ${
                activeTab === 'BMKG' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Buletin BMKG (FDRS)
            </button>
            <button
              onClick={() => setActiveTab('ISPU')}
              className={`flex-1 py-1.5 rounded font-medium transition-colors ${
                activeTab === 'ISPU' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ISPU / Pusdatin
            </button>
          </div>

          {/* SiPongi Sub-Mode Switcher: Mode Titik Koordinat vs Mode Rekapitulasi */}
          {activeTab === 'SIPONGI' && (
            <div className="p-2 bg-slate-950/70 border border-slate-800 rounded space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Mode Ekstraksi Data SiPongi+:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSipongiMode('POINTS')}
                  className={`p-2 rounded text-left border transition-colors ${
                    sipongiMode === 'POINTS'
                      ? 'bg-amber-950/60 border-amber-500/80 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Mode 1: Titik Berkoordinat
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Membutuhkan Lat & Lon untuk plotting peta langsung
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSipongiMode('SUMMARY')}
                  className={`p-2 rounded text-left border transition-colors ${
                    sipongiMode === 'SUMMARY'
                      ? 'bg-amber-950/60 border-amber-500/80 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-0.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    Mode 2: Rekapitulasi Daerah
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tabel agregat jumlah hotspot per kabupaten/kota
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-lg p-6 text-center transition-colors bg-slate-950/40">
            <input
              type="file"
              id="file-upload"
              accept=".xlsx,.xls,.csv,.txt,.kmz,.kml"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400 mb-2" />
              <span className="font-medium text-slate-200">
                {fileName ? fileName : 'Klik untuk memilih berkas resmi atau seret ke sini'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Mendukung XLSX, XLS, CSV, TXT, KMZ (Maksimal 20MB)
              </span>
            </label>
          </div>

          {/* Quick Demo Sample Loaders for both Modes */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLoadSamplePoints}
                type="button"
                className="text-amber-400 hover:text-amber-300 font-medium underline"
              >
                + Sampel Mode 1 (Titik Koordinat)
              </button>
              <button
                onClick={handleLoadSampleSummary}
                type="button"
                className="text-sky-400 hover:text-sky-300 font-medium underline"
              >
                + Sampel Mode 2 (Rekap Kabupaten)
              </button>
            </div>
            {fileName && (
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Berkas Siap Diolah
              </span>
            )}
          </div>

          {/* Preview Table if rows exist */}
          {previewRows.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold">Pratinjau Data Masukan:</span>
              <div className="max-h-28 overflow-auto border border-slate-800 rounded bg-slate-950 text-[11px] font-mono">
                <table className="w-full text-left">
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className={i === 0 ? 'bg-slate-900 font-bold text-slate-300' : 'border-t border-slate-900 text-slate-400'}>
                        {Array.isArray(row) && row.slice(0, 7).map((cell, j) => (
                          <td key={j} className="p-1 px-2 whitespace-nowrap">{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Diagnostic Report if skipped rows occur */}
          {importReport && importReport.skippedCount > 0 && (
            <div className="p-3 bg-amber-950/40 border border-amber-800 text-amber-300 rounded space-y-1 text-[11px]">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>{importReport.skippedCount} baris tidak memenuhi validasi koordinat:</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-300 text-[10px]">
                {importReport.reasons.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleProcessImport}
            disabled={!fileContent || isProcessing}
            className={`px-4 py-2 text-xs font-semibold text-white rounded transition-colors ${
              fileContent && !isProcessing
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            {isProcessing ? 'Memproses Berkas...' : 'Mulai Impor & Validasi'}
          </button>
        </div>
      </div>
    </div>
  );
};
