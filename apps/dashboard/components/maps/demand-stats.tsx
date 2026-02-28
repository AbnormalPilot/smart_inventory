"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Package, Calendar, Database } from "lucide-react"

const API_BASE = ""

interface Stats {
  totalEvents: number
  totalQuantity: number
  dateRange: { earliest: string; latest: string } | null
  topProducts: Array<{ product: string; totalQty: number }>
  sources: Array<{ source: string; count: number }>
}

export interface LiveStats {
  events: number
  quantity: number
  products: Record<string, number>
}

interface DemandStatsProps {
  refreshKey: number
  liveStats?: LiveStats
}

export function DemandStats({ refreshKey, liveStats }: DemandStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/demand/stats`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [refreshKey])

  // Merge base stats with live accumulated data
  const merged = useMemo(() => {
    if (!stats) return null

    const liveEvents = liveStats?.events ?? 0
    const liveQty = liveStats?.quantity ?? 0
    const liveProducts = liveStats?.products ?? {}

    // Merge top products: add live quantities to existing, include new ones
    const productMap = new Map<string, number>()
    for (const p of stats.topProducts) {
      productMap.set(p.product, p.totalQty)
    }
    for (const [name, qty] of Object.entries(liveProducts)) {
      productMap.set(name, (productMap.get(name) ?? 0) + qty)
    }
    const topProducts = Array.from(productMap.entries())
      .map(([product, totalQty]) => ({ product, totalQty }))
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5)

    return {
      totalEvents: stats.totalEvents + liveEvents,
      totalQuantity: stats.totalQuantity + liveQty,
      dateRange: stats.dateRange,
      topProducts,
    }
  }, [stats, liveStats])

  if (loading || !merged || merged.totalEvents === 0) return null

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" })

  return (
    <Card className="w-56 bg-background/80 backdrop-blur-md border-border/50 shadow-lg">
      <CardContent className="p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Demand Data</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Events
            </p>
            <p className="text-lg font-semibold leading-none tabular-nums">
              {merged.totalEvents}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> Quantity
            </p>
            <p className="text-lg font-semibold leading-none tabular-nums">
              {merged.totalQuantity.toLocaleString()}
            </p>
          </div>
        </div>

        {merged.dateRange && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(merged.dateRange.earliest)} — {formatDate(merged.dateRange.latest)}
          </div>
        )}

        {merged.topProducts.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">
              Top Products
            </p>
            <div className="flex flex-wrap gap-1">
              {merged.topProducts.slice(0, 3).map((p) => (
                <Badge
                  key={p.product}
                  variant="secondary"
                  className="text-[10px] font-normal"
                >
                  {p.product.length > 15
                    ? p.product.slice(0, 15) + "..."
                    : p.product}{" "}
                  ({p.totalQty})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
