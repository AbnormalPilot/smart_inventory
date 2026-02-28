"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface SalesData {
  date: string
  revenue: number
  count: number
}

const chartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  count: { label: "Orders", color: "hsl(var(--chart-2))" },
}

export function SalesReport() {
  const [data, setData] = useState<SalesData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ data: SalesData[] }>("/analytics/sales-trend?days=30")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false))
  }, [])

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Report (Last 30 Days)</CardTitle>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>Revenue: <strong className="text-foreground">${totalRevenue.toFixed(2)}</strong></span>
          <span>Orders: <strong className="text-foreground">{totalOrders}</strong></span>
          <span>Avg: <strong className="text-foreground">${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00"}</strong></span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            No sales data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
