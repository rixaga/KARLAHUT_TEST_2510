import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import type { Hotspot, BMKGFDRSRecord, ISPUSiteRecord, WorkingProvince } from '../types/karhutla.ts';

interface AnalyticsChartsProps {
  hotspots: Hotspot[];
  fdrsRecords: BMKGFDRSRecord[];
  ispuRecords: ISPUSiteRecord[];
  selectedProvince: WorkingProvince;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  hotspots,
  fdrsRecords,
  ispuRecords,
  selectedProvince
}) => {
  // 1. Group hotspots by date (last 7 days trend)
  const dateMap: Record<string, { date: string; total: number; highConfidence: number }> = {};
  
  hotspots.forEach(hs => {
    if (!dateMap[hs.acq_date]) {
      dateMap[hs.acq_date] = { date: hs.acq_date.slice(5), total: 0, highConfidence: 0 };
    }
    dateMap[hs.acq_date].total += 1;
    if (hs.confidence === 'high') {
      dateMap[hs.acq_date].highConfidence += 1;
    }
  });

  const dailyTrendData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  // 2. Province Breakdown
  const provinceCountMap: Record<string, number> = {
    'Riau': 0,
    'Jambi': 0,
    'Sumatera Selatan': 0,
    'Kalimantan Barat': 0,
    'Kalimantan Tengah': 0,
    'Kalimantan Selatan': 0
  };

  hotspots.forEach(hs => {
    if (provinceCountMap[hs.province] !== undefined) {
      provinceCountMap[hs.province] += 1;
    }
  });

  const provinceData = Object.entries(provinceCountMap).map(([province, count]) => ({
    province,
    count
  }));

  // 3. FDRS 10-day Forecast Trend (FFMC vs Rain Probability)
  const forecastTrendData = fdrsRecords
    .filter(f => f.regency === 'Kab. Ogan Komering Ilir') // Standard reference station
    .map(f => ({
      date: f.date.slice(5),
      label: f.isForecast ? `H+${f.forecastDay}` : 'Hari Ini',
      ffmc: f.ffmc,
      rain: f.rainProbability,
      fwi: f.fwi
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* Chart 1: Tren Harian Hotspot Teramati */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Tren Harian Hotspot Teramati (7 Hari Terakhir)
            </h3>
            <span className="text-xs text-slate-400">
              Observasi Satelit VIIRS SNPP / NOAA-20 & SiPongi+ KLHK
            </span>
          </div>
          <span className="text-xs font-mono tabular-nums text-amber-400">
            Total: {hotspots.length} Titik
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="total" name="Total Hotspot" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="highConfidence" name="Kepercayaan Tinggi (High)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Sebaran Hotspot per 6 Provinsi Kerja */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Distribusi Hotspot di 6 Provinsi Kerja Prioritas
            </h3>
            <span className="text-xs text-slate-400">
              Prioritas Supervisi & Siaga Darurat Karhutla BNPB
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Satuan: Titik Terdeteksi
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={provinceData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis dataKey="province" type="category" stroke="#94a3b8" fontSize={11} width={105} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="count" name="Jumlah Hotspot" fill="#d97706" radius={[0, 4, 4, 0]}>
                {provinceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count >= 6 ? '#ef4444' : entry.count >= 3 ? '#f59e0b' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Prakiraan Numerik 10 Hari BMKG FDRS */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Prakiraan 10 Hari Indeks Kemudahan Terbakar (FFMC) vs Peluang Curah Hujan
            </h3>
            <span className="text-xs text-slate-400">
              Pusat Meteorologi Publik BMKG · Stasiun Rujukan Kab. Ogan Komering Ilir
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-red-400">FFMC &gt; 88: Sangat Mudah Terbakar</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis yAxisId="left" stroke="#ef4444" fontSize={11} domain={[40, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ffmc"
                name="Indeks FFMC BMKG (Skala 0-100)"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rain"
                name="Peluang Hujan (% Probabilitas)"
                stroke="#38bdf8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
