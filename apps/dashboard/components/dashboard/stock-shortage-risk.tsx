"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface LowStockProduct {
  name: string
  quantity: number
  lowStockThreshold: number
  category: string
}

interface Recommendation {
  type: string
  title: string
  description: string
  priority: string
}

function getRiskLevel(quantity: number, threshold: number) {
  const ratio = quantity / threshold
  if (ratio <= 0.25) return { label: "Critical", color: "text-red-500", progressColor: "bg-red-500" }
  if (ratio <= 0.5) return { label: "High", color: "text-orange-500", progressColor: "bg-orange-500" }
  return { label: "Warning", color: "text-yellow-500", progressColor: "bg-yellow-500" }
}

export function StockShortageRisk() {
  const [products, setProducts] = useState<LowStockProduct[]>([])
  const [restockTips, setRestockTips] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<{ products: LowStockProduct[] }>("/products/low-stock"),
      apiFetch<{ recommendations: Recommendation[] }>("/ai/recommendations"),
    ])
      .then(([lowStock, recs]) => {
        setProducts(lowStock.products.slice(0, 5))
        setRestockTips(
          recs.recommendations
            .filter((r) => r.type === "restock")
            .map((r) => r.description)
            .slice(0, 2)
        )
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">Stock Shortage Risk</CardTitle>
          {products.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {products.length}
            </Badge>
          )}
        </div>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
            No stock shortage risks detected.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, i) => {
              const risk = getRiskLevel(product.quantity, product.lowStockThreshold)
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate mr-2">{product.name}</span>
                    <Badge variant="outline" className={`text-xs ${risk.color}`}>
                      {risk.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Progress
                        value={(product.quantity / product.lowStockThreshold) * 100}
                        className="h-2"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {product.quantity}/{product.lowStockThreshold}
                    </span>
                  </div>
                </div>
              )
            })}
            {restockTips.length > 0 && (
              <div className="mt-3 pt-3 border-t space-y-1">
                {restockTips.map((tip, i) => (
                  <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                    {tip}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
