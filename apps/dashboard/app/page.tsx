"use client"

import { KpiCards } from "@/components/dashboard/kpi-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { AiRecommendations } from "@/components/dashboard/ai-recommendations"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your AI-powered inventory management overview.
        </p>
      </div>

      <KpiCards />

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SalesChart />
        </div>
        <div className="lg:col-span-3">
          <CategoryChart />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <AiRecommendations />
        </div>
        <div className="lg:col-span-3">
          <TopProducts />
        </div>
      </div>

      <RecentSales />
    </div>
  )
}
