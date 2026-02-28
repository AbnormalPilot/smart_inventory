"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { MapPin, Maximize2, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface HeatmapData {
  points: Array<[number, number, number]>
  count: number
}

// Dynamically import the map to avoid SSR issues with Leaflet
const MiniMapInner = dynamic(() => import("./mini-map-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
})

export function MiniDemandMap() {
  const [points, setPoints] = useState<Array<[number, number, number]>>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hotzone, setHotzone] = useState<string>("")

  useEffect(() => {
    apiFetch<HeatmapData>("/demand/heatmap?days=7")
      .then((data) => {
        setPoints(data.points)
        setCount(data.count)

        // Find the hottest zone
        if (data.points.length > 0) {
          const sorted = [...data.points].sort((a, b) => b[2] - a[2])
          const top = sorted[0]
          setHotzone(`${top[0].toFixed(3)}, ${top[1].toFixed(3)}`)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">Demand Hotspots</CardTitle>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            7D
          </Badge>
        </div>
        <Link href="/maps">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        {isLoading ? (
          <div className="h-[220px] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : points.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
            <div className="text-center space-y-1">
              <MapPin className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p>No demand data yet</p>
              <Link href="/maps" className="text-xs text-primary hover:underline">
                Upload data on Maps page
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="h-[220px]">
              <MiniMapInner points={points} />
            </div>
            <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-t">
              <span>
                <span className="font-medium text-foreground">{count}</span> events
              </span>
              {hotzone && (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  Hottest: {hotzone}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
