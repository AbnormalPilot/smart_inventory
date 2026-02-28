"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesReport } from "@/components/analysis/sales-report"
import { InventoryAnalysis } from "@/components/analysis/inventory-analysis"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { AiRecommendations } from "@/components/dashboard/ai-recommendations"

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analysis</h1>
        <p className="text-muted-foreground">
          Sales reports, inventory analysis, and data insights.
        </p>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesReport />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryAnalysis />
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
