import React from 'react';
import { Filter, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import type { TimeRangeFilter, WorkingProvince } from '../types/karhutla.ts';
import { PRIORITY_20_REGENCIES } from '../utils/geo.ts';

interface FilterBarProps {
  selectedProvince: WorkingProvince;
  onSelectProvince: (prov: WorkingProvince) => void;
  selectedTimeRange: TimeRangeFilter;
  onSelectTimeRange: (range: TimeRangeFilter) => void;
  selectedRegencyId: string;
  onSelectRegencyId: (id: string) => void;
  totalHotspotsCount: number;
  useOpenMeteoPrototype: boolean;
  onToggleOpenMeteo: (val: boolean) => void;
}

const PROVINCES: WorkingProvince[] = [
  'SEMUA',
  'Riau',
  'Jambi',
  'Sumatera Selatan',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedProvince,
  onSelectProvince,
  selectedTimeRange,
  onSelectTimeRange,
  selectedRegencyId,
  onSelectRegencyId,
  totalHotspotsCount,
  useOpenMeteoPrototype,
  onToggleOpenMeteo
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Province Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium text-slate-400">Wilayah:</span>
            <select
              value={selectedProvince}
              onChange={(e) => onSelectProvince(e.target.value as WorkingProvince)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              {PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov === 'SEMUA' ? 'Nasional (Seluruh Indonesia)' : `Provinsi ${prov}`}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Filter (Segmented control) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-xs">
            <button
              onClick={() => onSelectTimeRange('HARI_INI')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                selectedTimeRange === 'HARI_INI'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => onSelectTimeRange('7_HARI_TERAKHIR')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                selectedTimeRange === '7_HARI_TERAKHIR'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => onSelectTimeRange('PRAKIRAAN_10_HARI')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                selectedTimeRange === 'PRAKIRAAN_10_HARI'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Hotspot besok tidak dapat diobservasi; menampilkan Prakiraan FDRS BMKG hingga 10 hari ke depan"
            >
              Prakiraan 10 Hari (FDRS)
            </button>
          </div>

          {/* 20 Priority Regencies Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="font-medium text-slate-400">20 Kab/Kota Prioritas:</span>
            <select
              value={selectedRegencyId}
              onChange={(e) => onSelectRegencyId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 max-w-xs"
            >
              <option value="">Semua Kabupaten / Kota</option>
              {PRIORITY_20_REGENCIES.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name} ({reg.province})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Info: Live Hotspot Count & Model Toggle */}
        <div className="flex items-center gap-4 text-xs">
          {/* Prototype Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={useOpenMeteoPrototype}
              onChange={(e) => onToggleOpenMeteo(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-slate-400">
              Muat Alternatif Model Open-Meteo
            </span>
          </label>

          {/* Hotspot Count */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded font-mono tabular-nums text-slate-300">
            <span className="text-amber-500 font-semibold">{totalHotspotsCount}</span>
            <span className="text-slate-400 text-[11px]">Hotspot Teramati</span>
          </div>
        </div>
      </div>
    </div>
  );
};
