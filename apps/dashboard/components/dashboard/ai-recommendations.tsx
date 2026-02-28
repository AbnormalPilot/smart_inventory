"use client"

import { useEffect, useState } from "react"
import { Sparkles, TrendingUp, AlertTriangle, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface Recommendation {
  type: "restock" | "trending" | "seasonal" | "insight"
  title: string
  description: string
  priority: "high" | "medium" | "low"
}

const iconMap = {
  restock: AlertTriangle,
  trending: TrendingUp,
  seasonal: Package,
  insight: Sparkles,
}

const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

export function AiRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ recommendations: Recommendation[] }>("/ai/recommendations")
      .then((res) => setRecommendations(res.recommendations))
      .catch(() => setRecommendations([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Add products and make sales to get AI recommendations.
          </p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const Icon = iconMap[rec.type] || Sparkles
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                >
                  <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{rec.title}</p>
                      <Badge variant="secondary" className={`text-[10px] ${priorityColors[rec.priority]}`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
