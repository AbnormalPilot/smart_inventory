"use client"

import { useEffect, useState, useCallback } from "react"
import { Brain, Loader2 } from "lucide-react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface Prediction {
  date: string
  predicted_quantity: number
  lower_bound: number
  upper_bound: number
}

interface ForecastResponse {
  entity: string
  entity_type: string
  horizon: number
  predictions: Prediction[]
  total_predicted: number
  avg_daily: number
  confidence_level: string
  model: string
}

interface FallbackResponse {
  fallback: true
  message: string
}

interface ProductOption {
  product: string
  category: string
  total_qty: number
  data_days: number
}

interface ChartPoint {
  date: string
  predicted: number
  lower: number
  upper: number
}

const chartConfig: ChartConfig = {
  predicted: { label: "Predicted", color: "hsl(var(--chart-1))" },
  lower: { label: "Lower Bound", color: "hsl(var(--chart-2))" },
  upper: { label: "Upper Bound", color: "hsl(var(--chart-2))" },
}

type Horizon = "7" | "14" | "30"

export function AiForecastChart() {
  const [products, setProducts] = useState<ProductOption[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [horizon, setHorizon] = useState<Horizon>("14")
  const [forecast, setForecast] = useState<ForecastResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [source, setSource] = useState<"chronos" | "unavailable">("chronos")
  const [error, setError] = useState<string | null>(null)

  // Load available products
  useEffect(() => {
    apiFetch<{ products: ProductOption[] }>("/ai-forecast/products")
      .then((data) => {
        setProducts(data.products)
        if (data.products.length > 0) {
          setSelectedProduct(data.products[0].product)
        }
      })
      .catch(() => setError("Could not load products"))
      .finally(() => setIsLoading(false))
  }, [])

  // Fetch forecast when product or horizon changes
  const fetchForecast = useCallback(async () => {
    if (!selectedProduct) return

    setIsFetching(true)
    setError(null)

    try {
      const data = await apiFetch<ForecastResponse | FallbackResponse>(
        "/ai-forecast/product",
        {
          method: "POST",
          body: JSON.stringify({
            product: selectedProduct,
            horizon: parseInt(horizon),
          }),
        }
      )

      if ("fallback" in data) {
        setSource("unavailable")
        setForecast(null)
        setError("AI engine offline — start it with: cd apps/ai-engine && npm run dev")
      } else {
        setSource("chronos")
        setForecast(data)
      }
    } catch {
      setError("Failed to fetch forecast")
      setForecast(null)
    } finally {
      setIsFetching(false)
    }
  }, [selectedProduct, horizon])

  useEffect(() => {
    fetchForecast()
  }, [fetchForecast])

  const chartData: ChartPoint[] =
    forecast?.predictions.map((p) => ({
      date: p.date.slice(5), // MM-DD
      predicted: p.predicted_quantity,
      lower: p.lower_bound,
      upper: p.upper_bound,
    })) ?? []

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">
            AI Demand Forecast
          </CardTitle>
          <Badge variant={source === "chronos" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
            {source === "chronos" ? "Chronos-2" : "Offline"}
          </Badge>
        </div>
        <Brain className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedProduct}
            onValueChange={setSelectedProduct}
            disabled={isLoading || products.length === 0}
          >
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.product} value={p.product} className="text-xs">
                  {p.product}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={horizon} onValueChange={(v) => setHorizon(v as Horizon)}>
            <TabsList className="h-8">
              <TabsTrigger value="7" className="text-xs px-2.5">7D</TabsTrigger>
              <TabsTrigger value="14" className="text-xs px-2.5">14D</TabsTrigger>
              <TabsTrigger value="30" className="text-xs px-2.5">30D</TabsTrigger>
            </TabsList>
          </Tabs>
          {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>

        {/* Chart */}
        {isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : error ? (
          <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
            {error}
          </div>
        ) : forecast && chartData.length > 0 ? (
          <>
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="upper"
                  fill="hsl(var(--chart-2) / 0.15)"
                  stroke="none"
                  type="monotone"
                />
                <Area
                  dataKey="lower"
                  fill="hsl(var(--background))"
                  stroke="none"
                  type="monotone"
                />
                <Line
                  dataKey="predicted"
                  stroke="var(--color-predicted)"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  type="monotone"
                />
              </ComposedChart>
            </ChartContainer>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Total: <span className="font-medium text-foreground">{Math.round(forecast.total_predicted).toLocaleString("en-IN")} units</span>
                {" "}| Avg: <span className="font-medium text-foreground">{Math.round(forecast.avg_daily).toLocaleString("en-IN")}/day</span>
              </span>
              <span>{forecast.confidence_level} confidence</span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
            Select a product to see AI-powered demand forecast.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
