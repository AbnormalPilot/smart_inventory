"use client"

import { useEffect, useRef, useCallback } from "react"
import L from "leaflet"
import "leaflet.heat"
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"

// Fix default marker icon (standard webpack/Leaflet issue)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center)
  }, [map, center])
  return null
}

interface HeatLayer extends L.Layer {
  setLatLngs(latlngs: Array<[number, number, number]>): this
  redraw(): this
}

function HeatmapLayer({ points }: { points: Array<[number, number, number]> }) {
  const map = useMap()
  const layerRef = useRef<HeatLayer | null>(null)
  const hasFitted = useRef(false)

  useEffect(() => {
    if (points.length === 0) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
      return
    }

    if (layerRef.current) {
      // Update existing layer in-place — no flicker
      layerRef.current.setLatLngs(points)
      layerRef.current.redraw()
    } else {
      const heat = (L as unknown as {
        heatLayer: (
          latlngs: Array<[number, number, number]>,
          options?: Record<string, unknown>
        ) => HeatLayer
      }).heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.2: "#2563eb",
          0.4: "#06b6d4",
          0.6: "#22c55e",
          0.8: "#eab308",
          1.0: "#ef4444",
        },
      })

      heat.addTo(map)
      layerRef.current = heat
    }

    if (!hasFitted.current) {
      const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng] as [number, number]))
      map.fitBounds(bounds, { padding: [40, 40] })
      hasFitted.current = true
    }
  }, [map, points])

  useEffect(() => {
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [map])

  return null
}

// ─── Live pulse markers — animated rings that fade out ─────────
function LivePulseMarkers({ pulses }: { pulses: Array<{ lat: number; lng: number; id: string }> }) {
  const map = useMap()
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map())

  useEffect(() => {
    const current = markersRef.current

    // Add new pulses
    for (const p of pulses) {
      if (current.has(p.id)) continue

      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 6,
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.8,
        weight: 2,
        opacity: 1,
      }).addTo(map)

      current.set(p.id, marker)

      // Animate: grow radius and fade out over 4 seconds
      let frame = 0
      const totalFrames = 80 // ~4s at 50ms/frame
      const interval = setInterval(() => {
        frame++
        const progress = frame / totalFrames
        const r = 6 + progress * 30
        const opacity = 1 - progress

        marker.setRadius(r)
        marker.setStyle({
          fillOpacity: opacity * 0.6,
          opacity: opacity,
        })

        if (frame >= totalFrames) {
          clearInterval(interval)
          map.removeLayer(marker)
          current.delete(p.id)
        }
      }, 50)
    }

    // Trim old entries beyond 20
    if (current.size > 20) {
      const keys = Array.from(current.keys())
      for (let i = 0; i < keys.length - 20; i++) {
        const m = current.get(keys[i])
        if (m) map.removeLayer(m)
        current.delete(keys[i])
      }
    }
  }, [map, pulses])

  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => map.removeLayer(m))
      markersRef.current.clear()
    }
  }, [map])

  return null
}

// ─── Click-to-popup handler ────────────────────────────────────
function ClickPopupHandler() {
  const map = useMap()
  const popupRef = useRef<L.Popup | null>(null)

  const handleClick = useCallback(async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    const zoom = map.getZoom()
    // Scale radius based on zoom — tighter at higher zoom
    const radius = zoom >= 15 ? 300 : zoom >= 13 ? 600 : 1000

    // Close previous popup
    if (popupRef.current) {
      map.closePopup(popupRef.current)
    }

    // Show loading popup
    const loadingPopup = L.popup({ maxWidth: 320, className: "demand-popup" })
      .setLatLng(e.latlng)
      .setContent('<div style="padding:8px;text-align:center;color:#888;font-size:13px">Loading area data...</div>')
      .openOn(map)
    popupRef.current = loadingPopup

    try {
      const res = await fetch(`/api/demand/area-stats?lat=${lat}&lng=${lng}&radius=${radius}`)
      const data = await res.json()

      if (!data.found || data.eventCount === 0) {
        loadingPopup.setContent(
          '<div style="padding:8px;text-align:center;color:#888;font-size:13px">No demand data in this area</div>'
        )
        return
      }

      const topProduct = data.topProducts[0]
      const topCategory = data.topCategories[0]

      const html = `
<div style="font-family:system-ui,-apple-system,sans-serif;min-width:240px;max-width:300px">
  <div style="font-weight:700;font-size:14px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:6px">
    <span style="font-size:16px">📍</span> Area Insights
    <span style="margin-left:auto;font-size:11px;color:#888;font-weight:400">${data.eventCount} orders</span>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
    <div style="background:#f0fdf4;padding:6px 8px;border-radius:6px">
      <div style="font-size:10px;color:#6b7280">Avg Spend</div>
      <div style="font-size:16px;font-weight:700;color:#16a34a">₹${data.avgSpending}</div>
    </div>
    <div style="background:#eff6ff;padding:6px 8px;border-radius:6px">
      <div style="font-size:10px;color:#6b7280">Total Revenue</div>
      <div style="font-size:16px;font-weight:700;color:#2563eb">₹${data.totalRevenue.toLocaleString()}</div>
    </div>
  </div>

  <div style="margin-bottom:6px">
    <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">🏆 Most Ordered</div>
    <div style="font-size:13px;font-weight:600">${topProduct.product}</div>
    <div style="font-size:11px;color:#6b7280">${topProduct.qty} units · ${topProduct.orders} orders · ₹${topProduct.revenue.toLocaleString()}</div>
  </div>

  <div style="margin-bottom:6px">
    <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">📦 Top Category</div>
    <div style="font-size:13px;font-weight:600">${topCategory.category}</div>
    <div style="font-size:11px;color:#6b7280">${topCategory.qty} units · ₹${topCategory.revenue.toLocaleString()}</div>
  </div>

  ${data.topCategories.length > 1 ? `
  <div style="margin-bottom:6px">
    <div style="font-size:10px;color:#6b7280;margin-bottom:3px">Categories</div>
    <div style="display:flex;flex-wrap:wrap;gap:3px">
      ${data.topCategories.slice(0, 5).map((c: { category: string; qty: number }) =>
        `<span style="font-size:10px;background:#f3f4f6;padding:2px 6px;border-radius:4px">${c.category} (${c.qty})</span>`
      ).join("")}
    </div>
  </div>` : ""}

  ${data.peakHour ? `
  <div style="font-size:11px;color:#6b7280;padding-top:4px;border-top:1px solid #f3f4f6">
    ⏰ Peak hour: <strong>${data.peakHour.hour}:00–${data.peakHour.hour}:59</strong> (${data.peakHour.qty} units)
  </div>` : ""}
</div>`

      loadingPopup.setContent(html)
    } catch {
      loadingPopup.setContent(
        '<div style="padding:8px;text-align:center;color:#ef4444;font-size:13px">Failed to load area data</div>'
      )
    }
  }, [map])

  useEffect(() => {
    map.on("click", handleClick)
    return () => {
      map.off("click", handleClick)
    }
  }, [map, handleClick])

  return null
}

interface LeafletMapProps {
  latitude: number
  longitude: number
  radiusKm: number
  showRadius?: boolean
  demandPoints?: Array<[number, number, number]>
  livePulses?: Array<{ lat: number; lng: number; id: string }>
}

export default function LeafletMap({
  latitude,
  longitude,
  radiusKm,
  showRadius = false,
  demandPoints = [],
  livePulses = [],
}: LeafletMapProps) {
  const center: [number, number] = [latitude, longitude]

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} />
      {showRadius && (
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
            weight: 2,
          }}
        />
      )}
      {demandPoints.length > 0 && <HeatmapLayer points={demandPoints} />}
      {livePulses.length > 0 && <LivePulseMarkers pulses={livePulses} />}
      <ClickPopupHandler />
      <MapUpdater center={center} />
    </MapContainer>
  )
}
