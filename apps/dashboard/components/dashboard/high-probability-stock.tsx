"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface TopProduct {
  product: string
  totalQty: number
  category: string
  eventCount: number
}

export function HighProbabilityStock() {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ topProducts: TopProduct[] }>("/demand/forecast?days=30")
      .then((res) => setProducts(res.topProducts.slice(0, 5)))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const maxQty = products.length > 0 ? Math.max(...products.map((p) => p.totalQty)) : 1

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">High Probability Stock</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
            No demand data available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate mr-2">{product.product}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    <span className="text-sm font-semibold tabular-nums">{product.totalQty.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <Progress value={(product.totalQty / maxQty) * 100} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
