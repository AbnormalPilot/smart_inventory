"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface CategoryValue {
  category: string
  totalCostValue: number
  totalRetailValue: number
  productCount: number
  totalUnits: number
}

interface InventoryData {
  categories: CategoryValue[]
  totals: { costValue: number; retailValue: number; products: number; units: number }
}

const chartConfig: ChartConfig = {
  totalRetailValue: { label: "Retail Value", color: "hsl(var(--chart-1))" },
  totalCostValue: { label: "Cost Value", color: "hsl(var(--chart-3))" },
}

export function InventoryAnalysis() {
  const [data, setData] = useState<InventoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetch<InventoryData>("/analytics/inventory-value")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Value by Category</CardTitle>
          {data?.totals && (
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span>Retail: <strong className="text-foreground">${data.totals.retailValue.toFixed(2)}</strong></span>
              <span>Cost: <strong className="text-foreground">${data.totals.costValue.toFixed(2)}</strong></span>
              <span>Margin: <strong className="text-foreground">${(data.totals.retailValue - data.totals.costValue).toFixed(2)}</strong></span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : !data || data.categories.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No inventory data available
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={data.categories} layout="vertical" margin={{ top: 10, right: 10, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="category" tickLine={false} axisLine={false} width={70} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="totalRetailValue" fill="var(--color-totalRetailValue)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="totalCostValue" fill="var(--color-totalCostValue)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {data && data.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Cost Value</TableHead>
                    <TableHead className="text-right">Retail Value</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.categories.map((cat) => (
                    <TableRow key={cat.category}>
                      <TableCell className="font-medium">{cat.category}</TableCell>
                      <TableCell className="text-right">{cat.productCount}</TableCell>
                      <TableCell className="text-right">{cat.totalUnits}</TableCell>
                      <TableCell className="text-right">${cat.totalCostValue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${cat.totalRetailValue.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${(cat.totalRetailValue - cat.totalCostValue).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
