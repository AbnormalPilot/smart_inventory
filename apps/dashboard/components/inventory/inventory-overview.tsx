"use client"

import { useEffect, useState } from "react"
import {
  Package,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  ShieldAlert,
  BarChart3,
} from "lucide-react"
import {
  Cell,
  Pie,
  PieChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface OverviewData {
  totalRevenue: number
  salesCount: number
  avgOrderValue: number
  todayRevenue: number
  todaySalesCount: number
  totalProducts: number
  lowStockCount: number
  inventoryValue: number
}

interface CategoryValue {
  category: string
  totalCostValue: number
  totalRetailValue: number
  productCount: number
  totalUnits: number
}

interface InventoryValueData {
  categories: CategoryValue[]
  totals: {
    costValue: number
    retailValue: number
    products: number
    units: number
  }
}

interface LowStockProduct {
  _id: string
  name: string
  sku: string
  category: string
  quantity: number
  lowStockThreshold: number
  unit: string
}

const CHART_COLORS = [
  "hsl(220, 70%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(30, 80%, 55%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
  "hsl(190, 70%, 50%)",
  "hsl(50, 80%, 50%)",
  "hsl(0, 70%, 55%)",
]

const categoryChartConfig: ChartConfig = {
  units: { label: "Units", color: "hsl(var(--chart-1))" },
  value: { label: "Value", color: "hsl(var(--chart-2))" },
}

export function InventoryOverview() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [inventoryValue, setInventoryValue] = useState<InventoryValueData | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<OverviewData>("/analytics/overview"),
      apiFetch<InventoryValueData>("/analytics/inventory-value"),
      apiFetch<{ products: LowStockProduct[]; count: number }>("/products/low-stock"),
    ])
      .then(([ov, iv, ls]) => {
        setOverview(ov)
        setInventoryValue(iv)
        setLowStockProducts(ls.products.slice(0, 6))
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Stock health data for donut chart
  const outOfStock = lowStockProducts.filter((p) => p.quantity === 0).length
  const lowStock = lowStockProducts.length - outOfStock
  const healthyStock = (overview?.totalProducts ?? 0) - lowStockProducts.length

  const stockHealthData = [
    { name: "Healthy", value: healthyStock, fill: "#22c55e" },
    { name: "Low Stock", value: lowStock, fill: "#eab308" },
    { name: "Out of Stock", value: outOfStock, fill: "#ef4444" },
  ].filter((d) => d.value > 0)

  // Category breakdown for bar chart
  const categoryData = (inventoryValue?.categories ?? []).slice(0, 6).map((c) => ({
    category: c.category.length > 10 ? c.category.slice(0, 10) + "..." : c.category,
    units: c.totalUnits,
    value: Math.round(c.totalRetailValue),
  }))

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold tabular-nums">{overview?.totalProducts ?? 0}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-2.5">
                <Package className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold tabular-nums text-yellow-600">
                  {overview?.lowStockCount ?? 0}
                </p>
              </div>
              <div className="rounded-full bg-yellow-500/10 p-2.5">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
            {(overview?.lowStockCount ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold tabular-nums">
                  ₹{(inventoryValue?.totals.retailValue ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-2.5">
                <IndianRupee className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cost: ₹{(inventoryValue?.totals.costValue ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold tabular-nums">
                  {(inventoryValue?.totals.units ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-purple-500/10 p-2.5">
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {inventoryValue?.categories.length ?? 0} categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Stock Health Donut */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Stock Health</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-[160px] w-[160px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockHealthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {stockHealthData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {stockHealthData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="text-sm">{entry.name}</span>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Bar */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Units by Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-[160px] text-sm text-muted-foreground">
                No category data available
              </div>
            ) : (
              <ChartContainer config={categoryChartConfig} className="h-[160px] w-full">
                <BarChart
                  data={categoryData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                  layout="vertical"
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={80}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="units" fill="var(--color-units)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Stock Alerts</CardTitle>
            <Badge variant="destructive" className="text-xs">
              {lowStockProducts.length} items
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((product) => {
                const pct = Math.round(
                  (product.quantity / Math.max(product.lowStockThreshold, 1)) * 100
                )
                const isOut = product.quantity === 0

                return (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.category} · {product.sku}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Progress
                          value={Math.min(pct, 100)}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs font-medium tabular-nums shrink-0">
                          {product.quantity}/{product.lowStockThreshold} {product.unit}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={isOut ? "destructive" : "secondary"}
                      className={`shrink-0 text-[10px] ${
                        !isOut
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : ""
                      }`}
                    >
                      {isOut ? "OUT" : "LOW"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
