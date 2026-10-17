import React from 'react';
import type { Hotspot, IRBIRecord, BMKGFDRSRecord, ISPUSiteRecord, WorkingProvince } from '../types/karhutla.ts';
import { Printer, X, Download, ShieldCheck, AlertOctagon, FileText } from 'lucide-react';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotspots: Hotspot[];
  irbiRecords: IRBIRecord[];
  fdrsRecords: BMKGFDRSRecord[];
  ispuRecords: ISPUSiteRecord[];
  selectedProvince: WorkingProvince;
  onExportExcel: () => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  hotspots,
  irbiRecords,
  fdrsRecords,
  ispuRecords,
  selectedProvince,
  onExportExcel
}) => {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const printTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // Counts
  const highConfHotspots = hotspots.filter(h => h.confidence === 'high').length;
  const extremeFdrsCount = fdrsRecords.filter(f => !f.isForecast && f.ffmcClass === 'EKSTREM').length;
  const unhealthyIspuCount = ispuRecords.filter(i => i.category === 'TIDAK_SEHAT' || i.category === 'SANGAT_TIDAK_SEHAT').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-100">
              Laporan Harian Pimpinan - Peringatan Dini Karhutla
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-100 bg-amber-600 hover:bg-amber-500 rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Cetak PDF</span>
            </button>
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content Body (Styled for Screen and High-Quality Print) */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-200 text-xs leading-relaxed bg-slate-950/60 print:bg-white print:text-black print:p-0">
          {/* Formal Letterhead */}
          <div className="text-center border-b-2 border-slate-700 print:border-black pb-4">
            <h1 className="text-base font-bold uppercase tracking-wider text-slate-100 print:text-black">
              BADAN NASIONAL PENANGGULANGAN BENCANA (BNPB)
            </h1>
            <h2 className="text-sm font-semibold tracking-wide text-amber-400 print:text-black">
              DIREKTORAT PERINGATAN DINI · DEPUTI BIDANG PENCEGAHAN
            </h2>
            <p className="text-[11px] text-slate-400 print:text-slate-700 mt-1">
              Graha BNPB, Jl. Pramuka Kav. 38 Jakarta Timur 13120 · Telp: (021) 29827793
            </p>
          </div>

          {/* Title & Document Number */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 print:border-gray-300 pb-3 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 print:text-gray-600">Nomor: </span>
              <strong className="text-slate-200 print:text-black">LAP-PD/KHT/{new Date().getFullYear()}/{new Date().getMonth() + 1}/082</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-600">Waktu Terbit: </span>
              <strong className="text-slate-200 print:text-black">{today}, {printTime} WIB</strong>
            </div>
          </div>

          {/* Section 1: Ringkasan Situasi 24 Jam */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black border-l-2 border-amber-500 pl-2">
              I. Ringkasan Eksekutif Situasi Nasional
            </h3>
            <p className="text-justify text-slate-300 print:text-black">
              Berdasarkan hasil pemantauan spasial terpadu Direktorat Peringatan Dini BNPB yang mengintegrasikan data satelit <strong>NASA FIRMS Area API (VIIRS/MODIS)</strong> dan <strong>SiPongi+ KLHK</strong>, terdeteksi sebanyak <strong>{hotspots.length} titik panas (hotspot)</strong> di wilayah {selectedProvince === 'SEMUA' ? 'Nasional' : selectedProvince}, dengan <strong>{highConfHotspots} titik berkepercayaan tinggi (high confidence)</strong> yang teridentifikasi di atas formasi lahan gambut kritis. Sistem Peringkat Bahaya Kebakaran (FDRS) BMKG menunjukkan <strong>{extremeFdrsCount} kabupaten/kota</strong> berada dalam kategori <em>Sangat Mudah Terbakar (Ekstrem)</em>.
            </p>
          </div>

          {/* Section 2: Matriks Ringkasan Indikator */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-900 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block">Hotspot Teramati</span>
              <span className="text-xl font-bold font-mono text-amber-400 print:text-black">{hotspots.length}</span>
              <span className="text-[10px] text-slate-400 print:text-gray-500 block">Titik Observasi</span>
            </div>
            <div className="p-3 bg-slate-900 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block">Kepercayaan Tinggi</span>
              <span className="text-xl font-bold font-mono text-red-400 print:text-black">{highConfHotspots}</span>
              <span className="text-[10px] text-slate-400 print:text-gray-500 block">Prioritas Lapangan</span>
            </div>
            <div className="p-3 bg-slate-900 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block">Wilayah FFMC Ekstrem</span>
              <span className="text-xl font-bold font-mono text-red-500 print:text-black">{extremeFdrsCount}</span>
              <span className="text-[10px] text-slate-400 print:text-gray-500 block">BMKG FDRS &gt; 88</span>
            </div>
            <div className="p-3 bg-slate-900 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block">AQMS Kualitas Tidak Sehat</span>
              <span className="text-xl font-bold font-mono text-amber-400 print:text-black">{unhealthyIspuCount}</span>
              <span className="text-[10px] text-slate-400 print:text-gray-500 block">ISPU &gt; 100</span>
            </div>
          </div>

          {/* Section 3: Rekap Wilayah Prioritas 6 Provinsi */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black border-l-2 border-amber-500 pl-2">
              II. Sebaran Hotspot & Indeks Risiko IRBI 2025 di 6 Provinsi Kerja
            </h3>
            <table className="w-full text-[11px] text-left border-collapse border border-slate-800 print:border-gray-300">
              <thead className="bg-slate-900 print:bg-gray-200 text-slate-300 print:text-black">
                <tr>
                  <th className="p-2 border border-slate-800 print:border-gray-300">Kabupaten / Kota Prioritas</th>
                  <th className="p-2 border border-slate-800 print:border-gray-300">Provinsi</th>
                  <th className="p-2 border border-slate-800 print:border-gray-300 text-right">Skor IRBI 2025</th>
                  <th className="p-2 border border-slate-800 print:border-gray-300 text-center">Kelas Risiko</th>
                  <th className="p-2 border border-slate-800 print:border-gray-300 text-right">Hotspot Teramati</th>
                  <th className="p-2 border border-slate-800 print:border-gray-300 text-center">Status FDRS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300 font-mono">
                {irbiRecords.slice(0, 6).map((rec) => {
                  const hsCount = hotspots.filter(h => h.regency === rec.regency).length;
                  return (
                    <tr key={rec.rank} className="print:text-black">
                      <td className="p-2 border border-slate-800 print:border-gray-300 font-sans font-medium">
                        {rec.regency}
                      </td>
                      <td className="p-2 border border-slate-800 print:border-gray-300 font-sans">
                        {rec.province}
                      </td>
                      <td className="p-2 border border-slate-800 print:border-gray-300 text-right">
                        {rec.riskIndex !== null && rec.riskIndex !== undefined ? rec.riskIndex.toFixed(1) : '-'}
                      </td>
                      <td className="p-2 border border-slate-800 print:border-gray-300 text-center font-sans font-semibold text-red-400 print:text-black">
                        {rec.riskClass}
                      </td>
                      <td className="p-2 border border-slate-800 print:border-gray-300 text-right font-bold text-amber-400 print:text-black">
                        {hsCount} Titik
                      </td>
                      <td className="p-2 border border-slate-800 print:border-gray-300 text-center font-sans">
                        EKSTREM
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 4: Rekomendasi Operasional Tindak Lanjut Pimpinan */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black border-l-2 border-amber-500 pl-2">
              III. Rekomendasi Tindak Lanjut Operasional Penanganan
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 print:text-black">
              <li>
                <strong>Peningkatan Kesiapsiagaan Darurat:</strong> Menginstruksikan BPBD Provinsi Sumatera Selatan, Riau, dan Kalimantan Tengah untuk memperpanjang Status Siaga Darurat Bencana Asap Karhutla.
              </li>
              <li>
                <strong>Patroli Terpadu & Groundcheck 24 Jam:</strong> Pengerahan regu gabungan TNI, Polri, BPBD, dan Manggala Agni ke titik hotspot terverifikasi di Teluk Meranti (Pelalawan) dan Pangkalan Lampam (OKI).
              </li>
              <li>
                <strong>Operasi Teknologi Modifikasi Cuaca (TMC):</strong> Rekomendasi pelaksanaan TMC bekerja sama dengan BMKG dan BRIN pada jendela awan potensial hari ke-4 dan ke-5 prakiraan hujan.
              </li>
              <li>
                <strong>Kesiapan Helikopter Water Bombing:</strong> Menempatkan 2 unit helikopter water bombing standby di Lanud Roesmin Nurjadin Pekanbaru dan Bandara SMB II Palembang.
              </li>
            </ol>
          </div>

          {/* Signatures */}
          <div className="pt-8 flex justify-between items-end text-center print:text-black">
            <div className="w-56">
              <p className="text-[11px] text-slate-400 print:text-gray-600 mb-12">Disiapkan Oleh:</p>
              <p className="font-bold underline text-slate-200 print:text-black">Tim Analis Peringatan Dini</p>
              <p className="text-[10px] text-slate-400 print:text-gray-600">Direktorat Peringatan Dini BNPB</p>
            </div>
            <div className="w-64">
              <p className="text-[11px] text-slate-400 print:text-gray-600 mb-12">Mengetahui,</p>
              <p className="font-bold underline text-slate-200 print:text-black">Direktur Peringatan Dini BNPB</p>
              <p className="text-[10px] text-slate-400 print:text-gray-600">NIP. 19740512 200212 1 002</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
