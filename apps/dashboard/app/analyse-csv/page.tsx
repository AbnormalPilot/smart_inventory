"use client"

import { CsvUpload } from "@/components/ai/csv-upload"

export default function AnalyseCsvPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyse CSV</h1>
        <p className="text-muted-foreground">
          Upload a CSV file for AI-powered analysis, insights, and recommendations.
        </p>
      </div>

      <CsvUpload />
    </div>
  )
}
