"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface CategoryData {
  category: string
  revenue: number
  quantity: number
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function CategoryChart() {
  const [data, setData] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ data: CategoryData[] }>("/analytics/category-breakdown")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false))
  }, [])

  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.category,
      { label: d.category, color: COLORS[i % COLORS.length] },
    ])
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No category data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={2}
                label={({ category, percent }) =>
                  `${category} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
