"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet.heat"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"

function HeatmapLayer({ points }: { points: Array<[number, number, number]> }) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current)
    }

    if (points.length === 0) return

    const heat = (L as unknown as {
      heatLayer: (
        latlngs: Array<[number, number, number]>,
        options?: Record<string, unknown>
      ) => L.Layer
    }).heatLayer(points, {
      radius: 20,
      blur: 12,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.2: "#3b82f6",
        0.4: "#06b6d4",
        0.6: "#22c55e",
        0.8: "#eab308",
        1.0: "#ef4444",
      },
    })

    heat.addTo(map)
    layerRef.current = heat

    // Fit bounds to show all points
    if (points.length > 0) {
      const bounds = L.latLngBounds(
        points.map(([lat, lng]) => [lat, lng] as [number, number])
      )
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 })
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map, points])

  return null
}

interface MiniMapInnerProps {
  points: Array<[number, number, number]>
}

export default function MiniMapInner({ points }: MiniMapInnerProps) {
  // Calculate center from points
  const center: [number, number] =
    points.length > 0
      ? [
          points.reduce((s, p) => s + p[0], 0) / points.length,
          points.reduce((s, p) => s + p[1], 0) / points.length,
        ]
      : [18.6298, 73.9131]

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
      dragging={true}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.length > 0 && <HeatmapLayer points={points} />}
    </MapContainer>
  )
}
