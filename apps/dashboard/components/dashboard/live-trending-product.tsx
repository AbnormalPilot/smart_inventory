"use client"

import { useEffect, useState } from "react"
import { Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"

interface DemandStats {
  totalEvents: number
  totalQuantity: number
  topProducts: Array<{ product: string; totalQty: number }>
}

export function LiveTrendingProduct() {
  const [stats, setStats] = useState<DemandStats | null>(null)

  useEffect(() => {
    function fetchStats() {
      apiFetch<DemandStats>("/demand/stats")
        .then(setStats)
        .catch(() => {})
    }
    fetchStats()
    const interval = setInterval(fetchStats, 60_000)
    return () => clearInterval(interval)
  }, [])

  const topProduct = stats?.topProducts?.[0]

  if (!stats || !topProduct) return null

  return (
    <Card className="sticky bottom-4 border-green-500/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="flex items-center gap-4 py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-green-500 uppercase tracking-wider">Live</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{topProduct.product}</span>
        </div>
        <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground shrink-0">
          <span><span className="font-semibold text-foreground tabular-nums">{topProduct.totalQty}</span> units sold</span>
          <span><span className="font-semibold text-foreground tabular-nums">{stats.totalQuantity}</span> net qty</span>
          <span><span className="font-semibold text-foreground tabular-nums">{stats.totalEvents}</span> events</span>
        </div>
      </CardContent>
    </Card>
  )
}
