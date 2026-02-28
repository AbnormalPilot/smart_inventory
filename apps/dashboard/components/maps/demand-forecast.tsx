"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  X,
  Layers,
} from "lucide-react"

const API_BASE = ""

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

interface Forecast {
  topProducts: Array<{
    product: string
    totalQty: number
    category: string
    eventCount: number
  }>
  peakHours: Array<{ hour: number; totalQty: number; eventCount: number }>
  dayOfWeek: Array<{ day: number; totalQty: number; eventCount: number }>
  trend: {
    direction: "up" | "down"
    percentage: number
    firstHalfTotal: number
    secondHalfTotal: number
  }
  categoryBreakdown: Array<{
    category: string
    totalQty: number
    eventCount: number
  }>
}

interface DemandForecastProps {
  open: boolean
  onClose: () => void
  refreshKey: number
}

export function DemandForecast({ open, onClose, refreshKey }: DemandForecastProps) {
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`${API_BASE}/api/demand/forecast?days=30`)
      .then((r) => r.json())
      .then((data) => setForecast(data))
      .catch(() => setForecast(null))
      .finally(() => setLoading(false))
  }, [open, refreshKey])

  if (!open) return null

  return (
    <div className="absolute top-0 right-0 bottom-0 z-[1000] w-80 bg-background/95 backdrop-blur-md border-l shadow-xl overflow-y-auto">
      <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Demand Forecast
        </h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !forecast ? (
        <div className="p-4 text-sm text-muted-foreground">
          Failed to load forecast data.
        </div>
      ) : (
        <div className="p-3 space-y-3">
          {/* Trend Indicator */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">30-Day Trend</p>
                  <div className="flex items-center gap-2 mt-1">
                    {forecast.trend.direction === "up" ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    <span
                      className={`text-2xl font-bold ${
                        forecast.trend.direction === "up"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {forecast.trend.percentage}%
                    </span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-muted-foreground space-y-0.5">
                  <p>First half: {forecast.trend.firstHalfTotal} units</p>
                  <p>Second half: {forecast.trend.secondHalfTotal} units</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" />
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={forecast.topProducts.slice(0, 7)}
                    layout="vertical"
                    margin={{ left: 0, right: 8, top: 0, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="product"
                      width={90}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: string) =>
                        v.length > 14 ? v.slice(0, 14) + "..." : v
                      }
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 11 }}
                      formatter={(value: number) => [`${value} units`, "Demand"]}
                    />
                    <Bar dataKey="totalQty" radius={[0, 4, 4, 0]}>
                      {forecast.topProducts.slice(0, 7).map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Peak Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={forecast.peakHours}
                    margin={{ left: -20, right: 4, top: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 9 }}
                      tickFormatter={(h: number) => `${h}h`}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ fontSize: 11 }}
                      labelFormatter={(h: number) =>
                        `${h}:00 - ${h}:59`
                      }
                      formatter={(value: number) => [`${value} units`, "Demand"]}
                    />
                    <Bar dataKey="totalQty" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Day of Week */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium">Day-of-Week Pattern</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={forecast.dayOfWeek.map((d) => ({
                      ...d,
                      name: DAY_NAMES[d.day - 1] || `D${d.day}`,
                    }))}
                    margin={{ left: -20, right: 4, top: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ fontSize: 11 }}
                      formatter={(value: number) => [`${value} units`, "Demand"]}
                    />
                    <Bar
                      dataKey="totalQty"
                      fill="hsl(var(--chart-2))"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1.5">
              {forecast.categoryBreakdown.slice(0, 6).map((c) => {
                const maxQty = forecast.categoryBreakdown[0]?.totalQty || 1
                const pct = Math.round((c.totalQty / maxQty) * 100)
                return (
                  <div key={c.category} className="space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">{c.category}</span>
                      <span className="font-medium">{c.totalQty}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Toggle button for the forecast panel
export function ForecastToggle({
  open,
  onClick,
}: {
  open: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="shadow-lg gap-1.5 bg-background/80 backdrop-blur-md"
      onClick={onClick}
    >
      <Layers className="h-3.5 w-3.5" />
      Forecast
      {open ? (
        <ChevronRight className="h-3.5 w-3.5" />
      ) : (
        <ChevronLeft className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}
