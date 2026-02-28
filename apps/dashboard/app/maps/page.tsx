"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { io, Socket } from "socket.io-client"
import { useGeolocation } from "@/hooks/use-geolocation"
import { RadiusControl } from "@/components/maps/radius-control"
import { DemandUpload } from "@/components/maps/demand-upload"
import { DemandStats } from "@/components/maps/demand-stats"
import { TimeFilter } from "@/components/maps/time-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Map, Flame, Radio } from "lucide-react"

const API_BASE = ""

const LeafletMap = dynamic(() => import("@/components/maps/leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="absolute inset-0" />,
})

interface LiveEvent {
  lat: number
  lng: number
  intensity: number
  product: string
  category: string
  quantity: number
  time: string
  id: string
}

export default function MapsPage() {
  const [radius, setRadius] = useState(5)
  const [viewMode, setViewMode] = useState<"radius" | "heatmap">("heatmap")
  const [refreshKey, setRefreshKey] = useState(0)
  const [demandPoints, setDemandPoints] = useState<Array<[number, number, number]>>([])
  const [timeRange, setTimeRange] = useState<[number, number] | null>(null)
  const [dateRange, setDateRange] = useState<{ days: number; start: string | null; end: string | null }>({
    days: 30,
    start: null,
    end: null,
  })
  const [liveCount, setLiveCount] = useState(0)
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([])
  const [livePulses, setLivePulses] = useState<Array<{ lat: number; lng: number; id: string }>>([])
  const [connected, setConnected] = useState(false)
  const eventIdRef = useRef(0)
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

  // Socket.IO connection
  useEffect(() => {
    const socket: Socket = io("http://localhost:6000")

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))

    socket.on("demand:new-events", (events: Omit<LiveEvent, "id">[]) => {
      const tagged = events.map((e) => ({
        ...e,
        id: `live-${++eventIdRef.current}`,
      }))

      // Append to heatmap with boosted intensity so live events are visible
      const newPoints: Array<[number, number, number]> = tagged.map((e) => [
        e.lat,
        e.lng,
        1.0, // max intensity so new dots stand out
      ])
      setDemandPoints((prev) => [...prev, ...newPoints])
      setLiveCount((prev) => prev + events.length)

      // Pulse markers on map (animated rings)
      setLivePulses((prev) =>
        [...prev, ...tagged.map((e) => ({ lat: e.lat, lng: e.lng, id: e.id }))].slice(-20)
      )

      // Update live feed (keep last 5)
      setLiveEvents((prev) => [...tagged, ...prev].slice(0, 5))
    })

    return () => {
      socket.disconnect()
    }
  }, [])

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
          livePulses={livePulses}
        />

        {/* Top bar — view toggle + filters + LIVE badge */}
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

          {/* Separator */}
          <div className="w-px h-5 bg-border mx-0.5" />

          {/* LIVE badge */}
          <div className="flex items-center gap-1.5 px-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  connected ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase">
              Live
            </span>
            {liveCount > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                +{liveCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Upload panel — top right */}
        <div className="absolute top-3 right-3 z-[1000]">
          <DemandUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* Stats overlay — bottom left */}
        <div className="absolute bottom-4 left-3 z-[1000]">
          <DemandStats refreshKey={refreshKey} />
        </div>

        {/* Live event feed — bottom right */}
        {liveEvents.length > 0 && (
          <div className="absolute bottom-4 right-3 z-[1000] w-56 space-y-1.5">
            {liveEvents.map((evt, i) => (
              <div
                key={evt.id}
                className="bg-background/85 backdrop-blur-md border rounded-lg px-3 py-2 shadow-md animate-in fade-in slide-in-from-right-3 duration-300"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Radio className="h-3 w-3 text-green-500 shrink-0" />
                    <span className="text-xs font-medium truncate">{evt.product}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    x{evt.quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{evt.category}</span>
                  <span className="text-[10px] text-muted-foreground">{evt.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Radius control — only visible in radius mode */}
        {viewMode === "radius" && (
          <RadiusControl radius={radius} onRadiusChange={setRadius} />
        )}
      </div>
    </div>
  )
}
