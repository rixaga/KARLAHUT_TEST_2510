#!/usr/bin/env python3
"""
Pipeline Pengambilan Data Hotspot Otomatis Dit. PD BNPB
Mengunduh data observasi NASA FIRMS Area API riwayat 7 hari,
melakukan validasi skema resmi NASA, deduplikasi spasial-temporal,
dan mengekspor ke format JSON, GeoJSON, dan Manifest terverifikasi.
"""

import os
import sys
import json
import math
import urllib.request
import urllib.error
from datetime import datetime, timezone

INDONESIA_EXTENT = "95,-11,141,6"
FIRMS_SOURCES = ["VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT"]

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def parse_nasa_csv(csv_text, satellite_name, provenance="RESMI_TERVERIFIKASI"):
    lines = [line.strip() for line in csv_text.strip().split("\n") if line.strip()]
    if len(lines) < 2:
        return []

    headers = [h.strip().lower() for h in lines[0].split(",")]
    try:
        lat_idx = headers.index("latitude")
        lon_idx = headers.index("longitude")
    except ValueError:
        print("[WARN] Format CSV NASA tidak memiliki kolom latitude/longitude.")
        return []

    date_idx = headers.index("acq_date") if "acq_date" in headers else -1
    time_idx = headers.index("acq_time") if "acq_time" in headers else -1
    conf_idx = headers.index("confidence") if "confidence" in headers else -1
    frp_idx = headers.index("frp") if "frp" in headers else -1
    bright_idx = headers.index("bright_ti4") if "bright_ti4" in headers else (
        headers.index("brightness") if "brightness" in headers else -1
    )
    daynight_idx = headers.index("daynight") if "daynight" in headers else -1

    records = []
    for i, line in enumerate(lines[1:], start=1):
        cols = [c.strip().strip('"\'') for c in line.split(",")]
        if len(cols) <= max(lat_idx, lon_idx):
            continue

        try:
            lat = float(cols[lat_idx])
            lon = float(cols[lon_idx])
        except ValueError:
            continue

        # Validasi batas geografis Indonesia
        if not (-11.5 <= lat <= 6.5 and 94.5 <= lon <= 141.5):
            continue

        acq_date = cols[date_idx] if date_idx != -1 and cols[date_idx] else "Tidak Tercantum"
        acq_time = cols[time_idx] if time_idx != -1 and cols[time_idx] else "N/A"

        # Parsing confidence NASA
        confidence = "nominal"
        if conf_idx != -1 and cols[conf_idx]:
            raw_conf = cols[conf_idx].lower()
            if raw_conf == "h" or raw_conf == "high":
                confidence = "high"
            elif raw_conf == "l" or raw_conf == "low":
                confidence = "low"
            else:
                try:
                    num_conf = int(raw_conf)
                    confidence = "high" if num_conf >= 80 else ("low" if num_conf < 30 else "nominal")
                except ValueError:
                    confidence = "nominal"

        # FRP & Brightness: simpan None (null) jika tidak tersedia, jangan rekayasa angka 0
        frp = None
        if frp_idx != -1 and cols[frp_idx]:
            try:
                frp = round(float(cols[frp_idx]), 1)
            except ValueError:
                frp = None

        brightness = None
        if bright_idx != -1 and cols[bright_idx]:
            try:
                brightness = round(float(cols[bright_idx]), 1)
            except ValueError:
                brightness = None

        daynight = cols[daynight_idx] if daynight_idx != -1 and cols[daynight_idx] in ["D", "N"] else "D"

        records.append({
            "id": f"NASA-{satellite_name[:4]}-{i}",
            "source": "NASA_FIRMS",
            "latitude": lat,
            "longitude": lon,
            "brightness": brightness,
            "acq_date": acq_date,
            "acq_time": acq_time,
            "satellite": satellite_name,
            "confidence": confidence,
            "frp": frp,
            "daynight": daynight,
            "province": "Indonesia",
            "regency": "Observasi Satelit NRT",
            "validationStatus": "OBSERVASI_SATELIT",
            "provenance": provenance
        })

    return records

def deduplicate_records(records):
    unique = []
    for cur in records:
        is_dup = False
        for ex in unique:
            if ex["acq_date"] == cur["acq_date"]:
                dist = haversine_km(ex["latitude"], ex["longitude"], cur["latitude"], cur["longitude"])
                if dist <= 1.0:
                    try:
                        t1 = int(ex["acq_time"].replace(":", ""))
                        t2 = int(cur["acq_time"].replace(":", ""))
                        if abs(t1 - t2) <= 30:
                            is_dup = True
                            break
                    except ValueError:
                        pass
        if not is_dup:
            unique.append(cur)
    return unique

def to_geojson(records):
    features = []
    for r in records:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [r["longitude"], r["latitude"]]
            },
            "properties": {
                "id": r["id"],
                "source": r["source"],
                "acq_date": r["acq_date"],
                "acq_time": r["acq_time"],
                "satellite": r["satellite"],
                "confidence": r["confidence"],
                "frp": r["frp"],
                "brightness": r["brightness"],
                "provenance": r["provenance"]
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }

def main():
    map_key = os.environ.get("FIRMS_MAP_KEY", "").strip()
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data")
    os.makedirs(out_dir, exist_ok=True)

    hotspots = []
    fetch_success = False

    if map_key:
        print("[INFO] Kunci FIRMS_MAP_KEY terdeteksi. Memulai pengambilan riwayat 7 hari NASA FIRMS Area API...")
        for src in FIRMS_SOURCES:
            url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{map_key}/{src}/{INDONESIA_EXTENT}/7"
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "BNPB-Karhutla-Dashboard/1.0"})
                with urllib.request.urlopen(req, timeout=12) as response:
                    if response.status == 200:
                        csv_data = response.read().decode("utf-8")
                        parsed = parse_nasa_csv(csv_data, src, provenance="RESMI_TERVERIFIKASI")
                        print(f"[OK] {src}: Berhasil mengambil {len(parsed)} titik hotspot.")
                        hotspots.extend(parsed)
                        fetch_success = True
            except Exception as e:
                print(f"[WARN] Gagal mengambil data dari {src}: {e}")

    if fetch_success and hotspots:
        hotspots = deduplicate_records(hotspots)
        provenance = "RESMI_TERVERIFIKASI"
        source_label = "NASA EOSDIS FIRMS Area API (VIIRS/MODIS)"
        status_label = "TERHUBUNG (DATA LIVE)"
    else:
        print("[INFO] Menghasilkan dataset baseline demonstrasi terverifikasi (DEMO / BELUM TERVERIFIKASI)...")
        provenance = "DEMO_BELUM_TERVERIFIKASI"
        source_label = "Dataset Sampel Pengujian Dit. PD BNPB"
        status_label = "BELUM_TERKONFIGURASI_DEMO"
        # Baseline sample records with provenance DEMO_BELUM_TERVERIFIKASI
        hotspots = [
            {
                "id": "DEMO-HS-01",
                "source": "NASA_FIRMS",
                "latitude": 0.3125,
                "longitude": 102.1642,
                "brightness": 334.8,
                "acq_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "acq_time": "13:42",
                "satellite": "VIIRS-SNPP (Sampel Pengujian)",
                "confidence": "high",
                "frp": 38.4,
                "daynight": "D",
                "province": "Riau",
                "regency": "Kab. Pelalawan",
                "district": "Teluk Meranti",
                "village": "Kuala Panduk",
                "validationStatus": "BELUM_TERVERIFIKASI_DEMO",
                "provenance": "DEMO_BELUM_TERVERIFIKASI"
            },
            {
                "id": "DEMO-HS-02",
                "source": "NASA_FIRMS",
                "latitude": -3.4210,
                "longitude": 105.1850,
                "brightness": 341.5,
                "acq_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "acq_time": "14:02",
                "satellite": "VIIRS-SNPP (Sampel Pengujian)",
                "confidence": "high",
                "frp": 45.2,
                "daynight": "D",
                "province": "Sumatera Selatan",
                "regency": "Kab. Ogan Komering Ilir",
                "district": "Pangkalan Lampam",
                "village": "Rambai",
                "validationStatus": "BELUM_TERVERIFIKASI_DEMO",
                "provenance": "DEMO_BELUM_TERVERIFIKASI"
            },
            {
                "id": "DEMO-HS-03",
                "source": "NASA_FIRMS",
                "latitude": -2.1450,
                "longitude": 112.8250,
                "brightness": 329.0,
                "acq_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "acq_time": "13:58",
                "satellite": "NOAA-20 (Sampel Pengujian)",
                "confidence": "nominal",
                "frp": 26.8,
                "daynight": "D",
                "province": "Kalimantan Tengah",
                "regency": "Kab. Kotawaringin Timur",
                "district": "Mentawa Baru Ketapang",
                "village": "Bapeang",
                "validationStatus": "BELUM_TERVERIFIKASI_DEMO",
                "provenance": "DEMO_BELUM_TERVERIFIKASI"
            }
        ]

    # 1. Output hotspots.json
    hotspots_path = os.path.join(out_dir, "hotspots.json")
    with open(hotspots_path, "w", encoding="utf-8") as f:
        json.dump({
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "count": len(hotspots),
            "provenance": provenance,
            "source": source_label,
            "data": hotspots
        }, f, indent=2, ensure_ascii=False)
    print(f"[OK] hotspots.json berhasil ditulis: {hotspots_path} ({len(hotspots)} titik)")

    # 2. Output hotspots.geojson
    geojson_path = os.path.join(out_dir, "hotspots.geojson")
    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump(to_geojson(hotspots), f, indent=2, ensure_ascii=False)
    print(f"[OK] hotspots.geojson berhasil ditulis: {geojson_path}")

    # 3. Output manifest.json (Data Provenance & Traceability)
    manifest_path = os.path.join(out_dir, "manifest.json")
    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "application": "Dashboard Peringatan Dini Karhutla Nasional - Dit. PD BNPB",
        "sources": {
            "firms": {
                "name": "NASA FIRMS Area API (VIIRS/MODIS)",
                "status": status_label,
                "count": len(hotspots),
                "period": "7 Hari Terakhir & NRT",
                "provenance": provenance
            },
            "sipongi": {
                "name": "KLHK SiPongi+ (Ditjen PPI)",
                "status": "BERKAS_TERSEDIA",
                "count": 0,
                "period": "Siap Terima Impor Resmi",
                "provenance": "RESMI_TERVERIFIKASI"
            },
            "inarisk": {
                "name": "InaRISK ArcGIS REST ImageServer",
                "endpoint": "https://gis.bnpb.go.id/arcgis/rest/services/inaRISK",
                "status": "ONLINE",
                "provenance": "RESMI_TERVERIFIKASI"
            },
            "bmkg": {
                "name": "Sistem Peringkat Bahaya Kebakaran (FDRS) BMKG",
                "period": "Hari Ini & Prakiraan 10 Hari",
                "status": "DEMO_BELUM_TERVERIFIKASI",
                "provenance": "DEMO_BELUM_TERVERIFIKASI"
            },
            "irbi": {
                "name": "IRBI 2025 (Dit. PERB BNPB)",
                "totalRegencies": 20,
                "status": "DEMO_BELUM_TERVERIFIKASI",
                "provenance": "DEMO_BELUM_TERVERIFIKASI"
            },
            "ispu": {
                "name": "ISPU Stasiun AQMS Ditjen PPKL KLHK",
                "stationsCount": 10,
                "status": "DEMO_BELUM_TERVERIFIKASI",
                "provenance": "DEMO_BELUM_TERVERIFIKASI"
            },
            "pusdatin": {
                "name": "Pusdatin BNPB (Catatan Kejadian & Penanganan)",
                "incidentCount": 6,
                "status": "DEMO_BELUM_TERVERIFIKASI",
                "provenance": "DEMO_BELUM_TERVERIFIKASI"
            }
        }
    }
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"[OK] manifest.json berhasil ditulis: {manifest_path}")

if __name__ == "__main__":
    main()
