import React from 'react';
import type { ISPUSiteRecord, PusdatinEventRecord, WorkingProvince } from '../types/karhutla.ts';
import { Wind, Activity, Flame, Plane, Users, CheckCircle, Upload } from 'lucide-react';
import { getISPUColor, getISPUDescription } from '../utils/ispuRating.ts';
import { SourceMetadataBadge } from './SourceMetadataBadge.tsx';

interface ISPUImpactViewProps {
  ispuRecords: ISPUSiteRecord[];
  pusdatinRecords: PusdatinEventRecord[];
  selectedProvince: WorkingProvince;
  onOpenImport: () => void;
}

export const ISPUImpactView: React.FC<ISPUImpactViewProps> = ({
  ispuRecords,
  pusdatinRecords,
  selectedProvince,
  onOpenImport
}) => {
  const filteredIspu = ispuRecords.filter((rec) => {
    if (selectedProvince !== 'SEMUA') {
      return rec.province === selectedProvince;
    }
    return true;
  });

  const filteredPusdatin = pusdatinRecords.filter((rec) => {
    if (selectedProvince !== 'SEMUA') {
      return rec.province === selectedProvince;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Source Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-slate-100">
                Indeks Standar Pencemar Udara (ISPU) & Dampak Karhutla
              </h2>
            </div>
            <SourceMetadataBadge
              metadata={{
                agency: 'Ditjen PPKL KLHK & Pusdatin BNPB',
                name: 'Stasiun AQMS & Log Operasi Penanganan Darurat',
                period: 'Hari Ini & 7 Hari Terakhir',
                timestamp: '2026-10-17 14:00 WIB',
                validationStatus: 'Data Sensor AQMS Terkalibrasi & Laporan Pusdalops BPBD',
                connectionStatus: 'TERHUBUNG',
                provenance: ispuRecords.some(r => r.provenance === 'RESMI_TERVERIFIKASI') ? 'RESMI_TERVERIFIKASI' : 'DEMO_BELUM_TERVERIFIKASI',
                details: 'Permen LHK No. P.14/2020 & Sistem Komunikasi Bencana Pusdatin'
              }}
            />
          </div>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-950 border border-slate-700 rounded hover:bg-slate-800 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Impor Data ISPU / Pusdatin</span>
          </button>
        </div>
      </div>

      {/* 2. ISPU AQMS Stations Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Kualitas Udara Stasiun Otomatis (AQMS KLHK) di Wilayah Terdampak Asap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIspu.map((site) => {
            const isUnhealthy = site.category === 'TIDAK_SEHAT' || site.category === 'SANGAT_TIDAK_SEHAT';
            return (
              <div
                key={site.stationId}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{site.city}</h4>
                    <span className="text-[11px] text-slate-400">{site.stationName}</span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider"
                    style={{
                      backgroundColor: `${getISPUColor(site.category)}25`,
                      color: getISPUColor(site.category),
                      border: `1px solid ${getISPUColor(site.category)}`
                    }}
                  >
                    {site.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
                    {site.ispuValue}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Parameter Kritis: <strong className="text-amber-400">{site.maxParam}</strong>
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  {getISPUDescription(site.category)}
                </p>

                {/* Pollutant parameters breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono tabular-nums text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">PM2.5:</span>
                    <span>{site.pm25} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">PM10:</span>
                    <span>{site.pm10} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">CO:</span>
                    <span>{site.co} ppm</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-right">
                  Pembaruan: {site.timestamp}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Pusdatin BNPB Disaster Event Log & Operations */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <h3 className="text-sm font-semibold text-slate-100">
            Log Operasi Penanganan Darurat Karhutla (Pusdatin BNPB)
          </h3>
          <span className="text-xs text-slate-400">
            Pengerahan Satgas Darat Gabungan TNI/Polri/BPBD & Armada Water Bombing BNPB
          </span>
        </div>

        <div className="overflow-x-auto rounded border border-slate-800">
          <table className="w-full text-xs text-left text-slate-300 border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">ID Kejadian</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Kabupaten / Provinsi</th>
                <th className="py-2.5 px-3 text-right">Luas Terbakar (Ha)</th>
                <th className="py-2.5 px-3 text-right">Personil Gabungan</th>
                <th className="py-2.5 px-3 text-right">Water Bombing (Sorti)</th>
                <th className="py-2.5 px-3 text-center">Status Operasi</th>
                <th className="py-2.5 px-3">Kronologi Penanganan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono tabular-nums">
              {filteredPusdatin.map((evt) => (
                <tr key={evt.eventId} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-amber-400 whitespace-nowrap">
                    {evt.eventId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                    {evt.date}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 font-sans whitespace-nowrap font-medium">
                    {evt.regency}, {evt.province}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-red-400">
                    {evt.burnedAreaHa !== null && evt.burnedAreaHa !== undefined ? evt.burnedAreaHa.toFixed(1) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {evt.personnelCount !== null && evt.personnelCount !== undefined ? `${evt.personnelCount} Orang` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-sky-400 font-semibold">
                    {evt.waterBombingSorties !== null && evt.waterBombingSorties !== undefined ? `${evt.waterBombingSorties} Sorti` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        evt.status === 'TERPADAMKAN'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : evt.status === 'PROSES_PEMADAMAN'
                          ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {evt.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px] max-w-xs truncate">
                    {evt.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
