import React, { useState } from 'react';
import type { BMKGFDRSRecord, WorkingProvince } from '../types/karhutla.ts';
import { CloudRain, Wind, AlertTriangle, Compass, Flame, Info, Upload } from 'lucide-react';
import { getFDRSBadge } from '../utils/fdrsCalc.ts';
import { SourceMetadataBadge } from './SourceMetadataBadge.tsx';

interface BMKGFDRSViewProps {
  fdrsRecords: BMKGFDRSRecord[];
  prototypeRecords: BMKGFDRSRecord[];
  selectedProvince: WorkingProvince;
  useOpenMeteoPrototype: boolean;
  onOpenImport: () => void;
}

export const BMKGFDRSView: React.FC<BMKGFDRSViewProps> = ({
  fdrsRecords,
  prototypeRecords,
  selectedProvince,
  useOpenMeteoPrototype,
  onOpenImport
}) => {
  const [selectedStation, setSelectedStation] = useState<string>('Kab. Ogan Komering Ilir');

  // Filter records by province if selected
  const activeRecords = fdrsRecords.filter((rec) => {
    if (selectedProvince !== 'SEMUA') {
      return rec.province === selectedProvince;
    }
    return true;
  });

  // Current analysis / today
  const todayRecord =
    activeRecords.find((r) => !r.isForecast && r.regency === selectedStation) ||
    activeRecords.find((r) => !r.isForecast) ||
    fdrsRecords[0];

  // 10-day numerical forecast records
  const forecastRecords = activeRecords
    .filter((r) => r.isForecast && r.regency === todayRecord.regency)
    .sort((a, b) => a.forecastDay - b.forecastDay);

  const ffmcBadge = getFDRSBadge(todayRecord.ffmcClass);
  const fwiBadge = getFDRSBadge(todayRecord.fwiClass);
  const isiBadge = getFDRSBadge(todayRecord.isiClass);

  return (
    <div className="space-y-6">
      {/* Header & Source Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-slate-100">
                Sistem Peringkat Bahaya Kebakaran (FDRS) BMKG
              </h2>
            </div>
            <SourceMetadataBadge
              metadata={{
                agency: 'BMKG Republik Indonesia',
                name: 'Produk FDRS Operasional (FFMC, FWI, ISI)',
                period: 'Analisis Hari Ini & Prakiraan Numerik 10 Hari',
                timestamp: '2026-10-17 07:00 WIB',
                validationStatus: 'Analisis Model Numerik Operasional',
                connectionStatus: 'TERHUBUNG',
                provenance: todayRecord.provenance,
                details: 'Data bersumber dari Stasiun Meteorologi Publik & Model Cuaca Global BMKG'
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-950 border border-slate-700 rounded hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Impor Buletin / CSV BMKG</span>
            </button>
          </div>
        </div>

        {/* Station Selector */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Stasiun Cuaca Rujukan:</span>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500 font-medium"
            >
              {Array.from(new Set(fdrsRecords.map((r) => r.regency))).map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4 text-amber-500" />
            <span>Prakiraan ke depan berbasis simulasi cuaca (Bukan titik api observasi)</span>
          </div>
        </div>
      </div>

      {/* 4 Key FDRS Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: FFMC */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Indeks FFMC</span>
            <span className="font-mono text-[11px]">Bahan Baku Halus</span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
              {todayRecord.ffmc !== null && todayRecord.ffmc !== undefined ? todayRecord.ffmc.toFixed(1) : 'N/A'}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className={`text-xs px-2 py-1 rounded border font-medium ${ffmcBadge.bg} ${ffmcBadge.text} ${ffmcBadge.border}`}>
            {ffmcBadge.label}
          </div>
          <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
            Tingkat kemudahan seresah daun kering dan gambut bagian atas menyala oleh percikan api.
          </p>
        </div>

        {/* Card 2: FWI */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Indeks FWI</span>
            <span className="font-mono text-[11px]">Intensitas Api Total</span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
              {todayRecord.fwi !== null && todayRecord.fwi !== undefined ? todayRecord.fwi.toFixed(1) : 'N/A'}
            </span>
            <span className="text-xs text-slate-400">Indeks</span>
          </div>
          <div className={`text-xs px-2 py-1 rounded border font-medium ${fwiBadge.bg} ${fwiBadge.text} ${fwiBadge.border}`}>
            {fwiBadge.label}
          </div>
          <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
            Indikator numerik intensitas pelepasan energi api secara menyeluruh bila terjadi kebakaran.
          </p>
        </div>

        {/* Card 3: ISI & Angin */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Indeks ISI & Angin</span>
            <span className="font-mono text-[11px]">Laju Penjalaran</span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
              {todayRecord.isi !== null && todayRecord.isi !== undefined ? todayRecord.isi.toFixed(1) : 'N/A'}
            </span>
            <span className="text-xs text-slate-400">Skor Laju</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-2 font-mono">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            <span>{todayRecord.windSpeedKmH !== null ? `${todayRecord.windSpeedKmH} km/jam` : 'N/A'} · {todayRecord.windDirection}</span>
          </div>
          <div className={`text-xs px-2 py-1 rounded border font-medium ${isiBadge.bg} ${isiBadge.text} ${isiBadge.border}`}>
            {isiBadge.label}
          </div>
        </div>

        {/* Card 4: Peluang Hujan & Asap */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Cuaca & Citra Asap</span>
            <span className="font-mono text-[11px]">Probabilitas</span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
              {todayRecord.rainProbability !== null && todayRecord.rainProbability !== undefined ? `${todayRecord.rainProbability}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-400">Peluang Hujan</span>
          </div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Potensi Kabut Asap:</span>
            <span className="font-semibold text-red-400">{todayRecord.smokeHazeRisk}</span>
          </div>
          <div className="text-xs px-2 py-1 rounded border bg-slate-950 border-slate-800 text-slate-300 font-mono">
            {todayRecord.rainProbability !== null && todayRecord.rainProbability !== undefined && todayRecord.rainProbability < 20 ? 'Kering Kritis (Siaga)' : 'Potensi Hujan Lokal'}
          </div>
        </div>
      </div>

      {/* Alternative Prototype Notice if checked */}
      {useOpenMeteoPrototype && (
        <div className="bg-indigo-950/40 border border-indigo-700/60 rounded-lg p-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-indigo-300 mb-1">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>DATA PROTOTIPE ALTERNATIF (OPEN-METEO) - TERPISAH DARI PRODUK RESMI BMKG</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Data prakiraan numerik berikut berasal dari model Open-Meteo Global Numerical Weather Forecast untuk tujuan riset perbandingan simulasi algoritma awal. Data ini BUKAN produk rujukan resmi BMKG.
          </p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
            {prototypeRecords.map((p, idx) => (
              <div key={idx} className="bg-slate-950/80 p-2 rounded border border-indigo-900/60 flex items-center justify-between">
                <span>{p.regency} (H+{p.forecastDay})</span>
                <span className="text-indigo-400">FFMC: {p.ffmc} · Hujan: {p.rainProbability}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10-Day Numerical Forecast Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Tabel Prakiraan Cuaca & Indeks Bahaya Kebakaran 10 Hari ke Depan
            </h3>
            <span className="text-xs text-amber-400/90 font-medium">
              PERHATIAN: Kolom ini murni hasil model prakiraan cuaca numerik; bukan titik api teramati.
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Wilayah: {todayRecord.regency}
          </span>
        </div>

        <div className="overflow-x-auto rounded border border-slate-800">
          <table className="w-full text-xs text-left text-slate-300 border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Hari Prakiraan</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3 text-right">FFMC (Seresah)</th>
                <th className="py-2.5 px-3 text-center">Status FFMC</th>
                <th className="py-2.5 px-3 text-right">FWI</th>
                <th className="py-2.5 px-3 text-right">ISI</th>
                <th className="py-2.5 px-3 text-right">Peluang Hujan (%)</th>
                <th className="py-2.5 px-3 text-right">Kecepatan Angin</th>
                <th className="py-2.5 px-3">Arah Angin</th>
                <th className="py-2.5 px-3 text-center">Potensi Asap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono tabular-nums">
              {forecastRecords.map((f) => {
                const badge = getFDRSBadge(f.ffmcClass);
                return (
                  <tr key={f.forecastDay} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-indigo-400 font-sans">
                      H+{f.forecastDay}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono">
                      {f.date}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                      {f.ffmc !== null && f.ffmc !== undefined ? f.ffmc.toFixed(1) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                        {f.ffmcClass}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {f.fwi !== null && f.fwi !== undefined ? f.fwi.toFixed(1) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {f.isi !== null && f.isi !== undefined ? f.isi.toFixed(1) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-sky-400 font-semibold">
                      {f.rainProbability !== null && f.rainProbability !== undefined ? `${f.rainProbability}%` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {f.windSpeedKmH !== null && f.windSpeedKmH !== undefined ? `${f.windSpeedKmH} km/j` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      {f.windDirection}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span
                        className={`text-[11px] font-semibold ${
                          f.smokeHazeRisk === 'PEKAT'
                            ? 'text-red-400'
                            : f.smokeHazeRisk === 'SEDANG'
                            ? 'text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {f.smokeHazeRisk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
