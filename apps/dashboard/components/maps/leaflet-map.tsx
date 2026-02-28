"use client"

import { useEffect } from "react"
import L from "leaflet"
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

interface LeafletMapProps {
  latitude: number
  longitude: number
  radiusKm: number
}

export default function LeafletMap({
  latitude,
  longitude,
  radiusKm,
}: LeafletMapProps) {
  const center: [number, number] = [latitude, longitude]

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full rounded-lg"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} />
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
      <MapUpdater center={center} />
    </MapContainer>
  )
}
