"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { Sparkles } from "lucide-react"

interface ForecastInsight {
  text: string
  timestamp: string
}

export function ForecastInsightBanner() {
  const [insight, setInsight] = useState<ForecastInsight | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const socket = io("http://localhost:7020")

    socket.on("ai:forecast-insight", (data: ForecastInsight) => {
      setInsight(data)
      setVisible(false)
      setTimeout(() => setVisible(true), 50)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  if (!insight || !visible) return null

  const time = new Date(insight.timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-500 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2 shrink-0">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              AI Forecast Insight
            </span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {insight.text}
          </p>
        </div>
      </div>
    </div>
  )
}
