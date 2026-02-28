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
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
})

export default function MapsPage() {
  const [radius, setRadius] = useState(5)
  const { latitude, longitude, error, loading } = useGeolocation()

  if (loading || latitude === null || longitude === null) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Skeleton className="h-[calc(100vh-16rem)] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {error && (
        <Badge variant="destructive" className="w-fit gap-1">
          <AlertCircle className="h-3 w-3" />
          Using fallback location (New Delhi) — {error}
        </Badge>
      )}
      <div className="relative h-[calc(100vh-16rem)]">
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
