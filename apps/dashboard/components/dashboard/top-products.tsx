"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface TopProduct {
  name: string
  sku: string
  totalQuantity: number
  totalRevenue: number
}

export function TopProducts() {
  const [data, setData] = useState<TopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ data: TopProduct[] }>("/analytics/top-products?limit=5")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false))
  }, [])

  const maxRevenue = data.length > 0 ? Math.max(...data.map((d) => d.totalRevenue)) : 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
        ) : (
          <div className="space-y-4">
            {data.map((product, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate mr-2">{product.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    ${product.totalRevenue.toFixed(2)}
                  </span>
                </div>
                <Progress value={(product.totalRevenue / maxRevenue) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">{product.totalQuantity} units sold</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
