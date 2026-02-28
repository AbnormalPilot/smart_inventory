"use client"

import { Package, AlertTriangle, Layers, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InventoryStatsProps {
  totalProducts: number
  lowStockCount: number
  categoriesCount: number
  totalValue: number
}

export function InventoryStats({ totalProducts, lowStockCount, categoriesCount, totalValue }: InventoryStatsProps) {
  const stats = [
    { title: "Total Products", value: totalProducts, icon: Package, color: "text-blue-500" },
    { title: "Low Stock", value: lowStockCount, icon: AlertTriangle, color: "text-red-500" },
    { title: "Categories", value: categoriesCount, icon: Layers, color: "text-green-500" },
    { title: "Inventory Value", value: `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-yellow-500" },
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
