"use client"

import { useEffect, useState } from "react"
import { Brain, TrendingUp, Package, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface ForecastOverall {
  entity: string
  entity_type: string
  horizon: number
  predictions: Array<{
    date: string
    predicted_quantity: number
    lower_bound: number
    upper_bound: number
  }>
  total_predicted: number
  avg_daily: number
  model: string
}

interface ProductInfo {
  product: string
  category: string
  total_qty: number
  data_days: number
}

export function ForecastSummaryCards() {
  const [overall, setOverall] = useState<ForecastOverall | null>(null)
  const [topProduct, setTopProduct] = useState<ProductInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAIAvailable, setIsAIAvailable] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch<ForecastOverall | { fallback: true }>("/ai-forecast/overall", {
        method: "POST",
        body: JSON.stringify({ horizon: 7 }),
      }),
      apiFetch<{ products: ProductInfo[] }>("/ai-forecast/products"),
    ])
      .then(([overallData, productsData]) => {
        if ("fallback" in overallData) {
          setIsAIAvailable(false)
        } else {
          setOverall(overallData)
          setIsAIAvailable(true)
        }
        if (productsData.products.length > 0) {
          setTopProduct(productsData.products[0])
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Calculate trend from predictions
  const trend =
    overall && overall.predictions.length >= 2
      ? overall.predictions[overall.predictions.length - 1].predicted_quantity -
        overall.predictions[0].predicted_quantity
      : 0
  const trendDirection = trend >= 0 ? "up" : "down"

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!isAIAvailable) {
    return null
  }

  const fmt = (n: number | undefined) => {
    if (n == null) return "—"
    return Math.round(n).toLocaleString("en-IN")
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Predicted 7-Day Demand */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Predicted Next 7D Demand
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {fmt(overall?.total_predicted)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  units
                </span>
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-2.5">
              <Brain className="h-4 w-4 text-primary" />
            </div>
          </div>
          <Badge variant="secondary" className="mt-2 text-[10px]">
            Chronos-2
          </Badge>
        </CardContent>
      </Card>

      {/* Top Predicted Product */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Top Tracked Product
              </p>
              <p className="text-lg font-bold truncate max-w-[180px]">
                {topProduct?.product ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {topProduct
                  ? `${fmt(topProduct.total_qty)} units over ${topProduct.data_days} days`
                  : "No data"}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-2.5">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                7-Day Forecast Trend
              </p>
              <div className="flex items-center gap-1.5">
                <TrendingUp
                  className={`h-5 w-5 ${
                    trendDirection === "up" ? "text-green-500" : "text-red-500 rotate-180"
                  }`}
                />
                <p className="text-2xl font-bold tabular-nums">
                  {fmt(overall?.avg_daily)}
                </p>
                <span className="text-sm font-normal text-muted-foreground">
                  avg/day
                </span>
              </div>
            </div>
            <div className="rounded-full bg-primary/10 p-2.5">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
