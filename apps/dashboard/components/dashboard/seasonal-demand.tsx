"use client"

import { useEffect, useState } from "react"
import { CalendarDays } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface SeasonalData {
  month: string
  revenue: number
  orders: number
}

interface Recommendation {
  type: string
  title: string
  description: string
  priority: string
}

const chartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
}

export function SeasonalDemand() {
  const [data, setData] = useState<SeasonalData[]>([])
  const [insight, setInsight] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<{ data: SeasonalData[] }>("/ai/seasonal-analysis"),
      apiFetch<{ recommendations: Recommendation[] }>("/ai/recommendations"),
    ])
      .then(([seasonal, recs]) => {
        setData(seasonal.data)
        const seasonalRec = recs.recommendations.find((r) => r.type === "seasonal")
        if (seasonalRec) setInsight(seasonalRec.description)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Seasonal Demand</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
            No seasonal data available yet.
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            {insight && (
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{insight}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
