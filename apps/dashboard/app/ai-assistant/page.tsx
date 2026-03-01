"use client"

import { ChatInterface } from "@/components/ai/chat-interface"
import { CsvUpload } from "@/components/ai/csv-upload"
import { ForecastInsightBanner } from "@/components/ai/forecast-insight-banner"

export default function AIAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
          Get AI-powered inventory recommendations and analyze your data.
        </p>
      </div>

      <ForecastInsightBanner />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 min-h-[500px]">
          <ChatInterface />
        </div>
        <div>
          <CsvUpload />
        </div>
      </div>
    </div>
  )
}
