"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useGeolocation } from "@/hooks/use-geolocation"
import { RadiusControl } from "@/components/maps/radius-control"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

const LeafletMap = dynamic(() => import("@/components/maps/leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="absolute inset-0" />,
})

export default function MapsPage() {
  const [radius, setRadius] = useState(5)
  const { latitude, longitude, error, loading } = useGeolocation()

  if (loading || latitude === null || longitude === null) {
    return (
      <div className="relative flex-1 -m-4 md:-m-6">
        <Skeleton className="absolute inset-0" />
      </div>
    )
  }

  return (
    <div className="relative flex-1 -m-4 md:-m-6">
      {error && (
        <Badge variant="destructive" className="absolute top-2 left-2 z-[1000] w-fit gap-1">
          <AlertCircle className="h-3 w-3" />
          Using fallback location (New Delhi) — {error}
        </Badge>
      )}
      <div className="absolute inset-0">
        <LeafletMap
          latitude={latitude}
          longitude={longitude}
          radiusKm={radius}
        />
        <RadiusControl radius={radius} onRadiusChange={setRadius} />
      </div>
    </div>
  )
}
