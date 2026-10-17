import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Hotspot, InaRiskLayerConfig, WorkingProvince } from '../types/karhutla.ts';
import { PROVINCE_VIEW_CONFIGS, PRIORITY_20_REGENCIES } from '../utils/geo.ts';
import { Layers, Eye, EyeOff, ShieldAlert, Flame, MapPin } from 'lucide-react';

interface InteractiveMapProps {
  hotspots: Hotspot[];
  selectedProvince: WorkingProvince;
  selectedRegencyId: string;
  inariskLayers: InaRiskLayerConfig[];
  onSelectHotspot?: (hotspot: Hotspot) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  hotspots,
  selectedProvince,
  selectedRegencyId,
  inariskLayers,
  onSelectHotspot
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Layer groups refs
  const hotspotGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const priorityGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const inariskHazardGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const boundaryGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // Layer Visibility State
  const [showHotspots, setShowHotspots] = useState(true);
  const [showPriorityRegencies, setShowPriorityRegencies] = useState(true);
  const [showInariskHazard, setShowInariskHazard] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [baseMapType, setBaseMapType] = useState<'dark' | 'satellite'>('dark');
  const [inariskOpacity, setInariskOpacity] = useState(0.65);
  const [activeLegend, setActiveLegend] = useState(true);

  const baseTileRef = useRef<L.TileLayer | null>(null);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const config = PROVINCE_VIEW_CONFIGS[selectedProvince] || PROVINCE_VIEW_CONFIGS.SEMUA;
    const map = L.map(mapContainerRef.current, {
      center: config.center,
      zoom: config.zoom,
      zoomControl: false,
      attributionControl: true
    });

    // Custom Zoom control at top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Initial Dark Base Map (Esri Dark Gray Canvas - Official GIS Basemap)
    const darkTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    }).addTo(map);
    baseTileRef.current = darkTile;

    // Add layer groups to map
    hotspotGroupRef.current.addTo(map);
    priorityGroupRef.current.addTo(map);
    inariskHazardGroupRef.current.addTo(map);
    boundaryGroupRef.current.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (baseTileRef.current) {
      map.removeLayer(baseTileRef.current);
    }

    if (baseMapType === 'satellite') {
      baseTileRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      ).addTo(map);
    } else {
      baseTileRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
        }
      ).addTo(map);
    }
  }, [baseMapType]);

  // Center & Zoom when province or selected regency changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (selectedRegencyId) {
      const reg = PRIORITY_20_REGENCIES.find(r => r.id === selectedRegencyId);
      if (reg) {
        map.flyTo([reg.latitude, reg.longitude], 9, { duration: 1.2 });
        return;
      }
    }

    const config = PROVINCE_VIEW_CONFIGS[selectedProvince] || PROVINCE_VIEW_CONFIGS.SEMUA;
    map.flyTo(config.center, config.zoom, { duration: 1.2 });
  }, [selectedProvince, selectedRegencyId]);

  // Render Hotspots Layer
  useEffect(() => {
    const group = hotspotGroupRef.current;
    group.clearLayers();

    if (!showHotspots) return;

    hotspots.forEach((hs) => {
      const isHigh = hs.confidence === 'high';
      const isNominal = hs.confidence === 'nominal';
      const color = isHigh ? '#ef4444' : isNominal ? '#f59e0b' : '#eab308';
      const radius = Math.min(Math.max((hs.frp || 10) / 3, 6), 14);

      const marker = L.circleMarker([hs.latitude, hs.longitude], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.5;">
          <div style="font-weight: 700; color: #f87171; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            Titik Panas (Hotspot) Teramati
          </div>
          <div><strong>Sumber:</strong> ${hs.source === 'NASA_FIRMS' ? 'NASA FIRMS Area API' : 'KLHK SiPongi+'}</div>
          <div><strong>Satelit:</strong> ${hs.satellite} (${hs.confidence.toUpperCase()})</div>
          <div><strong>Waktu:</strong> ${hs.acq_date} ${hs.acq_time}</div>
          <div><strong>FRP (Energi Radiasi):</strong> ${hs.frp} MW</div>
          <div><strong>Suhu Kecerahan:</strong> ${hs.brightness} K</div>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #334155;">
            <div><strong>Lokasi:</strong> ${hs.regency}, ${hs.province}</div>
            ${hs.district ? `<div><strong>Kecamatan:</strong> ${hs.district}</div>` : ''}
            ${hs.village ? `<div><strong>Desa:</strong> ${hs.village}</div>` : ''}
          </div>
          <div style="margin-top: 4px; color: #38bdf8; font-weight: 500;">
            Status: ${hs.validationStatus}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectHotspot) onSelectHotspot(hs);
      });

      group.addLayer(marker);
    });
  }, [hotspots, showHotspots, onSelectHotspot]);

  // Render 20 Priority Regencies
  useEffect(() => {
    const group = priorityGroupRef.current;
    group.clearLayers();

    if (!showPriorityRegencies) return;

    PRIORITY_20_REGENCIES.forEach((reg) => {
      // Circle Pin Marker
      const circlePin = L.circleMarker([reg.latitude, reg.longitude], {
        radius: 6,
        fillColor: '#f59e0b',
        color: '#ffffff',
        weight: 1.5,
        fillOpacity: 0.9
      });

      // Subtle pulse buffer
      const radiusCircle = L.circle([reg.latitude, reg.longitude], {
        radius: 30000, // 30 km buffer
        color: '#d97706',
        weight: 1,
        dashArray: '3, 4',
        fillColor: '#b45309',
        fillOpacity: 0.08
      });

      circlePin.bindTooltip(`<strong>${reg.name}</strong><br/>Gambut: ${(reg.peatlandAreaHa).toLocaleString('id-ID')} Ha`, {
        direction: 'top',
        className: 'bg-slate-900 text-slate-100 text-xs border border-slate-700 p-1 rounded'
      });

      const popupContent = `
        <div style="font-size: 12px; line-height: 1.5;">
          <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px; border-bottom: 1px solid #334155; padding-bottom: 2px;">
            ${reg.name} (${reg.province})
          </div>
          <div><strong>Status:</strong> 20 Kab/Kota Prioritas Karhutla BNPB</div>
          <div><strong>Tingkat Kerawanan:</strong> ${reg.fireProneLevel.replace('_', ' ')}</div>
          <div><strong>Luas Gambut Rentan:</strong> ${(reg.peatlandAreaHa).toLocaleString('id-ID')} Ha</div>
          <div style="margin-top: 4px; color: #38bdf8;"><strong>Kontak:</strong> ${reg.bpbdContact}</div>
        </div>
      `;

      circlePin.bindPopup(popupContent);
      group.addLayer(circlePin);
      group.addLayer(radiusCircle);
    });
  }, [showPriorityRegencies]);

  // Render InaRISK Bahaya Layer (ArcGIS REST Geoportal BNPB)
  const [inariskStatus, setInariskStatus] = useState<'ONLINE' | 'TIDAK_TERSEDIA' | 'MEMERIKSA'>('MEMERIKSA');

  useEffect(() => {
    const hazardGroup = inariskHazardGroupRef.current;
    hazardGroup.clearLayers();

    if (!showInariskHazard) return;

    try {
      // Endpoint resmi ArcGIS REST Geoportal BNPB
      const arcgisUrl = 'https://gis.bnpb.go.id/arcgis/rest/services/inaRISK/Bahaya_Karhutla_2024/ImageServer/tile/{z}/{y}/{x}';
      
      const arcgisLayer = L.tileLayer(arcgisUrl, {
        opacity: inariskOpacity,
        maxZoom: 16,
        attribution: 'Peta Bahaya Karhutla &copy; InaRISK BNPB'
      });

      let hasError = false;
      arcgisLayer.on('tileerror', () => {
        if (!hasError) {
          hasError = true;
          setInariskStatus('TIDAK_TERSEDIA');
        }
      });

      arcgisLayer.on('tileload', () => {
        if (!hasError) {
          setInariskStatus('ONLINE');
        }
      });

      hazardGroup.addLayer(arcgisLayer);
    } catch (e) {
      setInariskStatus('TIDAK_TERSEDIA');
    }
  }, [showInariskHazard, inariskOpacity]);

  return (
    <div className="relative w-full h-[620px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Layer Control Panel (Top Right) */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded p-3 shadow-xl max-w-xs text-xs">
        <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-slate-700 font-semibold text-slate-200">
          <div className="flex items-center gap-1.5 shrink-0">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Pengaturan Lapisan</span>
          </div>
          <button
            onClick={() => setActiveLegend(!activeLegend)}
            className="text-slate-400 hover:text-slate-200 text-[11px] whitespace-nowrap"
          >
            {activeLegend ? 'Tutup Legenda' : 'Buka Legenda'}
          </button>
        </div>

        {/* Base Map Switcher */}
        <div className="mb-2.5">
          <span className="text-[11px] text-slate-400 block mb-1">Peta Dasar:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBaseMapType('dark')}
              className={`flex-1 py-1 px-2 rounded text-[11px] font-medium transition-colors ${
                baseMapType === 'dark' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Mode Gelap
            </button>
            <button
              onClick={() => setBaseMapType('satellite')}
              className={`flex-1 py-1 px-2 rounded text-[11px] font-medium transition-colors ${
                baseMapType === 'satellite' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Citra Satelit
            </button>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="space-y-1.5 pt-1">
          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              Hotspot Teramati (NASA/SiPongi)
            </span>
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-amber-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              20 Kab/Kota Prioritas Nasional
            </span>
            <input
              type="checkbox"
              checked={showPriorityRegencies}
              onChange={(e) => setShowPriorityRegencies(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-amber-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
              InaRISK: Peta Bahaya (ArcGIS REST)
            </span>
            <input
              type="checkbox"
              checked={showInariskHazard}
              onChange={(e) => setShowInariskHazard(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-amber-500"
            />
          </label>
          {showInariskHazard && inariskStatus === 'TIDAK_TERSEDIA' && (
            <div className="text-[10px] text-amber-400/90 font-mono pl-5">
              ArcGIS Geoportal: Server tidak merespon (Offline)
            </div>
          )}
        </div>

        {/* Opacity Slider for InaRISK */}
        {showInariskHazard && (
          <div className="mt-2.5 pt-2 border-t border-slate-700/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Transparansi InaRISK:</span>
              <span className="font-mono">{Math.round(inariskOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={inariskOpacity}
              onChange={(e) => setInariskOpacity(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Map Legend (Bottom Left) */}
      {activeLegend && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded p-3 shadow-xl text-xs max-w-sm">
          <div className="font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-1">
            Legenda & Simbologi Resmi
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
            <div>
              <span className="text-slate-400 block font-medium mb-1">Kepercayaan Hotspot:</span>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span className="text-slate-300">Tinggi (High / &gt;80%)</span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="text-slate-300">Sedang (Nominal)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
                <span className="text-slate-300">Rendah (Low)</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-medium mb-1">InaRISK & FDRS:</span>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-3 h-2 bg-red-600 inline-block rounded-xs"></span>
                <span className="text-slate-300">Bahaya Sangat Tinggi</span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-3 h-2 bg-orange-600 inline-block rounded-xs"></span>
                <span className="text-slate-300">Bahaya Tinggi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-amber-700 inline-block rounded-xs"></span>
                <span className="text-slate-300">Buffer Kab. Prioritas</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
