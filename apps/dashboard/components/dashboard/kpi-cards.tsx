"use client"

import { useEffect, useState } from "react"
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface Overview {
  totalRevenue: number
  todaySalesCount: number
  totalProducts: number
  lowStockCount: number
  todayRevenue: number
  inventoryValue: number
}

export function KpiCards() {
  const [data, setData] = useState<Overview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetch<Overview>("/analytics/overview")
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-20" /></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Total Revenue",
      value: `$${(data?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      sub: `$${(data?.todayRevenue || 0).toFixed(2)} today`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Sales Today",
      value: String(data?.todaySalesCount || 0),
      sub: "transactions",
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: "Total Products",
      value: String(data?.totalProducts || 0),
      sub: `$${(data?.inventoryValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} value`,
      icon: Package,
      color: "text-purple-500",
    },
    {
      title: "Low Stock Alerts",
      value: String(data?.lowStockCount || 0),
      sub: "items need restock",
      icon: AlertTriangle,
      color: data?.lowStockCount ? "text-red-500" : "text-green-500",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
