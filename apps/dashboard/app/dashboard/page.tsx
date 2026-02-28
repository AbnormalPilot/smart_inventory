"use client"

import { TomorrowsDemand } from "@/components/dashboard/tomorrows-demand"
import { StockShortageRisk } from "@/components/dashboard/stock-shortage-risk"
import { SeasonalDemand } from "@/components/dashboard/seasonal-demand"
import { HighProbabilityStock } from "@/components/dashboard/high-probability-stock"
import { LiveTrendingProduct } from "@/components/dashboard/live-trending-product"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Intelligence Center</h1>
        <p className="text-muted-foreground">
          Demand forecasting, risk analysis, and live trending insights.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TomorrowsDemand />
        <StockShortageRisk />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SeasonalDemand />
        </div>
        <div className="lg:col-span-3">
          <HighProbabilityStock />
        </div>
      </div>

      <LiveTrendingProduct />
    </div>
  )
}
