"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useGeolocation } from "@/hooks/use-geolocation"
import { RadiusControl } from "@/components/maps/radius-control"
import { DemandUpload } from "@/components/maps/demand-upload"
import { DemandStats } from "@/components/maps/demand-stats"
import { DemandForecast, ForecastToggle } from "@/components/maps/demand-forecast"
import { TimeFilter } from "@/components/maps/time-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Map, Flame } from "lucide-react"

const API_BASE = ""

const LeafletMap = dynamic(() => import("@/components/maps/leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="absolute inset-0" />,
})

export default function MapsPage() {
  const [radius, setRadius] = useState(5)
  const [viewMode, setViewMode] = useState<"radius" | "heatmap">("heatmap")
  const [forecastOpen, setForecastOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [demandPoints, setDemandPoints] = useState<Array<[number, number, number]>>([])
  const [timeRange, setTimeRange] = useState<[number, number] | null>(null)
  const [dateRange, setDateRange] = useState<{ days: number; start: string | null; end: string | null }>({
    days: 30,
    start: null,
    end: null,
  })
  const { latitude, longitude, error, loading } = useGeolocation()

  const fetchHeatmapData = useCallback(() => {
    const params = new URLSearchParams()
    if (dateRange.start && dateRange.end) {
      params.set("start", dateRange.start)
      params.set("end", dateRange.end)
    }
    params.set("days", String(dateRange.days))
    if (timeRange) {
      params.set("startHour", String(timeRange[0]))
      params.set("endHour", String(timeRange[1]))
    }
    fetch(`${API_BASE}/api/demand/heatmap?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.points) setDemandPoints(data.points)
      })
      .catch(() => {})
  }, [timeRange, dateRange])

  useEffect(() => {
    fetchHeatmapData()
  }, [fetchHeatmapData, refreshKey])

  function handleUploadComplete() {
    setRefreshKey((k) => k + 1)
  }

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
          Using fallback location (DY Patil University, Lohegaon) — {error}
        </Badge>
      )}

      <div className="absolute inset-0">
        <LeafletMap
          latitude={latitude}
          longitude={longitude}
          radiusKm={radius}
          showRadius={viewMode === "radius"}
          demandPoints={demandPoints}
        />

        {/* Top bar — view toggle + filters, all inline */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 bg-background/80 backdrop-blur-md rounded-lg p-1 shadow-lg border">
          <Button
            variant={viewMode === "radius" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setViewMode("radius")}
          >
            <Map className="h-3.5 w-3.5" />
            Radius
          </Button>
          <Button
            variant={viewMode === "heatmap" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setViewMode("heatmap")}
          >
            <Flame className="h-3.5 w-3.5" />
            Heatmap
            {demandPoints.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                {demandPoints.length}
              </Badge>
            )}
          </Button>

          {/* Separator */}
          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Time & Date filters */}
          <TimeFilter
            timeRange={timeRange}
            onTimeChange={setTimeRange}
            dateRange={dateRange}
            onDateChange={setDateRange}
          />
        </div>

        {/* Upload panel — top right */}
        <div className="absolute top-3 right-3 z-[1000]">
          <DemandUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* Stats overlay — bottom left */}
        <div className="absolute bottom-4 left-3 z-[1000]">
          <DemandStats refreshKey={refreshKey} />
        </div>

        {/* Forecast toggle — middle right */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2 z-[1000]">
          <ForecastToggle
            open={forecastOpen}
            onClick={() => setForecastOpen(!forecastOpen)}
          />
        </div>

        {/* Forecast slide-out panel */}
        <DemandForecast
          open={forecastOpen}
          onClose={() => setForecastOpen(false)}
          refreshKey={refreshKey}
        />

        {/* Radius control — only visible in radius mode */}
        {viewMode === "radius" && (
          <RadiusControl radius={radius} onRadiusChange={setRadius} />
        )}
      </div>
    </div>
  )
}
