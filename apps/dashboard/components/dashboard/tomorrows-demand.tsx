"use client"

import { useEffect, useState } from "react"
import { Clock, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface StatisticalForecast {
  trend: { direction: "up" | "down"; percentage: number }
  topProducts: Array<{ product: string; totalQty: number; category: string }>
  dayOfWeek: Array<{ day: number; totalQty: number }>
  peakHours: Array<{ hour: number; totalQty: number }>
}

interface AIPrediction {
  date: string
  predicted_quantity: number
  lower_bound: number
  upper_bound: number
}

interface AIForecast {
  entity: string
  predictions: AIPrediction[]
  total_predicted: number
  avg_daily: number
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatHour(hour: number) {
  if (hour === 0) return "12 AM"
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return "12 PM"
  return `${hour - 12} PM`
}

export function TomorrowsDemand() {
  const [forecast, setForecast] = useState<StatisticalForecast | null>(null)
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null)
  const [source, setSource] = useState<"chronos" | "statistical">("statistical")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try AI forecast first, fall back to statistical
    Promise.all([
      apiFetch<StatisticalForecast>("/demand/forecast?days=7"),
      apiFetch<AIForecast | { fallback: true }>("/ai-forecast/overall", {
        method: "POST",
        body: JSON.stringify({ horizon: 7 }),
      }).catch(() => null),
    ])
      .then(([statistical, aiData]) => {
        setForecast(statistical)

        if (aiData && !("fallback" in aiData) && aiData.predictions?.length > 0) {
          // Use the first prediction (tomorrow)
          setAiPrediction(aiData.predictions[0])
          setSource("chronos")
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const tomorrowDay = (new Date().getDay() + 1) % 7
  const tomorrowName = DAY_NAMES[tomorrowDay]
  const dayData = forecast?.dayOfWeek.find((d) => d.day === tomorrowDay)

  // Use AI prediction if available, otherwise statistical
  const predictedUnits = aiPrediction
    ? Math.round(aiPrediction.predicted_quantity)
    : dayData?.totalQty ?? 0

  const topPeakHours = forecast?.peakHours.slice(0, 3) ?? []
  const topProducts = forecast?.topProducts.slice(0, 3) ?? []

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">Tomorrow&apos;s Demand</CardTitle>
          <Badge variant={source === "chronos" ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
            {source === "chronos" ? "Chronos-2" : "Statistical"}
          </Badge>
        </div>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !forecast ? (
          <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
            No forecast data available yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{tomorrowName} prediction</p>
                <p className="text-2xl font-bold tabular-nums">{predictedUnits.toLocaleString("en-IN")} units</p>
                {aiPrediction && (
                  <p className="text-xs text-muted-foreground">
                    Range: {Math.round(aiPrediction.lower_bound).toLocaleString("en-IN")}–{Math.round(aiPrediction.upper_bound).toLocaleString("en-IN")} units
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {forecast.trend.direction === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    forecast.trend.direction === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {forecast.trend.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Top Products</p>
              <div className="space-y-1.5">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate mr-2">{p.product}</span>
                    <span className="text-muted-foreground tabular-nums shrink-0">{p.totalQty.toLocaleString("en-IN")} units</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Peak Hours</p>
              <div className="flex flex-wrap gap-1.5">
                {topPeakHours.map((h, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {formatHour(h.hour)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
