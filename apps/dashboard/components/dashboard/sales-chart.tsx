"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface TrendData {
  date: string
  revenue: number
  count: number
}

const chartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  count: { label: "Orders", color: "hsl(var(--chart-2))" },
}

export function SalesChart() {
  const [data, setData] = useState<TrendData[]>([])
  const [days, setDays] = useState(30)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    apiFetch<{ data: TrendData[] }>(`/analytics/sales-trend?days=${days}`)
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false))
  }, [days])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sales Trend</CardTitle>
        <Tabs value={String(days)} onValueChange={(v) => setDays(parseInt(v))}>
          <TabsList className="h-8">
            <TabsTrigger value="7" className="text-xs px-2">7D</TabsTrigger>
            <TabsTrigger value="30" className="text-xs px-2">30D</TabsTrigger>
            <TabsTrigger value="90" className="text-xs px-2">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No sales data yet. Start making sales to see trends.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${v}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                fill="url(#fillRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
