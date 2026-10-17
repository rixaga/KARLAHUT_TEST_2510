import React, { useState, useMemo } from 'react';
import type { IRBIRecord, WorkingProvince } from '../types/karhutla.ts';
import { Search, ArrowUpDown, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SourceMetadataBadge } from './SourceMetadataBadge.tsx';

interface IRBITableProps {
  records: IRBIRecord[];
  selectedProvince: WorkingProvince;
  onSelectRegency?: (regencyName: string) => void;
}

export const IRBITable: React.FC<IRBITableProps> = ({
  records,
  selectedProvince,
  onSelectRegency
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyPriority20, setOnlyPriority20] = useState(false);
  const [sortField, setSortField] = useState<keyof IRBIRecord>('rank');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Province filter
        if (selectedProvince !== 'SEMUA' && rec.province !== selectedProvince) {
          return false;
        }
        // Priority 20 filter
        if (onlyPriority20 && !rec.isPriority20) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            rec.regency.toLowerCase().includes(q) ||
            rec.province.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [records, selectedProvince, onlyPriority20, searchQuery, sortField, sortAsc]);

  const handleSort = (field: keyof IRBIRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
      {/* Title & Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-100">
              Indeks Risiko Bencana Indonesia (IRBI) Karhutla 2025
            </h2>
          </div>
          <SourceMetadataBadge
            metadata={{
              agency: 'Dit. PERB BNPB',
              name: 'Buku IRBI 2025 Resmi',
              period: 'Tahun 2025',
              timestamp: '2026-10-17 08:00 WIB',
              validationStatus: 'Kajian Resmi Terverifikasi Nasional',
              connectionStatus: 'TERHUBUNG',
              provenance: records.some(r => r.provenance === 'RESMI_TERVERIFIKASI') ? 'RESMI_TERVERIFIKASI' : 'DEMO_BELUM_TERVERIFIKASI',
              details: 'Berdasarkan Perka BNPB No. 2/2012 tentang Pedoman Pengkajian Risiko Bencana'
            }}
          />
        </div>

        {/* Search & Priority Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Kabupaten/Kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500 w-48 sm:w-60"
            />
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded">
            <input
              type="checkbox"
              checked={onlyPriority20}
              onChange={(e) => setOnlyPriority20(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-amber-500"
            />
            <span>20 Kab/Kota Prioritas</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-slate-800">
        <table className="w-full text-xs text-left text-slate-300 border-collapse">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th
                onClick={() => handleSort('rank')}
                className="py-3 px-3 cursor-pointer hover:text-slate-100 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Peringkat</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('regency')}
                className="py-3 px-3 cursor-pointer hover:text-slate-100 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Kabupaten / Kota</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('province')}
                className="py-3 px-3 cursor-pointer hover:text-slate-100 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Provinsi</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('hazardScore')}
                className="py-3 px-3 cursor-pointer hover:text-slate-100 text-right whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bahaya (H)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('vulnerabilityScore')}
                className="py-3 px-3 cursor-pointer hover:text-slate-100 text-right whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Kerentanan (V)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('capacityScore')}
                className="py-3 px-3 cursor-pointer hover:text-slate-100 text-right whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Kapasitas (C)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('riskIndex')}
                className="py-3 px-3 cursor-pointer hover:text-slate-100 text-right whitespace-nowrap font-bold text-slate-200"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Indeks Risiko (0-250)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Kelas Risiko</th>
              <th
                onClick={() => handleSort('peatlandAreaHa')}
                className="py-3 px-3 cursor-pointer hover:text-slate-100 text-right whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Luas Gambut (Ha)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">20 Prioritas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-mono tabular-nums">
            {filteredRecords.map((rec) => {
              const isHigh = rec.riskClass === 'TINGGI';
              return (
                <tr
                  key={rec.rank}
                  onClick={() => onSelectRegency && onSelectRegency(rec.regency)}
                  className="hover:bg-slate-800/60 transition-colors cursor-pointer font-sans"
                >
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-400">
                    #{rec.rank}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-100 whitespace-nowrap">
                    {rec.regency}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {rec.province}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {rec.hazardScore !== null && rec.hazardScore !== undefined ? rec.hazardScore.toFixed(1) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {rec.vulnerabilityScore !== null && rec.vulnerabilityScore !== undefined ? rec.vulnerabilityScore.toFixed(1) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {rec.capacityScore !== null && rec.capacityScore !== undefined ? rec.capacityScore.toFixed(1) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                    {rec.riskIndex !== null && rec.riskIndex !== undefined ? rec.riskIndex.toFixed(1) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap font-sans">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isHigh
                          ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {rec.riskClass}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                    {rec.peatlandAreaHa !== null && rec.peatlandAreaHa !== undefined ? rec.peatlandAreaHa.toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {rec.isPriority20 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Prioritas
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-400 flex items-center justify-between pt-2">
        <span>Menampilkan {filteredRecords.length} dari {records.length} kabupaten/kota</span>
        <span>Metode: Skor Risiko = (Bahaya × Kerentanan) / Kapasitas</span>
      </div>
    </div>
  );
};
