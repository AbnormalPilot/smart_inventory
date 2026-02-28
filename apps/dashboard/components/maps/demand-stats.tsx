"use client"

import { useEffect, useState } from "react"
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

interface DemandStatsProps {
  refreshKey: number
}

export function DemandStats({ refreshKey }: DemandStatsProps) {
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

  if (loading || !stats || stats.totalEvents === 0) return null

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
            <p className="text-lg font-semibold leading-none">
              {stats.totalEvents}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> Quantity
            </p>
            <p className="text-lg font-semibold leading-none">
              {stats.totalQuantity.toLocaleString()}
            </p>
          </div>
        </div>

        {stats.dateRange && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(stats.dateRange.earliest)} — {formatDate(stats.dateRange.latest)}
          </div>
        )}

        {stats.topProducts.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">
              Top Products
            </p>
            <div className="flex flex-wrap gap-1">
              {stats.topProducts.slice(0, 3).map((p) => (
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
