"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesReport } from "@/components/analysis/sales-report"
import { InventoryAnalysis } from "@/components/analysis/inventory-analysis"

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
        </TabsList>

        <TabsContent value="sales">
          <SalesReport />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  )
}
