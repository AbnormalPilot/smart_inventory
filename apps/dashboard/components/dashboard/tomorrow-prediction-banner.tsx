"use client"

import { useEffect, useState } from "react"
import { Sparkles, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { apiFetch } from "@/lib/api"

interface ForecastData {
  trend: { direction: "up" | "down"; percentage: number }
  topProducts: Array<{ product: string; totalQty: number }>
  dayOfWeek: Array<{ day: number; totalQty: number }>
}

interface AIPrediction {
  predictions: Array<{
    date: string
    predicted_quantity: number
    lower_bound: number
    upper_bound: number
  }>
  total_predicted: number
  avg_daily: number
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function TomorrowPredictionBanner() {
  const [units, setUnits] = useState<number | null>(null)
  const [topProduct, setTopProduct] = useState<string>("")
  const [trendDir, setTrendDir] = useState<"up" | "down">("up")
  const [trendPct, setTrendPct] = useState(0)
  const [source, setSource] = useState<"ai" | "statistical">("statistical")
  const [range, setRange] = useState<{ low: number; high: number } | null>(null)

  const tomorrowDay = (new Date().getDay() + 1) % 7
  const tomorrowName = DAY_NAMES[tomorrowDay]

  useEffect(() => {
    Promise.all([
      apiFetch<ForecastData>("/demand/forecast?days=7"),
      apiFetch<AIPrediction | { fallback: true }>("/ai-forecast/overall", {
        method: "POST",
        body: JSON.stringify({ horizon: 3 }),
      }).catch(() => null),
    ])
      .then(([statistical, aiData]) => {
        setTrendDir(statistical.trend.direction)
        setTrendPct(statistical.trend.percentage)

        if (statistical.topProducts.length > 0) {
          setTopProduct(statistical.topProducts[0].product)
        }

        if (aiData && !("fallback" in aiData) && aiData.predictions?.length > 0) {
          const tomorrow = aiData.predictions[0]
          setUnits(Math.round(tomorrow.predicted_quantity))
          setRange({
            low: Math.round(tomorrow.lower_bound),
            high: Math.round(tomorrow.upper_bound),
          })
          setSource("ai")
        } else {
          const dayData = statistical.dayOfWeek.find((d) => d.day === tomorrowDay)
          setUnits(dayData?.totalQty ?? 0)
          setSource("statistical")
        }
      })
      .catch(() => {})
  }, [tomorrowDay])

  if (units === null) return null

  return (
    <div className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-primary/5 via-primary/3 to-transparent px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium">
            {tomorrowName} Forecast
          </span>
        </div>

        <div className="h-4 w-px bg-border hidden sm:block" />

        <div className="flex items-center gap-4 flex-wrap text-sm">
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-base tabular-nums">{units}</span>
            <span className="text-muted-foreground">units predicted</span>
            {range && (
              <span className="text-xs text-muted-foreground">
                ({range.low}–{range.high})
              </span>
            )}
          </span>

          <span className="flex items-center gap-1">
            {trendDir === "up" ? (
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span
              className={`font-semibold text-xs ${
                trendDir === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {trendPct}%
            </span>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </span>

          {topProduct && (
            <>
              <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowRight className="h-3 w-3" />
                Top: <span className="font-medium text-foreground">{topProduct}</span>
              </span>
            </>
          )}
        </div>

        <div className="ml-auto shrink-0">
          <Badge
            variant={source === "ai" ? "default" : "outline"}
            className="text-[10px] px-1.5 py-0"
          >
            {source === "ai" ? "Chronos-2" : "Statistical"}
          </Badge>
        </div>
      </div>
    </div>
  )
}
